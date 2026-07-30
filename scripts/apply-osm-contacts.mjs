/**
 * apply-osm-contacts.mjs — az OSM-ből gyűjtött elérhetőségek ALKALMAZÁSA.
 *
 * Bemenet: osm-contact-candidates.json (az osm-contact-harvest.mjs kimenete,
 * KÉZI ÁTNÉZÉS UTÁN). Kimenet: db/seed-osm-contacts.sql — csak UPDATE-ek, csak
 * azokra a sorokra, ahol MA SINCS elérhetőség (a feltétel a SQL-ben is ott van,
 * hogy egy időközbeni kézi javítást soha ne írjunk felül).
 *
 * ⚠️ A telefonszám a `phone` oszlopba megy. A weboldal a blurb végére, ` · `
 * elválasztóval — MERT a sémában nincs website oszlop, és a megjelenítő
 * (lib/contact-links.ts extractContactFromBlurb) az utolsó ` · ` szegmenst
 * olvassa URL-ként. Ha már van ilyen szegmens, NEM fűzünk hozzá másikat.
 */
import { readFileSync, writeFileSync } from "node:fs";

const cands = JSON.parse(readFileSync("osm-contact-candidates.json", "utf8"));
const q = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);

const lines = [
  "-- db/seed-osm-contacts.sql — AUTOGENERÁLT (scripts/apply-osm-contacts.mjs).",
  "-- Hiányzó elérhetőségek pótlása OpenStreetMap-ből, SZIGORÚ egyeztetés után",
  "-- (60 m-en belüli POI + token-szintű, szóhatáros név-egyezés).",
  "--   wrangler d1 execute kinti-db --remote --file=./db/seed-osm-contacts.sql",
  "",
];

let phoneN = 0;
let webN = 0;
for (const c of cands) {
  if (c.phone) {
    // Csak ha MA sincs telefon — egy időközbeni kézi javítást nem írunk felül.
    lines.push(
      `-- ${c.name} (${c.country}) ← OSM ${c.osmType} „${c.osmName}", ${c.dist} m, ${c.how}`,
    );
    lines.push(
      `UPDATE businesses SET phone = ${q(c.phone)} ` +
        `WHERE id = ${q(c.id)} AND (phone IS NULL OR trim(phone) = '');`,
    );
    phoneN++;
  }
  if (c.website) {
    // A weboldal a blurb végére kerül (nincs website oszlop). Csak akkor, ha a
    // blurbben MÉG NINCS ' · ' + pont mintájú (weboldal/email) szegmens.
    const host = String(c.website).replace(/^https?:\/\//i, "").replace(/\/$/, "");
    lines.push(
      `UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || ${q(host)} ` +
        `WHERE id = ${q(c.id)} AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');`,
    );
    webN++;
  }
  lines.push("");
}

writeFileSync("db/seed-osm-contacts.sql", lines.join("\n"), "utf8");
console.log(`db/seed-osm-contacts.sql legenerálva: ${cands.length} tétel (${phoneN} telefon, ${webN} weboldal).`);
