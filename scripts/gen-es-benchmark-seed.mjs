// gen-es-benchmark-seed.mjs — spanyol Iránytű referencia-seed generálása.
// Kimenet: db/seed-benchmark-es.sql (salary + rent benchmark sorok, country_code='ES').
//
// ─────────────────────────────────────────────────────────────────────────────
// HONNAN JÖNNEK A SZÁMOK (2026-07-30-i állapot)
// ─────────────────────────────────────────────────────────────────────────────
//   • Közösség-szorzó: INE, Encuesta Anual de Estructura Salarial (EAES) 2024,
//     DEFINITÍV adatok (közzététel 2026-05-28) — „ganancia media anual por
//     trabajador" comunidad autónoma szerint. A szorzó a közösségi érték /
//     országos átlag (29 540,26 €).
//   • Iparág-alap: az EAES ágazati táblájából csak azokat használom, amiket a
//     sajtóközlemény SZÖVEGE számszerűen megnevez (energia 57 931,81 €;
//     pénzügy/biztosítás 51 862,90 €; információ/kommunikáció 42 741,94 €;
//     szakmai-tudományos 35 165,11 €; vendéglátás 17 653,42 €; országos átlag
//     29 540,26 €, medián 24 497,17 €). A többi ágazat BECSLÉS.
//   • Lakbér: €/m²/hó kínálati ár közösségenként — Brains Real Estate
//     Q2-2026, keresztellenőrizve az idealista 2026. júniusi adataival
//     (Madrid 21,23 vs. 21,7 · Cataluña 17,57 vs. 17,6 · Murcia 9,39 vs. 9,5 ·
//     Extremadura 7,09 vs. 7,7 · országos 15,3 €/m²).
//   • Alsó korlát: SMI 2026 = 1 221 € × 14 paga = 17 094 €/év.
//
// ⚠️ HÁROM CSAPDA, AMIT ITT SZÁNDÉKOSAN KEZELEK
//
// 1) RÉSZMUNKAIDŐ-HÍGÍTÁS. Az EAES „ganancia media anual por trabajador"
//    a részmunkaidősöket IS tartalmazza, ezért a vendéglátás 17 653 €-s értéke
//    NEM azt jelenti, hogy egy teljes munkaidős spanyol felszolgáló ennyit kap.
//    Az Iránytűbe teljes munkaidős éves bruttót írnak be, tehát az ágazati
//    SZINTEKET teljes munkaidőre becsülöm — a KÖZÖSSÉGI SZORZÓKAT viszont
//    az EAES-ből veszem, mert az arány sokkal kevésbé érzékeny a hígításra.
//    Ha az EAES-szinteket vakon átvenném, minden teljes munkaidős spanyol
//    vendéglátós „átlag felettinek" látszana — rendszeres, egyirányú hiba.
//
// 2) MEDIÁN vs. ÁTLAG ORSZÁGOK KÖZÖTT. Az AT/DE/NL seedek MEDIÁN-szintűek.
//    Ha itt átlagot használnék, egy spanyol és egy német felhasználó
//    percentilise MÁS statisztika ellen számolódna. Ezért az alapok itt is
//    medián-szintűek (INE-medián 24 497 € körüli sávban).
//
// 3) CEUTA ÉS MELILLA NINCS SEEDELVE. Az INE közösségi táblája a 17 comunidad
//    autónomát tartalmazza, a két autonóm város nincs benne. Inkább üresen
//    maradnak (a hőtérkép „nincs elég adat"-ot ír rájuk), mint hogy kitalált
//    számot tegyek oda — beküldeni onnan is lehet, akkor megtelnek.
//
// ⚠️ SZOBASZÁM-SZEMANTIKA. Az app `rooms` mezője MINDEN szobát számol (a
// nappalit is): „1 szoba (Stúdió)", „3 szoba" = 2 hálószoba + nappali. A spanyol
// hirdetések HABITACIÓN/DORMITORIO-t számolnak. A leképezés jellemző beépített
// alapterülettel:  1 szoba=40 m² · 2=55 · 3=75 · 4=95 · 5=120.
//
// A számok BECSLÉSEK hivatalos horgonyokkal — NEM hivatalos statisztika.
//
// Futtatás:  node scripts/gen-es-benchmark-seed.mjs
import { writeFileSync } from "node:fs";

// Determinisztikus PRNG (mulberry32), hogy a seed reprodukálható legyen.
let _s = 0x1e5b40c7;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = (p) => 1 + (rnd() * 2 - 1) * p; // ±p

// Iparág → spanyol TELJES MUNKAIDŐS éves bruttó (EUR) medián-becslés.
// Az IT és a pénzügy az EAES J/K szekciójának magas szintjét tükrözi, de a
// mediánra lehúzva (a K átlagát a bónuszok viszik fel). A vendéglátás 20 000 €
// a részmunkaidő-hígítás visszaszámolása után (EAES: 17 653 € / minden dolgozó).
const INDUSTRIES = {
  "Informatika (IT)": 38000,
  "Vendéglátás / Szálloda": 20000,
  "Építőipar": 26000,
  "Egészségügy / Ápolás": 28000,
  "Pénzügy / Bank / Biztosítás": 38000,
  "Mérnök / Gyártás": 28500,
  "Logisztika / Szállítás": 25500,
  "Oktatás / Tudomány": 30000,
  "Kereskedelem / Retail": 22000,
  "Egyéb": 26500,
};

// Comunidad autónoma → ganancia media anual (EUR), INE EAES 2024 (definitív).
// A százalékos oszlop a forráson ki van írva, és minden érték kiadja azt
// (pl. 26 089,70 / 29 540,26 = 88,32%) — ez volt a keresztellenőrzés arra, hogy
// a táblát nem sor-elcsúszással olvastam ki. (Első két kiolvasásom TÉNYLEG
// elcsúszott: Extremadura helyett Cantabriát adta legalacsonyabbnak.)
const CCAA_MEAN = {
  PV: 35170, // País Vasco — 119,06%
  MD: 34410, // Comunidad de Madrid — 116,49%
  NC: 32605, // Navarra — 110,38%
  CT: 31730, // Cataluña — 107,41%
  IB: 29075, // Illes Balears — 98,43%
  AS: 28562, // Asturias — 96,69%
  AR: 28062, // Aragón — 95,00%
  RI: 27855, // La Rioja — 94,30%
  CB: 27097, // Cantabria — 91,73%
  VC: 26817, // Comunitat Valenciana — 90,78%
  GA: 26547, // Galicia — 89,87%
  MC: 26349, // Región de Murcia — 89,20%
  CL: 26177, // Castilla y León — 88,62%
  AN: 26090, // Andalucía — 88,32%
  CM: 26052, // Castilla-La Mancha — 88,23%
  CN: 25120, // Canarias — 85,04%
  EX: 24979, // Extremadura — 84,56% (a LEGALACSONYABB)
};
const ES_NATIONAL_MEAN = 29540;
// Közösség-szorzó = közösségi érték / országos átlag.
const RG = Object.fromEntries(
  Object.entries(CCAA_MEAN).map(([code, med]) => [code, med / ES_NATIONAL_MEAN]),
);
const RG_CODES = Object.keys(RG);

// Tapasztalat-sávok: [év, szorzó]
// ⚠️ KÖZÉPRE KALIBRÁLVA — ld. a részletes indoklást a GB-generátorban. Röviden:
// a régi [0,82 · 1,0 · 1,18 · 1,30] sávok átlaga 1,075, ami az egész eloszlást
// az iparági alap fölé tolja, és a felhasználót rendszeresen „alulfizetettnek"
// mutatja. Ez a sáv 1,025 átlagú, a karrier-ív megmarad.
const EXP = [[1, 0.80], [4, 0.96], [8, 1.11], [14, 1.23]];

// ⚠️ SMI 2026: 1 221 €/hó × 14 paga = 17 094 €/év. A seed egyetlen sora sem
// mehet ez alá — az illegális lenne, és a felhasználó bérét hamis mezőnyhöz
// mérné. A vendéglátás/kereskedelem alsó sávja tényleg ide tapad: Spanyolországban
// ez a valóság, nem műtermék.
const SMI_YEARLY = 1221 * 14; // 17 094 €

// €/m²/hó bérleti KÍNÁLATI ár közösségenként (Brains RE Q2-2026).
// ⚠️ Kínálati (hirdetési) ár, nem a teljes lakásállomány átlaga — magasabb.
// Ez itt SZÁNDÉKOS: a kiköltözőt éppen a piacon lévő ár érdekli.
const RENT_SQM = {
  MD: 21.23, IB: 18.79, CT: 17.57, PV: 14.94, AN: 14.81, CN: 13.49,
  VC: 12.94, CB: 12.15, AS: 10.96, NC: 10.31, AR: 10.18, MC: 9.39,
  CL: 9.31, GA: 9.20, RI: 8.96, CM: 7.92, EX: 7.09,
};
// Szoba (ÖSSZES szoba, a nappalival) → jellemző beépített alapterület (m²).
const ROOM_SQM = { 1: 40, 2: 55, 3: 75, 4: 95, 5: 120 };
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
lines.push("-- seed-benchmark-es.sql — spanyol Iránytű referencia-adat (generált).");
lines.push("-- Generátor: scripts/gen-es-benchmark-seed.mjs · BECSLÉS hivatalos horgonyokkal.");
lines.push("-- Bér-szorzó: INE EAES 2024 · Lakbér: Brains RE Q2-2026 · Alsó korlát: SMI 2026.");
lines.push("-- Ceuta (CE) és Melilla (ML) SZÁNDÉKOSAN nincs seedelve: nincs INE közösségi adat.");
lines.push("-- Előfeltétel: 0082_benchmark_country.sql (country_code oszlop).");
lines.push("DELETE FROM salary_benchmarks WHERE country_code = 'ES' AND ip_hash LIKE 'seed-es-%';");
lines.push("DELETE FROM rent_benchmarks   WHERE country_code = 'ES' AND ip_hash LIKE 'seed-es-%';");

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

// ── Bérek: minden (iparág × közösség × tapasztalat-sáv) → 1-2 sor ──
for (const [industry, base] of Object.entries(INDUSTRIES)) {
  for (const code of RG_CODES) {
    for (const [ei, [yrs, em]] of EXP.entries()) {
      const count = CELL_COUNT[industry][ei];
      for (let i = 0; i < count; i++) {
        const raw = base * RG[code] * em * noise(0.06);
        const gross = Math.max(SMI_YEARLY, Math.round(raw / 100) * 100);
        const yExp = Math.max(0, yrs + Math.round((rnd() * 2 - 1) * 2));
        const id = `seed-sal-es-${n}`;
        const ip = `seed-es-${n}`;
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
          `VALUES ('${id}', 'ES', '${code}', '${esc(industry)}', ${yExp}, ${gross}, '${ip}', datetime('now', '-${ageDays} days'));`
        );
      }
    }
  }
}

// ── Lakbérek: (közösség × szobaszám) → 2-3 sor ──
let m = 0;
for (const code of RG_CODES) {
  for (const rooms of ROOMS) {
    const base2 = RENT_SQM[code] * ROOM_SQM[rooms];
    const count = 2 + (rnd() < 0.5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const rent = Math.round((base2 * noise(0.08)) / 10) * 10;
      const id = `seed-rent-es-${m}`;
      // ⚠️ A lakbér-sorok ~60%-a PÁROSÍTVA egy bér-sorral (ugyanaz az ip_hash).
      // Enélkül a lakbér/fizetés-arány widget üresen marad: a `getRentToSalaryRatio`
      // ip_hash-en JOIN-ol. A svájci seed ezt SZÁNDÉKOSAN megteszi („a lakbér egy
      // része egy bér-sorral PÁROSÍTVA"), az AT/DE/NL generátorok elhagyták —
      // ezért ott ma is null az arány.
      // A párosítás nem véletlen: a szobaszám választja a bér-sávot (nagyobb lakás
      // → magasabb keresetű háztartás), különben stúdióban élő csúcskereső és
      // 5 szobás házban élő minimálbéres párok születnének.
      const mate = pickMate(code, rooms);
      const ip = mate !== null ? mate : `seed-es-rent-${m}`;
      m++;
      lines.push(
        `INSERT INTO rent_benchmarks (id, country_code, canton_code, rooms, rent_chf, ip_hash, created_at) ` +
        `VALUES ('${id}', 'ES', '${code}', ${rooms}, ${Math.max(250, rent)}, '${ip}', datetime('now', '-${1 + Math.floor(rnd() * 330)} days'));`
      );
    }
  }
}

writeFileSync("db/seed-benchmark-es.sql", lines.join("\n") + "\n");
console.log(`Generated db/seed-benchmark-es.sql — ${n} salary + ${m} rent rows.`);
