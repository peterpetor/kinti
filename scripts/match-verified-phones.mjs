/**
 * match-verified-phones.mjs — a Maps-ből visszakapott telefonok BIZTONSÁGOS
 * hozzárendelése a szaknévsor tételeihez.
 *
 * Használat:
 *   node scripts/match-verified-phones.mjs <verify-kimenet.json> <db-sorok.json> [ki.json]
 *
 * ⚠️⚠️ MIÉRT KELL SZIGORÚ SZŰRŐ: a Maps a névre keresve gyakran egy MÁSIK,
 * hasonló profilú helyet ad vissza. 2026-08-03-i mérés: 10 osztrák
 * pszichológusból 6-ra jött „találat", de kettő HAMIS volt — Göschl-Kraemer
 * Karla (Phorusgasse 2, 1040 Wien) helyett egy másik praxis a Semperstraße
 * 5-ben (1180 Wien). A név stimmelt volna, a cím nem.
 *
 * A SZABÁLY: a telefon CSAK akkor kerül be, ha a Maps CÍME egyezik a miénkkel
 * (utcanév + házszám). A név-egyezés ÖNMAGÁBAN NEM elég.
 *
 * ⚠️ A `gmaps-verify-open.mjs` a saját `cim` mezőjével FELÜLÍRJA a bemenetét,
 * ezért a MI címünket AZONOSÍTÓ SZERINT olvassuk vissza a DB-kivonatból —
 * nem a verify-kimenetből.
 *
 * ⚠️ Német utcanév-normalizálás kötelező: „Straße"/„Strasse"/„Str." ugyanaz,
 * ugyanígy „platz"/„Pl.". Enélkül a VALÓDI egyezések is elhullanának.
 */
import { readFileSync, writeFileSync } from "node:fs";

/** Német cím → összehasonlítható alak. */
export function normCim(s) {
  return (s || "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\bstrasse\b|\bstr\b/g, "str")
    .replace(/\bplatz\b|\bpl\b/g, "pl")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Utcanév + ELSŐ házszám (a „/1/3" ajtó-jelölő nélkül). */
export function utcaEsSzam(cim) {
  const n = normCim(cim);
  const m = n.match(/^(.*?)\s+(\d+)\s*[a-z]?(?:\/|\s|$)/);
  return m ? { utca: m[1].trim(), szam: m[2] } : null;
}

/** Egyezik-e a két cím utcanév + házszám szinten? */
export function cimEgyezik(mienk, mapse) {
  const a = utcaEsSzam(mienk);
  const b = utcaEsSzam(mapse);
  if (!a || !b || a.szam !== b.szam) return false;
  // A Maps néha rövidít, ezért elég, ha az egyik tartalmazza a másikat.
  return a.utca === b.utca || a.utca.includes(b.utca) || b.utca.includes(a.utca);
}

/**
 * ORSZÁG-FÜGGETLEN cím-egyezés.
 *
 * ⚠️ MIÉRT KELL A `cimEgyezik` MELLÉ: az a német/osztrák címrendre készült
 * („Utcanév 12"). A BRIT cím viszont HÁZSZÁMMAL KEZDŐDIK („353 Green Lanes"),
 * a spanyol pedig vesszőzik („Carrer de Lepant, 311") — ezeken az
 * „első szó(ak) + első szám" logika félreolvas, és VALÓDI egyezéseket dobna el.
 *
 * Ez a változat nyelvfüggetlen: (1) minden házszám-jelölt kigyűjtése, (2) az
 * utcanév-tokenek metszete. Egyezés = van KÖZÖS házszám ÉS közös utcanév-token.
 */
export function cimEgyezikAltalanos(a, b) {
  const bont = (s) => {
    const n = normCim(s).replace(/[^a-z0-9\s]/g, " ");
    const szamok = new Set((n.match(/\b\d{1,4}[a-z]?\b/g) || []).map((x) => x.replace(/[a-z]$/, "")));
    // ⚠️ Az irányítószámot (4-5 jegy) NEM tekintjük házszámnak, de a
    // token-halmazba bevesszük — két különböző utca ritkán osztozik rajta.
    const tokenek = new Set((n.match(/\b[a-z]{4,}\b/g) || []));
    return { szamok, tokenek };
  };
  const A = bont(a), B = bont(b);
  if (!A.szamok.size || !B.szamok.size || !A.tokenek.size || !B.tokenek.size) return false;
  const kozosSzam = [...A.szamok].some((x) => B.szamok.has(x));
  const kozosToken = [...A.tokenek].some((x) => B.tokenek.has(x));
  return kozosSzam && kozosToken;
}

/** Osztrák helyi alak (0660 …) → nemzetközi (+43 660 …). */
export function nemzetkozi(tel) {
  const t = (tel || "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.startsWith("+")) return t;
  if (t.startsWith("0")) return "+43 " + t.slice(1);
  return t;
}

if (process.argv[2] && process.argv[3]) {
  const sorok = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const dbNyers = JSON.parse(readFileSync(process.argv[3], "utf8"));
  const dbSorok = Array.isArray(dbNyers) ? (dbNyers[0]?.results ?? dbNyers) : dbNyers.results;
  const cimById = new Map(dbSorok.map((r) => [r.id, r.address]));

  const jo = [], bezart = [], elutasitva = [];
  for (const x of sorok) {
    if (!x.egyertelmu) continue;
    const mienk = cimById.get(x.id);
    if (!mienk) continue;
    if (x.bezart) { bezart.push({ id: x.id, nev: x.nev, mienk, maps: x.cim }); continue; }
    if (!x.tel) continue;
    if (cimEgyezik(mienk, x.cim)) jo.push({ id: x.id, nev: x.nev, tel: nemzetkozi(x.tel), cim: x.cim });
    else elutasitva.push({ id: x.id, nev: x.nev, mienk, maps: x.cim, tel: x.tel });
  }

  console.log(`✓ ${jo.length} biztonságos telefon`);
  for (const x of jo) console.log(`   ${x.nev.slice(0, 46).padEnd(48)} ${x.tel}`);
  console.log(`\n⛔ ${bezart.length} bezárt`);
  for (const x of bezart) console.log(`   ${x.nev.slice(0, 46).padEnd(48)} mienk=${x.mienk} | maps=${x.maps}`);
  console.log(`\n✗ ${elutasitva.length} ELUTASÍTVA (a cím nem egyezik — más praxis)`);
  for (const x of elutasitva) console.log(`   ${(x.nev || "").slice(0, 34).padEnd(36)} mienk=${(x.mienk || "").slice(0, 34)} | maps=${(x.maps || "").slice(0, 34)}`);
  writeFileSync(process.argv[4] || "phone-matches.json", JSON.stringify({ jo, bezart, elutasitva }, null, 1), "utf8");
}
