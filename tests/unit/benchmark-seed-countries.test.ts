import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COUNTRIES } from "@/lib/countries";
import { getRegions } from "@/lib/regions";
import { BENCHMARK_INDUSTRIES, BENCHMARK_ROOMS } from "@/lib/benchmark-meta";
import { ES_SMI_YEARLY } from "@/lib/salary-calc-es";
import {
  benchRegionWordDistributive,
  benchRegionWordSublative,
  benchCurrency,
} from "@/app/(app)/iranytu/region-util";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * ⚠️ AZ IRÁNYTŰ (BENCHMARK) ORSZÁG-LEFEDETTSÉGE.
 *
 * User-bejelentés (2026-07-30): „Iránytű: nulla adat — be van kapcsolva, de a
 * bér- és lakbér-tábla mindkét országban üres (CH/AT/DE/NL seedelve van, GB/ES
 * nem). Üres grafikonok fogadják a felhasználót."
 *
 * Ez a teszt HÁROM dolgot véd:
 *   1) a hőtérkép-rács MINDEN országra létezik, és a rács kódjai a VALÓDI
 *      régió-kódok (a régi ternárius-lánc a végén svájci kantonokat adott
 *      volna Angliára/Spanyolországra);
 *   2) a generált seed-SQL minden sora ÁTMEGY a saját beküldő-API validációján
 *      (iparág, régió, szobaszám, összeg-sávok) — különben olyan adat kerülne a
 *      közösségi statisztikába, amit a felhasználó maga nem tudna beküldeni;
 *   3) a seed számai a HIVATKOZOTT hivatalos szinteken maradnak: a bér nem eshet
 *      a törvényes minimum alá, és az összesített medián nem csúszhat el a
 *      közölt országos mediántól.
 */

// ── A hőtérkép-rács a forrásból (a komponens "use client", nem importáljuk) ──
const HEATMAP_SRC = read("src/app/(app)/iranytu/SwissHeatmap.tsx");

interface Cell { c: string; x: number; y: number }

function gridOf(name: string): Cell[] {
  const m = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`).exec(HEATMAP_SRC);
  if (!m) return [];
  return [...m[1].matchAll(/\{\s*c:\s*"([A-Z]+)",\s*x:\s*(\d+),\s*y:\s*(\d+)\s*\}/g)]
    .map((g) => ({ c: g[1], x: Number(g[2]), y: Number(g[3]) }));
}

/** A GRIDS tábla ország → (rács-név, oszlop, sor) leképezése a forrásból. */
function gridsTable(): Record<string, { name: string; cols: number; rows: number }> {
  const block = /const GRIDS: Record<[\s\S]*?> = \{([\s\S]*?)\n\};/.exec(HEATMAP_SRC);
  expect(block, "nem találom a GRIDS táblát a SwissHeatmap.tsx-ben").not.toBeNull();
  const out: Record<string, { name: string; cols: number; rows: number }> = {};
  for (const m of block![1].matchAll(
    /([A-Z]{2}):\s*\{\s*grid:\s*(\w+),\s*cols:\s*(\d+),\s*rows:\s*(\d+)/g,
  )) {
    out[m[1]] = { name: m[2], cols: Number(m[3]), rows: Number(m[4]) };
  }
  return out;
}

describe("Iránytű hőtérkép-rács", () => {
  const GRIDS = gridsTable();

  it("⚠️ MIND a hat országnak van rácsa (különben üres/hibás hőtérkép)", () => {
    for (const c of COUNTRIES) {
      expect(GRIDS[c.code], `${c.code} (${c.name}): nincs hőtérkép-rács`).toBeDefined();
    }
  });

  it("⚠️ a rács kódjai a VALÓDI régió-kódok, és minden régió pontosan egyszer szerepel", () => {
    for (const c of COUNTRIES) {
      const conf = GRIDS[c.code];
      if (!conf) continue;
      const cells = gridOf(conf.name);
      expect(cells.length, `${c.code}: üres rács`).toBeGreaterThan(0);
      const valid = new Set(getRegions(c.code).map((r) => r.code));
      const seen = new Set<string>();
      for (const cell of cells) {
        expect(valid.has(cell.c), `${c.code}: „${cell.c}" nem érvényes régió-kód`).toBe(true);
        expect(seen.has(cell.c), `${c.code}: „${cell.c}" kétszer van a rácsban`).toBe(false);
        seen.add(cell.c);
      }
      // Egyik régió sem maradhat le a rácsról — különben nem lehet rákoppintani.
      for (const code of valid) {
        expect(seen.has(code), `${c.code}: „${code}" régió hiányzik a rácsról`).toBe(true);
      }
    }
  });

  it("a cellák a rács méretén belül vannak, és nem lóg egyik a másikra", () => {
    for (const [cc, conf] of Object.entries(GRIDS)) {
      const cells = gridOf(conf.name);
      const at = new Set<string>();
      for (const cell of cells) {
        expect(cell.x >= 1 && cell.x <= conf.cols, `${cc}/${cell.c}: x=${cell.x} kifut (cols=${conf.cols})`).toBe(true);
        expect(cell.y >= 1 && cell.y <= conf.rows, `${cc}/${cell.c}: y=${cell.y} kifut (rows=${conf.rows})`).toBe(true);
        const key = `${cell.x},${cell.y}`;
        expect(at.has(key), `${cc}: két cella ugyanott (${key})`).toBe(false);
        at.add(key);
      }
    }
  });
});

describe("Iránytű régió-szó ragozása", () => {
  /**
   * ⚠️ VALÓDI, ÉLESBEN LÉVŐ HIBÁT JAVÍT: a hőtérkép „Koppints egy kantonra"
   * feliratot írt HOLLANDIÁBAN is, mert a ternárius-lánc végén a svájci szó
   * állt (`isAT || isDE ? "tartományra" : "kantonra"`).
   */
  const SWISS_WORDS = ["kanton", "Kanton"];

  it("⚠️ SVÁJCI szó CSAK Svájcban jelenik meg", () => {
    for (const c of COUNTRIES) {
      const words = [benchRegionWordDistributive(c.code), benchRegionWordSublative(c.code)];
      for (const w of words) {
        const swiss = SWISS_WORDS.some((s) => w.includes(s));
        expect(swiss, `${c.code}: „${w}" svájci szó`).toBe(c.code === "CH");
      }
    }
  });

  it("minden ország kap nem-üres, ragozott alakot", () => {
    for (const c of COUNTRIES) {
      expect(benchRegionWordDistributive(c.code)).toMatch(/ként$/);
      expect(benchRegionWordSublative(c.code)).toMatch(/(ra|re)$/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A GENERÁLT SEED-SQL
// ─────────────────────────────────────────────────────────────────────────────

interface SalRow { region: string; industry: string; yrs: number; gross: number; ip: string; days: number }
interface RentRow { region: string; rooms: number; rent: number; ip: string; days: number }

const SAL_RE = /VALUES \('[^']+', '([A-Z]{2})', '([A-Z]+)', '(.*?)', (\d+), (\d+), '([^']+)', datetime\('now', '-(\d+) days'\)\)/;
const RENT_RE = /VALUES \('[^']+', '([A-Z]{2})', '([A-Z]+)', ([\d.]+), (\d+), '([^']+)', datetime\('now', '-(\d+) days'\)\)/;

function parseSeed(file: string, cc: string) {
  const src = read(file);
  const sal: SalRow[] = [];
  const rent: RentRow[] = [];
  for (const line of src.split("\n")) {
    if (line.startsWith("INSERT INTO salary_benchmarks")) {
      const m = SAL_RE.exec(line);
      if (!m) continue;
      expect(m[1], `${file}: idegen country_code`).toBe(cc);
      sal.push({ region: m[2], industry: m[3], yrs: Number(m[4]), gross: Number(m[5]), ip: m[6], days: Number(m[7]) });
    } else if (line.startsWith("INSERT INTO rent_benchmarks")) {
      const m = RENT_RE.exec(line);
      if (!m) continue;
      expect(m[1], `${file}: idegen country_code`).toBe(cc);
      rent.push({ region: m[2], rooms: Number(m[3]), rent: Number(m[4]), ip: m[5], days: Number(m[6]) });
    }
  }
  return { src, sal, rent };
}

function median(a: number[]): number {
  const v = [...a].sort((x, y) => x - y);
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
}

/** Ország → (fájl, generátor, törvényes éves minimum, közölt országos medián). */
const SEEDS = [
  {
    cc: "GB",
    file: "db/seed-benchmark-gb.sql",
    gen: "scripts/gen-gb-benchmark-seed.mjs",
    table: "REGION_MEDIAN",
    // National Living Wage 2026-04: 12,71 £/óra × 37,5 óra × 52 hét.
    floor: Math.round(12.71 * 37.5 * 52),
    // ONS ASHE 2025 — teljes munkaidős medián éves bruttó.
    nationalMedian: 39039,
  },
  {
    cc: "ES",
    file: "db/seed-benchmark-es.sql",
    gen: "scripts/gen-es-benchmark-seed.mjs",
    table: "CCAA_MEAN",
    // SMI 2026: 1 221 € × 14 paga.
    floor: 1221 * 14,
    // INE EAES 2024 — a medián (24 497 €) és az átlag (29 540 €) közötti sáv
    // közepe: a seed 10 iparága nem foglalkoztatás-súlyozott, ezért nem az
    // egyik vagy a másik pontos értékét várjuk.
    nationalMedian: 27000,
  },
] as const;

describe.each(SEEDS)("$cc benchmark-seed", ({ cc, file, gen, table, floor, nationalMedian }) => {
  const { src, sal, rent } = parseSeed(file, cc);
  const validRegions = new Set(getRegions(cc).map((r) => r.code));

  it("nem üres, és idempotens (DELETE + INSERT)", () => {
    expect(sal.length, "nincs bér-sor").toBeGreaterThan(300);
    expect(rent.length, "nincs lakbér-sor").toBeGreaterThan(80);
    expect(src).toContain(`DELETE FROM salary_benchmarks WHERE country_code = '${cc}'`);
    expect(src).toContain(`DELETE FROM rent_benchmarks   WHERE country_code = '${cc}'`);
  });

  /**
   * ⚠️ A seed adata a KÖZÖSSÉGI statisztikába kerül, ugyanabba, amit a
   * felhasználó beküldése is táplál. Ha a seed olyan iparágat/régiót/szobaszámot
   * tartalmaz, amit a beküldő-API elutasít, akkor a seed a saját szabályainkat
   * sérti meg, és a statisztika olyat mutat, amit senki nem tud reprodukálni.
   */
  it("⚠️ MINDEN sor átmegy a beküldő-API validációján", () => {
    const industries = new Set<string>(BENCHMARK_INDUSTRIES as readonly string[]);
    const rooms = new Set<number>(BENCHMARK_ROOMS as readonly number[]);
    // A route.ts sávjai: nem-CH bér 15 000–250 000, lakbér ES 200–6 000 / 300–6 000.
    const minS = 15000, maxS = 250000;
    const minR = cc === "ES" ? 200 : 300, maxR = 6000;
    for (const s of sal) {
      expect(validRegions.has(s.region), `bér: „${s.region}" nem ${cc}-régió`).toBe(true);
      expect(industries.has(s.industry), `bér: „${s.industry}" nem engedélyezett iparág`).toBe(true);
      expect(s.yrs >= 0 && s.yrs <= 50, `bér: ${s.yrs} év kifut a 0–50 sávból`).toBe(true);
      expect(s.gross >= minS && s.gross <= maxS, `bér: ${s.gross} kifut a ${minS}–${maxS} sávból`).toBe(true);
    }
    for (const r of rent) {
      expect(validRegions.has(r.region), `lakbér: „${r.region}" nem ${cc}-régió`).toBe(true);
      expect(rooms.has(r.rooms), `lakbér: ${r.rooms} szoba nem engedélyezett`).toBe(true);
      expect(r.rent >= minR && r.rent <= maxR, `lakbér: ${r.rent} kifut a ${minR}–${maxR} sávból`).toBe(true);
    }
  });

  it("⚠️ egyetlen bér-sor sem esik a TÖRVÉNYES MINIMUM alá", () => {
    const under = sal.filter((s) => s.gross < floor);
    expect(under.length, `${under.length} sor a minimum (${floor}) alatt, pl. ${JSON.stringify(under[0])}`).toBe(0);
  });

  it("az összesített medián a közölt országos szint ±8%-án belül van", () => {
    const m = median(sal.map((s) => s.gross));
    const drift = Math.abs(m - nationalMedian) / nationalMedian;
    expect(drift, `seed-medián ${m} vs. közölt ${nationalMedian} (${(drift * 100).toFixed(1)}% eltérés)`).toBeLessThan(0.08);
  });

  /**
   * ⚠️ A HŐTÉRKÉP SZÍNE NEM MONDHAT MÁST, MINT A HIVATALOS TÁBLA.
   *
   * Két hibát is elkövettem, amíg ide jutottam — mindkettő a TESZTBEN volt:
   *
   * 1) Mediánt mértem, holott a hőtérkép ÁTLAGOT jelenít meg
   *    (`getSalaryHeatmap`: `ROUND(AVG(...))`). A medián a spanyol lista szűk
   *    alsó sávjában mintavételi okokból cserélődik, az átlag stabil.
   * 2) A két vég PONTOS sorrendjét kötöttem meg. Csak hogy Angliában East
   *    Midlands (30 690 £) és Yorkshire (30 682 £) között NYOLC FONT a
   *    különbség — a sorrendjük megkötése nem követelmény, hanem véletlen.
   *
   * A helyes megfogalmazás: ahol a hivatalos tábla ÉRDEMI különbséget mond
   * (>1,5%), ott a seed sem fordulhat meg. Az ez alatti különbségek döntetlenek,
   * és döntetlent nem kötünk meg. Ez az egész táblát lefedi, nem csak a végeit.
   *
   * ⚠️ ÉS EZ VALÓDI SEED-HIBÁT FOGOTT: a cellánkénti 1-2 soros véletlen a
   * régió-cikluson BELÜL volt, tehát minden régió más iparág-összetételt kapott.
   * Mivel az iparágak között ~2-szeres bérkülönbség van, ez dominálta a
   * régiós átlagot: Cantabria a seedben Castilla y León ALATT végzett, holott
   * 3,5%-kal fölötte van. A generátorban a sorszám most régió-független.
   */
  it("⚠️ ahol a hivatalos tábla >1,5% különbséget mond, ott a seed sem fordul meg", () => {
    const genSrc = read(gen);
    const block = new RegExp(`const ${table} = \\{([\\s\\S]*?)\\n\\};`).exec(genSrc);
    expect(block, `${gen}: nem találom a ${table} táblát`).not.toBeNull();
    const official = new Map(
      [...block![1].matchAll(/([A-Z]+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])] as const),
    );
    expect(official.size, "üres hivatalos tábla").toBeGreaterThan(8);
    for (const code of official.keys()) {
      expect(validRegions.has(code), `${gen}: „${code}" nem ${cc}-régió`).toBe(true);
    }

    // A megjelenített statisztika: régiós ÁTLAG.
    const byReg = new Map<string, number[]>();
    for (const s of sal) {
      if (!byReg.has(s.region)) byReg.set(s.region, []);
      byReg.get(s.region)!.push(s.gross);
    }
    const avg = new Map(
      [...byReg].map(([r, v]) => [r, v.reduce((a, b) => a + b, 0) / v.length] as const),
    );

    const codes = [...official.keys()].filter((c) => avg.has(c));
    let checked = 0;
    for (const a of codes) {
      for (const b of codes) {
        if (a === b) continue;
        const oa = official.get(a)!, ob = official.get(b)!;
        if (oa / ob <= 1.015) continue; // döntetlen — nem követelmény
        checked++;
        expect(
          avg.get(a)!,
          `${a} (hivatalos ${oa}) a seedben ${b} (${ob}) alatt van`,
        ).toBeGreaterThan(avg.get(b)!);
      }
    }
    expect(checked, "egyetlen érdemi pár sem volt — a teszt nem mér semmit").toBeGreaterThan(10);
  });

  /**
   * ⚠️ A LAKBÉR/FIZETÉS-ARÁNY WIDGET a `getRentToSalaryRatio`-ból él, ami
   * ip_hash-en JOIN-olja a két táblát. A svájci seed ezért SZÁNDÉKOSAN párosítja
   * a sorok egy részét („a lakbér egy része egy bér-sorral PÁROSÍTVA"); az
   * AT/DE/NL generátorok ezt elhagyták, és ott ma is `avg_ratio: null` jön
   * vissza. GB/ES párosít — ez a teszt védi, hogy a párosítás ne csak létezzen,
   * hanem ÉRTELMES is legyen.
   */
  it("⚠️ a lakbér-sorok egy része PÁROSÍTVA van bér-sorral (különben null az arány)", () => {
    const byIp = new Map(sal.map((s) => [s.ip, s]));
    const paired = rent.filter((r) => byIp.has(r.ip));
    const share = paired.length / rent.length;
    expect(share, `csak ${Math.round(share * 100)}% párosított`).toBeGreaterThan(0.3);
  });

  it("⚠️ a párosítás NEM lóg át más régióba", () => {
    const byIp = new Map(sal.map((s) => [s.ip, s]));
    for (const r of rent) {
      const mate = byIp.get(r.ip);
      if (!mate) continue;
      expect(mate.region, `${r.rooms} szoba: ${r.region} lakbér ${mate.region} bérhez párosítva`).toBe(r.region);
    }
  });

  /**
   * ⚠️ MÓDSZERTANI DÖNTÉS, NEM VÉLETLEN: az 5 szobás (4+ hálószobás) lakást
   * HÁZTARTÁS bérli, nem egy személy. Egyetlen fizetéshez mérve 70% körüli
   * lakbér-terhet adott — ezért ezek a sorok a lakbér-statisztikában benne
   * vannak, az arány-widgetben nem.
   */
  it("⚠️ az 5 szobás lakások NINCSENEK párosítva (háztartás-szint)", () => {
    const ips = new Set(sal.map((s) => s.ip));
    for (const r of rent.filter((x) => x.rooms >= 5)) {
      expect(ips.has(r.ip), `${r.rooms} szobás lakás párosítva egyetlen fizetéshez`).toBe(false);
    }
  });

  it("a párosított bér NŐ a szobaszámmal (nem stúdióban élő csúcskereső)", () => {
    const byIp = new Map(sal.map((s) => [s.ip, s]));
    const byRoom = new Map<number, number[]>();
    for (const r of rent) {
      const mate = byIp.get(r.ip);
      if (!mate) continue;
      if (!byRoom.has(r.rooms)) byRoom.set(r.rooms, []);
      byRoom.get(r.rooms)!.push(mate.gross);
    }
    const keys = [...byRoom.keys()].sort((a, b) => a - b);
    expect(keys.length, "nincs elég párosított szobaszám").toBeGreaterThan(2);
    let prev = 0;
    for (const k of keys) {
      const v = byRoom.get(k)!;
      const avg = v.reduce((a, b) => a + b, 0) / v.length;
      expect(avg, `${k} szoba párjainak átlagbére (${Math.round(avg)}) nem nagyobb az előzőnél (${Math.round(prev)})`).toBeGreaterThan(prev);
      prev = avg;
    }
  });

  /**
   * ⚠️ A TREND-DIAGRAM 12 hónapot rajzol, IPARÁGRA szűrve. Ha a dátumok
   * sorrendben (`n % 200`) állnának, minden iparág egy ~55 napos szeletet kapna,
   * és a diagram iparágonként 2 pontot tudna kirajzolni. A szórásnak ezért
   * iparágon BELÜL is végig kell futnia az éven.
   */
  it("⚠️ a dátumok a teljes 12 hónapra szórnak — IPARÁGON BELÜL is", () => {
    const byInd = new Map<string, Set<number>>();
    for (const s of sal) {
      if (!byInd.has(s.industry)) byInd.set(s.industry, new Set());
      byInd.get(s.industry)!.add(Math.floor(s.days / 30));
    }
    for (const [ind, bands] of byInd) {
      expect(bands.size, `„${ind}": csak ${bands.size} hónap-sáv (a trend így ${bands.size} pontot rajzol)`).toBeGreaterThan(7);
    }
  });

  it("a lakbér nő a szobaszámmal (monoton)", () => {
    const byRoom = new Map<number, number[]>();
    for (const r of rent) {
      if (!byRoom.has(r.rooms)) byRoom.set(r.rooms, []);
      byRoom.get(r.rooms)!.push(r.rent);
    }
    const keys = [...byRoom.keys()].sort((a, b) => a - b);
    let prev = 0;
    for (const k of keys) {
      const m = median(byRoom.get(k)!);
      expect(m, `${k} szoba mediánja (${m}) nem nagyobb a ${k - 1} szobásnál (${prev})`).toBeGreaterThan(prev);
      prev = m;
    }
  });
});

describe("Iránytű seed — ország-specifikus tudnivalók", () => {
  /**
   * ⚠️ SZÁNDÉKOS HIÁNY, NEM ELFELEJTETT SOR. Az INE közösségi bértáblája a 17
   * comunidad autónomát tartalmazza; Ceuta és Melilla nincs benne. Inkább
   * üresen maradnak („nincs elég adat"), mint hogy kitalált szám kerüljön oda.
   * Ha valaki egyszer valós adatot talál rájuk, ezt a tesztet kell átírni —
   * és akkor tudatos döntés lesz, nem véletlen.
   */
  it("Ceuta és Melilla NINCS seedelve (nincs rájuk hivatalos adat)", () => {
    const { sal, rent } = parseSeed("db/seed-benchmark-es.sql", "ES");
    for (const code of ["CE", "ML"]) {
      expect(sal.some((s) => s.region === code), `${code}: kitalált bér-adat`).toBe(false);
      expect(rent.some((r) => r.region === code), `${code}: kitalált lakbér-adat`).toBe(false);
    }
  });

  /**
   * A generátor .mjs — nem tud TS-t importálni, ezért a spanyol minimálbér KÉT
   * helyen szerepel. Ez a teszt köti össze őket, hogy a jövő évi SMI-emelésnél
   * ne csússzon el a kettő. (Ugyanaz a minta, mint a regionWord/regionLabel
   * szinkron-őrnél.)
   */
  it("⚠️ a generátor SMI-je EGYEZIK a bérkalkulátor ES_SMI_YEARLY-jével", () => {
    const genSrc = read("scripts/gen-es-benchmark-seed.mjs");
    const m = /const SMI_YEARLY = (\d+) \* (\d+);/.exec(genSrc);
    expect(m, "nem találom az SMI_YEARLY-t a generátorban").not.toBeNull();
    expect(Number(m![1]) * Number(m![2])).toBe(ES_SMI_YEARLY);
  });

  it("a pénznem országonként helyes (GB fontban gondolkodik)", () => {
    expect(benchCurrency("GB")).toBe("GBP");
    expect(benchCurrency("ES")).toBe("EUR");
    expect(benchCurrency("CH")).toBe("CHF");
  });
});
