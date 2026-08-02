/**
 * psyonline-match.mjs — a PsyOnline-lekérdezés kimenetének BIZTONSÁGOS szűrése.
 *
 * Használat:
 *   node scripts/psyonline-match.mjs <psy-out.json> <psy-in.json> [ki.json]
 *
 * ⚠️ A telefon CSAK akkor kerül be, ha a PsyOnline-on szereplő címek KÖZÜL
 * LEGALÁBB EGY egyezik a szaknévsorban lévő címünkkel (utcanév + házszám).
 * A név-egyezés önmagában NEM elég: a regiszter a keresett név mellé a
 * KÖRNYÉKBELI más terapeutákat is kiírja, így idegen cím/telefon is bekerülhet.
 *
 * ⚠️ TÖBB RENDELŐ: egy szakembernek több praxisa is lehet (Giselbrecht
 * Brigitta: 1020 Wien Große Mohrengasse ÉS 1220 Wien Pogrelzstraße). Ezért
 * BÁRMELYIK cím egyezése elfogadható — ha csak az elsőt néznénk, valódi
 * találatokat utasítanánk el.
 *
 * ⚠️⚠️ A MI CÍMÜNKET A BEMENETI FÁJLBÓL, AZONOSÍTÓ SZERINT olvassuk vissza:
 * a lookup-szkript a PsyOnline címével FELÜLÍRJA a saját `cim` mezőjét.
 * (Ugyanez a csapda a match-verified-phones.mjs-nél is megvolt.)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { cimEgyezik } from "./match-verified-phones.mjs";

/** „0676 - 3508814" → „+43 676 3508814" */
export function atTelefon(t) {
  if (!t) return null;
  const tiszta = t.replace(/[\s\-/().]+/g, "");
  if (!/^\d{7,}$/.test(tiszta)) return null;
  return tiszta.startsWith("0") ? `+43 ${tiszta.slice(1, 4)} ${tiszta.slice(4)}` : `+43 ${tiszta}`;
}

if (process.argv[2] && process.argv[3]) {
  const sorok = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const cimById = new Map(JSON.parse(readFileSync(process.argv[3], "utf8")).map((x) => [x.id, x.cim]));

  const jo = [], elutasitva = [], nincs = [];
  for (const x of sorok) {
    const mienk = cimById.get(x.id);
    if (!x.tel && !x.web) { nincs.push({ ...x, mienk }); continue; }
    const cimek = x.cimek?.length ? x.cimek : x.cim ? [x.cim] : [];
    if (mienk && cimek.some((c) => cimEgyezik(mienk, c))) {
      jo.push({ id: x.id, nev: x.nev, tel: atTelefon(x.tel), web: x.web, mienk });
    } else {
      elutasitva.push({ id: x.id, nev: x.nev, mienk, kapott: cimek });
    }
  }

  console.log(`✓ ${jo.length} biztonságos   ✗ ${elutasitva.length} cím nem egyezik   · ${nincs.length} nincs adat`);
  for (const x of jo) console.log(`   ${x.nev.slice(0, 30).padEnd(32)} ${(x.tel || "—").padEnd(20)} ${x.web || ""}`);
  if (elutasitva.length) {
    console.log("\n✗ ELUTASÍTVA (a cím nem egyezik — más szakember):");
    for (const x of elutasitva) console.log(`   ${x.nev.slice(0, 26).padEnd(28)} mienk=${(x.mienk || "").slice(0, 32)} | kapott=${(x.kapott[0] || "—").slice(0, 32)}`);
  }
  writeFileSync(process.argv[4] || "psy-match.json", JSON.stringify({ jo, elutasitva, nincs }, null, 1), "utf8");
}
