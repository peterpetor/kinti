// scripts/harvest-osm-hu-biz-regional.mjs
// 16. kör: a 15. kör DE/NL ORSZÁG-szintű Overpass lekérdezése 504-timeoutba
// futott. Ez a szkript ugyanazt a két lekérdezést (A: cuisine=hungarian,
// B: magyar-nevű konkrét shop-típusok) TARTOMÁNYI bontásban futtatja le
// (area["name"="<Bundesland/Provincie>"]), hogy egy-egy hívás kisebb legyen.
// Kimenet: scripts/osm-hu-biz-regional.json

import { writeFileSync } from "node:fs";

// ISO3166-2 kód a name-alapú keresés helyett: elkerüli az NL város/tartomány
// névütközést (Utrecht, Groningen egyszerre VÁROS és TARTOMÁNY neve az OSM-ben —
// name-alapú kereséssel a kisebb városi area-t is behozná, ami hibás/hiányos
// eredményhez vezetne). Az ISO3166-2 relációt egyértelműen a tartományra köti.
const DE_STATES = [
  ["DE-BY", "Bayern"], ["DE-NW", "Nordrhein-Westfalen"], ["DE-BW", "Baden-Württemberg"],
  ["DE-NI", "Niedersachsen"], ["DE-HE", "Hessen"], ["DE-SN", "Sachsen"],
  ["DE-RP", "Rheinland-Pfalz"], ["DE-BE", "Berlin"], ["DE-SH", "Schleswig-Holstein"],
  ["DE-BB", "Brandenburg"], ["DE-ST", "Sachsen-Anhalt"], ["DE-TH", "Thüringen"],
  ["DE-HH", "Hamburg"], ["DE-MV", "Mecklenburg-Vorpommern"], ["DE-SL", "Saarland"],
  ["DE-HB", "Bremen"],
];
const NL_PROVINCES = [
  ["NL-NH", "Noord-Holland"], ["NL-ZH", "Zuid-Holland"], ["NL-NB", "Noord-Brabant"],
  ["NL-GE", "Gelderland"], ["NL-UT", "Utrecht"], ["NL-OV", "Overijssel"],
  ["NL-LI", "Limburg"], ["NL-GR", "Groningen"], ["NL-FR", "Friesland"],
  ["NL-DR", "Drenthe"], ["NL-FL", "Flevoland"], ["NL-ZE", "Zeeland"],
];

const REGIONS = [
  ...DE_STATES.map(([iso, name]) => ({ country: "DE", iso, name })),
  ...NL_PROVINCES.map(([iso, name]) => ({ country: "NL", iso, name })),
];

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
  return null;
}

function isHungarianThemed(t) {
  const n = (t.name || "").toLowerCase();
  const cu = (t.cuisine || "").toLowerCase();
  if (cu.includes("hungarian")) return true;
  return /ungar|magyar|hungá|hungar|budapest|paprika|gulyás|gulasch|puszta|balaton|tokaj|debrecen/.test(n);
}

const NAME_RE = "ungar|magyar|hungá|hungar|budapest|paprika|gulasch|puszta|balaton|tokaj|debrecen";
const SHOP_RE = "bakery|pastry|confectionery|hairdresser|butcher|deli|convenience|greengrocer|supermarket|beverages";

// area["ISO3166-2"=...] tartományi keresés — egyértelmű, névütközés-mentes.
const queryA = (iso) => `[out:json][timeout:90];area["ISO3166-2"="${iso}"]->.a;(nwr["amenity"~"restaurant|cafe|fast_food"]["cuisine"~"hungarian",i](area.a););out center tags;`;
const queryB = (iso) => `[out:json][timeout:90];area["ISO3166-2"="${iso}"]->.a;(nwr["shop"~"${SHOP_RE}"]["name"~"${NAME_RE}",i](area.a);nwr["amenity"~"restaurant|cafe|fast_food"]["name"~"${NAME_RE}",i](area.a););out center tags;`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overpass(q, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "User-Agent": "kinti.app-seed/1.0 (info@kinti.app)", "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(q),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error(`${label}: HTTP ${res.status} (próba ${attempt}) ${txt.slice(0, 200)}`);
        await sleep(8000);
        continue;
      }
      const data = await res.json();
      return data.elements || [];
    } catch (e) {
      console.error(`${label}: ${e.message} (próba ${attempt})`);
      await sleep(8000);
    }
  }
  return null; // végleges hiba (3 próba után is)
}

const out = [];
const seen = new Set();
const summary = [];

for (const { country, iso, name } of REGIONS) {
  const elemsA = await overpass(queryA(iso), `${country}/${name}/A`);
  await sleep(2000);
  const elemsB = await overpass(queryB(iso), `${country}/${name}/B`);
  await sleep(2000);

  if (elemsA === null && elemsB === null) {
    console.log(`${country} ${name}: SIKERTELEN (mindkét lekérdezés hibázott)`);
    summary.push({ country, name, status: "FAIL", raw: 0, kept: 0 });
    continue;
  }
  const elements = [...(elemsA || []), ...(elemsB || [])];
  let kept = 0;
  for (const e of elements) {
    const t = e.tags || {};
    const name_ = t.name;
    const st = t["addr:street"], hn = t["addr:housenumber"], city = t["addr:city"], pc = t["addr:postcode"];
    if (!name_ || !st || !hn) continue;
    if (!isHungarianThemed(t)) continue;
    const cat = categoryFor(t);
    if (!cat) continue;
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon;
    if (lat == null || lng == null) continue;
    const key = `${name_}|${st}|${hn}|${city}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name: name_, country, region: name, categoryId: cat[0], categoryLabel: cat[1],
      address: `${st} ${hn}${pc || city ? ", " : ""}${pc || ""}${pc && city ? " " : ""}${city || ""}`.trim(),
      city: city || "", lat: +(+lat).toFixed(7), lng: +(+lng).toFixed(7),
      website: t.website || t["contact:website"] || "", phone: t.phone || t["contact:phone"] || "",
      osm: `${e.type}/${e.id}`,
    });
    kept++;
  }
  console.log(`${country} ${name}: ${elements.length} elem → ${kept} pontos-címes magyar üzlet`);
  summary.push({ country, name, status: "OK", raw: elements.length, kept });
  await sleep(1500);
}

writeFileSync(new URL("./osm-hu-biz-regional.json", import.meta.url), JSON.stringify(out, null, 2), "utf8");
console.log(`\nÖsszesen: ${out.length} üzlet mentve → scripts/osm-hu-biz-regional.json`);
console.log("\n--- Tartomány-összegzés ---");
for (const s of summary) console.log(`  [${s.status}] ${s.country} ${s.name}: raw=${s.raw} kept=${s.kept}`);
for (const b of out) console.log(`  [${b.country}/${b.region}] ${b.categoryId.padEnd(14)} ${b.name} — ${b.address}`);
