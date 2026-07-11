/**
 * db-backup.mjs — az ÉLES D1 adatbázis teljes SQL-exportja dátumozott fájlba.
 *
 * Futtatás: `npm run db:backup` (wrangler OAuth-tal bejelentkezve).
 * Kimenet:  backups/kinti-db-YYYY-MM-DD.sql — a mappa GITIGNORE-OLT (a dump
 *           PII-t tartalmaz: lead-emailek, CV-profilok — SOHA ne kerüljön repóba).
 *
 * Ez a "földrengés-biztosítás" réteg; az ELSŐDLEGES helyreállítás a Cloudflare
 * D1 beépített Time Travel-je (~30 nap point-in-time restore):
 *   wrangler d1 time-travel info kinti-db
 *   wrangler d1 time-travel restore kinti-db --timestamp=<unix|ISO>
 * Az export arra az esetre kell, ha a fiók/adatbázis maga válik elérhetetlenné.
 */
import { execSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";

const day = new Date().toISOString().slice(0, 10);
const out = `backups/kinti-db-${day}.sql`;
mkdirSync("backups", { recursive: true });

console.log(`Éles D1 export → ${out} ...`);
execSync(`npx wrangler d1 export kinti-db --remote --output=${out}`, { stdio: "inherit" });

const size = statSync(out).size;
if (size < 100_000) {
  console.error(`⚠️ Gyanúsan kicsi dump (${size} bájt) — ellenőrizd kézzel!`);
  process.exit(1);
}
console.log(`✅ Mentés kész: ${out} (${(size / 1024 / 1024).toFixed(1)} MB)`);
console.log("Tipp: másold a fájlt a gépen kívülre is (felhő-tárhely / külső meghajtó).");
