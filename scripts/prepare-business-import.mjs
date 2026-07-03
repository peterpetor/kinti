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
  // 2026-07-03: van már `elelmiszer` kategória (a generált SQL hozza létre,
  // INSERT OR IGNORE) — a magyar boltok a szaknévsorban kereshetők, ahogy a
  // /magyarbolt kivezetésekor a döntés szólt.
  elelmiszerbolt: ["elelmiszer", "Élelmiszerbolt"],
  allatorvos: ["allatorvos", "Állatorvos"],
  borgyogyasz: ["borgyogyasz", "Bőrgyógyász"],
  alternativgyogyasz: ["termeszetgyogyasz", "Természetgyógyász"],
  ingatlan: ["ingatlan", "Ingatlan"],
};

// Város (kisbetűs részlet) → [régiókód, lat, lng].
const CITY = {
  "tägerwilen": ["TG", 47.651, 9.176],
  "bottighofen": ["TG", 47.6423, 9.2153],
  "zürich": ["ZH", 47.3769, 8.5417],
  "unterföhring": ["BY", 48.1927, 11.644],
  "rosenheim": ["BY", 47.857, 12.116],
  "münchen": ["BY", 48.1351, 11.582],
  "berlin": ["BE", 52.52, 13.405],
  "frankfurt": ["HE", 50.1109, 8.6821],
  "rattersdorf": ["BGL", 47.43, 16.43],
  "oberwart": ["BGL", 47.2895, 16.2059],
  "bécs": ["W", 48.2082, 16.3738],
  "wien": ["W", 48.2082, 16.3738],
  "amszterdam": ["NH", 52.3676, 4.9041],
  "amsterdam": ["NH", 52.3676, 4.9041],
  "rotterdam": ["ZH", 51.9244, 4.4777],
  "schiedam": ["ZH", 51.92, 4.4],
  "vlaardingen": ["ZH", 51.9121, 4.3419],
  "leiden": ["ZH", 52.1601, 4.497],
  "utrecht": ["UT", 52.0907, 5.1214],
  "groningen": ["GR", 53.2194, 6.5665],
  "purmerend": ["NH", 52.505, 4.9592],
};
// Ország-középpont, ha a város ismeretlen (pl. csak „Hollandia").
const COUNTRY_FALLBACK = { CH: [46.8, 8.23], AT: [47.6, 14.5], DE: [51.1, 10.4], NL: [52.13, 5.29] };

// A régió/fallback-koordináta a városból VAGY a cím szövegéből (a CSV-ben a
// city néha csak „Hollandia", de a cím tartalmazza a valódi települést).
function resolveCity(city, address, country) {
  const c = `${city || ""} ${address || ""}`.toLowerCase();
  for (const k of Object.keys(CITY)) if (c.includes(k)) return CITY[k];
  const f = COUNTRY_FALLBACK[country] || [47.3769, 8.5417];
  return [null, f[0], f[1]];
}

// --- Nominatim geokódolás: a PONTOS cím → házszám-szintű lat/lng -------------
// A [[precise-address-seed]] elv: sosem tippelünk — a megadott címet a Nominatim
// oldja fel, országra szűrve; bbox-validálás után fogadjuk csak el. Cache-fájl
// (geocode-cache.json), hogy az újrafuttatás ne kérdezzen újra (1,15s/kérés limit).
const CACHE_FILE = path.join(__dirname, "geocode-cache.json");
const BBOX = {
  CH: [45.8, 47.9, 5.9, 10.6], AT: [46.3, 49.1, 9.4, 17.2],
  DE: [47.2, 55.1, 5.8, 15.1], NL: [50.7, 53.6, 3.3, 7.3],
};
const inBbox = (cc, lat, lng) => {
  const b = BBOX[cc];
  return !!b && lat >= b[0] && lat <= b[1] && lng >= b[2] && lng <= b[3];
};
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch { /* első futás */ }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Bécsi/holland címek lépcsőház-emelet jelölései ("8-12/1/25", "Top 203",
// "(18. ker)") megzavarják a Nominatimot → egyszerűsített változat a retry-hoz:
// csak utca + első házszám + irányítószám/város marad.
function simplifyAddress(address) {
  let a = address
    .replace(/\(([^)]*)\)/g, " ")                    // zárójeles rész ki
    .replace(/\b(Top|Stiege|Tür|St\.?g\.?)\s*\S+/gi, " ") // Top 203 / Stiege ki
    .replace(/(\d+)[a-z]?\s*[-–]\s*\d+/gi, "$1")     // 8-12 → 8
    .replace(/(\d+)\/[\w/.]+/g, "$1")                // 17/3, 24/1/16 → első szám
    .replace(/\d+\.\s*ker(ület|\.)?/gi, "Wien")      // "14. ker" → Wien
    .replace(/\s*\/\s*(?=,|$)/g, "")                 // lógó "/" ki
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .trim();
  return a;
}

async function fetchNominatim(query, country) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1` +
    `&countrycodes=${country.toLowerCase()}&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "kinti-import/1.0 (kinti.app)" } });
    const data = await res.json();
    const hit = Array.isArray(data) && data[0];
    if (hit) {
      const lat = Number(hit.lat), lng = Number(hit.lon);
      if (inBbox(country, lat, lng)) return { lat, lng };
    }
  } catch { /* hálózati hiba → null */ }
  return null;
}

async function geocode(address, country) {
  if (!address || !/\d/.test(address)) return null; // házszám nélkül nincs mit pontosítani
  const key = `${country}|${address}`;
  if (key in cache && cache[key] !== null) return cache[key];
  let out = await fetchNominatim(address, country);
  await sleep(1150); // Nominatim usage policy: max ~1 kérés/mp
  if (!out) {
    const simple = simplifyAddress(address);
    if (simple && simple !== address) {
      out = await fetchNominatim(simple, country);
      await sleep(1150);
    }
  }
  cache[key] = out; // a null-t is cache-eljük (a retry-ág null-nál újrapróbál)
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1), "utf8");
  return out;
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
  "-- átvehető (claimed=0). UPSERT: a meglévő (nem-claimolt, csv-import) sorok cím/koordináta/blurb",
  "-- mezői frissülnek — a tulaj által átvett sorokat NEM írja felül.",
  "-- Élesítés: wrangler d1 execute kinti-db --remote --file=scripts/import_businesses.sql",
  "",
  "-- Élelmiszer-kategória (a /magyarbolt kivezetésekor a döntés: a boltok a szaknévsorban kereshetők)",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('elelmiszer', 'Élelmiszerbolt', '🛒', 900);",
  "",
];
let count = 0, geocoded = 0;
const perCountry = {};

for (const r of records) {
  if (!r.name || !r.country_code) continue;
  const cat = CATEGORY[r.category_id];
  if (!cat) { skipped.push(`${r.name} — ismeretlen kategória: "${r.category_id}"`); continue; }
  const [catId, catLabel] = cat;
  const country = r.country_code.toUpperCase();
  const [region, cityLat, cityLng] = resolveCity(r.city, r.address, country);
  // Pontos cím → Nominatim (házszám-szintű koordináta); ha nem oldódik fel,
  // a város-koordináta marad, és a [FIGYELEM] log jelzi kézi ellenőrzésre.
  const geo = await geocode(r.address, country);
  const lat = geo?.lat ?? cityLat;
  const lng = geo?.lng ?? cityLng;
  if (geo) geocoded++;
  else if (r.address && /\d/.test(r.address)) skipped.push(`(geokód-fallback, város-pont) ${r.name} — ${r.address}`);

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
  lines.push(
    `INSERT INTO businesses ${cols} VALUES (${vals})`,
    `  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,`,
    `    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,`,
    `    category_label=excluded.category_label, canton_code=excluded.canton_code`,
    `  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';`,
  );
  count++;
  perCountry[country] = (perCountry[country] || 0) + 1;
}

fs.writeFileSync(SQL_OUTPUT, lines.join("\n") + "\n", "utf8");
console.log(`[Siker] ${count} vállalkozás (${geocoded} házszám-pontos geokóddal) → ${SQL_OUTPUT}`);
console.log("  Ország szerint:", JSON.stringify(perCountry));
if (skipped.length) console.log("[FIGYELEM]\n  " + skipped.join("\n  "));
