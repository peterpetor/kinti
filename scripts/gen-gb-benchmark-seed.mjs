// gen-gb-benchmark-seed.mjs — angliai Iránytű referencia-seed generálása.
// Kimenet: db/seed-benchmark-gb.sql (salary + rent benchmark sorok, country_code='GB').
//
// ─────────────────────────────────────────────────────────────────────────────
// HONNAN JÖNNEK A SZÁMOK (2026-07-30-i állapot)
// ─────────────────────────────────────────────────────────────────────────────
// A régió-szorzók és a lakbérek HIVATALOS, közzétett adatból származnak; az
// iparág-alapok BECSLÉSEK. Ez tudatos vonalhúzás: a régiós arányokat és a
// lakbéreket az ONS teljes bontásban közli, az iparági medián-táblát viszont csak
// a nyers ASHE-adatfájlokban — abból itt csak a sajtóközleményben SZÁMSZERŰEN
// megnevezett sávokat használom, a többit a sektor-sorrendből becsülöm.
//
//   • Régió-szorzó: ONS ASHE 2025 (2025. április) — medián éves bruttó, MINDEN
//     foglalkoztatott (teljes + részmunkaidő), lakóhely szerint. A szorzó a
//     régiós medián / országos medián. ⚠️ SZÁNDÉKOSAN a „minden foglalkoztatott"
//     tábla: EZ az egyetlen, amit mind a 9 angol régióra teljesen közöltek, és a
//     szorzóhoz csak az ARÁNY kell, nem a szint.
//   • Szint-kalibráció: a szorzót a teljes munkaidős ASHE 2025 mediánra
//     (39 039 £) alkalmazom, mert az Iránytűbe a felhasználók teljes munkaidős
//     éves bruttót írnak be. Ellenőrzés a közölt teljes munkaidős értékek ellen:
//     London 47 200 vs. 49 826 (−5%), North East 35 100 vs. 35 422 (−1%) — a
//     legjobb egyezés, amit egyetlen egyszerű transzformáció ad.
//   • Lakbér: ONS Price Index of Private Rents (PIPR), 2026. május — régiós
//     átlagos havi lakbér, minden ingatlantípus. A szobaszám-görbe a PIPR
//     hálószoba-bontásából (1 háló 1 123 £ … 4+ háló 2 056 £, UK-átlag 1 383 £).
//   • Alsó korlát: National Living Wage 2026. április, 21+ → 12,71 £/óra.
//
// ⚠️ SZOBASZÁM-SZEMANTIKA — EZ A LEGKÖNNYEBBEN ELVÉTHETŐ RÉSZ.
// Az app `rooms` mezője a SVÁJCI/MAGYAR konvenció szerint MINDEN szobát számol
// (a nappalit is): „1 szoba (Stúdió)", „3 szoba" = 2 hálószoba + nappali.
// Az angol hirdetések viszont HÁLÓSZOBÁT számolnak („2 bedroom flat").
// Ha a kettőt összekeverem, egy egész szobával elcsúszik a lakbér-tábla, és a
// brit felhasználó rendre „drágának" látná a saját lakbérét. A leképezés:
//   1 szoba = studio · 2 szoba = 1 bed · 3 szoba = 2 bed · 4 szoba = 3 bed
//   5 szoba = 4 bed
//
// A számok tehát BECSLÉSEK hivatalos horgonyokkal — NEM hivatalos statisztika.
// Cél ugyanaz, mint AT/DE/NL-nél: az Iránytű ne üres grafikonokkal fogadja a
// felhasználót.
//
// Futtatás:  node scripts/gen-gb-benchmark-seed.mjs
import { writeFileSync } from "node:fs";

// Determinisztikus PRNG (mulberry32), hogy a seed reprodukálható legyen.
let _s = 0x67b21d05;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = (p) => 1 + (rnd() * 2 - 1) * p; // ±p

// Iparág → angliai teljes munkaidős éves bruttó (GBP) medián-becslés.
// Horgonyok (ASHE 2025 sajtóközlemény): minden iparág 39 039 £; szálloda/
// vendéglátás 28 687 £ (a legalacsonyabb szekció). A pénzügy közölt 58 488 £-os
// értéke ÁTLAG — a City bónuszai miatt a medián ennél jóval alacsonyabb, ezért
// itt nem az átlagot használom.
const INDUSTRIES = {
  "Informatika (IT)": 52000,
  "Vendéglátás / Szálloda": 28700,
  "Építőipar": 39000,
  "Egészségügy / Ápolás": 36000,
  "Pénzügy / Bank / Biztosítás": 51000,
  "Mérnök / Gyártás": 38000,
  "Logisztika / Szállítás": 35000,
  "Oktatás / Tudomány": 38500,
  "Kereskedelem / Retail": 31500,
  "Egyéb": 39000,
};

// Régiós medián éves bruttó (GBP) — ONS ASHE 2025, minden foglalkoztatott.
const REGION_MEDIAN = {
  LDN: 39778, SE: 35215, EE: 34104, SW: 31432, WM: 31345,
  NW: 31330, EM: 30690, YH: 30682, NE: 29584,
};
const NATIONAL_MEDIAN = 32890; // UK, minden foglalkoztatott, ASHE 2025
// Régió-szorzó = régiós medián / országos medián.
const RG = Object.fromEntries(
  Object.entries(REGION_MEDIAN).map(([code, med]) => [code, med / NATIONAL_MEDIAN]),
);
const RG_CODES = Object.keys(RG);

// Tapasztalat-sávok: [év, szorzó]
// ⚠️ KÖZÉPRE KALIBRÁLVA. Az AT/DE/NL seedek [0,82 · 1,0 · 1,18 · 1,30] sávokat
// használnak, aminek az ÁTLAGA 1,075 — vagyis a generált eloszlás mediánja ~7-10%-kal
// az iparági alap FÖLÉ esik. Az első futásomnál pontosan ez történt: az IT-medián
// 57 300 £ lett az 52 000 £-os alapból, és az összesített medián 40 800 £ a közölt
// 39 039 £ helyett. Így minden felhasználó rendszeresen „alulfizetettnek" látszott
// volna — egyirányú hiba, nem szimmetrikus zaj. A sávok most 1,025 átlagra vannak
// húzva, a karrier-ív (+54% pályakezdőtől a szenioráig) megmarad.
const EXP = [[1, 0.80], [4, 0.96], [8, 1.11], [14, 1.23]];

// ⚠️ National Living Wage 2026. április (21+): 12,71 £/óra → 37,5 óra × 52 hét.
// A seed EGYETLEN sora sem mehet ez alá: egy jogszerű teljes munkaidős állás
// Angliában nem fizethet kevesebbet. A vendéglátás-sorok egy része tényleg
// ide tapad — ez NEM műtermék, az ONS is növekvő NLW-közeli arányt jelez.
const NLW_YEARLY = Math.round(12.71 * 37.5 * 52); // 24 785 £

// PIPR átlagos havi lakbér régiónként (GBP, 2026. május, minden ingatlantípus).
const RENT_REGION_AVG = {
  LDN: 2294, SE: 1418, EE: 1280, SW: 1234, WM: 966,
  NW: 954, EM: 914, YH: 856, NE: 776,
};
// Szoba (ÖSSZES szoba!) → a régiós átlag szorzója. A PIPR hálószoba-bontásából:
// 1 háló 1 123 £ / 1 383 £ = 0,81 · 4+ háló 2 056 £ / 1 383 £ = 1,49.
const ROOM_FACTOR = { 1: 0.72, 2: 0.81, 3: 0.95, 4: 1.06, 5: 1.49 };
const ROOMS = [1, 2, 3, 4, 5];

// ── Bér–lakbér párosítás ───────────────────────────────────────
// A generált bér-sorok (ip + régió + összeg), hogy a lakbérek egy részét
// ugyanahhoz a szintetikus „személyhez" tudjuk kötni.
const salaryPool = [];

/**
 * Szobaszám → melyik bér-percentilis-sávból válasszunk párt.
 *
 * ⚠️ AZ 5 SZOBÁS SZÁNDÉKOSAN NINCS BENNE. A lakbér/fizetés-arány EGY ember
 * bérét méri EGY lakás bérleti díjához — egy 4+ hálószobás házat viszont
 * HÁZTARTÁS bérel (két kereset vagy lakótársak), nem egy személy. Ha ezeket is
 * párosítanám, a közösségi átlag felfelé csúszna: az első futtatásnál 71%-os
 * maximumot adott (londoni 5 szobás ház egyetlen 52 ezres fizetéshez mérve).
 * Az 5 szobás sorok így önálló beküldésként maradnak: a lakbér-statisztikában
 * benne vannak, az arány-widgetben nem.
 */
const MATE_BAND = {
  1: [0.0, 0.35],
  2: [0.15, 0.5],
  3: [0.35, 0.7],
  4: [0.55, 0.85],
};

/** Egy azonos régióbeli bér-sor ip_hash-e a szobaszámhoz illő sávból (vagy null). */
function pickMate(code, rooms) {
  const band = MATE_BAND[rooms];
  if (!band) return null; // 5 szobás (háztartás-szintű) — nem párosítjuk
  if (rnd() > 0.6) return null; // ~40% marad önálló beküldés
  const pool = salaryPool.filter((s) => s.code === code).sort((a, b) => a.gross - b.gross);
  if (pool.length === 0) return null;
  const from = Math.floor(band[0] * (pool.length - 1));
  const to = Math.floor(band[1] * (pool.length - 1));
  return pool[from + Math.floor(rnd() * (to - from + 1))].ip;
}

const lines = [];
lines.push("-- seed-benchmark-gb.sql — angliai Iránytű referencia-adat (generált).");
lines.push("-- Generátor: scripts/gen-gb-benchmark-seed.mjs · BECSLÉS hivatalos horgonyokkal.");
lines.push("-- Bér-szorzó: ONS ASHE 2025 · Lakbér: ONS PIPR 2026-05 · Alsó korlát: NLW 2026-04.");
lines.push("-- Előfeltétel: 0082_benchmark_country.sql (country_code oszlop).");
lines.push("DELETE FROM salary_benchmarks WHERE country_code = 'GB' AND ip_hash LIKE 'seed-gb-%';");
lines.push("DELETE FROM rent_benchmarks   WHERE country_code = 'GB' AND ip_hash LIKE 'seed-gb-%';");

let n = 0;
const esc = (s) => s.replace(/'/g, "''");

/**
 * ⚠️ A CELLÁNKÉNTI SORSZÁM RÉGIÓ-FÜGGETLEN — EZ NEM SZŐRSZÁLHASOGATÁS.
 *
 * Korábban `1 + (rnd() < 0.5 ? 1 : 0)` volt a régió-ciklus BELSEJÉBEN, tehát
 * minden régió MÁS iparág-összetételt kapott: az egyik régióban a vendéglátás
 * kapott 2 sort és az IT 1-et, a másikban fordítva. Mivel az iparágak között
 * ~2-szeres bérkülönbség van (a zaj csak ±6%), EZ dominálta a régiós átlagot —
 * vagyis a hőtérkép „összes iparág" nézete részben azt színezte, melyik
 * iparág kapott véletlenül eggyel több sort. A saját tesztem buktatta le:
 * Cantabria (hivatalos 27 097 €) a seedben Castilla y León (26 177 €) ALATT
 * végzett, holott 3,5%-kal fölötte kell lennie.
 *
 * Most a sorszám CSAK (iparág × tapasztalat)-tól függ, tehát minden régió
 * ÓRA-AZONOS összetételt kap, és a régiók közötti különbség pontosan a
 * hivatalos szorzót + a zajt tükrözi.
 */
const CELL_COUNT = Object.fromEntries(
  Object.keys(INDUSTRIES).map((ind) => [ind, EXP.map(() => 1 + (rnd() < 0.5 ? 1 : 0))]),
);

// ── Bérek: minden (iparág × régió × tapasztalat-sáv) → 1-2 sor ──
for (const [industry, base] of Object.entries(INDUSTRIES)) {
  for (const code of RG_CODES) {
    for (const [ei, [yrs, em]] of EXP.entries()) {
      const count = CELL_COUNT[industry][ei];
      for (let i = 0; i < count; i++) {
        const raw = base * RG[code] * em * noise(0.06);
        const gross = Math.max(NLW_YEARLY, Math.round(raw / 100) * 100);
        const yExp = Math.max(0, yrs + Math.round((rnd() * 2 - 1) * 2));
        const id = `seed-sal-gb-${n}`;
        const ip = `seed-gb-${n}`;
        n++;
        // ⚠️ A dátum a TELJES 12 hónapra szórva, nem `n % 200` szerint sorban.
        // A sorrendi változat minden iparágnak egy ~55 napos SZELETET adott (az `n`
        // az iparágakon át fut), így a trend-diagram iparágonként mindössze 2 pontot
        // tudott kirajzolni. Szórással mind a 12 hónap kap adatot.
        // A szórás EGYENLETES, nem emelkedő: nem építünk bele bérnövekedési sztorit.
        const ageDays = 1 + Math.floor(rnd() * 330);
        salaryPool.push({ ip: ip, code: code, gross: gross });
        lines.push(
          `INSERT INTO salary_benchmarks (id, country_code, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at) ` +
          `VALUES ('${id}', 'GB', '${code}', '${esc(industry)}', ${yExp}, ${gross}, '${ip}', datetime('now', '-${ageDays} days'));`
        );
      }
    }
  }
}

// ── Lakbérek: (régió × szobaszám) → 2-3 sor ──
let m = 0;
for (const code of RG_CODES) {
  for (const rooms of ROOMS) {
    const base2 = RENT_REGION_AVG[code] * ROOM_FACTOR[rooms];
    const count = 2 + (rnd() < 0.5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const rent = Math.round((base2 * noise(0.08)) / 10) * 10;
      const id = `seed-rent-gb-${m}`;
      // ⚠️ A lakbér-sorok ~60%-a PÁROSÍTVA egy bér-sorral (ugyanaz az ip_hash).
      // Enélkül a lakbér/fizetés-arány widget üresen marad: a `getRentToSalaryRatio`
      // ip_hash-en JOIN-ol. A svájci seed ezt SZÁNDÉKOSAN megteszi („a lakbér egy
      // része egy bér-sorral PÁROSÍTVA"), az AT/DE/NL generátorok elhagyták —
      // ezért ott ma is null az arány.
      // A párosítás nem véletlen: a szobaszám választja a bér-sávot (nagyobb lakás
      // → magasabb keresetű háztartás), különben stúdióban élő csúcskereső és
      // 5 szobás házban élő minimálbéres párok születnének.
      const mate = pickMate(code, rooms);
      const ip = mate !== null ? mate : `seed-gb-rent-${m}`;
      m++;
      lines.push(
        `INSERT INTO rent_benchmarks (id, country_code, canton_code, rooms, rent_chf, ip_hash, created_at) ` +
        `VALUES ('${id}', 'GB', '${code}', ${rooms}, ${Math.max(400, rent)}, '${ip}', datetime('now', '-${1 + Math.floor(rnd() * 330)} days'));`
      );
    }
  }
}

writeFileSync("db/seed-benchmark-gb.sql", lines.join("\n") + "\n");
console.log(`Generated db/seed-benchmark-gb.sql — ${n} salary + ${m} rent rows.`);
