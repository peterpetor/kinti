/**
 * match-physical-contacts.mjs — FIZIKAI ÜZLETEK (étterem, bolt, fodrász,
 * autószerelő…) Maps-ből kapott telefonjának biztonságos hozzárendelése.
 *
 * Használat:
 *   node scripts/match-physical-contacts.mjs <maps-out.json> <db-sorok.json> [ki.json]
 *
 * ⚠️⚠️ KÉT FÜGGETLEN SZŰRŐ, mert egyik sem elég:
 *   1. CÍM (utcanév + házszám, ORSZÁG-FÜGGETLENÜL — a brit cím házszámmal
 *      kezdődik, a spanyol vesszőz)
 *   2. NÉV (a Maps-név és a mi nevünk osszon meg legalább egy érdemi tokent)
 *
 * A NÉV-szűrő a HELYSZÍN-CSAPDÁT fogja meg: ha a tétel piaci standon, közösségi
 * házban, iskolában vagy templomban működik, a Maps a BEFOGADÓ HELY telefonját
 * adja vissza ugyanarra a címre. 2026-08-03-án öt ilyen volt egyetlen nap alatt
 * (HTL Wien West, Neil's Cheese Board, The Market Hall Carlisle, Colegio de La
 * Salle, Juniper Green Village Hall).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { cimEgyezikAltalanos } from "./match-verified-phones.mjs";

/** Nem megkülönböztető szavak — ezek egyezése NEM bizonyíték. */
const ZAJ = new Set([
  "magyar", "hungarian", "ungarisch", "hungaro", "hongaars", "etterem", "restaurant", "restaurante",
  "bolt", "shop", "store", "laden", "winkel", "cafe", "café", "bistro", "salon", "studio", "gmbh",
  "kft", "ltd", "bar", "food", "market", "supermarket", "elelmiszer", "fodrasz", "friseur", "the",
  "and", "und", "van", "der", "des", "kozmetika", "beauty", "haus", "house",
  /**
   * ⚠️ SZAKMA-SZAVAK. Élesben a „Happy Face Killer – Tattoo & **Barber**" és a
   * „Bandido **Barber** Shop Horb" egyezőnek látszott — pusztán a szakma közös
   * szavától. A szakmanév épp azért közös, mert ugyanabba a kategóriába
   * soroltuk őket; bizonyítéknak ezért használhatatlan.
   */
  "barber", "tattoo", "garage", "werkstatt", "autoszerviz", "szerviz", "service", "pizzeria",
  "delikatessen", "feinkost", "backerei", "pekseg", "konditorei", "cukraszda", "gasthaus",
  "gaststatte", "imbiss", "buffet", "bufe", "nails", "korom", "massage", "masszazs", "praxis",
]);

const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");

/**
 * Van-e KÖZÖS, érdemi (nem zaj) szó a két névben?
 *
 * ⚠️ A `cim` paraméter NEM opcionális dísz: ami a CÍMBEN is szerepel, az
 * HELYNÉV, nem cégnév-jel. Élesben a „Happy Face Killer" és a „Bandido Barber
 * Shop **Horb**" egyezőnek látszott — pusztán azért, mert mindkettőben ott volt
 * a VÁROS neve (Horb am Neckar). Cím-tokenek kizárása nélkül minden olyan
 * üzlet „egyezik", amelyik a nevébe teszi a városát.
 */
export function nevEgyezik(mienk, mapse, cim = "") {
  const tok = (s) => norm(s).split(/\s+/).filter((w) => w.length > 3 && !ZAJ.has(w));
  const helynevek = new Set(tok(cim));
  const t = (s) => new Set(tok(s).filter((w) => !helynevek.has(w)));
  const A = t(mienk), B = t(mapse);
  if (!A.size || !B.size) return false;
  return [...A].some((w) => B.has(w));
}

if (process.argv[2] && process.argv[3]) {
  const sorok = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const nyers = JSON.parse(readFileSync(process.argv[3], "utf8"));
  const db = Array.isArray(nyers) ? (nyers[0]?.results ?? nyers) : nyers.results;
  const byId = new Map(db.map((r) => [r.id, r]));

  const jo = [], bezart = [], csakCim = [], elutasitva = [];
  for (const x of sorok) {
    const sajat = byId.get(x.id);
    if (!sajat || !x.egyertelmu) continue;
    const cimOk = cimEgyezikAltalanos(sajat.address, x.cim);
    const nevOk = nevEgyezik(sajat.name, x.nev, `${sajat.address ?? ""} ${x.cim ?? ""}`);

    /**
     * ⚠️⚠️ A BEZÁRÁS-JELZŐ CSAK EGYEZŐ CÍMMEL ÉRVÉNYES. Élesben előfordult, hogy
     * a „Magyar etterem Gernrode" (Quedlinburger Straße 7, **06507 Gernrode**)
     * keresésre a Maps egy MÁSIK, 06485 **Quedlinburg**-i „Csarda"-t adott
     * vissza — bezártként. Cím-ellenőrzés nélkül egy ÉLŐ éttermet rejtettem
     * volna el egy másik város bezárt étterme miatt.
     * Ugyanez a hiba fordítva is: a `bezart` mező akkor is igaz lehet, ha a
     * Maps egyáltalán nem azonosított helyet (`egyertelmu=false`) — azt a fenti
     * `continue` már kiszűri.
     */
    if (x.bezart) {
      if (cimOk) bezart.push({ id: x.id, nev: sajat.name, mapsNev: x.nev, maps: x.cim });
      else elutasitva.push({ id: x.id, nev: sajat.name, mapsNev: x.nev, mienk: sajat.address, maps: x.cim, megj: "bezártnak jelölve, DE más cím" });
      continue;
    }
    if (!x.tel && !x.web) continue;
    const rec = { id: x.id, nev: sajat.name, mapsNev: x.nev, tel: x.tel, web: x.web, mienk: sajat.address, maps: x.cim };
    if (cimOk && nevOk) jo.push(rec);
    else if (cimOk) csakCim.push(rec); // ⚠️ KÉZI döntés kell: lehet helyszín-csapda
    else elutasitva.push(rec);
  }

  console.log(`✓ ${jo.length} biztonságos (cím ÉS név)   ⚠️ ${csakCim.length} csak cím (kézi)   ✗ ${elutasitva.length} elutasítva   ⛔ ${bezart.length} bezárt`);
  for (const x of jo) console.log(`   ${x.nev.slice(0, 34).padEnd(36)} ${(x.tel || "—").padEnd(20)} ${x.mapsNev.slice(0, 28)}`);
  if (csakCim.length) {
    console.log("\n⚠️ CSAK A CÍM EGYEZIK — kézi döntés (helyszín-csapda lehet):");
    for (const x of csakCim) console.log(`   ${x.nev.slice(0, 30).padEnd(32)} → ${x.mapsNev.slice(0, 32).padEnd(34)} ${x.tel || "—"}`);
  }
  if (bezart.length) {
    console.log("\n⛔ BEZÁRT:");
    for (const x of bezart) console.log(`   ${x.nev.slice(0, 40)}`);
  }
  writeFileSync(process.argv[4] || "phys-match.json", JSON.stringify({ jo, csakCim, elutasitva, bezart }, null, 1), "utf8");
}
