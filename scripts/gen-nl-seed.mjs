// scripts/gen-nl-seed.mjs
//
// A db/seed-data/nl-organizations.json (valódi hollandiai magyar szervezetek)
// alapján legenerálja a db/seed-nl.sql-t: a "magyar-kozosseg" kategóriát +
// a szervezeteket a businesses táblába (country_code='NL', régió a canton_code-ba,
// jóváhagyva [moderation_status=1] de nem foglalt [claimed=0], hogy a valódi
// szervezet később átvehesse). Futtatás:  node scripts/gen-nl-seed.mjs
//
// A seedet KÉZZEL kell alkalmazni (a 0081 migráció UTÁN):
//   wrangler d1 execute kinti-db --remote --file=./db/seed-nl.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(root, "db/seed-data/nl-organizations.json"), "utf8"));

// Város → (lat,lng) közelítő középpont (térkép-pin). Ismeretlennél a provincia-székhely.
const CITY_COORDS = {
  "amsterdam": [52.3676, 4.9041],
  "amstelveen": [52.3114, 4.8701],
  "alkmaar": [52.6324, 4.7534],
  "den haag": [52.0705, 4.3007],
  "hága": [52.0705, 4.3007],
  "rotterdam": [51.9244, 4.4777],
  "utrecht": [52.0907, 5.1214],
  "maarssen": [52.1389, 5.0386],
  "vianen": [51.9897, 5.0936],
  "eindhoven": [51.4416, 5.4697],
  "hengelo": [52.2659, 6.7930],
  "zwolle": [52.5168, 6.0830],
  "meppel": [52.6957, 6.1939],
  "maastricht": [50.8514, 5.6910],
};
// Provincia-kód → székhely fallback koordináta (regions.ts NL-kódjaival egyezően).
const REGION_COORDS = {
  NH: [52.3874, 4.6462],  // Haarlem
  ZH: [52.0705, 4.3007],  // Den Haag
  UT: [52.0907, 5.1214],  // Utrecht
  NB: [51.6978, 5.3037],  // 's-Hertogenbosch
  GE: [51.9851, 5.8987],  // Arnhem
  OV: [52.5168, 6.0830],  // Zwolle
  LI: [50.8514, 5.6910],  // Maastricht
  FR: [53.2012, 5.7999],  // Leeuwarden
  GR: [53.2194, 6.5665],  // Groningen
  DR: [52.9925, 6.5649],  // Assen
  FL: [52.5185, 5.4714],  // Lelystad
  ZE: [51.4988, 3.6136],  // Middelburg
};

function coordsFor(org) {
  const city = (org.city || "").toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (city.includes(key)) return CITY_COORDS[key];
  }
  return REGION_COORDS[org.region] || REGION_COORDS.NH;
}

function slugify(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u", ä: "a", ß: "ss" };
  return (
    "nl-" +
    s
      .toLowerCase()
      .replace(/[áéíóöőúüűäß]/g, (c) => map[c] || c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null ? "NULL" : `'${esc(s)}'`);

const seen = new Set();
const lines = [];
lines.push("-- db/seed-nl.sql — AUTOGENERÁLT (scripts/gen-nl-seed.mjs). NE szerkeszd kézzel.");
lines.push("-- Valódi hollandiai magyar szervezetek. Alkalmazás a 0081 migráció UTÁN:");
lines.push("--   wrangler d1 execute kinti-db --remote --file=./db/seed-nl.sql");
lines.push("");
lines.push("-- 1) Közösség-kategória (ország-független, OR IGNORE — a többi seed is ezt használja).");
lines.push(
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);",
);
lines.push("");
lines.push("-- 2) Szervezetek (country_code='NL', régió a canton_code-ban, jóváhagyva, nem foglalt).");

for (const org of data.organizations) {
  let id = slugify(org.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const [lat, lng] = coordsFor(org);
  const typeLabel = org.type
    ? /magyar/i.test(org.type) ? org.type[0].toUpperCase() + org.type.slice(1) : `Magyar ${org.type}`
    : "Magyar közösségi szervezet";
  const blurbParts = [typeLabel, org.city].filter(Boolean);
  if (org.website) blurbParts.push(org.website.replace(/^https?:\/\//, ""));
  const blurb = blurbParts.join(" · ");
  const cols =
    "(id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)";
  const vals = [
    q(id),
    q(org.name),
    "'magyar-kozosseg'",
    q(org.type ? org.type[0].toUpperCase() + org.type.slice(1) : "Egyesület"),
    q(org.city),
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
    1, // moderation_status = jóváhagyva
    0, // claimed = nem foglalt (a valódi szervezet átveheti)
    0, // hidden
    "'seed-nl-org'",
    "'NL'",
    q(org.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
}

lines.push("");
const out = lines.join("\n");
writeFileSync(join(root, "db/seed-nl.sql"), out, "utf8");
console.log(`db/seed-nl.sql legenerálva: ${data.organizations.length} szervezet.`);
