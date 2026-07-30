/**
 * osm-contact-harvest.mjs — hiányzó elérhetőségek gyűjtése OpenStreetMap-ből.
 *
 * A szaknévsor 518 tételének NINCS semmilyen elérhetősége (se telefon, se e-mail,
 * se weboldal) — az ilyen adatlapon a felhasználónak nincs mit kattintania.
 * Ez a szkript a HÁZSZÁM-SZINTŰ címmel rendelkezőkre próbál OSM-ből kontaktot
 * találni: az Overpass `around` több-koordinátás alakjával egyszerre kérdez le
 * sok pontot, majd HELYBEN, szigorúan egyeztet.
 *
 * ⚠️ EGYEZTETÉSI FEGYELEM (a szaknévsor-szabályok szerint: „inkább nincs adat,
 * mint rossz"): egy OSM-POI kontaktja CSAK akkor kerül át, ha
 *   • a POI 60 m-en belül van, ÉS
 *   • a NEVEK érdemben egyeznek (normalizált tokenek Jaccard-átfedése ≥ 0,6
 *     VAGY az egyik név tartalmazza a másikat, min. 5 karakteres törzzsel).
 * A puszta közelség NEM elég — egy szomszédos üzlet telefonszáma rosszabb,
 * mint a semmi.
 *
 * Kimenet: osm-contact-candidates.json (id, mit találtunk, milyen bizonyítékkal)
 * — a tényleges D1-írás KÜLÖN, kézi ellenőrzés után történik.
 */
import { readFileSync, writeFileSync } from "node:fs";

const OVERPASS = "https://overpass-api.de/api/interpreter";
const CHUNK = 40;        // koordináta / lekérdezés
const RADIUS = 60;       // méter
const MIN_JACCARD = 0.6;

const rows = JSON.parse(readFileSync("nocontact_rows.json", "utf8"));
// Csak a házszám-szintű címmel rendelkezők — a városközpont-koordinátán
// az „around" egyeztetés értelmetlen (véletlen szomszédot találna).
const targets = rows.filter((r) => r.address && /\d/.test(r.address) && r.lat != null);
console.log(`cél: ${targets.length} tétel (a ${rows.length}-ből, házszám-szintű címmel)`);

/** Név-normalizálás egyeztetéshez: kisbetű, ékezet le, csak betű/szám tokenek. */
function tokens(s) {
  return new Set(
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((t) => t.length >= 3 && !STOP.has(t)),
  );
}
const STOP = new Set([
  "und", "der", "die", "das", "gmbh", "kft", "bt", "zrt", "ltd", "sarl", "ag",
  "praxis", "salon", "studio", "restaurant", "cafe", "shop", "store", "magyar",
  "dr", "prof", "mag", "med", "univ",
]);

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function namesMatch(ourName, osmName) {
  const A = tokens(ourName);
  const B = tokens(osmName);
  if (jaccard(A, B) >= MIN_JACCARD) return "jaccard";
  // Tartalmazás: pl. „Kovács Fogászat" ⊂ „Zahnarztpraxis Kovács Fogászat"
  const na = [...A].join(" ");
  const nb = [...B].join(" ");
  if (na.length >= 5 && nb.includes(na)) return "contains";
  if (nb.length >= 5 && na.includes(nb)) return "contains";
  return null;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function waitForSlot() {
  for (let i = 0; i < 40; i++) {
    try {
      const t = await (await fetch("https://overpass-api.de/api/status")).text();
      if (/slots available now|\d+ slots available/i.test(t) && !/rate_limited/i.test(t)) return;
    } catch { /* hálózati hiba → várunk */ }
    await new Promise((r) => setTimeout(r, 4000));
  }
}

async function queryChunk(chunk) {
  const coords = chunk.map((r) => `${r.lat},${r.lng}`).join(",");
  const q = `[out:json][timeout:120];
nwr(around:${RADIUS},${coords})["name"](if:is_tag("phone") || is_tag("contact:phone") || is_tag("website") || is_tag("contact:website") || is_tag("email") || is_tag("contact:email"));
out center tags 400;`;
  await waitForSlot();
  const res = await fetch(OVERPASS, { method: "POST", body: q });
  if (!res.ok) return [];
  const j = await res.json().catch(() => null);
  return j?.elements ?? [];
}

const found = [];
for (let i = 0; i < targets.length; i += CHUNK) {
  const chunk = targets.slice(i, i + CHUNK);
  process.stdout.write(`\n[${i + 1}-${Math.min(i + CHUNK, targets.length)}] lekérdezés… `);
  let els = [];
  try {
    els = await queryChunk(chunk);
  } catch (e) {
    console.log("hiba:", e.message);
    continue;
  }
  process.stdout.write(`${els.length} POI → `);

  let hits = 0;
  for (const r of chunk) {
    let best = null;
    for (const e of els) {
      const t = e.tags || {};
      const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
      if (lat == null || !t.name) continue;
      const dist = haversine(r.lat, r.lng, lat, lon);
      if (dist > RADIUS) continue;
      const how = namesMatch(r.name, t.name);
      if (!how) continue;
      if (!best || dist < best.dist) {
        best = {
          dist: Math.round(dist),
          how,
          osmName: t.name,
          osmType: `${e.type}/${e.id}`,
          phone: t.phone || t["contact:phone"] || null,
          website: t.website || t["contact:website"] || null,
          email: t.email || t["contact:email"] || null,
        };
      }
    }
    if (best) {
      found.push({ id: r.id, name: r.name, address: r.address, country: r.country_code, ...best });
      hits++;
    }
  }
  process.stdout.write(`${hits} egyezés`);
}

console.log(`\n\nÖSSZESEN ${found.length} egyezés a ${targets.length} célból.`);
writeFileSync("osm-contact-candidates.json", JSON.stringify(found, null, 2));
console.log("→ osm-contact-candidates.json");
