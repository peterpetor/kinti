/**
 * gen-website-fix-sql.mjs — a weboldal-linkek javító SQL-jének előállítása.
 *
 * Bemenet: website-check.json (1. kör), website-recheck.json (2. kör),
 *          website-http.json (HTTP-próba), web-rows.json (a blurb-ök).
 * Kimenet: db/seed-website-fixes.sql
 *
 * ⚠️ HÁROM KÜLÖN ESET, HÁROM KÜLÖN KEZELÉS:
 *
 *  1. CSAK HTTP-n ÉL (47 tétel) — a `lib/contact-links.ts` a protokoll nélküli
 *     címhez MINDIG `https://`-t told, így ezeknél a „Weboldal" gomb IDŐTÚLLÉPÉST
 *     ad. A javítás: a TELJES, működő URL kerül a blurb-be (a parser a
 *     `https?://`-vel kezdődő szegmenst változatlanul hagyja).
 *
 *  2. ÁTIRÁNYÍT MÁS DOMAINRE — a praxis/cég költözött vagy beolvadt; a végleges
 *     URL kerül be. ⚠️ KIVÉTEL: ha a cél egy GENERIKUS katalógus vagy egy
 *     „felfüggesztett tárhely" oldal, az NEM a cég oldala → linket törölni.
 *
 *  3. HALOTT (DNS-hiba, kapcsolat-megtagadás, 404 a gyökéren is) — a linket
 *     LEVÁGJUK a blurb végéről. ⚠️ A TÉTELT NEM rejtjük el: a halott domain nem
 *     bizonyítja, hogy a cég megszűnt (a berlini Piroschka MŰKÖDIK, csak a
 *     domainje járt le).
 */
import { readFileSync, writeFileSync } from "node:fs";

const readJson = (f) => JSON.parse(readFileSync(f, "utf8").replace(/^﻿/, ""));
const dedupe = (arr) => {
  const m = new Map();
  for (const o of arr) if (!m.has(o.id)) m.set(o.id, o);
  return [...m.values()];
};

const rows = readJson("web-rows.json")[0].results;
const blurbById = new Map(rows.map((r) => [r.id, r.blurb]));
const first = dedupe(readJson("website-check.json"));
const second = dedupe(readJson("website-recheck.json"));
const httpTry = dedupe(readJson("website-http.json"));

const secondBy = new Map(second.map((o) => [o.id, o]));
const httpBy = new Map(httpTry.map((o) => [o.id, o]));

/** Nem a cég saját oldala: felfüggesztett tárhely / generikus katalógus. */
const NOT_OWN_SITE = [
  "suspendedpage.cgi", "doktor.ch/augenaerzte", "sedo.com", "godaddy.com",
  "domainparking", "parkingcrew", "afternic.com", "hugedomains.com",
];
const isNotOwnSite = (u) => !!u && NOT_OWN_SITE.some((m) => u.toLowerCase().includes(m));

const fixes = [];          // { id, name, newSegment | null, reason }
const keptUncertain = [];  // időtúllépő, de NEM bizonyítottan halott → marad
for (const o of first) {
  const s = secondBy.get(o.id);
  const h = httpBy.get(o.id);

  // 1) Már az első körben rendben volt / csak bot-védett → nincs teendő.
  if (["ok", "protected"].includes(o.verdict)) continue;

  // 2) HTTP-n él → a működő, TELJES URL kerül be.
  if (h && h.httpStatus >= 200 && h.httpStatus < 400) {
    const finalUrl = h.httpFinal || h.url.replace(/^https:\/\//i, "http://");
    if (isNotOwnSite(finalUrl)) {
      fixes.push({ id: o.id, name: o.name, newSegment: null, reason: `nem saját oldal (${finalUrl})` });
    } else {
      fixes.push({ id: o.id, name: o.name, newSegment: finalUrl, reason: "csak HTTP-n él / átirányít" });
    }
    continue;
  }

  // 3) Második körre életre kelt (átmeneti hiba volt) → marad.
  if (s && s.verdict2 === "ok-masodikra") continue;

  // 4) A gyökér él, a mély útvonal nem → rövidítés a gyökérre.
  if (s && s.verdict2 === "gyoker-el") {
    let origin = null;
    try { origin = new URL(o.url).origin; } catch { /* rossz URL */ }
    if (origin && !isNotOwnSite(origin)) {
      fixes.push({ id: o.id, name: o.name, newSegment: origin, reason: "mély útvonal 404, a gyökér él" });
      continue;
    }
  }

  // 5) Átmeneti szerverhiba (5xx) → NEM nyúlunk hozzá, lehet karbantartás.
  if (["http-503", "http-500"].includes(o.verdict) || (s && ["http-503", "http-500"].includes(s.verdict2))) continue;

  // 6) ⚠️ IDŐTÚLLÉPÉS NEM BIZONYÍTÉK. Kétszer (https + http) sem válaszolt, de ez
  //    lehet lassú szerver, tűzfal, vagy a mi IP-nk kizárása is. Egy MŰKÖDŐ link
  //    törlése rosszabb, mint egy gyanús link meghagyása — ezért ezeket
  //    MEGHAGYJUK, és egy későbbi kör nézi újra.
  if (o.verdict === "timeout" || (s && s.verdict2 === "timeout-ismet")) {
    keptUncertain.push({ id: o.id, name: o.name, url: o.url });
    continue;
  }

  // 7) Marad a BIZONYÍTHATÓ halál: DNS-nemlétezés, kapcsolat-megtagadás,
  //    404 úgy, hogy a gyökér sem él.
  fixes.push({ id: o.id, name: o.name, newSegment: null, reason: o.verdict });
}

// --- SQL ---------------------------------------------------------------------
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const lines = [
  "-- db/seed-website-fixes.sql — AUTOGENERÁLT (scripts/gen-website-fix-sql.mjs).",
  "-- A szaknévsor 872 hirdetett weboldalának élet-ellenőrzése után.",
  "--   wrangler d1 execute kinti-db --remote --file=./db/seed-website-fixes.sql",
  "",
];

let repaired = 0;
let removed = 0;
for (const f of fixes) {
  const blurb = blurbById.get(f.id);
  if (blurb == null) continue;
  const parts = String(blurb).split(" · ");
  // A weboldal az UTOLSÓ szegmens; egyszegmensű blurb esetén maga a blurb.
  const rest = parts.length < 2 ? null : parts.slice(0, -1).join(" · ").trim();

  if (f.newSegment) {
    const next = rest ? `${rest} · ${f.newSegment}` : f.newSegment;
    lines.push(`-- ${f.name} — ${f.reason}`);
    lines.push(`UPDATE businesses SET blurb = ${q(next)} WHERE id = ${q(f.id)};`);
    repaired++;
  } else {
    lines.push(`-- ${f.name} — HALOTT LINK levágva (${f.reason}); a tétel MARAD.`);
    lines.push(
      rest
        ? `UPDATE businesses SET blurb = ${q(rest)} WHERE id = ${q(f.id)};`
        : `UPDATE businesses SET blurb = NULL WHERE id = ${q(f.id)};`,
    );
    removed++;
  }
  lines.push("");
}

writeFileSync("db/seed-website-fixes.sql", lines.join("\n"), "utf8");
console.log(`db/seed-website-fixes.sql: ${repaired} javított link, ${removed} levágott halott link.`);
console.log("\n--- javított (első 12):");
for (const f of fixes.filter((x) => x.newSegment).slice(0, 12)) console.log(`  ${f.name} → ${f.newSegment}`);
console.log("\n--- levágott, ok szerint:");
const byReason = {};
for (const f of fixes.filter((x) => !x.newSegment)) byReason[f.reason] = (byReason[f.reason] ?? 0) + 1;
console.log(byReason);
console.log(`\n--- MEGHAGYVA, bizonytalan (időtúllépés, nem bizonyított halál): ${keptUncertain.length}`);
writeFileSync("website-uncertain.json", JSON.stringify(keptUncertain, null, 2));
