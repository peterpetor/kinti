// scripts/gen-de-seed.mjs
//
// A db/seed-data/de-organizations.json (valódi németországi magyar szervezetek)
// alapján legenerálja a db/seed-de.sql-t: a "magyar-kozosseg" kategóriát +
// a szervezeteket a businesses táblába (country_code='DE', régió a canton_code-ba,
// jóváhagyva [moderation_status=1] de nem foglalt [claimed=0], hogy a valódi
// szervezet később átvehesse). Futtatás:  node scripts/gen-de-seed.mjs
//
// A seedet KÉZZEL kell alkalmazni (a 0081 + 0083 migráció UTÁN):
//   wrangler d1 execute kinti-db --remote --file=./db/seed-de.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(root, "db/seed-data/de-organizations.json"), "utf8"));

// Város → (lat,lng) közelítő középpont (térkép-pin). Ismeretlennél a régió-főváros.
const CITY_COORDS = {
  "stuttgart": [48.7758, 9.1829],
  "karlsruhe": [49.0069, 8.4037],
  "pforzheim": [48.8922, 8.6946],
  "heidelberg": [49.3988, 8.6724],
  "mainz": [49.9929, 8.2473],
  "chemnitz": [50.8278, 12.9214],
  "münchen": [48.1351, 11.5820],
  "augsburg": [48.3705, 10.8978],
  "berlin": [52.5200, 13.4050],
  "frankfurt": [50.1109, 8.6821],
  "darmstadt": [49.8728, 8.6512],
  "hannover": [52.3759, 9.7320],
  "düsseldorf": [51.2277, 6.7735],
  "köln": [50.9375, 6.9603],
  "münster": [51.9607, 7.6261],
  "kiel": [54.3233, 10.1228],
  "neustadt": [51.0237, 14.2139],
  "dresden": [51.0504, 13.7373],
  "hamburg": [53.5511, 9.9937],
};
// Régió-kód → tartományi székhely fallback koordináta (de-points.ts-szel egyezően).
const REGION_COORDS = {
  BW: [48.7758, 9.1829],   // Stuttgart
  BY: [48.1351, 11.5820],  // München
  BE: [52.5200, 13.4050],  // Berlin
  BB: [52.3906, 13.0645],  // Potsdam
  HB: [53.0793, 8.8017],   // Bremen
  HH: [53.5511, 9.9937],   // Hamburg
  HE: [50.0782, 8.2398],   // Wiesbaden
  MV: [53.6355, 11.4012],  // Schwerin
  NI: [52.3759, 9.7320],   // Hannover
  NW: [51.2277, 6.7735],   // Düsseldorf
  RP: [49.9929, 8.2473],   // Mainz
  SL: [49.2402, 6.9969],   // Saarbrücken
  SN: [51.0504, 13.7373],  // Dresden
  ST: [52.1205, 11.6276],  // Magdeburg
  SH: [54.3233, 10.1228],  // Kiel
  TH: [50.9848, 11.0299],  // Erfurt
};

function coordsFor(org) {
  const city = (org.city || "").toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (city.includes(key)) return CITY_COORDS[key];
  }
  return REGION_COORDS[org.region] || REGION_COORDS.BE;
}

function slugify(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u", ä: "a", ß: "ss" };
  return (
    "de-" +
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
lines.push("-- db/seed-de.sql — AUTOGENERÁLT (scripts/gen-de-seed.mjs). NE szerkeszd kézzel.");
lines.push("-- Valódi németországi magyar szervezetek. Alkalmazás a 0081 + 0083 migráció UTÁN:");
lines.push("--   wrangler d1 execute kinti-db --remote --file=./db/seed-de.sql");
lines.push("");
lines.push("-- 1) Közösség-kategória (ország-független, OR IGNORE — AT-seed is ezt használja).");
lines.push(
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);",
);
lines.push("");
lines.push("-- 2) Szervezetek (country_code='DE', régió a canton_code-ban, jóváhagyva, nem foglalt).");

for (const org of data.organizations) {
  let id = slugify(org.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const [lat, lng] = coordsFor(org);
  // A "Magyar" előtag elmarad, ha a típus már tartalmazza (pl. "német-magyar társaság").
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
    "'seed-de-org'",
    "'DE'",
    q(org.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
}

lines.push("");
const out = lines.join("\n");
writeFileSync(join(root, "db/seed-de.sql"), out, "utf8");
console.log(`db/seed-de.sql legenerálva: ${data.organizations.length} szervezet.`);
