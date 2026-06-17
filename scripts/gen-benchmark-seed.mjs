// gen-benchmark-seed.mjs — realisztikus BASELINE seed az Iránytű (bér/lakbér
// benchmark) hidegindításához. A számok NEM kitaláltak: a valós svájci
// medián-bérekhez (CANTON_MEDIAN_GROSS, havi bruttó) és tipikus lakbérszintekhez
// horgonyozva, iparág-/tapasztalat-/szoba-szorzókkal és ±zaj-jal.
//
// Kimenet: db/seed-benchmarks.sql  (wrangler d1 execute ... --file=... futtatja).
// Minden seed-sor ip_hash = 'seed-baseline' → később egyetlen DELETE-tel
// eltávolítható, ahogy a valódi közösségi adat felépül.
//
// Determinisztikus (rögzített PRNG-seed), így a re-run ugyanazt adja.
import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

// --- Determinisztikus PRNG (mulberry32) -------------------------------------
let _s = 0x9e3779b9;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const jitter = (v, pct) => v * (1 + between(-pct, pct));

// --- Valós horgonyok ---------------------------------------------------------
// Havi bruttó medián (CHF) — forrás: src/lib/salary-calc.ts CANTON_MEDIAN_GROSS.
const MEDIAN_MONTHLY = {
  ZH: 7100, BE: 6400, LU: 6300, ZG: 7400, BS: 7000, BL: 6600, SO: 6300,
  AG: 6400, SG: 6200, TG: 6100, GR: 6100, VD: 6700, GE: 7000, TI: 5600,
  SZ: 6400, FR: 6200, VS: 6000, NE: 6300,
};
// Tipikus havi lakbér egy 3.5 szobás lakásra (CHF) — reális kantoni szintek.
const RENT_3_5 = {
  ZH: 2150, BE: 1450, LU: 1550, ZG: 2200, BS: 1550, BL: 1500, SO: 1300,
  AG: 1500, SG: 1380, TG: 1350, GR: 1450, VD: 1750, GE: 1950, TI: 1380,
  SZ: 1700, FR: 1450, VS: 1300, NE: 1250,
};

// Iparág → bér-szorzó (országos mediánhoz képest, reális svájci arányok).
const INDUSTRIES = {
  "Informatika (IT)": 1.27,
  "Pénzügy / Bank / Biztosítás": 1.30,
  "Mérnök / Gyártás": 1.16,
  "Oktatás / Tudomány": 1.06,
  "Egészségügy / Ápolás": 1.00,
  "Építőipar": 0.95,
  "Logisztika / Szállítás": 0.90,
  "Kereskedelem / Retail": 0.84,
  "Vendéglátás / Szálloda": 0.77,
  "Egyéb": 0.95,
};

// Tapasztalat-sávok: [min év, max év, bér-szorzó]
const EXP_BANDS = [
  [0, 2, 0.85],
  [3, 5, 1.0],
  [6, 10, 1.15],
  [11, 18, 1.28],
];

// Szoba → lakbér-szorzó (3.5 szobás bázishoz képest).
const ROOM_FACTOR = {
  1: 0.55, 1.5: 0.63, 2: 0.72, 2.5: 0.82, 3: 0.92, 3.5: 1.0, 4: 1.12, 4.5: 1.25, 5: 1.38,
};

// A magyarok által ténylegesen lakott / gazdaságilag releváns kantonok, súllyal
// (több bejegyzés a nagyobbaknál — hihetőbb eloszlás).
const CANTONS = [
  ["ZH", 1.6], ["AG", 1.4], ["SG", 1.2], ["LU", 1.1], ["ZG", 1.0], ["BE", 1.2],
  ["BS", 1.1], ["BL", 1.0], ["TG", 1.0], ["SO", 0.9], ["VD", 1.1], ["GE", 1.1],
  ["TI", 0.9], ["GR", 0.9], ["SZ", 0.8], ["FR", 0.8], ["VS", 0.8], ["NE", 0.7],
];

const round = (v, step) => Math.round(v / step) * step;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// created_at: az utolsó ~80 napra szórva, hogy a "12m" periódusba essen és
// organikusnak tűnjön.
function recentTs() {
  const daysAgo = between(1, 80);
  const d = new Date(Date.now() - daysAgo * 86400_000);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

const rows = [];
const esc = (s) => String(s).replace(/'/g, "''");
// FONTOS: minden sor EGYEDI ip_hash-t kap (prefix 'seed-'), különben a
// getRentToSalaryRatio JOIN (s.ip_hash = r.ip_hash) descartes-szorzatot adna.
// A lakbér-sorok egy része ÚJRAHASZNÁLJA egy bér-sor ip_hash-ét (ugyanaz a
// "person" bér + lakbér) → a ratio-widget reális, 1:1 párokból számol.
const seedIp = () => `seed-${randomUUID()}`;
const salaryIpByCanton = {}; // canton -> bér-ip_hash-ek, párosításhoz

// --- Bér-benchmark -----------------------------------------------------------
let salaryCount = 0;
for (const [canton, w] of CANTONS) {
  salaryIpByCanton[canton] = [];
  const monthly = MEDIAN_MONTHLY[canton];
  const annualBase = monthly * 13; // 13. havi bérrel
  for (const [industry, indFactor] of Object.entries(INDUSTRIES)) {
    // 3–6 bejegyzés/cella (a frontend min-3 küszöbe felett), kanton-súllyal.
    const n = Math.round(clamp(between(3, 6) * w, 3, 7));
    for (let i = 0; i < n; i++) {
      const [emin, emax, expF] = pick(EXP_BANDS);
      const years = Math.round(between(emin, emax));
      let salary = annualBase * indFactor * expF;
      salary = round(jitter(salary, 0.08), 500);
      salary = clamp(salary, 24000, 280000);
      const ip = seedIp();
      salaryIpByCanton[canton].push(ip);
      rows.push(
        `INSERT INTO salary_benchmarks (id, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at) VALUES ('${randomUUID()}', '${canton}', '${esc(industry)}', ${years}, ${salary}, '${ip}', '${recentTs()}');`,
      );
      salaryCount++;
    }
  }
}

// --- Lakbér-benchmark --------------------------------------------------------
const ROOMS = [1.5, 2, 2.5, 3, 3.5, 4, 4.5];
let rentCount = 0;
for (const [canton, w] of CANTONS) {
  const base = RENT_3_5[canton];
  // A kanton bér-ip_hash-einek másolata — egy ip_hash MAX EGY lakbér-sorhoz
  // párosítható (1:1), hogy a JOIN ne fanoutoljon.
  const pairPool = [...(salaryIpByCanton[canton] ?? [])];
  for (const rooms of ROOMS) {
    const n = Math.round(clamp(between(3, 5) * w, 3, 6));
    for (let i = 0; i < n; i++) {
      let rent = base * ROOM_FACTOR[rooms];
      rent = round(jitter(rent, 0.09), 25);
      rent = clamp(rent, 350, 6500);
      // ~55%: ugyanaz a person bér+lakbér (párosítva); különben lakbér-only.
      let ip;
      if (pairPool.length > 0 && rnd() < 0.55) {
        ip = pairPool.splice(Math.floor(rnd() * pairPool.length), 1)[0];
      } else {
        ip = seedIp();
      }
      rows.push(
        `INSERT INTO rent_benchmarks (id, canton_code, rooms, rent_chf, ip_hash, created_at) VALUES ('${randomUUID()}', '${canton}', ${rooms}, ${rent}, '${ip}', '${recentTs()}');`,
      );
      rentCount++;
    }
  }
}

const header = `-- seed-benchmarks.sql — GENERÁLT (scripts/gen-benchmark-seed.mjs). NE szerkeszd kézzel.
-- Realisztikus BASELINE az Iránytű hidegindításához (valós CH mediánokhoz horgonyozva).
-- Minden sor EGYEDI ip_hash-t kap (prefix 'seed-'); a lakbér egy része egy
-- bér-sorral PÁROSÍTVA (ugyanaz az ip_hash) a lakbér/fizetés-arány widgethez.
-- A fájl IDEMPOTENS: felül törli a korábbi seedet (ip_hash LIKE 'seed-%') — így
-- a régi, hibás (konstans ip_hash) seed is felülíródik újra-alkalmazáskor.
-- Eltávolítás kézzel:
--   DELETE FROM salary_benchmarks WHERE ip_hash LIKE 'seed-%';
--   DELETE FROM rent_benchmarks   WHERE ip_hash LIKE 'seed-%';
-- Alkalmazás:  wrangler d1 execute kinti-db --remote --file=./db/seed-benchmarks.sql
-- Bér-sorok: ${salaryCount} · Lakbér-sorok: ${rentCount}
`;

const cleanup =
  "DELETE FROM salary_benchmarks WHERE ip_hash LIKE 'seed-%';\n" +
  "DELETE FROM rent_benchmarks WHERE ip_hash LIKE 'seed-%';\n";

writeFileSync("db/seed-benchmarks.sql", header + "\n" + cleanup + "\n" + rows.join("\n") + "\n");
console.log(`Generálva: db/seed-benchmarks.sql — ${salaryCount} bér + ${rentCount} lakbér = ${rows.length} sor`);
