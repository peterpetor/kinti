// scripts/gen-gb-seed.mjs
//
// A db/seed-data/gb-organizations.json (valódi ANGLIAI magyar szervezetek)
// alapján legenerálja a db/seed-gb.sql-t: a "magyar-kozosseg" kategóriát +
// a szervezeteket a businesses táblába (country_code='GB', régió a canton_code-ba,
// jóváhagyva [moderation_status=1] de nem foglalt [claimed=0], hogy a valódi
// szervezet később átvehesse). Futtatás:  node scripts/gen-gb-seed.mjs
//
// ⚠️ ELTÉRÉS a CH/AT/DE/NL seedektől: itt a JSON-ban VAN utcaszintű `address`,
// `phone` és `email` is, ezért ezeket a valódi oszlopokba írjuk (address, phone,
// contact_email) — a régebbi seedek csak a várost tették az address mezőbe.
// Ahol nincs utcacím (a hétvégi iskolák bérelt helyszínen működnek, és nem
// publikálnak állandó címet), ott a város kerül az address-be.
//
// A seedet KÉZZEL kell alkalmazni:
//   wrangler d1 execute kinti-db --remote --file=./db/seed-gb.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(root, "db/seed-data/gb-organizations.json"), "utf8"));

// Város → (lat,lng) közelítő középpont (térkép-pin). Ismeretlennél a régió-központ.
const CITY_COORDS = {
  london: [51.5074, -0.1278],
  birmingham: [52.4862, -1.8904],
  coventry: [52.4068, -1.5197],
  manchester: [53.4808, -2.2426],
  cambridge: [52.2053, 0.1218],
  "st albans": [51.752, -0.3369],
  guildford: [51.2362, -0.5704],
  reading: [51.4543, -0.9781],
  woking: [51.3168, -0.561],
  oxford: [51.752, -1.2577],
  basingstoke: [51.2665, -1.0873],
  southampton: [50.9097, -1.4044],
  bristol: [51.4545, -2.5879],
  "milton keynes": [52.0406, -0.7594],
  witchford: [52.4033, 0.2166],
};

// Régió-kód → központ fallback (regions.ts GB-kódjaival és a gb-points.ts-szel egyezően).
const REGION_COORDS = {
  LDN: [51.5074, -0.1278],
  SE: [51.2, -0.6],
  SW: [50.9, -3.2],
  EE: [52.2, 0.5],
  WM: [52.4862, -1.8904],
  EM: [52.9, -1.0],
  NW: [53.7, -2.6],
  YH: [53.9, -1.3],
  NE: [54.9, -1.8],
};

function coordsFor(org) {
  // ⚠️ Ha a tételhez VAN házszám-szintű, geokódolt koordináta (Nominatim/OSM),
  // az mindig veri a város-középpontot — a térkép-pin különben a belvárosba
  // mutatna egy külvárosi bolt helyett. Tippelt koordináta SOHA ne kerüljön ide.
  if (typeof org.lat === "number" && typeof org.lng === "number") return [org.lat, org.lng];
  const city = (org.city || "").toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (city.includes(key)) return CITY_COORDS[key];
  }
  return REGION_COORDS[org.region] || REGION_COORDS.LDN;
}

function slugify(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u" };
  return (
    "gb-" +
    s
      .toLowerCase()
      .replace(/[áéíóöőúüű]/g, (c) => map[c] || c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}

/** Dedup-kulcs: a név ékezet- és írásjel-mentes, tömörített alakja. */
function nameKey(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u" };
  return s.toLowerCase().replace(/[áéíóöőúüű]/g, (c) => map[c] || c).replace(/[^a-z0-9]/g, "");
}

/** Dedup-kulcs címre: kisbetűs, csak betű+szám (így a „Rd." / „Road" és a
 *  vesszők/szóközök eltérése nem rejt el egy valódi duplikátumot). */
function addrKey(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null ? "NULL" : `'${esc(s)}'`);

// ── Épelméjűség-ellenőrzés a generálás ELŐTT ────────────────────────────────
const VALID_REGIONS = new Set(Object.keys(REGION_COORDS));
// ⚠️ Csak olyan kategória mehet ki, ami LÉTEZIK a categories táblában — különben
// a bejegyzés kategória nélkül, kereshetetlenül landolna az adatbázisban.
const VALID_CATEGORIES = new Set(["magyar-kozosseg", "elelmiszer", "etterem", "cukrasz", "konyveles", "fogorvos", "fodrasz", "szepseg"]);
const problems = [];
const nameSeen = new Map();
const addrSeen = new Map();
for (const org of data.organizations) {
  if (!org.name || !org.city || !org.region) problems.push(`hiányzó alapmező: ${org.name || "(névtelen)"}`);
  if (!VALID_REGIONS.has(org.region)) problems.push(`ismeretlen régió-kód (${org.region}): ${org.name}`);
  // ⚠️ A user-követelmény: legyen valódi elérhetőség. Cím VAGY e-mail VAGY
  // telefon VAGY weboldal nélkül a bejegyzés használhatatlan — ne is menjen ki.
  if (!org.address && !org.email && !org.phone && !org.website) problems.push(`nincs semmilyen elérhetőség: ${org.name}`);
  if (org.category && !VALID_CATEGORIES.has(org.category)) problems.push(`ismeretlen kategória (${org.category}): ${org.name}`);
  const k = nameKey(org.name);
  if (nameSeen.has(k)) problems.push(`DUPLIKÁTUM név szerint: "${org.name}" ≈ "${nameSeen.get(k)}"`);
  else nameSeen.set(k, org.name);
  // ⚠️ A név-dedup nem elég: ugyanaz a bolt két néven is felkerülhet
  // (pl. „Magyarok Boltja" és „Hungarian Delicatessen Ltd" egy címen).
  // Az utcaszintű cím a megbízhatóbb azonosító, ezért arra is szűrünk.
  if (org.address) {
    const a = addrKey(org.address);
    if (addrSeen.has(a)) problems.push(`DUPLIKÁTUM cím szerint: "${org.name}" ≈ "${addrSeen.get(a)}" (${org.address})`);
    else addrSeen.set(a, org.name);
  }
}
if (problems.length) {
  console.error("A seed NEM generálódott le — javítsd ezeket:");
  for (const p of problems) console.error("  ✗ " + p);
  process.exit(1);
}

const seen = new Set();
const lines = [];
lines.push("-- db/seed-gb.sql — AUTOGENERÁLT (scripts/gen-gb-seed.mjs). NE szerkeszd kézzel.");
lines.push("-- Valódi angliai magyar szervezetek, ellenőrzött elérhetőséggel. Alkalmazás:");
lines.push("--   wrangler d1 execute kinti-db --remote --file=./db/seed-gb.sql");
lines.push("");
lines.push("-- 1) Közösség-kategória (ország-független, OR IGNORE — a többi seed is ezt használja).");
lines.push(
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);",
);
lines.push("");
lines.push("-- 2) Szervezetek (country_code='GB', régió a canton_code-ban, jóváhagyva, nem foglalt).");

for (const org of data.organizations) {
  let id = slugify(org.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const [lat, lng] = coordsFor(org);
  const typeLabel = org.type ? org.type[0].toUpperCase() + org.type.slice(1) : "Magyar közösségi szervezet";
  // A `category` a categories tábla id-je (pl. elelmiszer, etterem). Ahol nincs
  // megadva, a tétel a közösségi kategóriába kerül (egyesület/iskola/egyház).
  const categoryId = org.category || "magyar-kozosseg";
  // A blurb a listán látszik: típus · város · (weboldal-domain).
  const blurbParts = [typeLabel, org.city].filter(Boolean);
  if (org.website) blurbParts.push(org.website.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const blurb = blurbParts.join(" · ");
  // Ahol van utcacím, az megy az address-be; egyébként a város.
  const address = org.address || org.city;

  const cols =
    "(id, name, category_id, category_label, address, phone, contact_email, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, open_text, moderation_status, claimed, hidden, source, country_code, canton_code)";
  const vals = [
    q(id),
    q(org.name),
    q(categoryId),
    q(typeLabel),
    q(address),
    q(org.phone ?? null),
    q(org.email ?? null),
    q(blurb),
    `'["Magyar"]'`,
    lat,
    lng,
    50,
    50,
    0,
    0,
    0,
    0,
    q(org.hours ?? null),
    1, // moderation_status = jóváhagyva
    0, // claimed = nem foglalt (a valódi szervezet átveheti)
    0, // hidden
    "'seed-gb-org'",
    "'GB'",
    q(org.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
  // ⚠️ Az INSERT OR IGNORE a MÁR MEGLÉVŐ sort némán átugorja, így egy utólagos
  // pontosítás (házszám-szintű koordináta, irányítószám, telefon, nyitvatartás)
  // sosem érne célba — ezért minden tételhez UPDATE is megy.
  // A `claimed = 0 AND source` feltétel védi azt, amit egy valódi tulajdonos
  // már átvett és a saját kezével szerkesztett: azt NEM írjuk felül.
  lines.push(
    `UPDATE businesses SET address = ${q(address)}, phone = ${q(org.phone ?? null)}, ` +
      `contact_email = ${q(org.email ?? null)}, open_text = ${q(org.hours ?? null)}, ` +
      `lat = ${lat}, lng = ${lng}, category_id = ${q(categoryId)}, blurb = ${q(blurb)} ` +
      `WHERE id = ${q(id)} AND claimed = 0 AND source = 'seed-gb-org';`,
  );
}

lines.push("");
writeFileSync(join(root, "db/seed-gb.sql"), lines.join("\n"), "utf8");

const withAddress = data.organizations.filter((o) => o.address).length;
const withPhone = data.organizations.filter((o) => o.phone).length;
const withEmail = data.organizations.filter((o) => o.email).length;
console.log(
  `db/seed-gb.sql legenerálva: ${data.organizations.length} szervezet ` +
    `(${withAddress} utcacímmel, ${withPhone} telefonnal, ${withEmail} e-maillel).`,
);
