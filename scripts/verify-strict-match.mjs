/**
 * verify-strict-match.mjs — a Maps-hitelesítés KÉT-SZŰRŐS kiértékelése.
 *
 * ⚠️⚠️ MIÉRT KÉT SZŰRŐ: a `gmaps-verify-open.mjs` „✓"-je CSAK annyit jelent,
 * hogy a Maps EGY konkrét helyet nyitott meg — nem azt, hogy AZT a helyet.
 * Mérve ebben a körben: „Szabo Istvan, Ringenwalder Str. 59, Berlin" lekérdezésre
 * az „Elektro Notdienst Berlin Mitte" jött vissza, „Hajdu Jochen"-re a „DEKRA
 * Congress Center", „Varga Hausmeisterdienste"-re pedig egy hirdetés
 * („Patrocinado"). Egyetlen szűrővel mindhárom bekerült volna a szaknévsorba.
 *
 * A szabály: a találat AKKOR fogadható el, ha
 *   (A) a TELEFON számjegyre normalizálva egyezik,  VAGY
 *   (B) a CÍM házszámig egyezik ÉS a NÉV-ben van közös megkülönböztető token.
 *
 * Kimenet: elfogadott + elutasított lista, indoklással.
 */
import { readFileSync, writeFileSync } from "node:fs";

// ⚠️ A `gmaps-verify-open.mjs` FELÜLÍRJA a `nev`/`cim`/`tel` mezőket a Maps
// értékeivel, tehát a FORRÁS-adat elveszik belőle. Ezért a jelölt-fájlt is be
// kell olvasni, és a `q` mezőn összekötni — enélkül nincs mihez hasonlítani.
const be = JSON.parse(readFileSync(process.argv[2], "utf8"));
const forras = new Map(JSON.parse(readFileSync(process.argv[3], "utf8")).map((x) => [x.q, x]));
const KI_JO = process.argv[4];
const KI_ROSSZ = process.argv[5];

const ekezet = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const tel = (s) => {
  const d = (s || "").replace(/\D/g, "").replace(/^00/, "");
  if (d.length < 7) return null;
  return d.replace(/^(49|43|41|31|44|34)/, "").replace(/^0/, "").slice(-8);
};
/** cégforma és általános szavak — ezek NEM megkülönböztetők */
const KOZOS = new Set(
  `gmbh und der die das inh kg ohg gbr ug e.k ek co gebaudereinigung reinigung bau service
  transporte transport haustechnik elektro taxi taxen busse malermeister maler dachdecker
  dachdeckerei schreinerei bäckerei baeckerei glaserei fussplege fusspflege medizinische
  meisterbetrieb betrieb montagebetrieb hausmeisterservice hausmeisterdienste gartenpflege
  landschaftsbau garten str strasse`
    .split(/\s+/)
    .filter(Boolean),
);
const tokenek = (s) =>
  new Set(
    ekezet(s)
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((t) => t.length > 3 && !KOZOS.has(t)),
  );
/** házszám + utcanév eleje */
const cimMag = (s) => {
  const e = ekezet(s).replace(/\(.*?\)/g, " ");
  const hsz = (e.match(/\b(\d+\s?[a-z]?)\b(?!\d)/g) || []).map((x) => x.replace(/\s/g, ""));
  const utca = (e.match(/[a-z]{4,}(str|strasse|weg|platz|allee|gasse|ring|damm)/) || [])[0] || null;
  return { hsz, utca };
};

const jo = [], rossz = [];
for (const x of be) {
  const f = forras.get(x.q);
  const cimke = (f?.nev || x.q || "?").slice(0, 42);
  if (!f) { rossz.push({ ...x, miert: "nincs forrás-jelölt ehhez a lekérdezéshez" }); continue; }
  if (x.hiba) { rossz.push({ ...x, forras: f, miert: "hiba: " + x.hiba }); continue; }
  if (x.bezart) { rossz.push({ ...x, forras: f, miert: "⛔ véglegesen bezárt" }); continue; }
  if (!x.egyertelmu) { rossz.push({ ...x, forras: f, miert: "találati LISTA, nem konkrét hely" }); continue; }

  const ok = [];
  const tA = tel(x.tel), tB = tel(f.tel);
  const telEgyezik = Boolean(tA && tB && tA === tB);
  if (telEgyezik) ok.push("telefon egyezik");

  const cA = cimMag(x.cim || ""), cB = cimMag(f.cim || "");
  const hszEgyezik = cA.hsz.some((h) => cB.hsz.includes(h)) && cA.utca && cB.utca && cA.utca === cB.utca;
  const kozosNev = [...tokenek(x.nev || "")].filter((t) => tokenek(f.nev || "").has(t));
  if (hszEgyezik) ok.push("cím házszámig egyezik");
  if (kozosNev.length) ok.push("közös név-token:" + kozosNev[0]);

  const elfogad = telEgyezik || (hszEgyezik && kozosNev.length > 0);
  const rek = { ...f, maps_nev: x.nev, maps_cim: x.cim, maps_tel: x.tel, maps_web: x.web, indok: ok, cimke };
  if (elfogad) jo.push(rek);
  else rossz.push({ ...rek, miert: "⚠️ MÁS hely: " + (ok.join(", ") || "sem telefon, sem cím+név nem egyezik") });
}

writeFileSync(KI_JO, JSON.stringify(jo, null, 1), "utf8");
writeFileSync(KI_ROSSZ, JSON.stringify(rossz, null, 1), "utf8");
console.log(`${be.length} hitelesített → ${jo.length} ELFOGADVA, ${rossz.length} elutasítva`);
for (const r of rossz) console.log(`  – ${(r.cimke || r.q || "?").slice(0, 42).padEnd(44)} ${r.miert}`);
for (const r of jo) console.log(`  ✓ ${(r.cimke || "").padEnd(44)} ${r.indok.join(", ")}`);
