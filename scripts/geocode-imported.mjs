// scripts/geocode-imported.mjs
//
// A scripts/_geocode_in.json (wrangler --json export: id,name,address,country_code,lat,lng)
// utcaszintű címeit BEGEOKÓDOLJA a Photon (OSM) publikus API-val, és kiírja a
// scripts/geocode_updates.sql-t (UPDATE businesses SET lat/lng). A homályos
// (csak város / „Mobil" / „Online") címeket kihagyja. Sanity: ország + <40 km a
// jelenlegi (városközpont) ponttól. Futtatás:  node scripts/geocode-imported.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRY_NAME = { CH: "Schweiz", AT: "Österreich", DE: "Deutschland", NL: "Nederland" };
const COUNTRY_CC = { CH: "ch", AT: "at", DE: "de", NL: "nl" };

const raw = JSON.parse(readFileSync(join(__dirname, "_geocode_in.json"), "utf8"));
const rows = Array.isArray(raw) ? raw[0]?.results ?? raw : raw.results ?? [];

const cleanAddress = (a) =>
  String(a || "")
    .replace(/\(\s*\d+\.?\s*ker\.?\s*\)/gi, "")   // (18. ker)
    .replace(/,?\s*\d+\.\s*ker(ület)?\.?/gi, "")   // , 14. ker / 5. kerület
    .replace(/\bpartnerklinika\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();

const isGeocodable = (a) => {
  const c = cleanAddress(a);
  return /\d/.test(c) && !/^(mobil|online)$/i.test(c) && c.length > 4;
};

const haversine = (la1, lo1, la2, lo2) => {
  const R = 6371, d = (x) => (x * Math.PI) / 180;
  const h = Math.sin(d(la2 - la1) / 2) ** 2 + Math.cos(d(la1)) * Math.cos(d(la2)) * Math.sin(d(lo2 - lo1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

async function geocode(q, biasLat, biasLng) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1&lat=${biasLat}&lon=${biasLng}`;
  const res = await fetch(url, { headers: { "User-Agent": "kinti-geocode/1.0 (admin@kinti.app)" } });
  if (!res.ok) return null;
  const j = await res.json();
  const f = j.features?.[0];
  if (!f?.geometry?.coordinates) return null;
  const [lng, lat] = f.geometry.coordinates;
  return { lat, lng, country: (f.properties?.countrycode || "").toLowerCase() };
}

const updates = [];
const skipped = [];
for (const r of rows) {
  if (!isGeocodable(r.address)) { skipped.push(`${r.name} — nincs utcacím (${r.address || "—"})`); continue; }
  const q = `${cleanAddress(r.address)}, ${COUNTRY_NAME[r.country_code] || ""}`;
  let got = null;
  try { got = await geocode(q, r.lat, r.lng); } catch { /* hálózat */ }
  await new Promise((s) => setTimeout(s, 350)); // udvarias rate-limit
  if (!got) { skipped.push(`${r.name} — geokód sikertelen`); continue; }
  const dist = haversine(r.lat, r.lng, got.lat, got.lng);
  const wrongCountry = got.country && COUNTRY_CC[r.country_code] && got.country !== COUNTRY_CC[r.country_code];
  if (wrongCountry || dist > 40) { skipped.push(`${r.name} — gyanús (${dist.toFixed(1)} km / ${got.country || "?"})`); continue; }
  updates.push({ id: r.id, name: r.name, lat: +got.lat.toFixed(6), lng: +got.lng.toFixed(6), dist: +dist.toFixed(2) });
}

const sql = [
  "-- scripts/geocode_updates.sql — AUTOGENERÁLT (geocode-imported.mjs). Pontos koordináták (Photon/OSM).",
  ...updates.map((u) => `UPDATE businesses SET lat=${u.lat}, lng=${u.lng} WHERE id='${u.id.replace(/'/g, "''")}';`),
  "",
].join("\n");
writeFileSync(join(__dirname, "geocode_updates.sql"), sql, "utf8");

console.log(`[Siker] ${updates.length} cég geokódolva → scripts/geocode_updates.sql`);
updates.forEach((u) => console.log(`  ${String(u.dist).padStart(6)} km  ${u.name}`));
if (skipped.length) console.log(`\n[Kihagyva ${skipped.length}]\n  ` + skipped.join("\n  "));
