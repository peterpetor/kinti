// gen-nl-benchmark-seed.mjs — holland Iránytű referencia-seed generálása.
// Kimenet: db/seed-benchmark-nl.sql (salary + rent benchmark sorok, country_code='NL').
//
// A számok BECSLÉSEK holland éves bruttó (EUR) medián-szintek alapján (CBS/Pararius
// nagyságrendek), provincia- és tapasztalat-szorzókkal + kis determinisztikus zaj.
// A provincia-szorzók a PROV_MEDIAN havi mediánjaiból származnak (median / országos
// medián). Cél: a tool ne legyen üres induláskor (mint AT/DE-nél). NEM hivatalos.
//
// Futtatás:  node scripts/gen-nl-benchmark-seed.mjs
import { writeFileSync } from "node:fs";

// Determinisztikus PRNG (mulberry32), hogy a seed reprodukálható legyen.
let _s = 0x4e7b91a3;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = (p) => 1 + (rnd() * 2 - 1) * p; // ±p

// Iparág → holland éves bruttó (EUR) medián-becslés.
const INDUSTRIES = {
  "Informatika (IT)": 58000,
  "Vendéglátás / Szálloda": 30000,
  "Építőipar": 42000,
  "Egészségügy / Ápolás": 42000,
  "Pénzügy / Bank / Biztosítás": 58000,
  "Mérnök / Gyártás": 54000,
  "Logisztika / Szállítás": 38000,
  "Oktatás / Tudomány": 48000,
  "Kereskedelem / Retail": 34000,
  "Egyéb": 44000,
};

// Provincia havi medián bruttó (EUR, CBS-becslés) — a régió-szorzóhoz.
const PROV_MEDIAN = {
  UT: 3550, NH: 3500, ZH: 3400, NB: 3400, FL: 3350, GE: 3300,
  OV: 3200, ZE: 3200, DR: 3150, LI: 3150, FR: 3100, GR: 3100,
};
const NATIONAL_MEDIAN = 3300;
// Provincia-szorzó = a provincia mediánja / országos medián.
const PR = Object.fromEntries(
  Object.entries(PROV_MEDIAN).map(([code, med]) => [code, med / NATIONAL_MEDIAN]),
);
const PR_CODES = Object.keys(PR);

// Tapasztalat-sávok: [év, szorzó]
const EXP = [[1, 0.82], [4, 1.0], [8, 1.18], [14, 1.3]];

// 2 szobás havi alap-lakbér (kale huur, EUR) provinciánként; szobánként +~280.
const RENT_BASE = {
  NH: 1700, UT: 1550, ZH: 1450, NB: 1350, FL: 1250, GE: 1250,
  OV: 1150, LI: 1150, GR: 1100, ZE: 1100, FR: 1050, DR: 1050,
};
const ROOMS = [1, 2, 3, 4];

const lines = [];
lines.push("-- seed-benchmark-nl.sql — holland Iránytű referencia-adat (generált).");
lines.push("-- Generátor: scripts/gen-nl-benchmark-seed.mjs · BECSLÉS, nem hivatalos.");
lines.push("-- Előfeltétel: 0082_benchmark_country.sql (country_code oszlop).");
lines.push("DELETE FROM salary_benchmarks WHERE country_code = 'NL' AND ip_hash LIKE 'seed-nl-%';");
lines.push("DELETE FROM rent_benchmarks   WHERE country_code = 'NL' AND ip_hash LIKE 'seed-nl-%';");

let n = 0;
const esc = (s) => s.replace(/'/g, "''");

// ── Bérek: minden (iparág × provincia × tapasztalat-sáv) → 1-2 sor ──
for (const [industry, base] of Object.entries(INDUSTRIES)) {
  for (const code of PR_CODES) {
    for (const [yrs, em] of EXP) {
      const count = 1 + (rnd() < 0.5 ? 1 : 0); // 1-2 sor / cella
      for (let i = 0; i < count; i++) {
        const gross = Math.round((base * PR[code] * em * noise(0.06)) / 100) * 100;
        const yExp = Math.max(0, yrs + Math.round((rnd() * 2 - 1) * 2));
        const id = `seed-sal-nl-${n}`;
        const ip = `seed-nl-${n}`;
        n++;
        lines.push(
          `INSERT INTO salary_benchmarks (id, country_code, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at) ` +
          `VALUES ('${id}', 'NL', '${code}', '${esc(industry)}', ${yExp}, ${gross}, '${ip}', datetime('now', '-${1 + (n % 200)} days'));`
        );
      }
    }
  }
}

// ── Lakbérek: (provincia × szobaszám) → 2-3 sor ──
let m = 0;
for (const code of PR_CODES) {
  for (const rooms of ROOMS) {
    const base2 = RENT_BASE[code];
    const count = 2 + (rnd() < 0.5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const rent = Math.round((base2 + (rooms - 2) * 280) * noise(0.08) / 10) * 10;
      const id = `seed-rent-nl-${m}`;
      const ip = `seed-nl-rent-${m}`;
      m++;
      lines.push(
        `INSERT INTO rent_benchmarks (id, country_code, canton_code, rooms, rent_chf, ip_hash, created_at) ` +
        `VALUES ('${id}', 'NL', '${code}', ${rooms}, ${Math.max(400, rent)}, '${ip}', datetime('now', '-${1 + (m % 150)} days'));`
      );
    }
  }
}

writeFileSync("db/seed-benchmark-nl.sql", lines.join("\n") + "\n");
console.log(`Generated db/seed-benchmark-nl.sql — ${n} salary + ${m} rent rows.`);
