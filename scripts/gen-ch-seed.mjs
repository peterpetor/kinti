// scripts/gen-ch-seed.mjs
//
// A db/seed-data/ch-organizations.json (valódi svájci magyar szervezetek) alapján
// legenerálja a db/seed-ch.sql-t: a "magyar-kozosseg" kategóriát + a szervezeteket a
// businesses táblába (country_code='CH', kanton a canton_code-ba, jóváhagyva
// [moderation_status=1] de nem foglalt [claimed=0], hogy a valódi szervezet később
// átvehesse). Futtatás:  node scripts/gen-ch-seed.mjs
//
// A seedet KÉZZEL kell alkalmazni:
//   wrangler d1 execute kinti-db --remote --file=./db/seed-ch.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(root, "db/seed-data/ch-organizations.json"), "utf8"));

// Város → (lat,lng) közelítő középpont (térkép-pin). Ismeretlennél a kanton-székhely.
const CITY_COORDS = {
  "zürich": [47.3769, 8.5417],
  "zurich": [47.3769, 8.5417],
  "basel": [47.5596, 7.5886],
  "bern": [46.9480, 7.4474],
  "genf": [46.2044, 6.1432],
  "genève": [46.2044, 6.1432],
  "geneve": [46.2044, 6.1432],
  "kreuzlingen": [47.6510, 9.1745],
  "baden": [47.4737, 8.3080],
  "luzern": [47.0502, 8.3093],
  "winterthur": [47.5001, 8.7501],
  "st. gallen": [47.4245, 9.3767],
  "lugano": [46.0037, 8.9511],
  "zug": [47.1662, 8.5155],
  "lausanne": [46.5197, 6.6323],
};
// Kanton-kód → székhely fallback koordináta (lib/regions.ts CH kantonjaihoz igazodva).
const REGION_COORDS = {
  ZH: [47.3769, 8.5417],   // Zürich
  BE: [46.9480, 7.4474],   // Bern
  GE: [46.2044, 6.1432],   // Genève
  BS: [47.5596, 7.5886],   // Basel
  BL: [47.4840, 7.7340],   // Liestal
  VD: [46.5197, 6.6323],   // Lausanne
  LU: [47.0502, 8.3093],   // Luzern
  SG: [47.4245, 9.3767],   // St. Gallen
  TI: [46.0037, 8.9511],   // Lugano
  ZG: [47.1662, 8.5155],   // Zug
  AG: [47.3909, 8.0455],   // Aarau
  FR: [46.8065, 7.1619],   // Fribourg
  NE: [46.9899, 6.9293],   // Neuchâtel
  TG: [47.5536, 8.8987],   // Frauenfeld
  SO: [47.2074, 7.5371],   // Solothurn
  GR: [46.8499, 9.5329],   // Chur
  VS: [46.2294, 7.3608],   // Sion
  SH: [47.6970, 8.6349],   // Schaffhausen
};

function coordsFor(org) {
  const city = (org.city || "").toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (city.includes(key)) return CITY_COORDS[key];
  }
  return REGION_COORDS[org.region] || REGION_COORDS.ZH;
}

function slugify(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u", ä: "a", ß: "ss" };
  return (
    "ch-" +
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
lines.push("-- db/seed-ch.sql — AUTOGENERÁLT (scripts/gen-ch-seed.mjs). NE szerkeszd kézzel.");
lines.push("-- Valódi svájci magyar szervezetek (forrás: berni nagykövetség hivatalos jegyzéke). Alkalmazás:");
lines.push("--   wrangler d1 execute kinti-db --remote --file=./db/seed-ch.sql");
lines.push("");
lines.push("-- 1) Közösség-kategória (ország-független, OR IGNORE — az AT/DE-seed is ezt használja).");
lines.push(
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);",
);
lines.push("");
lines.push("-- 2) Szervezetek (country_code='CH', kanton a canton_code-ban, jóváhagyva, nem foglalt).");

for (const org of data.organizations) {
  let id = slugify(org.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const [lat, lng] = coordsFor(org);
  const typeLabel = org.type
    ? /magyar/i.test(org.type) ? org.type[0].toUpperCase() + org.type.slice(1) : `Magyar ${org.type}`
    : "Magyar közösségi szervezet";
  const blurbParts = [typeLabel, org.city].filter(Boolean);
  if (org.website) blurbParts.push(org.website.replace(/^https?:\/\//, "").replace(/\/$/, ""));
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
    "'seed-ch-org'",
    "'CH'",
    q(org.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
}

lines.push("");
writeFileSync(join(root, "db/seed-ch.sql"), lines.join("\n"), "utf8");
console.log(`db/seed-ch.sql legenerálva: ${data.organizations.length} szervezet.`);
