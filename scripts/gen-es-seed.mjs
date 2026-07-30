// scripts/gen-es-seed.mjs
//
// A db/seed-data/es-organizations.json (valódi SPANYOLORSZÁGI magyar közösségi
// szervezetek + magyarul beszélő szakemberek) alapján legenerálja a
// db/seed-es.sql-t: a "magyar-kozosseg" kategóriát (ha még nincs) + a
// szervezeteket/szakembereket a businesses táblába (country_code='ES', a
// comunidad autónoma kódja a canton_code-ba), jóváhagyva (moderation_status=1),
// de nem foglalt (claimed=0), hogy a valódi tulajdonos később átvehesse.
// Futtatás:  node scripts/gen-es-seed.mjs
//
// A minta a gen-gb-seed.mjs-t követi (utcaszintű address/phone/contact_email a
// valódi oszlopokba, weboldal a blurb-be). SOHA ne találj ki házszámot — ahol a
// forrás csak várost/megyét adott (pl. a MAEC hites fordító-jegyzék publikus
// nyilvántartása utcacím nélkül), ott a `address` mező a megye/tartomány neve
// marad, a `lat`/`lng` pedig a legközelebbi nagyváros középpontja.
//
// A seedet KÉZZEL kell alkalmazni:
//   wrangler d1 execute kinti-db --remote --file=./db/seed-es.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(root, "db/seed-data/es-organizations.json"), "utf8"));

function slugify(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u" };
  return (
    "es-" +
    s
      .toLowerCase()
      .replace(/[áéíóöőúüű]/g, (c) => map[c] || c)
      // Spanyol/katalán ékezetek is előfordulnak a nevekben (María, Gómöry…).
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}

/** Dedup-kulcs: a név ékezet- és írásjel-mentes, tömörített alakja. */
function nameKey(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

/** Dedup-kulcs címre: kisbetűs, csak betű+szám. */
function addrKey(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null ? "NULL" : `'${esc(s)}'`);

// ── Épelméjűség-ellenőrzés a generálás ELŐTT ────────────────────────────────
// A 17 comunidad autónoma + Ceuta/Melilla — egyezik a regions.ts ES_REGIONS-szal.
const VALID_REGIONS = new Set([
  "MD", "CT", "AN", "VC", "IB", "CN", "PV", "GA", "CL", "CM",
  "AR", "MC", "AS", "EX", "NC", "CB", "RI", "CE", "ML",
]);
// ⚠️ Csak olyan kategória mehet ki, ami LÉTEZIK a categories táblában —
// különben a bejegyzés kategória nélkül, kereshetetlenül landolna.
const VALID_CATEGORIES = new Set([
  "magyar-kozosseg", "fordito", "forditasszak", "ugyved", "jogtanacsado",
  "fogorvos", "orvos", "borgyogyasz", "konyveles", "penzugyi_tanacsado",
  "ingatlan", "etterem", "elelmiszer", "cukrasz", "autoszer", "fodrasz",
  "pszichiater", "pszichologus", "dietetikus",
]);
// ⚠️ A spanyol bounding box (business.ts isSpanishCoord): a kontinentális
// félsziget VAGY a Kanári-szigetek — máshova eső koordináta hibás geokódra utal.
function isSpanishCoord(lat, lng) {
  const peninsula = lat >= 35.1 && lat <= 43.9 && lng >= -9.4 && lng <= 4.4;
  const canarias = lat >= 27.5 && lat <= 29.5 && lng >= -18.3 && lng <= -13.3;
  return peninsula || canarias;
}

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
  if (typeof org.lat === "number" && typeof org.lng === "number" && !isSpanishCoord(org.lat, org.lng)) {
    problems.push(`a koordináta Spanyolországon KÍVÜL esik: ${org.name} (${org.lat}, ${org.lng})`);
  }
  const k = nameKey(org.name);
  if (nameSeen.has(k)) problems.push(`DUPLIKÁTUM név szerint: "${org.name}" ≈ "${nameSeen.get(k)}"`);
  else nameSeen.set(k, org.name);
  // ⚠️ A név-dedup nem elég — cím szerint is szűrünk. KIVÉTEL: a `sharedAddress`
  // mező ÉRTÉKE a magyarázat (string), így egy valódi közös praxis/üzleti
  // épület nem esik ki, de a kivétel dokumentált marad.
  if (org.address && !org.sharedAddress) {
    const a = addrKey(org.address);
    if (addrSeen.has(a)) problems.push(`DUPLIKÁTUM cím szerint: "${org.name}" ≈ "${addrSeen.get(a)}" (${org.address})`);
    else addrSeen.set(a, org.name);
  }
  if (org.sharedAddress && typeof org.sharedAddress !== "string") {
    problems.push(`a sharedAddress értéke legyen a MAGYARÁZAT (string), ne ${typeof org.sharedAddress}: ${org.name}`);
  }
}
if (problems.length) {
  console.error("A seed NEM generálódott le — javítsd ezeket:");
  for (const p of problems) console.error("  ✗ " + p);
  process.exit(1);
}

const seen = new Set();
const lines = [];
lines.push("-- db/seed-es.sql — AUTOGENERÁLT (scripts/gen-es-seed.mjs). NE szerkeszd kézzel.");
lines.push("-- Valódi spanyolországi magyar szervezetek/szakemberek, ellenőrzött elérhetőséggel. Alkalmazás:");
lines.push("--   wrangler d1 execute kinti-db --remote --file=./db/seed-es.sql");
lines.push("");
lines.push("-- 1) Közösség-kategória (ország-független, OR IGNORE — a többi seed is ezt használja).");
lines.push(
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);",
);
lines.push("");
lines.push("-- 2) Szervezetek/szakemberek (country_code='ES', comunidad autónoma a canton_code-ban).");

for (const org of data.organizations) {
  let id = slugify(org.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const lat = org.lat;
  const lng = org.lng;
  const typeLabel = org.type ? org.type[0].toUpperCase() + org.type.slice(1) : "Magyar közösségi szervezet";
  const categoryId = org.category || "magyar-kozosseg";
  const blurbParts = [typeLabel, org.city].filter(Boolean);
  if (org.website) blurbParts.push(org.website.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const blurb = blurbParts.join(" · ");
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
    "'seed-es-org'",
    "'ES'",
    q(org.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
  // ⚠️ Az INSERT OR IGNORE a MÁR MEGLÉVŐ sort némán átugorja, így egy utólagos
  // pontosítás sosem érne célba — ezért minden tételhez UPDATE is megy.
  // A `claimed = 0 AND source` feltétel védi, amit egy valódi tulajdonos már
  // átvett és saját kezűleg szerkesztett: azt NEM írjuk felül.
  lines.push(
    `UPDATE businesses SET address = ${q(address)}, phone = ${q(org.phone ?? null)}, ` +
      `contact_email = ${q(org.email ?? null)}, open_text = ${q(org.hours ?? null)}, ` +
      `lat = ${lat}, lng = ${lng}, category_id = ${q(categoryId)}, blurb = ${q(blurb)}, ` +
      `canton_code = ${q(org.region)} ` +
      `WHERE id = ${q(id)} AND claimed = 0 AND source = 'seed-es-org';`,
  );
}

lines.push("");
writeFileSync(join(root, "db/seed-es.sql"), lines.join("\n"), "utf8");

const withAddress = data.organizations.filter((o) => o.address && o.address !== o.city).length;
const withPhone = data.organizations.filter((o) => o.phone).length;
const withEmail = data.organizations.filter((o) => o.email).length;
console.log(
  `db/seed-es.sql legenerálva: ${data.organizations.length} tétel ` +
    `(${withAddress} utcaszintű címmel, ${withPhone} telefonnal, ${withEmail} e-maillel).`,
);
