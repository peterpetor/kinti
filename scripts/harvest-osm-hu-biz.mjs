// scripts/harvest-osm-hu-biz.mjs
// Valós magyar MINDENNAPI üzletek (étterem, pékség, fodrász, hentes, cukrászda…)
// kigyűjtése az OpenStreetMap-ból (Overpass API) — CH/AT/DE/NL. CSAK házszám-szintű
// címmel rendelkezőket tartunk meg (a user: "fontos a pontos cím és házszám").
// Nulla kitalált adat — minden az OSM-ből, valós addr:street + addr:housenumber.
// Kimenet: scripts/osm-hu-biz.json  (kézi átnézés után seedeljük).

import { writeFileSync } from "node:fs";

const COUNTRIES = ["AT", "DE", "CH", "NL"];

// OSM tag → szaknévsor kategória.
function categoryFor(t) {
  const shop = (t.shop || "").toLowerCase();
  const am = (t.amenity || "").toLowerCase();
  if (shop === "bakery") return ["kenyer_pekseg", "Kenyér / Pékség"];
  if (shop === "pastry" || shop === "confectionery") return ["cukrasz", "Cukrász / Torták"];
  if (shop === "hairdresser") return ["fodrasz", "Fodrász"];
  if (shop === "butcher") return ["husszek", "Hentes / Húsbolt"];
  if (shop === "greengrocer") return ["zoldseges", "Zöldséges"];
  if (shop === "deli" || shop === "convenience" || shop === "supermarket") return ["husszek", "Magyar élelmiszer / deli"];
  if (am === "cafe") return ["kavez", "Kávézó / Cukrászda"];
  if (am === "restaurant" || am === "fast_food") return ["etterem", "Étterem"];
  return null; // nem-mappelhető → kihagyjuk
}

// A businesses.canton_code-hoz: OSM addr:state / megye → app régió-kód. Egyszerű
// heurisztika; ismeretlennél null (a szaknévsor akkor is listáz, csak régió nélkül).
function isHungarianThemed(t) {
  const n = (t.name || "").toLowerCase();
  const cu = (t.cuisine || "").toLowerCase();
  if (cu.includes("hungarian")) return true;
  return /ungar|magyar|hungá|hungar|budapest|paprika|gulyás|gulasch|puszta|balaton|tokaj|debrecen/.test(n);
}

// Két KÖNNYŰ lekérdezés országonként (a teljes-shop-scan kifut az időből):
//  A) magyar konyhájú éttermek/kávézók (cuisine=hungarian) — gyors.
//  B) magyar-nevű üzletek, de KONKRÉT shop-típusokra szűkítve (nem az összes shop).
const NAME_RE = "ungar|magyar|hungá|hungar|budapest|paprika|gulasch|puszta|balaton|tokaj|debrecen";
const SHOP_RE = "bakery|pastry|confectionery|hairdresser|butcher|deli|convenience|greengrocer|supermarket|beverages";
const queryA = (iso) => `[out:json][timeout:60];area["ISO3166-1"="${iso}"][admin_level=2]->.a;(nwr["amenity"~"restaurant|cafe|fast_food"]["cuisine"~"hungarian",i](area.a););out center tags;`;
const queryB = (iso) => `[out:json][timeout:60];area["ISO3166-1"="${iso}"][admin_level=2]->.a;(nwr["shop"~"${SHOP_RE}"]["name"~"${NAME_RE}",i](area.a);nwr["amenity"~"restaurant|cafe|fast_food"]["name"~"${NAME_RE}",i](area.a););out center tags;`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overpass(q, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "User-Agent": "kinti.app-seed/1.0 (info@kinti.app)", "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(q),
      });
      if (!res.ok) { console.error(`${label}: HTTP ${res.status} (próba ${attempt})`); await sleep(6000); continue; }
      const data = await res.json();
      return data.elements || [];
    } catch (e) { console.error(`${label}: ${e.message} (próba ${attempt})`); await sleep(6000); }
  }
  return [];
}

const out = [];
const seen = new Set();

for (const iso of COUNTRIES) {
  const elemsA = await overpass(queryA(iso), `${iso}/A`); await sleep(2500);
  const elemsB = await overpass(queryB(iso), `${iso}/B`); await sleep(2500);
  const elements = [...elemsA, ...elemsB];
  let kept = 0;
  for (const e of elements) {
    const t = e.tags || {};
    const name = t.name;
    const st = t["addr:street"], hn = t["addr:housenumber"], city = t["addr:city"], pc = t["addr:postcode"];
    if (!name || !st || !hn) continue;            // KELL a pontos cím + házszám
    if (!isHungarianThemed(t)) continue;           // tényleg magyar-vonatkozású
    const cat = categoryFor(t);
    if (!cat) continue;
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon;
    if (lat == null || lng == null) continue;
    const key = `${name}|${st}|${hn}|${city}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name, country: iso, categoryId: cat[0], categoryLabel: cat[1],
      address: `${st} ${hn}${pc || city ? ", " : ""}${pc || ""}${pc && city ? " " : ""}${city || ""}`.trim(),
      city: city || "", lat: +(+lat).toFixed(7), lng: +(+lng).toFixed(7),
      website: t.website || t["contact:website"] || "", phone: t.phone || t["contact:phone"] || "",
      osm: `${e.type}/${e.id}`,
    });
    kept++;
  }
  console.log(`${iso}: ${elements.length} elem → ${kept} pontos-címes magyar üzlet`);
  await sleep(1500);
}

writeFileSync(new URL("./osm-hu-biz.json", import.meta.url), JSON.stringify(out, null, 2), "utf8");
console.log(`\nÖsszesen: ${out.length} üzlet mentve → scripts/osm-hu-biz.json`);
for (const b of out) console.log(`  [${b.country}] ${b.categoryId.padEnd(14)} ${b.name} — ${b.address}`);
