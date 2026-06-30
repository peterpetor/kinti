// scripts/prepare-business-import.mjs
//
// A scripts/businesses.csv-ből legenerálja a scripts/import_businesses.sql-t a
// VALÓDI businesses-séma szerint (canton_code, blurb, lat/lng, pin_x/pin_y,
// source stb.), kategória-leképezéssel a kanonikus categories ID-kre, és
// régió/koordináta-feloldással a városból. moderation_status=1 (jóváhagyva,
// azonnal látszik), claimed=0 (a tulaj átveheti). Idempotens (INSERT OR IGNORE,
// determinisztikus id). Futtatás:  node scripts/prepare-business-import.mjs
// Élesítés:  npx wrangler d1 execute kinti-db --remote --file=scripts/import_businesses.sql

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_FILE = path.join(__dirname, "businesses.csv");
const SQL_OUTPUT = path.join(__dirname, "import_businesses.sql");

// RFC4180-szerű CSV-parser: idézőjeles mezők (vesszővel), "" = escaped idézőjel.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((v) => v.trim() !== "")).map((r) => {
    const o = {}; headers.forEach((h, i) => (o[h] = (r[i] ?? "").trim())); return o;
  });
}

// CSV category_id → [kanonikus categories.id, megjelenített címke].
// A kanonikus ID-k a prod `categories` tábla ellen ellenőrizve; ahol a CSV ID
// nem létezik, a legközelebbi valódi kategóriára képezve (de a CÍMKE a tényleges
// szakma marad).
const CATEGORY = {
  fodrasz: ["fodrasz", "Fodrász"],
  fogorvos: ["fogorvos", "Fogorvos"],
  ugyved: ["ugyved", "Ügyvéd"],
  konyvelo: ["konyveles", "Könyvelés"],
  nogyogyasz: ["nogyogyasz", "Nőgyógyász / Szülész"],
  autoszerelo: ["autoszer", "Autószerelő"],
  pszichologus: ["pszichologus", "Pszichológus / Coach"],
  haziorvos: ["orvos", "Háziorvos"],
  gyermekgyogyasz: ["gyermekorvos", "Gyermekorvos"],
  fordito: ["fordito", "Fordító"],
  etterem: ["etterem", "Étterem"],
  kozmetikus: ["szepseg", "Kozmetikus"],
  szemelyiedzo: ["szemelyi_edzo", "Személyi edző"],
  biztosito: ["biztositas", "Biztosítás"],
  // FIGYELEM: az `elelmiszerbolt` SZÁNDÉKOSAN nincs itt — a magyar élelmiszer-
  // boltok/webshopok a dedikált /magyarbolt funkcióba kerülnek (hofladen_spots,
  // category="bolt"), nem a szaknévsorba (ott nincs jó grocery kategória). Az
  // ilyen sorokat a script kihagyja (lásd a [KIHAGYVA] logot).
  allatorvos: ["allatorvos", "Állatorvos"],
  borgyogyasz: ["borgyogyasz", "Bőrgyógyász"],
  alternativgyogyasz: ["termeszetgyogyasz", "Természetgyógyász"],
  ingatlan: ["ingatlan", "Ingatlan"],
};

// Város (kisbetűs részlet) → [régiókód, lat, lng].
const CITY = {
  "tägerwilen": ["TG", 47.651, 9.176],
  "zürich": ["ZH", 47.3769, 8.5417],
  "unterföhring": ["BY", 48.1927, 11.644],
  "rosenheim": ["BY", 47.857, 12.116],
  "münchen": ["BY", 48.1351, 11.582],
  "berlin": ["BE", 52.52, 13.405],
  "frankfurt": ["HE", 50.1109, 8.6821],
  "rattersdorf": ["BGL", 47.43, 16.43],
  "bécs": ["W", 48.2082, 16.3738],
  "amszterdam": ["NH", 52.3676, 4.9041],
  "rotterdam": ["ZH", 51.9244, 4.4777],
  "schiedam": ["ZH", 51.92, 4.4],
  "leiden": ["ZH", 52.1601, 4.497],
  "utrecht": ["UT", 52.0907, 5.1214],
};
// Ország-középpont, ha a város ismeretlen (pl. csak „Hollandia").
const COUNTRY_FALLBACK = { CH: [46.8, 8.23], AT: [47.6, 14.5], DE: [51.1, 10.4], NL: [52.13, 5.29] };

function resolveCity(city, country) {
  const c = (city || "").toLowerCase();
  for (const k of Object.keys(CITY)) if (c.includes(k)) return CITY[k];
  const f = COUNTRY_FALLBACK[country] || [47.3769, 8.5417];
  return [null, f[0], f[1]];
}

function slugify(country, name) {
  const m = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u", ä: "a", ß: "ss" };
  return country.toLowerCase() + "-imp-" +
    name.toLowerCase().replace(/[áéíóöőúüűäß]/g, (ch) => m[ch] || ch)
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56);
}
const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null || s === "" ? "NULL" : `'${esc(s)}'`);

const records = parseCSV(fs.readFileSync(CSV_FILE, "utf8"));
const seen = new Set();
const skipped = [];
const lines = [
  "-- scripts/import_businesses.sql — AUTOGENERÁLT (prepare-business-import.mjs). NE szerkeszd kézzel.",
  "-- Valódi magyar szakemberek (CH/AT/DE/NL), per-cég kategóriával, jóváhagyva (moderation_status=1),",
  "-- átvehető (claimed=0). Élesítés: wrangler d1 execute kinti-db --remote --file=scripts/import_businesses.sql",
  "",
];
let count = 0;
const perCountry = {};

for (const r of records) {
  if (!r.name || !r.country_code) continue;
  const cat = CATEGORY[r.category_id];
  if (!cat) { skipped.push(`${r.name} — ismeretlen kategória: "${r.category_id}"`); continue; }
  const [catId, catLabel] = cat;
  const country = r.country_code.toUpperCase();
  const [region, lat, lng] = resolveCity(r.city, country);

  let id = slugify(country, r.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);

  const website = r.website ? r.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
  const blurb = [r.description, website].filter(Boolean).join(" · ");
  const address = r.address || r.city || null;

  const cols =
    "(id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, " +
    "rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code)";
  const vals = [
    q(id), q(r.name), q(catId), q(catLabel), q(address), q(r.phone), q(blurb),
    `'["Magyar"]'`, lat, lng, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, "'csv-import'", q(country), q(region),
  ].join(", ");
  lines.push(`INSERT OR IGNORE INTO businesses ${cols} VALUES (${vals});`);
  count++;
  perCountry[country] = (perCountry[country] || 0) + 1;
}

fs.writeFileSync(SQL_OUTPUT, lines.join("\n") + "\n", "utf8");
console.log(`[Siker] ${count} vállalkozás → ${SQL_OUTPUT}`);
console.log("  Ország szerint:", JSON.stringify(perCountry));
if (skipped.length) console.log("[KIHAGYVA]\n  " + skipped.join("\n  "));
