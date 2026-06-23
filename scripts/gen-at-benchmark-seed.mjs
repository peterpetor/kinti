// gen-at-benchmark-seed.mjs — osztrák Iránytű referencia-seed generálása.
// Kimenet: db/seed-benchmark-at.sql (salary + rent benchmark sorok, country_code='AT').
//
// A számok BECSLÉSEK osztrák éves bruttó (14×, EUR) medián-szintek alapján
// (Statistik Austria nagyságrendek), Bundesland- és tapasztalat-szorzókkal +
// kis determinisztikus zaj. Cél: a tool ne legyen üres induláskor.
//
// Futtatás:  node scripts/gen-at-benchmark-seed.mjs
import { writeFileSync } from "node:fs";

// Determinisztikus PRNG (mulberry32), hogy a seed reprodukálható legyen.
let _s = 0x9e3779b9;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = (p) => 1 + (rnd() * 2 - 1) * p; // ±p

const INDUSTRIES = {
  "Informatika (IT)": 58000,
  "Vendéglátás / Szálloda": 30000,
  "Építőipar": 39000,
  "Egészségügy / Ápolás": 41000,
  "Pénzügy / Bank / Biztosítás": 54000,
  "Mérnök / Gyártás": 52000,
  "Logisztika / Szállítás": 37000,
  "Oktatás / Tudomány": 46000,
  "Kereskedelem / Retail": 35000,
  "Egyéb": 42000,
};

// Bundesland-kód → bér-szorzó (a regions/salary-calc kódjaival egyezően).
// A kódok a regions.ts AT-kódjaival egyeznek (W/NOE/OOE/STM/TIR/KTN/SBG/VBG/BGL).
const BL = {
  W: 1.05, NOE: 1.02, OOE: 1.03, VBG: 1.04, SBG: 1.0, STM: 0.98, BGL: 0.96, KTN: 0.95, TIR: 0.96,
};
const BL_CODES = Object.keys(BL);

// Tapasztalat-sávok: [év, szorzó]
const EXP = [[1, 0.82], [4, 1.0], [8, 1.18], [14, 1.3]];

// 2 szobás havi alap-lakbér (EUR) Bundeslandonként; szobánként +~230.
const RENT_BASE = {
  W: 1000, NOE: 850, OOE: 820, VBG: 1050, SBG: 1020, STM: 800, BGL: 760, KTN: 770, TIR: 980,
};
const ROOMS = [1, 2, 3, 4];

const lines = [];
lines.push("-- seed-benchmark-at.sql — osztrák Iránytű referencia-adat (generált).");
lines.push("-- Generátor: scripts/gen-at-benchmark-seed.mjs · BECSLÉS, nem hivatalos.");
lines.push("-- Előfeltétel: 0082_benchmark_country.sql (country_code oszlop).");
lines.push("DELETE FROM salary_benchmarks WHERE country_code = 'AT' AND ip_hash LIKE 'seed-at-%';");
lines.push("DELETE FROM rent_benchmarks   WHERE country_code = 'AT' AND ip_hash LIKE 'seed-at-%';");

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
        const id = `seed-sal-at-${n}`;
        const ip = `seed-at-${n}`;
        n++;
        lines.push(
          `INSERT INTO salary_benchmarks (id, country_code, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at) ` +
          `VALUES ('${id}', 'AT', '${code}', '${esc(industry)}', ${yExp}, ${gross}, '${ip}', datetime('now', '-${1 + (n % 200)} days'));`
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
      const rent = Math.round((base2 + (rooms - 2) * 230) * noise(0.08) / 10) * 10;
      const id = `seed-rent-at-${m}`;
      const ip = `seed-at-rent-${m}`;
      m++;
      lines.push(
        `INSERT INTO rent_benchmarks (id, country_code, canton_code, rooms, rent_chf, ip_hash, created_at) ` +
        `VALUES ('${id}', 'AT', '${code}', ${rooms}, ${Math.max(300, rent)}, '${ip}', datetime('now', '-${1 + (m % 150)} days'));`
      );
    }
  }
}

writeFileSync("db/seed-benchmark-at.sql", lines.join("\n") + "\n");
console.log(`Generated db/seed-benchmark-at.sql — ${n} salary + ${m} rent rows.`);
