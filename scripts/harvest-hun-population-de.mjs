// scripts/harvest-hun-population-de.mjs
//
// Magyar állampolgárok/nemzetiségű lakosok száma tartományonként (Bundesland)
// — a Statistisches Bundesamt (Destatis) hivatalos, KÖZVETLENÜL letölthető
// xlsx-jelentéséből ("Statistischer Bericht – Ausländische Bevölkerung"),
// regisztráció/API-fiók NÉLKÜL.
//
// ⚠️ ELŐZMÉNY: a GENESIS-Online / regionalstatistik.de API-t (járási/Kreis
// szintű adatért) próbáltuk először — a portál-regisztráció megvolt, de a
// webservice/API-hozzáférés külön engedélyt igényelt volna (401 "nem vagy
// jogosult"), ami a felhasználó fiókján még nem volt bekapcsolva. Eközben
// derült ki, hogy a Destatis MAGA publikálja ugyanezt tartomány-szinten,
// bejelentkezés nélkül, egy rendszeresen frissülő xlsx-riportban — ez lett a
// végleges forrás (a Kreis-szintű felbontás egy jövőbeli finomítás lehet, ha
// a GENESIS-hozzáférés valaha megoldódik).
//
// Az xlsx (OOXML) egy ZIP, aminek a munkalapjait `unzip`-pel csomagoljuk ki és
// célzott reguláris kifejezésekkel olvassuk (a projektben — biztonsági okból,
// ld. memória — NINCS xlsx/ods npm-függőség: a "xlsx" csomag npm-verziója 36
// sebezhetőséget hoz be).
//
// Előfeltétel: `unzip` a PATH-on (Git Bash/Linux alapból van).
// Futtatás:  node scripts/harvest-hun-population-de.mjs
// Kimenet:   db/seed-data/hun-population-de.json (nyers adat, auditálhatóság)
//            db/seed-hun-pop-de.sql (INSERT-ek, kézzel alkalmazandó)
// Élesítés:  wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-de.sql

import { writeFileSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const REPORT_URL =
  "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Migration-Integration/Publikationen/Downloads-Migration/statistischer-bericht-auslaend-bevoelkerung-2010200257005.xlsx?__blob=publicationFile&v=2";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// A "12521-08: Ausländische Bevölkerung … nach ausgewählten Staatsangehörigkeiten,
// Geschlecht und Ländern" tábla munkalap-neve az Inhaltsübersicht szerint.
const SHEET_NAME = "12521-08";

// A tábla oszlop-sorrendje (a fejléc-sor 2. oszlopától, a "Deutschland"
// (nemzeti összesen, KIHAGYVA — nem régió) oszlop után) — PONTOSAN egyezik a
// lib/regions.ts DE_REGIONS sorrendjével.
const BUNDESLAND_CODES = ["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"];
const BUNDESLAND_NAMES = [
  "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen",
  "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz",
  "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen",
];

function downloadXlsx(destFile) {
  execFileSync("curl", ["-sS", "-L", "--max-time", "40", "-H", `User-Agent: ${UA}`, "-o", destFile, REPORT_URL]);
}

function extractXlsx(xlsxFile, workDir) {
  execFileSync("unzip", ["-oq", xlsxFile, "-d", workDir]);
}

/** Az összes shared string (sharedStrings.xml <si><t>…</t></si> — rich-text runoknál több <t> is lehet, összefűzve). */
function loadSharedStrings(workDir) {
  const xml = readFileSync(join(workDir, "xl/sharedStrings.xml"), "utf8");
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...m[1].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((t) => t[1]).join(""),
  );
}

/** workbook.xml.rels alapján: munkalap-NÉV → sheetN.xml fájlnév. */
function findSheetFile(workDir, sheetName) {
  const workbookXml = readFileSync(join(workDir, "xl/workbook.xml"), "utf8");
  const sheetMatch = new RegExp(`<sheet name="${sheetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*r:id="([^"]+)"`).exec(workbookXml);
  if (!sheetMatch) throw new Error(`Nem található "${sheetName}" nevű munkalap.`);
  const rId = sheetMatch[1];
  const rels = readFileSync(join(workDir, "xl/_rels/workbook.xml.rels"), "utf8");
  const relMatch = new RegExp(`Id="${rId}"[^>]*Target="([^"]+)"`).exec(rels);
  if (!relMatch) throw new Error(`Nem található rId="${rId}" a rels-ben.`);
  return join(workDir, "xl", relMatch[1]);
}

function colLetterToIndex(ref) {
  const letters = ref.match(/^([A-Z]+)/)[1];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** A munkalap teljes rács-tartalma (sorindex → oszlop-tömb, string/szám vegyesen). */
function parseSheet(sheetFile, sharedStrings) {
  const xml = readFileSync(sheetFile, "utf8");
  const rows = [...xml.matchAll(/<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)];
  const grid = [];
  for (const [, rowNum, rowContent] of rows) {
    const cells = [...rowContent.matchAll(/<c r="([A-Z]+\d+)"(?:[^>]*t="([^"]*)")?[^>]*>(?:<v>([^<]*)<\/v>)?<\/c>/g)];
    const rowArr = [];
    for (const [, ref, type, val] of cells) {
      const idx = colLetterToIndex(ref);
      if (val === undefined) continue;
      rowArr[idx] = type === "s" ? (sharedStrings[Number(val)] ?? `#${val}`) : Number(val);
    }
    grid[Number(rowNum)] = rowArr;
  }
  return grid;
}

async function main() {
  const workDir = mkdtempSync(join(tmpdir(), "kinti-de-xlsx-"));
  try {
    console.log("[Destatis] xlsx-jelentés letöltése...");
    const xlsxFile = join(workDir, "report.xlsx");
    downloadXlsx(xlsxFile);
    extractXlsx(xlsxFile, workDir);

    const sharedStrings = loadSharedStrings(workDir);
    const sheetFile = findSheetFile(workDir, SHEET_NAME);
    const grid = parseSheet(sheetFile, sharedStrings);

    // A dátum a lap-cím sorából ("… am 31.12.2025 nach …") — kinyerjük az évet.
    const titleRow = grid.find((r) => r?.[0] && String(r[0]).includes(SHEET_NAME));
    const yearMatch = /\b(\d{4})\b/.exec(String(titleRow?.[0] ?? ""));
    const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

    // A fejléc-sor ("Staatsangehörigkeit | Geschlecht", "Deutschland", 16 Bundesland…).
    // ⚠️ NEM elég a cell[0]-ban "Staatsangehörigkeit"-et keresni — a lap CÍM-sora
    // ("…nach ausgewählten Staatsangehörigkeiten…") is tartalmazza részszóként, és
    // mivel a cím előbb van, a .find() TÉVESEN azt találná meg. A valódi fejléc-sor
    // egyedi jele: a 2. oszlopa pontosan "Deutschland" (a cím-sornak nincs 2. oszlopa).
    const headerRow = grid.find((r) => r?.[1] === "Deutschland");
    if (!headerRow) throw new Error("Nem található a fejléc-sor.");
    // Ellenőrzés: a fejléc 2. oszlopa "Deutschland" (nemzeti összesen — kihagyjuk),
    // a 3-18. oszlop a 16 Bundesland, PONTOSAN a BUNDESLAND_NAMES sorrendjében.
    for (let i = 0; i < BUNDESLAND_NAMES.length; i++) {
      const headerName = String(headerRow[2 + i] ?? "").replace(/\r?\n/g, "");
      if (!headerName.startsWith(BUNDESLAND_NAMES[i].slice(0, 6))) {
        throw new Error(`Oszlop-eltolódás a fejlécben: várt "${BUNDESLAND_NAMES[i]}", kapott "${headerName}" (pozíció ${i}).`);
      }
    }

    // Az "Ungarn" ("Insgesamt", NEM a férfi/nő al-sor) adatsor.
    const ungarnRowIdx = grid.findIndex((r) => r?.[0] === "Ungarn");
    if (ungarnRowIdx < 0) throw new Error('Nem található "Ungarn" sor.');
    const ungarnRow = grid[ungarnRowIdx];

    const rows = BUNDESLAND_CODES.map((code, i) => ({
      code,
      name: BUNDESLAND_NAMES[i],
      count: Number(ungarnRow[2 + i]),
    }));
    const total = Number(ungarnRow[1]); // "Deutschland" oszlop = hivatalos nemzeti összesen
    const regionSum = rows.reduce((s, r) => s + r.count, 0);
    console.log(`[Destatis] ${SHEET_NAME} — ${year}, "Ungarn" sor a(z) ${ungarnRowIdx}. sorban.`);
    rows.forEach((r) => console.log(`  ${r.name.padEnd(24)}: ${r.count}`));
    console.log(`[Destatis] tartományok összege: ${regionSum} (hivatalos nemzeti összesen: ${total})`);
    // A két szám kerekítési eltéréstől eltekintve egyezzen — ha nagyon eltér, oszlop-hiba gyanús.
    if (Math.abs(regionSum - total) > total * 0.01) {
      throw new Error(`A tartomány-összeg (${regionSum}) túl messze van a nemzeti összesentől (${total}) — ellenőrizd az oszlop-illesztést.`);
    }

    const jsonOut = { source: "Destatis (Statistisches Bundesamt)", file: REPORT_URL, table: SHEET_NAME, year, nationalTotal: total, fetchedAt: new Date().toISOString(), rows };
    writeFileSync(join(root, "db/seed-data/hun-population-de.json"), JSON.stringify(jsonOut, null, 2), "utf8");

    const esc = (s) => String(s).replace(/'/g, "''");
    const lines = [
      "-- db/seed-hun-pop-de.sql — AUTOGENERÁLT (harvest-hun-population-de.mjs). NE szerkeszd kézzel.",
      `-- Forrás: Destatis, "Statistischer Bericht – Ausländische Bevölkerung", tábla ${SHEET_NAME}, ${year}.`,
      "-- Élesítés: wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-de.sql",
      "",
    ];
    for (const r of rows) {
      const id = `de-${r.code.toLowerCase()}-${year}`;
      lines.push(
        `INSERT INTO hungarian_population_stats (id, country_code, region_code, region_name, region_level, hungarian_count, year, source, source_url) ` +
        `VALUES ('${id}', 'DE', '${r.code}', '${esc(r.name)}', 'bundesland', ${r.count}, ${year}, 'Destatis', '${REPORT_URL.split("?")[0]}') ` +
        `ON CONFLICT(id) DO UPDATE SET hungarian_count=excluded.hungarian_count, updated_at=datetime('now');`,
      );
    }
    writeFileSync(join(root, "db/seed-hun-pop-de.sql"), lines.join("\n") + "\n", "utf8");
    console.log(`[Siker] db/seed-hun-pop-de.sql (${rows.length} sor)`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error("[Hiba]", e.message);
  process.exit(1);
});
