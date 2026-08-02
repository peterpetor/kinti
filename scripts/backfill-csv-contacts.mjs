/**
 * backfill-csv-contacts.mjs — a D1-ben pótolt elérhetőségek visszaírása a CSV-be.
 *
 * ⚠️⚠️ MIÉRT LÉTFONTOSSÁGÚ: a `prepare-business-import.mjs` által generált SQL
 * `ON CONFLICT(id) DO UPDATE SET ... blurb=excluded.blurb, phone=excluded.phone`
 * záradékkal fut MINDEN `csv-import` forrású, nem-claimolt cégre. Ha a CSV-ben
 * üres a telefon, egy teljes import NÉMÁN LETÖRLI a D1-ben pótolt kontaktot.
 *
 * Vagyis: minden D1-oldali kontakt-pótlás UTÁN ezt is le kell futtatni,
 * különben a következő import visszacsinálja a munkát.
 */
import { readFileSync, writeFileSync } from "node:fs";

const rows = JSON.parse(readFileSync("csv-backfill.json", "utf8"));
const csvPath = "scripts/businesses.csv";
const lines = readFileSync(csvPath, "utf8").split(/\r?\n/);

/** A blurb végi ` · domain` szegmens = a weboldal (nincs külön oszlop). */
function weboldal(blurb) {
  if (!blurb) return null;
  const utolso = blurb.split(" · ").pop()?.trim() ?? "";
  return /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(utolso) ? utolso : null;
}

/** Egyszerű CSV-sor-bontó (idézőjeles mezők, "" = escape). */
function split(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
const quote = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';

let modositva = 0;
const nevIndex = new Map(rows.map((r) => [r.name.toLowerCase().trim(), r]));

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const f = split(lines[i]);
  if (f.length < 8) continue;
  const nev = f[0].toLowerCase().trim();
  const r = nevIndex.get(nev);
  if (!r) continue;

  const web = weboldal(r.blurb);
  let valtozott = false;
  if (r.phone && !f[5].trim()) { f[5] = r.phone; valtozott = true; }
  if (web && !f[6].trim()) { f[6] = web; valtozott = true; }
  if (!valtozott) continue;

  lines[i] = [quote(f[0]), f[1], f[2], quote(f[3]), quote(f[4]), quote(f[5]), quote(f[6]), quote(f[7])].join(",");
  modositva++;
  console.log(`  ${f[0].slice(0, 40).padEnd(42)} tel=${f[5] || "—"}  web=${f[6] || "—"}`);
}

writeFileSync(csvPath, lines.join("\n"), "utf8");
console.log(`\n${modositva} CSV-sor frissítve (${rows.length} jelöltből)`);
