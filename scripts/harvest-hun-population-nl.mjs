// scripts/harvest-hun-population-nl.mjs
//
// Magyar nemzetiségű lakosok száma tartományonként (provincie) és
// landsdeel-enként — a CBS (Centraal Bureau voor de Statistiek) hivatalos
// OData API-jából (StatLine, tábla 85644NED "Bevolking; geslacht, leeftijd,
// nationaliteit en regio, 1 januari"), nyílt, regisztráció nélküli hozzáférés,
// CC-BY 4.0. Ez a "hol élnek a magyarok" funkció NL adatforrása.
//
// Futtatás:  node scripts/harvest-hun-population-nl.mjs
// Kimenet:   db/seed-data/hun-population-nl.json (nyers adat, auditálhatóság)
//            db/seed-hun-pop-nl.sql (INSERT-ek, kézzel alkalmazandó)
// Élesítés:  wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-nl.sql

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const TABLE = "85644NED";
const NATIONALITY_HU = "NAT9345"; // "Hongaars" kategória-kód ebben a táblában
const GESLACHT_TOTAL = "T001038"; // "Totaal mannen en vrouwen"
// ⚠️ A táblának van egy Leeftijd (korcsoport) dimenziója is (21 érték: Totaal +
// 20 ötéves sáv) — enélkül a szűrő nélkül régiónként ~20 plusz sor jön (minden
// korcsoportra egy-egy KÜLÖNBÖZŐ számmal), amit könnyű összekeverni valódi
// duplikációval. A "10000" a "Totaal" (minden korcsoport összesen).
const LEEFTIJD_TOTAL = "10000";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`CBS API HTTP ${res.status} — ${url}`);
  return res.json();
}

/** A legfrissebb periódus, aminek TÉNYLEG van adata (a legújabb évkód néha még üres/hiányos —
 *  a szűrőnek a VÉGSŐ lekérdezéssel egyeznie kell, különben egy hiányos sor hamis pozitívot ad). */
async function latestPeriodWithData() {
  const periods = (await getJson(`https://opendata.cbs.nl/ODataApi/OData/${TABLE}/Perioden?$format=json`)).value;
  for (let i = periods.length - 1; i >= 0; i--) {
    const key = periods[i].Key;
    const filter = `Nationaliteit eq '${NATIONALITY_HU}' and Perioden eq '${key}' and Geslacht eq '${GESLACHT_TOTAL}' and Leeftijd eq '${LEEFTIJD_TOTAL}'`;
    let test;
    try {
      test = await getJson(
        `https://opendata.cbs.nl/ODataApi/OData/${TABLE}/TypedDataSet?$filter=${encodeURIComponent(filter)}&$top=1&$format=json`,
      );
    } catch {
      continue; // ez a periódus hibázik (pl. még nincs feltöltve) → próbáljuk az előzőt
    }
    if (test.value.length > 0) return { key, year: Number(periods[i].Title) };
  }
  throw new Error("Egyetlen periódusban sem volt Hongaars-adat.");
}

async function main() {
  const { key: periodKey, year } = await latestPeriodWithData();
  console.log(`[CBS] legfrissebb adatos periódus: ${periodKey} (${year})`);

  const regioMap = new Map(
    (await getJson(`https://opendata.cbs.nl/ODataApi/OData/${TABLE}/RegioS?$format=json`)).value.map((r) => [
      r.Key.trim(),
      r.Title,
    ]),
  );

  // ⚠️ A CBS OData API $top NÉLKÜL a teljes táblát próbálja pásztázni a szűrés
  // ELŐTT, és 500-at ad ("...returns less than 10000 records"), akkor is, ha a
  // szűrt eredmény maga kicsi. $top=1000 (jóval a ~480 régiónál nagyobb) a
  // lapozott — és ténylegesen működő — kódútra tereli.
  const filter = `Nationaliteit eq '${NATIONALITY_HU}' and Perioden eq '${periodKey}' and Geslacht eq '${GESLACHT_TOTAL}' and Leeftijd eq '${LEEFTIJD_TOTAL}'`;
  const data = await getJson(
    `https://opendata.cbs.nl/ODataApi/OData/${TABLE}/TypedDataSet?$filter=${encodeURIComponent(filter)}&$top=1000&$format=json`,
  );

  const rows = data.value
    .map((r) => {
      const code = r.RegioS.trim();
      // NL01 = ország, LD.. = landsdeel, PV.. = provincie, GM.. = gemeente,
      // CR.. = COROP-régió (statisztikai egység, nem közigazgatási — a
      // hollandok nem ismerik névről, ezért lentebb kiszűrjük).
      const level = code === "NL01" ? "country" : code.startsWith("LD") ? "landsdeel" : code.startsWith("PV") ? "provincie" : code.startsWith("CR") ? "corop" : "gemeente";
      let name = regioMap.get(code) ?? code;
      // A CBS néhány gemeente-nevet "(gemeente)"-vel különböztet meg az
      // AZONOS NEVŰ tartománytól (pl. "Utrecht (gemeente)" vs. Utrecht
      // provincia, "Groningen (gemeente)" vs. Groningen provincia). Mivel a
      // MI listánk csak gemeente-szintet mutat, ez a toldalék felesleges —
      // levágjuk. A MÁSIK zárójeles forma (pl. "Beek (L.)" vs. "Beek (NH.)")
      // VALÓDI két különböző település közti megkülönböztetés — az MARAD.
      if (level === "gemeente") name = name.replace(/\s*\(gemeente\)$/, "");
      return { code, name, level, count: r.Bevolking_1 };
    })
    // Az ország-összesent és a COROP-régiókat NEM tesszük a régió-táblába —
    // előbbinek nincs helye régió-listában, utóbbi nem felismerhető egység.
    // A `count === null` a CBS SAJÁT adatvédelmi titkosítása (5 alatti szám
    // sose publikus, hogy egy kistelepülésen ne legyen egyénileg beazonosítható
    // valaki) — ez NEM hiányzó adat, hanem SZÁNDÉKOSAN rejtett. 0-t írni ide
    // félrevezető lenne (a valós szám 1-4 is lehet); ezért ezeket a sorokat
    // egyszerűen KIHAGYJUK — nem találgatunk.
    .filter((r) => r.level !== "country" && r.level !== "corop" && r.count !== null);

  const total = data.value.find((r) => r.RegioS.trim() === "NL01")?.Bevolking_1 ?? null;
  console.log(`[CBS] ${rows.length} régiósor, országos összesen: ${total}`);

  const jsonOut = { source: "CBS StatLine", table: TABLE, period: periodKey, year, fetchedAt: new Date().toISOString(), countryTotal: total, rows };
  writeFileSync(join(root, "db/seed-data/hun-population-nl.json"), JSON.stringify(jsonOut, null, 2), "utf8");

  const esc = (s) => String(s).replace(/'/g, "''");
  const lines = [
    "-- db/seed-hun-pop-nl.sql — AUTOGENERÁLT (harvest-hun-population-nl.mjs). NE szerkeszd kézzel.",
    `-- Forrás: CBS StatLine (Centraal Bureau voor de Statistiek), tábla ${TABLE}, ${periodKey}.`,
    "-- Élesítés: wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-nl.sql",
    "",
  ];
  for (const r of rows) {
    const id = `nl-${r.code.toLowerCase()}-${year}`;
    lines.push(
      `INSERT INTO hungarian_population_stats (id, country_code, region_code, region_name, region_level, hungarian_count, year, source, source_url) ` +
      `VALUES ('${id}', 'NL', '${r.code}', '${esc(r.name)}', '${r.level}', ${r.count}, ${year}, 'CBS StatLine', 'https://opendata.cbs.nl/statline/portal.html?_la=nl&_catalog=CBS&tableId=${TABLE}') ` +
      `ON CONFLICT(id) DO UPDATE SET hungarian_count=excluded.hungarian_count, updated_at=datetime('now');`,
    );
  }
  writeFileSync(join(root, "db/seed-hun-pop-nl.sql"), lines.join("\n") + "\n", "utf8");
  console.log(`[Siker] db/seed-hun-pop-nl.sql (${rows.length} sor)`);
}

main().catch((e) => {
  console.error("[Hiba]", e.message);
  process.exit(1);
});
