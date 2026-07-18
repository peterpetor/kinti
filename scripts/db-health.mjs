/**
 * db-health.mjs — az ÉLES szaknévsor adat-integritásának ellenőrzése.
 *
 * Futtatás: `npm run db:health` (wrangler OAuth-tal bejelentkezve).
 *
 * MIÉRT: a 2026-07-18-i kézi audit egy egész hibaosztályt tárt fel, amit addig
 * semmi sem fogott meg automatikusan — 18 élő cég rossz koordinátán (ország
 * földrajzi közepén) ült, 214-nek hiányzott a tartomány-kódja. Ez a script ezt
 * a kézi auditot teszi újrafuttathatóvá: minden ellenőrzés önálló, magyarázó
 * kimenettel, és a súlyos (KRITIKUS) hibáknál nem-nulla exit-kóddal tér vissza,
 * hogy CI/pre-deploy lépésbe köthető legyen.
 *
 * Szintek:
 *   KRITIKUS → hibás térkép-pin / hiányzó vagy érvénytelen tartomány / rossz
 *              országba geokódolt sor. Nem-nulla exit.
 *   FIGYELEM → emberi átnézést igénylő, de nem feltétlen hibás (azonos telefon =
 *              gyakran legitim csoportpraxis). Nem befolyásolja az exit-kódot.
 *
 * READ-ONLY: kizárólag SELECT-eket futtat, az adatbázist nem módosítja.
 */
import { execSync } from "node:child_process";

/** A négy ország geokód-fallbackje (prepare-business-import.mjs COUNTRY_FALLBACK).
 *  Egy VALÓDI cég sosem ül pontosan az ország közepén → ez mindig hibás pin. */
const COUNTRY_CENTERS = {
  CH: [46.8, 8.23],
  AT: [47.6, 14.5],
  DE: [51.1, 10.4],
  NL: [52.13, 5.29],
};

/** Ország-bbox (prepare-business-import.mjs BBOX): [latMin, latMax, lngMin, lngMax]. */
const BBOX = {
  CH: [45.8, 47.9, 5.9, 10.6],
  AT: [46.3, 49.1, 9.4, 17.2],
  DE: [47.2, 55.1, 5.8, 15.1],
  NL: [50.7, 53.6, 3.3, 7.3],
};

/** Érvényes tartomány-kódok országonként (regions.ts / cantons.ts tükre). */
const VALID_CANTONS = {
  AT: ["W", "NOE", "OOE", "STM", "TIR", "KTN", "SBG", "VBG", "BGL"],
  DE: ["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"],
  NL: ["NH", "ZH", "UT", "NB", "GE", "OV", "LI", "FR", "GR", "DR", "FL", "ZE"],
  CH: ["ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR", "SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG", "TI", "VD", "VS", "NE", "GE", "JU"],
};

function q(sql) {
  // Az újsorokat egy sorba vonjuk — a wrangler --command shell-idézése a
  // beágyazott újsoron elhasal ("unrecognized token").
  const oneLine = sql.replace(/\s+/g, " ").trim();
  const raw = execSync(
    `npx wrangler d1 execute kinti-db --remote --json --command ${JSON.stringify(oneLine)}`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
  );
  const parsed = JSON.parse(raw);
  return parsed[0]?.results ?? [];
}

/** Kerekített koordináta-sáv, hogy a lebegőpontos zaj ne csússzon a küszöbbe. */
const near = (v) => Number(v.toFixed(2));

let critical = 0;
let warnings = 0;
const section = (t) => console.log(`\n── ${t} ──`);

console.log("Szaknévsor adat-integritás ellenőrzés (élő D1, csak olvasás)\n");

// 1) KRITIKUS — ország-közép / hiányzó koordináta (hibás térkép-pin).
section("1. Hibás térkép-pin (ország-közép vagy hiányzó koordináta)");
{
  const centerOr = Object.entries(COUNTRY_CENTERS)
    .map(([, [lat, lng]]) => `(lat BETWEEN ${near(lat - 0.01)} AND ${near(lat + 0.01)} AND lng BETWEEN ${near(lng - 0.01)} AND ${near(lng + 0.01)})`)
    .join(" OR ");
  const rows = q(
    `SELECT id, name, country_code, lat, lng FROM businesses
     WHERE COALESCE(hidden,0)=0 AND (${centerOr} OR lat IS NULL OR lat=0)`,
  );
  if (rows.length === 0) console.log("  ✓ nincs hibás pin");
  else {
    critical += rows.length;
    for (const r of rows) console.log(`  ✗ ${r.id} (${r.country_code}) — ${r.name} @ ${r.lat},${r.lng}`);
  }
}

// 2) KRITIKUS — hiányzó vagy érvénytelen tartomány-kód (kiesik a régió-szűrőből).
section("2. Hiányzó vagy érvénytelen tartomány-kód");
{
  const rows = q(
    `SELECT country_code, canton_code, COUNT(*) n FROM businesses
     WHERE COALESCE(hidden,0)=0
     GROUP BY country_code, canton_code`,
  );
  const problems = [];
  for (const r of rows) {
    const valid = VALID_CANTONS[r.country_code];
    if (!valid) continue; // ismeretlen ország — nem ez a script dolga
    if (r.canton_code == null || r.canton_code === "" || !valid.includes(r.canton_code)) {
      problems.push(r);
    }
  }
  if (problems.length === 0) console.log("  ✓ minden élő sor érvényes tartomány-kóddal");
  else {
    for (const p of problems) {
      critical += p.n;
      console.log(`  ✗ ${p.country_code}: canton_code=${p.canton_code === null ? "NULL" : `"${p.canton_code}"`} — ${p.n} sor`);
    }
  }
}

// 3) KRITIKUS — az ország bbox-án KÍVÜLI koordináta (rossz országba geokódolva).
section("3. Ország bbox-án kívüli koordináta");
{
  let found = 0;
  for (const [cc, [latMin, latMax, lngMin, lngMax]] of Object.entries(BBOX)) {
    const rows = q(
      `SELECT id, name, lat, lng FROM businesses
       WHERE COALESCE(hidden,0)=0 AND country_code='${cc}' AND lat IS NOT NULL AND lat!=0
         AND (lat < ${latMin} OR lat > ${latMax} OR lng < ${lngMin} OR lng > ${lngMax})`,
    );
    for (const r of rows) {
      found++;
      critical++;
      console.log(`  ✗ ${cc} bboxon kívül: ${r.id} — ${r.name} @ ${r.lat},${r.lng}`);
    }
  }
  if (found === 0) console.log("  ✓ minden koordináta a saját országa bbox-ában");
}

// 4) FIGYELEM — azonos telefonszám több élő cégnél (lehet legitim csoportpraxis).
section("4. Azonos telefonszám több élő cégnél (emberi átnézés)");
{
  const rows = q(
    `SELECT phone, COUNT(*) n, GROUP_CONCAT(name, ' | ') names FROM businesses
     WHERE COALESCE(hidden,0)=0 AND phone IS NOT NULL AND phone!=''
     GROUP BY phone HAVING n > 1 ORDER BY n DESC`,
  );
  if (rows.length === 0) console.log("  ✓ nincs telefon-ütközés");
  else {
    warnings += rows.length;
    console.log(`  ⚠ ${rows.length} telefon-csoport (gyakran legitim: házaspár-/csoportpraxis, közös iroda):`);
    for (const r of rows.slice(0, 15)) console.log(`    ${r.phone} (${r.n}×): ${String(r.names).slice(0, 90)}`);
    if (rows.length > 15) console.log(`    … és további ${rows.length - 15} csoport`);
  }
}

// 5) FIGYELEM — pontosan egyező cím+név (valódi duplikátum-gyanú).
section("5. Azonos cím + azonos név (duplikátum-gyanú)");
{
  const rows = q(
    `SELECT LOWER(TRIM(name)) k, address, COUNT(*) n, GROUP_CONCAT(id, ' | ') ids FROM businesses
     WHERE COALESCE(hidden,0)=0 AND address IS NOT NULL
     GROUP BY LOWER(TRIM(name)), LOWER(TRIM(address)) HAVING n > 1`,
  );
  if (rows.length === 0) console.log("  ✓ nincs azonos név+cím páros");
  else {
    warnings += rows.length;
    for (const r of rows) console.log(`  ⚠ "${r.k}" @ ${r.address} — ${r.n}× (${r.ids})`);
  }
}

// 6) FIGYELEM — azonos UTCACÍM + azonos kategória (név-eltérő duplikátum-gyanú).
// Ezt a #5 (pontos név+cím) NEM fogja meg, ha ugyanaz az üzlet MÁS néven szerepel
// (pl. „Spájz Rotterdami Magyar Bolt" vs „Spájz-Hollandia Magyar Bolt", azonos
// cím). Csak utcaszintű címnél (van házszám) — a csak-városnál tömeges álpozitív
// lenne. Csoportpraxisnál (több azonos szakmájú orvos egy klinikán) LEGITIM is
// lehet → emberi átnézés.
section("6. Azonos utcacím + azonos kategória (név-eltérő duplikátum-gyanú)");
{
  const rows = q(
    `SELECT LOWER(TRIM(address)) a, category_id, COUNT(*) n, GROUP_CONCAT(name, ' | ') names
     FROM businesses
     WHERE COALESCE(hidden,0)=0 AND address IS NOT NULL AND address GLOB '*[0-9]*'
     GROUP BY LOWER(TRIM(address)), category_id HAVING n > 1 ORDER BY n DESC`,
  );
  if (rows.length === 0) console.log("  ✓ nincs azonos cím+kategória csoport");
  else {
    warnings += rows.length;
    console.log(`  ⚠ ${rows.length} cím+kategória csoport (lehet csoportpraxis is — nézd át):`);
    for (const r of rows.slice(0, 15)) console.log(`    ${r.a} [${r.category_id}] ${r.n}×: ${String(r.names).slice(0, 80)}`);
    if (rows.length > 15) console.log(`    … és további ${rows.length - 15} csoport`);
  }
}

// Összegzés + exit-kód.
console.log(`\n${"=".repeat(52)}`);
console.log(`KRITIKUS: ${critical}  |  FIGYELEM: ${warnings}`);
if (critical > 0) {
  console.log("✗ Kritikus adat-integritási hiba — javítás szükséges (ld. fent).");
  process.exit(1);
}
console.log("✓ Nincs kritikus hiba." + (warnings ? " A FIGYELEM-tételek emberi átnézést kérnek." : ""));
