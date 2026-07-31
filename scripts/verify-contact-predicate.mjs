/**
 * verify-contact-predicate.mjs — a rendezés SQL-közelítésének hitelesítése.
 *
 * ⚠️ A `repo-business.ts` a „van-e elérhetőség" rendezési feltételt SQL-ben
 * közelíti (a D1 nem tud JS-t hívni), a MEGJELENÍTÉS viszont a
 * `lib/contact-links.ts` `extractContactFromBlurb`-jét használja. A kettő
 * ELTÉRHET — és ha eltér, a lista pont azokat a cégeket rangsorolja hátra,
 * amelyeknél az adatlapon MEGJELENIK a „Weboldal" gomb.
 *
 * Ezért a szabály: az SQL-feltétel MINDEN módosítását itt kell újramérni.
 * Bemenet: all-blurbs.json (D1-export), kimenet: konzol-jelentés.
 */
import { readFileSync } from "node:fs";

const rows = JSON.parse(readFileSync("all-blurbs.json", "utf8").replace(/^﻿/, ""))[0].results;

// --- A MEGJELENÍTÉS igazsága (lib/contact-links.ts másolata) ------------------
const EMAIL_RE = /^(?:mailto:)?([^\s@]+@[^\s@]+\.[a-z]{2,})$/i;
const URL_RE = /^(?:https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/\S*)?$/i;

function segmentContact(seg) {
  if (EMAIL_RE.test(seg)) return { email: true, website: false };
  if (URL_RE.test(seg)) return { email: false, website: true };
  return null;
}
function extract(raw) {
  if (!raw) return null;
  const parts = String(raw).split(" · ");
  if (parts.length < 2) return segmentContact(String(raw).trim());
  return segmentContact(parts[parts.length - 1].trim());
}

// --- Az SQL-közelítés (repo-business.ts másolata) -----------------------------
function sqlLike(s, pattern) {
  // Csak a használt mintákra: '%X%' és '% %'
  return s.includes(pattern);
}
function sqlPredicate(r) {
  const phone = !!(r.phone && String(r.phone).trim());
  const email = !!(r.contact_email && String(r.contact_email).trim());
  const b = r.blurb == null ? null : String(r.blurb);
  const seg = b != null && /^.*\s·\s.*\..*$/s.test(b); // blurb LIKE '% · %.%'
  const bare = b != null && sqlLike(b, ".") && !sqlLike(b, " "); // '%.%' AND NOT '% %'
  return phone || email || seg || bare;
}

let agree = 0;
const disagree = [];
for (const r of rows) {
  const c = extract(r.blurb);
  const truth =
    !!(r.phone && String(r.phone).trim()) ||
    !!(r.contact_email && String(r.contact_email).trim()) ||
    !!(c && (c.website || c.email));
  const approx = sqlPredicate(r);
  if (truth === approx) agree++;
  else disagree.push({ id: r.id, name: r.name, blurb: r.blurb, truth, approx });
}

console.log(`egyezés: ${agree}/${rows.length} (${((agree / rows.length) * 100).toFixed(2)}%)`);
console.log(`eltérés: ${disagree.length}`);
for (const d of disagree.slice(0, 20)) {
  console.log(`  [${d.truth ? "MEGJELENIK, de SQL nem" : "SQL igen, de nem jelenik meg"}] ${d.name} — ${JSON.stringify(d.blurb)?.slice(0, 90)}`);
}
