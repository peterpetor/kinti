/**
 * psyonline-contact-match.mjs — telefonszám-pótlás az osztrák pszichoterapeuta-
 * tételekhez a psyonline.at HIVATALOS listájából.
 *
 * A 62 kontakt nélküli AT pszichológus/coach tétel eredeti forrása is ez a lista
 * volt (ld. memória), csak a telefonszám akkor nem került át. A lista minden
 * bejegyzésénél ott van a `tel:` link (tiszta E.164), a név és a pontos cím.
 *
 * ⚠️ EGYEZTETÉSI FEGYELEM: az elsődleges horgony a CÍM (utca+házszám+irányítószám
 * normalizálva) — ez sokkal megbízhatóbb, mint a név, mert a nálunk tárolt nevek
 * kötőjeles/rövidített alakúak („Dr. Kocsis Krisztina – Pszichológus"), a listán
 * viszont „Kocsis Krisztina, Mag." formában állnak. A cím-egyezés MELLETT a
 * vezetéknevet is ellenőrizzük — csak ha MINDKETTŐ stimmel, vesszük át a számot.
 */
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("psy.html", "utf8");
const rows = JSON.parse(readFileSync("nocontact_rows.json", "utf8"));
const targets = rows.filter((r) => r.country_code === "AT");
console.log(`AT célok (kontakt nélkül): ${targets.length}`);

// --- psyonline lista kiolvasása ---------------------------------------------
// Egy bejegyzés: <h2>…<span bold>VEZETÉKNÉV</span> Keresztnév, titulusok</h2>
// … „PLZ Város, Utca Hsz" … <a href="tel:+43…">
const entries = [];
const chunks = html.split(/<h2 style="font-weight:normal/);
for (const c of chunks.slice(1)) {
  const nameM = /<span style="font-weight:bold;">([^<]+)<\/span>([^<]*)</.exec(c);
  if (!nameM) continue;
  const surname = nameM[1].trim();
  const rest = nameM[2].replace(/,.*$/, "").trim(); // keresztnév a titulusok előtt
  // cím: „1180 Wien, Schumanngasse 11/4"
  const addrM = /(\d{4})\s+([A-Za-zÄÖÜäöüß\.\-\s]+),\s*([^<]{3,60}?)(?:<|$)/.exec(c);
  const telM = /href="tel:(\+?[\d]+)"/.exec(c);
  if (!addrM) continue;
  entries.push({
    surname,
    firstname: rest,
    plz: addrM[1],
    city: addrM[2].trim(),
    street: addrM[3].trim(),
    phone: telM ? telM[1] : null,
  });
}
console.log(`psyonline bejegyzés: ${entries.length} (ebből telefonnal: ${entries.filter((e) => e.phone).length})`);

// --- normalizálás ------------------------------------------------------------
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/strasse|straße|str\./g, "str")
    .replace(/gasse/g, "gasse")
    .replace(/[^a-z0-9]/g, "");

/** Cím-kulcs: irányítószám + utca/házszám tömörítve. */
function addrKey(plz, street) {
  return `${plz}|${norm(street)}`;
}

const byAddr = new Map();
for (const e of entries) {
  if (!e.phone) continue;
  const k = addrKey(e.plz, e.street);
  if (!byAddr.has(k)) byAddr.set(k, []);
  byAddr.get(k).push(e);
}

// --- egyeztetés --------------------------------------------------------------
const matches = [];
const noMatch = [];
for (const r of targets) {
  // A nálunk tárolt cím: „Zimmermannplatz 4/27, 1090 Wien"
  const m = /^(.+?),\s*(\d{4})\s/.exec(r.address || "");
  if (!m) { noMatch.push({ ...r, why: "nem parszolható cím" }); continue; }
  const key = addrKey(m[2], m[1]);
  const cands = byAddr.get(key);
  if (!cands || cands.length === 0) { noMatch.push({ ...r, why: "nincs cím-egyezés" }); continue; }

  // Cím stimmel — most a VEZETÉKNÉV is stimmeljen (különben más rendelhet ott).
  const ourNorm = norm(r.name);
  const hit = cands.find((c) => ourNorm.includes(norm(c.surname)) && norm(c.surname).length >= 4);
  if (!hit) { noMatch.push({ ...r, why: `cím egyezik, de a név nem (${cands.map((c) => c.surname).join("/")})` }); continue; }

  matches.push({
    id: r.id,
    name: r.name,
    address: r.address,
    phone: hit.phone,
    evidence: `psyonline.at: ${hit.surname} ${hit.firstname} — ${hit.plz} ${hit.city}, ${hit.street}`,
  });
}

console.log(`\n✅ EGYEZÉS (cím + vezetéknév): ${matches.length}`);
matches.slice(0, 10).forEach((m) => console.log(`   • ${m.name} → ${m.phone}`));
console.log(`\n❌ nincs egyezés: ${noMatch.length}`);
const reasons = {};
noMatch.forEach((n) => { reasons[n.why.replace(/\(.*\)/, "(…)")] = (reasons[n.why.replace(/\(.*\)/, "(…)")] || 0) + 1; });
Object.entries(reasons).forEach(([k, v]) => console.log(`   ${String(v).padStart(3)} ${k}`));

writeFileSync("psyonline-matches.json", JSON.stringify(matches, null, 2));
console.log("\n→ psyonline-matches.json");
