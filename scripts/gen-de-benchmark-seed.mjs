// gen-de-benchmark-seed.mjs — német Iránytű referencia-seed generálása.
// Kimenet: db/seed-benchmark-de.sql (salary + rent benchmark sorok, country_code='DE').
//
// A számok BECSLÉSEK német éves bruttó (Jahresbrutto, EUR) medián-szintek alapján
// (Destatis nagyságrendek), Bundesland- és tapasztalat-szorzókkal + kis
// determinisztikus zaj. A Bundesland-szorzók a DE_LAND_MEDIAN_GROSS (salary-calc.ts)
// havi mediánjaiból származnak (median / országos medián). Cél: a tool ne legyen
// üres induláskor (mint AT-nál).
//
// Futtatás:  node scripts/gen-de-benchmark-seed.mjs
import { writeFileSync } from "node:fs";

// Determinisztikus PRNG (mulberry32), hogy a seed reprodukálható legyen.
let _s = 0x1a2b3c4d;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = (p) => 1 + (rnd() * 2 - 1) * p; // ±p

// Iparág → német éves bruttó (Jahresbrutto, EUR) medián-becslés.
const INDUSTRIES = {
  "Informatika (IT)": 62000,
  "Vendéglátás / Szálloda": 32000,
  "Építőipar": 44000,
  "Egészségügy / Ápolás": 44000,
  "Pénzügy / Bank / Biztosítás": 60000,
  "Mérnök / Gyártás": 58000,
  "Logisztika / Szállítás": 40000,
  "Oktatás / Tudomány": 50000,
  "Kereskedelem / Retail": 38000,
  "Egyéb": 48000,
};

// Bundesland havi medián bruttó (Destatis-becslés, salary-calc.ts DE_LAND_MEDIAN_GROSS).
const LAND_MEDIAN = {
  HH: 4800, HE: 4700, BW: 4650, BY: 4600, HB: 4400, NW: 4350, BE: 4300,
  NI: 4150, RP: 4150, SL: 4150, SH: 4050, BB: 3900, SN: 3800, TH: 3800,
  ST: 3800, MV: 3750,
};
const NATIONAL_MEDIAN = 4300;
// Bundesland-szorzó = a tartomány mediánja / országos medián.
const BL = Object.fromEntries(
  Object.entries(LAND_MEDIAN).map(([code, med]) => [code, med / NATIONAL_MEDIAN]),
);
const BL_CODES = Object.keys(BL);

// Tapasztalat-sávok: [év, szorzó]
const EXP = [[1, 0.82], [4, 1.0], [8, 1.18], [14, 1.3]];

// 2 szobás havi alap-lakbér (Kaltmiete, EUR) Bundeslandonként; szobánként +~220.
const RENT_BASE = {
  BY: 1300, HH: 1250, HE: 1200, BE: 1200, BW: 1150, NW: 950, SH: 950, HB: 920,
  RP: 900, NI: 880, BB: 850, SL: 800, SN: 800, MV: 780, TH: 760, ST: 720,
};
const ROOMS = [1, 2, 3, 4];

const lines = [];
lines.push("-- seed-benchmark-de.sql — német Iránytű referencia-adat (generált).");
lines.push("-- Generátor: scripts/gen-de-benchmark-seed.mjs · BECSLÉS, nem hivatalos.");
lines.push("-- Előfeltétel: 0082_benchmark_country.sql (country_code oszlop).");
lines.push("DELETE FROM salary_benchmarks WHERE country_code = 'DE' AND ip_hash LIKE 'seed-de-%';");
lines.push("DELETE FROM rent_benchmarks   WHERE country_code = 'DE' AND ip_hash LIKE 'seed-de-%';");

let n = 0;
const esc = (s) => s.replace(/'/g, "''");

// ── Bérek: minden (iparág × Bundesland × tapasztalat-sáv) → 1-2 sor ──
for (const [industry, base] of Object.entries(INDUSTRIES)) {
  for (const code of BL_CODES) {
    for (const [yrs, em] of EXP) {
      const count = 1 + (rnd() < 0.5 ? 1 : 0); // 1-2 sor / cella
      for (let i = 0; i < count; i++) {
        const gross = Math.round((base * BL[code] * em * noise(0.06)) / 100) * 100;
        const yExp = Math.max(0, yrs + Math.round((rnd() * 2 - 1) * 2));
        const id = `seed-sal-de-${n}`;
        const ip = `seed-de-${n}`;
        n++;
        lines.push(
          `INSERT INTO salary_benchmarks (id, country_code, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at) ` +
          `VALUES ('${id}', 'DE', '${code}', '${esc(industry)}', ${yExp}, ${gross}, '${ip}', datetime('now', '-${1 + (n % 200)} days'));`
        );
      }
    }
  }
}

// ── Lakbérek: (Bundesland × szobaszám) → 2-3 sor ──
let m = 0;
for (const code of BL_CODES) {
  for (const rooms of ROOMS) {
    const base2 = RENT_BASE[code];
    const count = 2 + (rnd() < 0.5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const rent = Math.round((base2 + (rooms - 2) * 220) * noise(0.08) / 10) * 10;
      const id = `seed-rent-de-${m}`;
      const ip = `seed-de-rent-${m}`;
      m++;
      lines.push(
        `INSERT INTO rent_benchmarks (id, country_code, canton_code, rooms, rent_chf, ip_hash, created_at) ` +
        `VALUES ('${id}', 'DE', '${code}', ${rooms}, ${Math.max(300, rent)}, '${ip}', datetime('now', '-${1 + (m % 150)} days'));`
      );
    }
  }
}

writeFileSync("db/seed-benchmark-de.sql", lines.join("\n") + "\n");
console.log(`Generated db/seed-benchmark-de.sql — ${n} salary + ${m} rent rows.`);
