// scripts/gen-at-seed.mjs
//
// A db/seed-data/at-organizations.json (valódi osztrák magyar szervezetek)
// alapján legenerálja a db/seed-at.sql-t: az új "magyar-kozosseg" kategóriát +
// a szervezeteket a businesses táblába (country_code='AT', régió a canton_code-ba,
// jóváhagyva [moderation_status=1] de nem foglalt [claimed=0], hogy a valódi
// szervezet később átvehesse). Futtatás:  node scripts/gen-at-seed.mjs
//
// A seedet KÉZZEL kell alkalmazni (a 0081 migráció UTÁN):
//   wrangler d1 execute kinti-db --remote --file=./db/seed-at.sql

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(root, "db/seed-data/at-organizations.json"), "utf8"));

// Város → (lat,lng) közelítő középpont (térkép-pin). Ismeretlennél a régió-főváros.
const CITY_COORDS = {
  "wien": [48.2082, 16.3738],
  "alsóőr": [47.2667, 16.2167],
  "felsőőr": [47.2853, 16.2003],
  "őrisziget": [47.2500, 16.2333],
  "graz": [47.0707, 15.4395],
  "linz": [48.3064, 14.2861],
  "wels": [48.1575, 14.0289],
  "innsbruck": [47.2692, 11.4041],
  "salzburg": [47.8095, 13.0550],
  "wiener neustadt": [47.8149, 16.2425],
};
// Régió-kód → fővárosi fallback koordináta.
const REGION_COORDS = {
  W: [48.2082, 16.3738],     // Wien
  BGL: [47.8457, 16.5278],   // Eisenstadt
  STM: [47.0707, 15.4395],   // Graz
  OOE: [48.3064, 14.2861],   // Linz
  TIR: [47.2692, 11.4041],   // Innsbruck
  SBG: [47.8095, 13.0550],   // Salzburg
  VBG: [47.5031, 9.7471],    // Bregenz
  KTN: [46.6247, 14.3050],   // Klagenfurt
  NOE: [47.8149, 16.2425],   // Wiener Neustadt
};

function coordsFor(org) {
  const city = (org.city || "").toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (city.includes(key)) return CITY_COORDS[key];
  }
  return REGION_COORDS[org.region] || REGION_COORDS.W;
}

function slugify(s) {
  const map = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u" };
  return (
    "at-" +
    s
      .toLowerCase()
      .replace(/[áéíóöőúüű]/g, (c) => map[c] || c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null ? "NULL" : `'${esc(s)}'`);

const seen = new Set();
const lines = [];
lines.push("-- db/seed-at.sql — AUTOGENERÁLT (scripts/gen-at-seed.mjs). NE szerkeszd kézzel.");
lines.push("-- Valódi osztrák magyar szervezetek. Alkalmazás a 0081 migráció UTÁN:");
lines.push("--   wrangler d1 execute kinti-db --remote --file=./db/seed-at.sql");
lines.push("");
lines.push("-- 1) Közösség-kategória (ország-független, de csak AT-ben lesz rá tartalom).");
lines.push(
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);",
);
lines.push("");
lines.push("-- 2) Szervezetek (country_code='AT', régió a canton_code-ban, jóváhagyva, nem foglalt).");

for (const org of data.organizations) {
  let id = slugify(org.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);
  const [lat, lng] = coordsFor(org);
  const blurbParts = [org.type ? `Magyar ${org.type}` : "Magyar közösségi szervezet", org.city].filter(Boolean);
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
    "'seed-at-org'",
    "'AT'",
    q(org.region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
}

lines.push("");
const out = lines.join("\n");
writeFileSync(join(root, "db/seed-at.sql"), out, "utf8");
console.log(`db/seed-at.sql legenerálva: ${data.organizations.length} szervezet.`);
