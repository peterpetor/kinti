/**
 * check-business-websites.mjs — a szaknévsorban hirdetett weboldalak élet-ellenőrzése.
 *
 * MIÉRT: a halott weboldal ugyanolyan zsákutca, mint a hiányzó elérhetőség — a
 * felhasználó rákattint a „Weboldal" gombra, és semmi. Kézi mintavételnél a
 * halott arány ~10% volt (piroschka.net, weisehandeln.at, blockhaus-creglingen.de,
 * cafe-lehmann-kreischa.de, balaton-gastro-service.de).
 *
 * ⚠️ A weboldal a `blurb` UTOLSÓ ` · ` szegmensében áll, PROTOKOLL NÉLKÜL —
 * ugyanaz a szabály, mint a lib/contact-links.ts `extractContactFromBlurb`-ben.
 *
 * ⚠️ ÍTÉLKEZÉSI FEGYELEM:
 *   • a halott weboldal NEM jelenti, hogy a cég megszűnt (a berlini Piroschka
 *     MŰKÖDIK, csak a domainje járt le) → csak a LINKET vágjuk le, a tételt nem,
 *   • a 403/401/429 NEM halott: bot-védelem. Csak a DNS-hiba és a
 *     kapcsolat-megtagadás számít biztos halálnak, a 404/410 pedig „rossz cím",
 *   • kétes esetben marad — inkább egy gyanús link, mint egy jó tétel csonkítva.
 *
 * Udvarias tempó: 10 párhuzamos kérés, HEAD (GET-fallbackkel), 15s időkorlát.
 * Kimenet: website-check.json
 */
import { readFileSync, writeFileSync } from "node:fs";

// ⚠️ A PowerShell `Out-File -Encoding utf8` BOM-ot ír a fájl elejére, amitől a
// JSON.parse elhasal — le kell vágni.
const rows = JSON.parse(readFileSync("web-rows.json", "utf8").replace(/^﻿/, ""))[0].results;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) kinti.app-linkcheck";

const URL_RE = /^(?:https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/\S*)?$/i;
const EMAIL_RE = /^(?:mailto:)?([^\s@]+@[^\s@]+\.[a-z]{2,})$/i;

/** A blurb utolsó ` · ` szegmenséből weboldal (ugyanaz a szabály, mint az appban). */
function websiteOf(blurb) {
  if (!blurb) return null;
  const parts = String(blurb).split(" · ");
  const last = (parts.length < 2 ? blurb : parts[parts.length - 1]).trim();
  if (EMAIL_RE.test(last)) return null;
  if (!URL_RE.test(last)) return null;
  return /^https?:\/\//i.test(last) ? last : `https://${last}`;
}

const targets = [];
for (const r of rows) {
  const url = websiteOf(r.blurb);
  if (url) targets.push({ ...r, url });
}
console.log(`cél: ${targets.length} weboldal a ${rows.length} sorból\n`);

async function probe(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        headers: { "user-agent": UA, accept: "*/*" },
        signal: AbortSignal.timeout(15000),
      });
      // 405 = HEAD nem támogatott → próbáljuk GET-tel
      if (method === "HEAD" && (res.status === 405 || res.status === 501)) continue;
      return { status: res.status, err: null };
    } catch (e) {
      const msg = String(e?.cause?.code || e?.name || e?.message || e);
      // A GET-kör hibáját jelentjük (a HEAD-hiba után még próbálkozunk).
      if (method === "GET") return { status: 0, err: msg };
    }
  }
  return { status: 0, err: "unknown" };
}

const CONC = 10;
const out = [];
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const t = queue.shift();
    const { status, err } = await probe(t.url);
    // Osztályozás: mi számít BIZTOS halálnak.
    const dnsDead = /ENOTFOUND|EAI_AGAIN|ERR_NAME/i.test(err ?? "");
    const refused = /ECONNREFUSED|ECONNRESET|EHOSTUNREACH|ENETUNREACH/i.test(err ?? "");
    const verdict =
      status >= 200 && status < 400 ? "ok"
      : status === 403 || status === 401 || status === 429 ? "protected"
      : status === 404 || status === 410 ? "notfound"
      : dnsDead ? "dns-dead"
      : refused ? "refused"
      : status === 0 ? "timeout"
      : `http-${status}`;
    out.push({
      id: t.id, name: t.name, country: t.country_code, url: t.url, status, err, verdict,
      hasPhone: !!(t.phone && String(t.phone).trim()),
      hasEmail: !!(t.contact_email && String(t.contact_email).trim()),
    });
    done++;
    if (done % 50 === 0) {
      console.log(`  … ${done}/${targets.length}`);
      writeFileSync("website-check.json", JSON.stringify(out, null, 2));
    }
  }
}

const queue = [...targets];
await Promise.all(Array.from({ length: CONC }, () => worker(queue)));
writeFileSync("website-check.json", JSON.stringify(out, null, 2));

const by = {};
for (const o of out) by[o.verdict] = (by[o.verdict] ?? 0) + 1;
console.log("\n=== eredmény ===");
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(4)}  ${k}`);
const dead = out.filter((o) => o.verdict === "dns-dead" || o.verdict === "refused");
console.log(`\nBIZTOSAN HALOTT (DNS/kapcsolat): ${dead.length}`);
console.log(`  ebből EGYÉB elérhetőség nélkül (teljes zsákutca lenne): ${dead.filter((d) => !d.hasPhone && !d.hasEmail).length}`);
