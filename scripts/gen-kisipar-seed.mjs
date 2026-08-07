/**
 * gen-kisipar-seed.mjs — a hitelesített kisipar-jelöltekből seed SQL.
 *
 * Bemenet: a `verify-strict-match.mjs` ELFOGADOTT listája (JSON).
 * Kimenet: `INSERT ... ON CONFLICT DO NOTHING` sorok, utcaszintű koordinátával.
 *
 * ⚠️ IRÁNYÍTÓSZÁM → TARTOMÁNY: a német PLZ-sávok NEM esnek egybe a
 * tartományhatárokkal. Két mért kivétel él a térképben:
 *   • 66482 Zweibrücken  → Rheinland-Pfalz (a 66xxx amúgy Saarland)
 *   • 88131–88179 Lindau → Bayern         (a 88xxx amúgy Baden-Württemberg)
 * Ha új tétel kerül be egy határvidéki PLZ-ről, ELLENŐRIZD, ne tippelj.
 *
 * ⚠️ NYELV: a `languages` mező CSAK akkor kap „Magyar"-t, ha a cégnévben MAGYAR
 * KERESZTNÉV is van. A puszta magyar vezetéknév (pl. „Takacs Christian") második
 * generációt is jelenthet, aki nem beszél magyarul — ezt NEM állítjuk.
 *
 * ⚠️ BLURB: se idegen pontszám, se a felkutatás módszertana nem kerülhet bele
 * (ld. blurb-public-text-rules). Csak szakma + település.
 *
 * Futtatás:
 *   node scripts/gen-kisipar-seed.mjs jo.json db/ki.sql <id-elotag> <source-cimke>
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BE = process.argv[2];
const KI = process.argv[3];
const ELOTAG = process.argv[4] || "de3";
const SOURCE = process.argv[5] || "seed-de-vezeteknev-2026-08";
const CACHE = join(__dirname, "geocode-cache.json");

/** PLZ első két jegye → tartomány-kód. */
const PLZ_LAND = {
  "01": "SN", "02": "SN", "03": "BB", "04": "SN", "06": "ST", "07": "TH", "08": "SN", "09": "SN",
  10: "BE", 12: "BE", 13: "BE", 14: "BB", 15: "BB", 16: "BB", 17: "MV", 18: "MV", 19: "MV",
  20: "HH", 21: "HH", 22: "HH", 23: "SH", 24: "SH", 25: "SH", 26: "NI", 27: "NI", 28: "HB", 29: "NI",
  30: "NI", 31: "NI", 32: "NW", 33: "NW", 34: "HE", 35: "HE", 36: "HE", 37: "NI", 38: "NI", 39: "ST",
  40: "NW", 41: "NW", 42: "NW", 44: "NW", 45: "NW", 46: "NW", 47: "NW", 48: "NW", 49: "NI",
  50: "NW", 51: "NW", 52: "NW", 53: "NW", 54: "RP", 55: "RP", 56: "RP", 57: "NW", 58: "NW", 59: "NW",
  60: "HE", 61: "HE", 63: "HE", 64: "HE", 65: "HE", 66: "SL", 67: "RP", 68: "BW", 69: "BW",
  70: "BW", 71: "BW", 72: "BW", 73: "BW", 74: "BW", 75: "BW", 76: "BW", 77: "BW", 78: "BW", 79: "BW",
  80: "BY", 81: "BY", 82: "BY", 83: "BY", 84: "BY", 85: "BY", 86: "BY", 87: "BY", 88: "BW", 89: "BY",
  90: "BY", 91: "BY", 92: "BY", 93: "BY", 94: "BY", 95: "BY", 96: "BY", 97: "BY", 98: "TH", 99: "TH",
};
/** ⚠️ Mért kivételek — a kétjegyű sáv itt ROSSZ tartományt adna. */
const PLZ_KIVETEL = [
  { tol: 66482, ig: 66482, land: "RP" }, // Zweibrücken
  { tol: 88131, ig: 88179, land: "BY" }, // Lindau és környéke
];

function land(plz) {
  const n = Number(plz);
  for (const k of PLZ_KIVETEL) if (n >= k.tol && n <= k.ig) return k.land;
  return PLZ_LAND[plz.slice(0, 2)] || null;
}

/** magyar keresztnevek — CSAK ezek engedik meg a „Magyar" nyelv-állítást */
const KERESZT = new Set(
  `zoltan zoltán csaba attila laszlo lászló tibor sandor sándor gabor gábor istvan istván ferenc
  bela béla arpad árpád zsolt balazs balázs gergely levente akos ákos imre geza géza janos jános
  jozsef józsef andras andrás miklos miklós gyula lajos karoly károly ildiko ildikó katalin
  zsuzsanna aniko anikó eniko enikő tunde tünde csilla emese reka réka kinga bernadett szilard
  szilárd kalman kálmán dezso dezső vilmos botond marton márton aron áron szabolcs krisztian
  krisztián barnabas barnabás elemer elemér zsombor bence jeno jenő denes dénes kristof kristóf
  balint bálint gergo gergő odon ödön zsigmond bertalan domonkos benedek kornel kornél nandor
  nándor tivadar aladar aladár csongor zalan zalán almos álmos samuel piroska ilona jolan jolán
  sarolta ibolya boglarka boglárka hajnalka orsolya noemi noémi beata beáta melinda zsofia zsófia
  judit marta márta erzsebet erzsébet gizella margit etelka rozalia terezia lilla zita borbala
  borbála franciska henrietta timea tímea agnes ágnes eva éva maté máté laslo`
    .split(/\s+/)
    .filter(Boolean),
);

/** kategória → blurb-sablon (`{hely}` = település) */
const BLURB = {
  tetofedo: "Tetőfedés és ácsmunka {hely} környékén.",
  burkolo: "Csempézés, burkolás {hely} környékén.",
  parkettazas: "Parketta- és padlóburkolás {hely} környékén.",
  taxis: "Taxi és személyszállítás {hely} környékén.",
  koltoztetes: "Költöztetés {hely} környékén.",
  szigetelo: "Víz- és hőszigetelés {hely} környékén.",
  temetkezes: "Temetkezési szolgáltatás {hely} környékén.",
  fuggesztett_menyezet: "Gipszkarton- és álmennyezet-szerelés {hely} környékén.",
  klima: "Fűtés- és klímaszerelés {hely} környékén.",
  karpitos: "Kárpitos munkák {hely} környékén.",
  ekszer: "Ékszerkészítés és -javítás {hely} környékén.",
  gazvez: "Víz- és gázszerelés {hely} környékén.",
  villany: "Villanyszerelés {hely} környékén.",
  festo: "Szobafestés, mázolás {hely} környékén.",
  asztalos: "Asztalos- és bútormunkák {hely} környékén.",
  kőműves: "Kőműves- és építőipari munkák {hely} környékén.",
  lakasfelujitas: "Lakásfelújítás és kivitelezés {hely} környékén.",
  takarito: "Takarítás és épülettisztítás {hely} környékén.",
  hazaszerkeszto: "Házmesteri és gondnoki szolgáltatás {hely} környékén.",
  kertesz: "Kertészet és kertfenntartás {hely} környékén.",
  futas: "Fuvarozás és szállítás {hely} környékén.",
  szallitmanyozo: "Szállítmányozás {hely} környékén.",
  lakatos: "Lakatos- és zárszerelő munkák {hely} környékén.",
  autoszer: "Autójavítás és -szerviz {hely} környékén.",
  pek: "Pékség {hely} környékén.",
  pedikur: "Pedikűr és lábápolás {hely} környékén.",
  gepijarmu_oktato: "Autósiskola {hely} környékén.",
  kerekpar: "Kerékpárszerviz {hely} környékén.",
  gumiszerviz: "Gumiszerviz {hely} környékén.",
  uveges: "Üvegezés {hely} környékén.",
  kemenysepro: "Kéményseprés {hely} környékén.",
  cipesz: "Cipőjavítás {hely} környékén.",
  varrono: "Ruhajavítás és -igazítás {hely} környékén.",
  hegeszto: "Hegesztés és fémszerkezet {hely} környékén.",
  karosszeria: "Karosszéria-javítás {hely} környékén.",
  autofenyezo: "Autófényezés {hely} környékén.",
  lakberendezes: "Belsőépítészet és lakberendezés {hely} környékén.",
  allvanyozo: "Állványozás {hely} környékén.",
  terkovezes: "Térkövezés és útépítés {hely} környékén.",
  nyilaszaros: "Nyílászáró-beépítés {hely} környékén.",
  arnyekolastechnika: "Árnyékolástechnika és redőny {hely} környékén.",
  homlokzatszigetelo: "Homlokzatszigetelés {hely} környékén.",
  futar: "Futárszolgálat {hely} környékén.",
  haztartasigep_szerelo: "Háztartásigép-szerelés {hely} környékén.",
};

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
const alszik = (ms) => new Promise((r) => setTimeout(r, ms));

/** ⚠️ Nominatim: max 1 kérés/másodperc, és KÖTELEZŐ a User-Agent. */
async function egyKeres(cim) {
  const u = new URL("https://nominatim.openstreetmap.org/search");
  u.searchParams.set("q", cim);
  u.searchParams.set("countrycodes", "de");
  u.searchParams.set("format", "json");
  u.searchParams.set("limit", "1");
  const r = await fetch(u, { headers: { "User-Agent": "kinti.app szaknevsor seed (snyggdam@gmail.com)" } });
  await alszik(1100);
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.length) return null;
  return { lat: Number(j[0].lat), lng: Number(j[0].lon) };
}

async function geokod(cim) {
  const kulcs = "DE|" + cim;
  if (cache[kulcs]) return cache[kulcs];
  // ⚠️ A cégjegyzék városrészt tesz zárójelbe („67657 Kaiserslautern (Innenstadt)"),
  // és a Nominatim ettől NULLA találatot ad. Zárójel nélkül újra kell próbálni.
  const valtozatok = [cim, cim.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim()];
  for (const v of [...new Set(valtozatok)]) {
    const p = await egyKeres(v);
    if (p) {
      cache[kulcs] = p;
      writeFileSync(CACHE, JSON.stringify(cache, null, 1), "utf8");
      return p;
    }
  }
  return null;
}

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 46);

const be = JSON.parse(readFileSync(BE, "utf8"));
const sorok = [];
const kihagyva = [];
const hasznaltId = new Set();

for (const x of be) {
  // ⚠️ A jelenlegi (Maps-beli) NÉV a mérvadó: a cégjegyzék régi nevet is tárol.
  // A Maps-név viszont a teljes szolgáltatás-felsorolást is beleírja
  // („… Holz- und Bautenschutz, Bauwerksabdichtung, Trockenbau, Fensterbau"),
  // ami a kártyán elfér ugyan, de olvashatatlan — az első tagmondat elég.
  let nev = (x.maps_nev || x.nev)
    .replace(/\s+/g, " ")
    .replace(/^(Frau|Herr)\s+/i, "")
    .replace(/[.,\s]+$/, "")
    .trim();
  if (nev.length > 58) nev = nev.split(/\s*,\s*/)[0].replace(/[.,\s]+$/, "").trim();
  if (nev.length > 58) nev = nev.slice(0, 58).replace(/\s+\S*$/, "");
  // ⚠️ A cégjegyzék KÉT zárójeles utótagot is ragaszthat a városra
  // („78224 Singen (Hohentwiel) (Hausen)"), a városra szűkített keresés pedig
  // TÁVOLSÁGOT („67346 Speyer 483 km"). Mindkettőt takarítani kell.
  let cim = (x.cim || "").replace(/\s*\d+\s*km\s*$/i, "").replace(/\s+/g, " ").trim();
  const zarojelek = cim.match(/\([^)]*\)/g) || [];
  if (zarojelek.length > 1) cim = cim.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const plz = (cim.match(/\b(\d{5})\b/) || [])[1];
  if (!plz) { kihagyva.push([nev, "nincs irányítószám"]); continue; }
  const l = land(plz);
  if (!l) { kihagyva.push([nev, "ismeretlen PLZ-sáv: " + plz]); continue; }
  const hely = (cim.split(plz)[1] || "").replace(/\(.*?\)/g, "").replace(/[,–-]\s*$/, "").trim() || "a környék";
  const sablon = BLURB[x.kategoria];
  if (!sablon) { kihagyva.push([nev, "nincs blurb-sablon: " + x.kategoria]); continue; }

  const p = await geokod(cim);
  if (!p) { kihagyva.push([nev, "nem geokódolható: " + cim]); continue; }

  const tokenek = new Set(
    nev.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, " ").split(" "),
  );
  const vanKeresztnev = [...tokenek].some((t) => KERESZT.has(t));
  const nyelvek = vanKeresztnev ? '["Magyar","Német"]' : '["Német"]';

  let id = `${ELOTAG}-${slug(nev)}`;
  let n = 2;
  while (hasznaltId.has(id)) id = `${ELOTAG}-${slug(nev)}-${n++}`;
  hasznaltId.add(id);

  const tel = (x.maps_tel || x.tel || "").replace(/\s+/g, " ").trim();
  sorok.push(
    "INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES\n" +
      `(${q(id)}, ${q(nev)}, ${q(x.kategoria)}, ${q(x.kategoria_cimke)}, ${q(cim)}, ${q(tel)}, ` +
      `${q(sablon.replace("{hely}", hely))}, ${q(nyelvek)}, ${p.lat}, ${p.lng}, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, ${q(SOURCE)}, 'DE', ${q(l)})\n` +
      "ON CONFLICT(id) DO NOTHING;",
  );
}

writeFileSync(KI, sorok.join("\n\n") + "\n", "utf8");
console.log(`${be.length} elfogadott → ${sorok.length} INSERT`);
for (const [n, ok] of kihagyva) console.log(`  kihagyva: ${n.slice(0, 40).padEnd(42)} ${ok}`);
