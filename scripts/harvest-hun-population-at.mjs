// scripts/harvest-hun-population-at.mjs
//
// Magyar állampolgárok száma tartományonként (Bundesland) — a Statistik
// Austria hivatalos, közvetlenül letölthető ODS-fájljából ("Bevölkerung zu
// Jahresbeginn nach detaillierter Staatsangehörigkeit seit 2002", tartomány-
// munkalaponként), regisztráció nélkül.
//
// Az ODS egy ZIP (OpenDocument), a content.xml-je egy 2002-től induló, évek
// szerinti idősor-tábla KILENC külön munkalapon (egy-egy Bundeslandra) + egy
// "Ö" (országos) lapon. Minden lapon PONTOSAN egy "Ungarn" sorral. Mivel a
// projektben (biztonsági okból) nincs xlsx/ods npm-függőség, a content.xml-t
// helyben, `unzip`-pel csomagoljuk ki és célzott reguláris kifejezésekkel
// olvassuk (a fájl szerkezete stabil: cím-sor → dátum-fejléc-sor → adatsorok).
//
// Előfeltétel: `unzip` a PATH-on (Git Bash/Linux alapból van).
// Futtatás:  node scripts/harvest-hun-population-at.mjs
// Kimenet:   db/seed-data/hun-population-at.json (nyers adat, auditálhatóság)
//            db/seed-hun-pop-at.sql (INSERT-ek, kézzel alkalmazandó)
// Élesítés:  wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-at.sql

import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ODS_URL = "https://www.statistik.at/fileadmin/pages/407/Bev_Staatsangeh_Bundesland_Zeitreihe.ods";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// Munkalap-név → megjelenítendő tartomány-név (a lib/regions.ts AT kódjaival
// összhangban: BGL/KTN/NOE/OOE/SBG/STM/TIR/VBG/W).
const SHEETS = [
  ["B", "BGL", "Burgenland"],
  ["K", "KTN", "Kärnten"],
  ["NÖ", "NOE", "Niederösterreich"],
  ["OÖ", "OOE", "Oberösterreich"],
  ["SBG", "SBG", "Salzburg"],
  ["STMK", "STM", "Steiermark"],
  ["TIR", "TIR", "Tirol"],
  ["V", "VBG", "Vorarlberg"],
  ["W", "W", "Wien"],
];

function downloadOds(destFile) {
  execFileSync("curl", ["-sS", "-L", "--max-time", "40", "-H", `User-Agent: ${UA}`, "-o", destFile, ODS_URL]);
}

function extractContentXml(odsFile, workDir) {
  execFileSync("unzip", ["-oq", odsFile, "content.xml", "-d", workDir]);
  return execFileSync("cat", [join(workDir, "content.xml")], { encoding: "utf8", maxBuffer: 40 * 1024 * 1024 });
}

/** Egy <table:table table:name="NAME" ...> ... </table:table> blokk kinyerése. */
function extractSheet(xml, sheetName) {
  const escaped = sheetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startRe = new RegExp(`<table:table [^>]*table:name="${escaped}"[^>]*>`);
  const m = startRe.exec(xml);
  if (!m) throw new Error(`Nem található munkalap: "${sheetName}"`);
  const start = m.index;
  // A KÖVETKEZŐ <table:table ...> (vagy a string vége) a blokk vége.
  const nextTableRe = /<table:table[ >]/g;
  nextTableRe.lastIndex = start + m[0].length;
  const nextMatch = nextTableRe.exec(xml);
  const end = nextMatch ? nextMatch.index : xml.length;
  return xml.slice(start, end);
}

/** A fejléc-sor dátumai (office:date-value="YYYY-MM-DD...") sorrendben. */
function extractHeaderYears(sheetXml) {
  const headerRowMatch = /<table:table-row[^>]*table:style-name="ro3"[^>]*>([\s\S]*?)<\/table:table-row>/.exec(sheetXml);
  if (!headerRowMatch) throw new Error("Nem található fejléc-sor (ro3).");
  const years = [];
  const re = /office:date-value="(\d{4})-/g;
  let m;
  while ((m = re.exec(headerRowMatch[1]))) years.push(Number(m[1]));
  return years;
}

/** Az "Ungarn" adatsor float-értékei sorrendben (a fejléc-évekkel egyező pozícióban). */
function extractUngarnValues(sheetXml) {
  const idx = sheetXml.indexOf(">Ungarn<");
  if (idx < 0) throw new Error('Nem található "Ungarn" sor.');
  const rowStart = sheetXml.lastIndexOf("<table:table-row", idx);
  const rowEnd = sheetXml.indexOf("</table:table-row>", idx) + "</table:table-row>".length;
  const row = sheetXml.slice(rowStart, rowEnd);
  const values = [];
  const re = /office:value-type="float" office:value="([\d.]+)"/g;
  let m;
  while ((m = re.exec(row))) values.push(Number(m[1]));
  return values;
}

async function main() {
  const workDir = mkdtempSync(join(tmpdir(), "kinti-at-ods-"));
  const odsFile = join(workDir, "at.ods");
  try {
    console.log("[Statistik Austria] ODS letöltése...");
    downloadOds(odsFile);
    const xml = extractContentXml(odsFile, workDir);
    console.log(`[Statistik Austria] content.xml kicsomagolva (${(xml.length / 1e6).toFixed(1)} MB)`);

    const rows = [];
    for (const [sheetName, code, name] of SHEETS) {
      const sheetXml = extractSheet(xml, sheetName);
      const years = extractHeaderYears(sheetXml);
      const values = extractUngarnValues(sheetXml);
      if (values.length !== years.length) {
        throw new Error(`${sheetName}: ${years.length} év, de ${values.length} érték — nem egyeznek.`);
      }
      const lastIdx = years.length - 1;
      rows.push({ code, name, year: years[lastIdx], count: values[lastIdx] });
      console.log(`  ${name.padEnd(18)} (${years[lastIdx]}): ${values[lastIdx]}`);
    }

    const year = rows[0].year;
    if (!rows.every((r) => r.year === year)) throw new Error("A tartományok legfrissebb éve nem egyezik egymással.");
    const total = rows.reduce((s, r) => s + r.count, 0);
    console.log(`[Statistik Austria] ${rows.length} tartomány, összesen ${total} magyar állampolgár (${year})`);

    const jsonOut = { source: "Statistik Austria", file: ODS_URL, year, fetchedAt: new Date().toISOString(), rows };
    writeFileSync(join(root, "db/seed-data/hun-population-at.json"), JSON.stringify(jsonOut, null, 2), "utf8");

    const esc = (s) => String(s).replace(/'/g, "''");
    const lines = [
      "-- db/seed-hun-pop-at.sql — AUTOGENERÁLT (harvest-hun-population-at.mjs). NE szerkeszd kézzel.",
      "-- Forrás: Statistik Austria, 'Bevölkerung zu Jahresbeginn nach detaillierter Staatsangehörigkeit'.",
      "-- Élesítés: wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-at.sql",
      "",
    ];
    for (const r of rows) {
      const id = `at-${r.code.toLowerCase()}-${year}`;
      lines.push(
        `INSERT INTO hungarian_population_stats (id, country_code, region_code, region_name, region_level, hungarian_count, year, source, source_url) ` +
        `VALUES ('${id}', 'AT', '${r.code}', '${esc(r.name)}', 'bundesland', ${r.count}, ${year}, 'Statistik Austria', '${ODS_URL}') ` +
        `ON CONFLICT(id) DO UPDATE SET hungarian_count=excluded.hungarian_count, updated_at=datetime('now');`,
      );
    }
    writeFileSync(join(root, "db/seed-hun-pop-at.sql"), lines.join("\n") + "\n", "utf8");
    console.log(`[Siker] db/seed-hun-pop-at.sql (${rows.length} sor)`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error("[Hiba]", e.message);
  process.exit(1);
});
