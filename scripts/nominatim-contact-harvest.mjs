/**
 * nominatim-contact-harvest.mjs — hiányzó elérhetőségek gyűjtése OpenStreetMap-ből
 * a Nominatim `extratags` mezőjén keresztül.
 *
 * MIÉRT NEM OVERPASS: az Overpass mindhárom publikus végpontja elérhetetlen lett
 * ebből a környezetből (a mai intenzív használat után időtúllépés), a Nominatim
 * viszont működik és a `extratags=1` visszaadja a `phone`/`website`/`email`
 * címkéket. Cserébe név+cím szerint kell keresni, egyesével.
 *
 * ⚠️ EGYEZTETÉSI FEGYELEM („inkább nincs adat, mint rossz"):
 *   • a találat legyen 150 m-en belül a nálunk tárolt koordinátától, ÉS
 *   • a NEVEK token-szinten (szóhatárosan) egyezzenek.
 * ⚠️ A név-illesztés SZÓHATÁROS: egy korábbi, nyers substring-teszt „Abel"-t
 * illesztett „Izabellá"-ra — vagyis idegen telefonszámot adott volna valakihez.
 *
 * Tempó: 1 kérés/mp (a Nominatim használati feltétele), saját User-Agenttel.
 * Kimenet: osm-contact-candidates.json — az ALKALMAZÁS külön szkript.
 */
import { readFileSync, writeFileSync } from "node:fs";

const MAX_DIST = 150; // méter
const MIN_JACCARD = 0.6;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rows = JSON.parse(readFileSync("nocontact_rows.json", "utf8"));
const targets = rows.filter((r) => r.address && /\d/.test(r.address) && r.lat != null);
console.log(`cél: ${targets.length} tétel (a ${rows.length}-ből, házszám-szintű címmel)\n`);

const STOP = new Set([
  "und", "der", "die", "das", "gmbh", "kft", "bt", "zrt", "ltd", "sarl", "ag",
  "praxis", "salon", "studio", "restaurant", "cafe", "shop", "store", "magyar",
  "dr", "prof", "mag", "med", "univ", "ungarisches", "ungarische", "hungarian",
]);
const tokens = (s) =>
  new Set(
    (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ").split(" ")
      .filter((t) => t.length >= 3 && !STOP.has(t)),
  );
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let i = 0; for (const t of a) if (b.has(t)) i++;
  return i / (a.size + b.size - i);
}
/** Token-szintű (szóhatáros) név-egyezés — NEM nyers substring. */
function namesMatch(ours, osm) {
  const A = tokens(ours), B = tokens(osm);
  if (!A.size || !B.size) return null;
  if (jaccard(A, B) >= MIN_JACCARD) return "jaccard";
  const [s, l] = A.size <= B.size ? [A, B] : [B, A];
  if (s.size >= 2 && [...s].every((t) => l.has(t))) return "subset";
  // Egyetlen, RITKA és hosszú tulajdonnév is elég (pl. „Piroschka"), ha a másik
  // oldalon is teljes tokenként szerepel — a stopszavak már ki vannak szűrve.
  if (s.size === 1) {
    const only = [...s][0];
    if (only.length >= 6 && l.has(only)) return "rare-token";
  }
  return null;
}
function haversine(la1, lo1, la2, lo2) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180;
  const dLa = rad(la2 - la1), dLo = rad(lo2 - lo1);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** A keresőkifejezés: „<név>, <utca hsz>, <város>" — a cím a mi mezőnkből. */
function queryFor(r) {
  const cleanName = r.name.replace(/\s*[–—-]\s*.*$/, "").trim(); // levágjuk a „– Fodrász" utótagot
  return `${cleanName}, ${r.address}`;
}

const found = [];
for (let i = 0; i < targets.length; i++) {
  const r = targets[i];
  let hit = null;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", queryFor(r));
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "3");
    url.searchParams.set("extratags", "1");
    const res = await fetch(url, {
      headers: { "User-Agent": "kinti.app contact-completion (info@kinti.app)" },
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      const arr = await res.json().catch(() => []);
      for (const x of arr) {
        const e = x.extratags || {};
        const phone = e.phone || e["contact:phone"] || null;
        const website = e.website || e["contact:website"] || null;
        const email = e.email || e["contact:email"] || null;
        if (!phone && !website && !email) continue;
        const dist = haversine(r.lat, r.lng, Number(x.lat), Number(x.lon));
        if (dist > MAX_DIST) continue;
        const osmName = (x.display_name || "").split(",")[0].trim();
        const how = namesMatch(r.name, osmName);
        if (!how) continue;
        hit = { dist: Math.round(dist), how, osmName, phone, website, email };
        break;
      }
    }
  } catch { /* hálózati hiba → kihagyjuk, nem tippelünk */ }

  if (hit) {
    found.push({ id: r.id, name: r.name, address: r.address, country: r.country_code, ...hit });
    console.log(`✓ [${i + 1}/${targets.length}] ${r.name} → ${hit.phone || ""} ${hit.website || ""} (${hit.dist} m, ${hit.how})`);
    writeFileSync("osm-contact-candidates.json", JSON.stringify(found, null, 2));
  } else if ((i + 1) % 25 === 0) {
    console.log(`  … ${i + 1}/${targets.length} feldolgozva, eddig ${found.length} találat`);
  }
  await sleep(1100); // Nominatim: max 1 kérés/mp
}

console.log(`\nÖSSZESEN ${found.length} szigorú egyezés a ${targets.length} célból.`);
writeFileSync("osm-contact-candidates.json", JSON.stringify(found, null, 2));
