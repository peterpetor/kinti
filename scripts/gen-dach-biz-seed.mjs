// scripts/gen-dach-biz-seed.mjs
//
// A db/seed-data/dach-businesses.json (valódi magyar vendéglátóhelyek/üzletek DACH-ban)
// alapján legenerálja a db/seed-dach-biz.sql-t: a businesses táblába, PER-CÉG kategóriával
// (nem közösség), jóváhagyva (moderation_status=1), nem foglalt (claimed=0). Futtatás:
//   node scripts/gen-dach-biz-seed.mjs
// Alkalmazás:  wrangler d1 execute kinti-db --remote --file=./db/seed-dach-biz.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const data = JSON.parse(readFileSync(join(root, "db/seed-data/dach-businesses.json"), "utf8"));

// Város → koordináta (a lefedett városokra). Ismeretlennél a régió-fallback.
const CITY_COORDS = {
  "wien": [48.2082, 16.3738],
  "berlin": [52.5200, 13.4050],
  "münchen": [48.1351, 11.5820],
  "graz": [47.0707, 15.4395],
  "linz": [48.3064, 14.2861],
  "salzburg": [47.8095, 13.0550],
  "innsbruck": [47.2692, 11.4041],
  "frankfurt": [50.1109, 8.6821],
  "hamburg": [53.5511, 9.9937],
  "köln": [50.9375, 6.9603],
  "stuttgart": [48.7758, 9.1829],
  "zürich": [47.3769, 8.5417],
  "basel": [47.5596, 7.5886],
  "genf": [46.2044, 6.1432],
};
const REGION_COORDS = {
  W: [48.2082, 16.3738], BE: [52.5200, 13.4050], BY: [48.1351, 11.5820],
  STM: [47.0707, 15.4395], OOE: [48.3064, 14.2861], SBG: [47.8095, 13.0550],
  TIR: [47.2692, 11.4041], HE: [50.1109, 8.6821], HH: [53.5511, 9.9937],
  NW: [51.2277, 6.7735], BW: [48.7758, 9.1829], ZH: [47.3769, 8.5417],
};

function coordsFor(b) {
  const city = (b.city || "").toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) if (city.includes(key)) return CITY_COORDS[key];
  return REGION_COORDS[b.region] || [48.2082, 16.3738];
}

function slugify(country, s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u", ä: "a", ß: "ss" };
  return (
    country.toLowerCase() + "-biz-" +
    s.toLowerCase().replace(/[áéíóöőúüűäß]/g, (c) => map[c] || c)
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56)
  );
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null ? "NULL" : `'${esc(s)}'`);

const seen = new Set();
const lines = [
  "-- db/seed-dach-biz.sql — AUTOGENERÁLT (scripts/gen-dach-biz-seed.mjs). NE szerkeszd kézzel.",
  "-- Valódi magyar vendéglátóhelyek/üzletek DACH-ban, per-cég kategóriával. Alkalmazás:",
  "--   wrangler d1 execute kinti-db --remote --file=./db/seed-dach-biz.sql",
  "",
];

for (const b of data.businesses) {
  let id = slugify(b.country, b.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const [lat, lng] = coordsFor(b);
  const blurbParts = [b.label, b.city].filter(Boolean);
  if (b.website) blurbParts.push(b.website.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const cols =
    "(id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)";
  const vals = [
    q(id), q(b.name), q(b.category), q(b.label), q(b.city), q(blurbParts.join(" · ")),
    `'["Magyar"]'`, lat, lng, 50, 50, 0, 0, 0, 0, 1, 0, 0, "'seed-biz'", q(b.country), q(b.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
}

lines.push("");
writeFileSync(join(root, "db/seed-dach-biz.sql"), lines.join("\n"), "utf8");
console.log(`db/seed-dach-biz.sql legenerálva: ${data.businesses.length} cég.`);
