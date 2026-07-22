// scripts/harvest-hun-population-ch.mjs
//
// Magyar állampolgárok száma kantononként — a BFS (Bundesamt für Statistik)
// hivatalos PX-Web API-jából (STATPOP, tábla px-x-0102010000_104), nyílt,
// regisztráció nélküli hozzáférés. Ez a "hol élnek a magyarok" funkció CH
// adatforrása — hivatalos szám, NEM app-használati adat (ld. [[presence-heatmap]]
// memória: a korábbi, saját-adatra épülő verzió az ürességet reklámozta).
//
// Futtatás:  node scripts/harvest-hun-population-ch.mjs
// Kimenet:   db/seed-data/hun-population-ch.json (nyers adat, auditálhatóság)
//            db/seed-hun-pop-ch.sql (INSERT-ek, kézzel alkalmazandó)
// Élesítés:  wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-ch.sql

import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ⚠️ A BFS PX-Web API elé egy kormányzati WAF van téve, ami Node `fetch`
// (undici) TLS-ujjlenyomatát elutasítja MÉG böngésző-UA mellett is
// ("Client network socket disconnected before secure TLS connection was
// established") — de a `curl`-lel ugyanaz a kérés simán átmegy. Ezért a
// HTTP-hívást `curl`-ön keresztül végezzük (execFileSync), a JSON-feldolgozás
// marad Node-ban.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function curlPostJson(url, bodyObj) {
  const dir = mkdtempSync(join(tmpdir(), "kinti-bfs-"));
  const bodyFile = join(dir, "body.json");
  writeFileSync(bodyFile, JSON.stringify(bodyObj), "utf8");
  try {
    const out = execFileSync(
      "curl",
      [
        "-sS", "-L", "--max-time", "30",
        "-H", `User-Agent: ${UA}`,
        "-H", "Content-Type: application/json",
        "-X", "POST", "--data-binary", `@${bodyFile}`,
        url,
      ],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const TABLE = "px-x-0102010000_104";
const YEAR = "2024"; // a legfrissebb lezárt STATPOP-év a táblában
const HUNGARY_CODE = "8240"; // Staatsangehörigkeit "Ungarn" kódja ebben a táblában

// A 26 kanton hivatalos 2-betűs kódja + megjelenítendő név (lib/cantons.ts-szel
// összhangban). A PX-Web séma "- <Kanton>" prefixű szöveggel jelöli a kanton-
// szintet a kombinált Kanton/Bezirk/Gemeinde dimenzióban.
const CANTONS = [
  ["ZH", "Zürich"], ["BE", "Bern"], ["LU", "Luzern"], ["UR", "Uri"],
  ["SZ", "Schwyz"], ["OW", "Obwalden"], ["NW", "Nidwalden"], ["GL", "Glarus"],
  ["ZG", "Zug"], ["FR", "Freiburg"], ["SO", "Solothurn"], ["BS", "Basel-Stadt"],
  ["BL", "Basel-Landschaft"], ["SH", "Schaffhausen"], ["AR", "Appenzell Ausserrhoden"],
  ["AI", "Appenzell Innerrhoden"], ["SG", "St. Gallen"], ["GR", "Graubünden"],
  ["AG", "Aargau"], ["TG", "Thurgau"], ["TI", "Ticino"], ["VD", "Vaud"],
  ["VS", "Valais"], ["NE", "Neuchâtel"], ["GE", "Genève"], ["JU", "Jura"],
];

async function fetchCantonData() {
  const url = `https://www.pxweb.bfs.admin.ch/api/v1/de/${TABLE}/${TABLE}.px`;
  const body = {
    query: [
      { code: "Kanton (-) / Bezirk (>>) / Gemeinde (......)", selection: { filter: "item", values: CANTONS.map((c) => c[0]) } },
      { code: "Bevölkerungstyp", selection: { filter: "item", values: ["1"] } }, // Ständige Wohnbevölkerung
      { code: "Geburtsort", selection: { filter: "item", values: ["-99999"] } }, // Total (össz. születési hely)
      { code: "Staatsangehörigkeit", selection: { filter: "item", values: [HUNGARY_CODE] } },
      { code: "Jahr", selection: { filter: "item", values: [YEAR] } },
    ],
    response: { format: "json-stat2" },
  };
  const text = curlPostJson(url, body);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`BFS API nem-JSON választ adott (WAF-blokk?): ${text.slice(0, 300)}`);
  }
  const values = data.value;
  if (!Array.isArray(values) || values.length !== CANTONS.length) {
    throw new Error(`Váratlan válasz-alak: ${values?.length} érték, ${CANTONS.length} vártunk`);
  }
  return CANTONS.map(([code, name], i) => ({ code, name, count: values[i] }));
}

const esc = (s) => String(s).replace(/'/g, "''");

async function main() {
  const rows = await fetchCantonData();
  const total = rows.reduce((s, r) => s + r.count, 0);
  console.log(`[BFS] ${rows.length} kanton lekérdezve, összesen ${total} magyar állampolgár (${YEAR})`);

  const jsonOut = { source: "BFS STATPOP", table: TABLE, year: Number(YEAR), fetchedAt: new Date().toISOString(), rows };
  writeFileSync(join(root, "db/seed-data/hun-population-ch.json"), JSON.stringify(jsonOut, null, 2), "utf8");

  const lines = [
    "-- db/seed-hun-pop-ch.sql — AUTOGENERÁLT (harvest-hun-population-ch.mjs). NE szerkeszd kézzel.",
    "-- Forrás: BFS (Bundesamt für Statistik) STATPOP, PX-Web API, tábla " + TABLE + ".",
    "-- Élesítés: wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-ch.sql",
    "",
  ];
  for (const r of rows) {
    const id = `ch-${r.code.toLowerCase()}-${YEAR}`;
    lines.push(
      `INSERT INTO hungarian_population_stats (id, country_code, region_code, region_name, region_level, hungarian_count, year, source, source_url) ` +
      `VALUES ('${id}', 'CH', '${r.code}', '${esc(r.name)}', 'canton', ${r.count}, ${YEAR}, 'BFS STATPOP', 'https://www.bfs.admin.ch/bfs/de/home/statistiken/bevoelkerung/erhebungen/statpop.html') ` +
      `ON CONFLICT(id) DO UPDATE SET hungarian_count=excluded.hungarian_count, updated_at=datetime('now');`,
    );
  }
  writeFileSync(join(root, "db/seed-hun-pop-ch.sql"), lines.join("\n") + "\n", "utf8");
  console.log(`[Siker] db/seed-hun-pop-ch.sql (${rows.length} sor)`);
}

main().catch((e) => {
  console.error("[Hiba]", e.message);
  process.exit(1);
});
