import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COUNTRIES } from "@/lib/countries";
import { isValidJobCategory } from "@/lib/job-categories";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * ⚠️ A KOMMENTEKET LE KELL VÁGNI a „nem szabad benne lennie" állítások előtt.
 * Az első futtatásnál három ilyen állítás bukott el — a SAJÁT magyarázó
 * kommentemen: leírtam benne a tiltott mintát (`isNL ?`, `=== "CH" ? "CHF"`),
 * és a teszt azt találta meg. A teszt a KÓDOT vizsgálja, nem a prózát róla.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !l.trim().startsWith("//"))
    .join("\n");
}

const SRC = read("src/lib/job-sync.ts");
const CODE = stripComments(SRC);

/**
 * ⚠️ A `job-sync.ts` a Cloudflare-függő adzuna/jooble modulokat húzza be
 * („server-only"), ezért vitest-ből NEM importálható — a táblákat a forrásból
 * olvassuk. Ezért van minden ellenőrzés szöveg-szinten.
 */
const SYNC_COUNTRIES: string[] = (() => {
  const m = /const SYNC_COUNTRIES = \[([^\]]*)\]/.exec(SRC);
  expect(m, "nem találom a SYNC_COUNTRIES listát").not.toBeNull();
  return [...m![1].matchAll(/"([A-Z]{2})"/g)].map((x) => x[1]);
})();

/**
 * ⚠️ AZ ÁLLÁS-AGGREGÁTOR NYELVI LEFEDÉSE.
 *
 * User-bejelentés (2026-07-30): „Állások: nincs külső hirdetés — az aggregátor
 * csak CH/AT/DE/NL-re fut, mert a szektor-kulcsszó tábla csak német és holland
 * szavakat tartalmaz. Angol/spanyol kulcsszó-oszlop nélkül a bekapcsolás német
 * szavakkal keresne — zajt adna."
 *
 * A tábla most négy nyelvű. Ez a teszt azt védi, hogy
 *   1) egyik nyelv-oszlop se maradjon hiányos vagy másolat,
 *   2) a kvóta-szabály (GB/ES kategóriánként EGY kulcsszó) igaz maradjon,
 *   3) a nyelv-választás TÁBLÁBÓL menjen, ne ternárius-láncból.
 */

interface Row { category: string; de: string; nl: string; en: string; es: string; core: boolean }

function sectorRows(): Row[] {
  const block = /const SECTOR_QUERIES: [^=]*=\s*\[([\s\S]*?)\n\];/.exec(SRC);
  expect(block, "nem találom a SECTOR_QUERIES táblát").not.toBeNull();
  const rows: Row[] = [];
  const re =
    /\{\s*category:\s*"([a-z-]+)",\s*de:\s*"([^"]+)",\s*nl:\s*"([^"]+)",\s*en:\s*"([^"]+)",\s*es:\s*"([^"]+)"(,\s*core:\s*true)?\s*\}/g;
  for (const m of block![1].matchAll(re)) {
    rows.push({ category: m[1], de: m[2], nl: m[3], en: m[4], es: m[5], core: !!m[6] });
  }
  return rows;
}

const ROWS = sectorRows();

describe("job-sync szektor-tábla", () => {
  it("a tábla kiolvasható és nem üres", () => {
    expect(ROWS.length).toBeGreaterThan(20);
  });

  it("⚠️ MIND A NÉGY nyelv-oszlop ki van töltve minden soron", () => {
    for (const r of ROWS) {
      for (const lang of ["de", "nl", "en", "es"] as const) {
        expect(r[lang].trim().length, `${r.category}/${lang}: üres kulcsszó`).toBeGreaterThan(1);
      }
    }
  });

  /**
   * ⚠️ A MÁSOLT OSZLOP A LEGCSENDESEBB HIBA: ha az `en` egyszerűen a `de`
   * másolata, a teszt „kitöltöttnek" látja, de a szinkron NÉMET szóval keres
   * angol állást — pontosan az, amitől a funkció eddig ki volt kapcsolva.
   * Néhány szó valóban azonos minden nyelven (pl. „IT"), ezért nem soronként,
   * hanem OSZLOP-szinten mérünk: az angol/spanyol oszlop nem lehet túlnyomóan
   * a német másolata.
   */
  it("⚠️ az en/es oszlop NEM a német másolata", () => {
    for (const lang of ["en", "es"] as const) {
      const same = ROWS.filter((r) => r[lang].toLowerCase() === r.de.toLowerCase());
      expect(
        same.length,
        `${lang}: ${same.length} sor azonos a némettel (${same.map((r) => r.de).join(", ")})`,
      ).toBeLessThan(3);
    }
  });

  it("minden kategória létező job-category", () => {
    for (const r of ROWS) {
      expect(isValidJobCategory(r.category), `„${r.category}" nem létező job-category`).toBe(true);
    }
  });

  /**
   * ⚠️ KVÓTA-SZABÁLY, NEM STÍLUS. Az Adzuna ingyenes szintje 250 hívás/nap. A
   * mai AT+DE+NL forgalom 144/nap; GB/ES teljes szélességgel 240-re vinné (96%,
   * nulla ráhagyás admin-futtatásra és újrapróbálkozásra). Ezért GB/ES
   * KATEGÓRIÁNKÉNT EGY kulcsszót kap — a `core` sorokat, 12 × 2 × 2 = 48/nap.
   *
   * A szabály: minden kategóriából PONTOSAN EGY sor `core`. Így egy kategória
   * sem marad üresen a két új országban, és a kvótán belül maradunk.
   */
  it("⚠️ minden kategóriából PONTOSAN EGY sor `core` (kvóta-korlát)", () => {
    const byCat = new Map<string, number>();
    for (const r of ROWS) {
      byCat.set(r.category, (byCat.get(r.category) ?? 0) + (r.core ? 1 : 0));
    }
    for (const [cat, n] of byCat) {
      expect(n, `„${cat}": ${n} core sor (pontosan 1 kell)`).toBe(1);
    }
    const core = ROWS.filter((r) => r.core).length;
    // 12 kategória × 2 ország × napi 2 futás = 48 Adzuna-hívás/nap GB+ES-re.
    expect(core * 2 * 2, `${core} core szektor → ${core * 4} hívás/nap GB+ES-re`).toBeLessThanOrEqual(60);
  });

  /**
   * ⚠️ A NYELV-VÁLASZTÁS TÁBLÁBÓL. A korábbi `isNL ? sector.nl : sector.de`
   * alak minden NEM-holland országra NÉMET szót adott — a GB/ES bekapcsolása
   * így némán németül keresett volna. Táblával a hiányzó bejegyzés = nincs
   * keresés (fail-closed), nem = rossz nyelvű keresés.
   */
  it("⚠️ a nyelv-választás TÁBLÁBÓL megy, nem ternárius-láncból", () => {
    expect(SRC).toContain("const SECTOR_LANG: Record<string,");
    expect(CODE, "visszakerült az isNL ternárius").not.toMatch(/isNL\s*\?/);
    // Nyelv nélküli ország → 0, nem „alapértelmezett német".
    expect(SRC).toContain("if (!lang) return 0;");
  });

  it("a SECTOR_LANG minden Adzuna/Jooble-alapú országot ismer (a CH kivétel)", () => {
    const block = /const SECTOR_LANG: Record<[^=]*=\s*\{([\s\S]*?)\};/.exec(SRC);
    expect(block, "nem találom a SECTOR_LANG táblát").not.toBeNull();
    const mapped = new Set([...block![1].matchAll(/([A-Z]{2}):/g)].map((m) => m[1]));
    for (const c of COUNTRIES) {
      // CH a hivatalos Job-Room (SECO) API-t használja, nem a szektor-keresést.
      if (c.code === "CH") {
        expect(mapped.has("CH"), "CH-nak nem kell szektor-nyelv (Job-Room megy)").toBe(false);
        continue;
      }
      expect(mapped.has(c.code), `${c.code}: nincs keresőszó-nyelv`).toBe(true);
    }
  });
});

describe("job-sync ország-lista", () => {
  it("⚠️ MIND a hat ország szinkronizál", () => {
    for (const c of COUNTRIES) {
      expect(SYNC_COUNTRIES.includes(c.code), `${c.code} kimaradt a szinkronból`).toBe(true);
    }
  });

  /**
   * ⚠️ A cron-route korábban SAJÁT `COUNTRIES` halmazt tartott. Két listát nem
   * lehet szinkronban tartani: egy új ország ott hiányozva azt jelentette volna,
   * hogy a `?country=GB` CSENDBEN az „összes ország" ágra esik — vagyis az
   * Adzuna percenkénti kvótáját túllépő burst indul.
   */
  it("⚠️ a cron-route a job-sync listáját használja, nem saját kézi listát", () => {
    const route = read("src/app/api/cron/sync-jobs/route.ts");
    expect(route).toContain("SYNC_COUNTRIES");
    expect(route, "kézi ország-lista került vissza a route-ba").not.toMatch(
      /new Set\(\[\s*"[A-Z]{2}"/,
    );
  });
});

describe("job-sync pénznem", () => {
  /**
   * ⚠️ VALÓDI HIBA VOLT: `country === "CH" ? "CHF" : "EUR"` — egy angliai
   * hirdetés FONTBAN megadott bére EURÓKÉNT került volna az adatbázisba.
   */
  it("⚠️ a pénznem a budgetCurrency-ből jön, nem bináris CHF/EUR-ból", () => {
    expect(SRC).toContain("budgetCurrency");
    expect(CODE, "visszakerült a bináris CHF/EUR").not.toMatch(
      /=== "CH" \? "CHF" : "EUR"/,
    );
  });
});

describe("Arbeitnow-fallback ország-szűrő", () => {
  const AN = read("src/lib/arbeitnow.ts");
  const AN_CODE = stripComments(AN);

  /**
   * ⚠️ A `hints.length === 0` KORÁBBAN ELFOGADTA MINDENT. A feed erősen német,
   * tehát egy hint nélküli országra (GB, ES) az ország-szűrő teljesen
   * kikapcsolt: német állások kerültek volna be angliai/spanyolországi
   * hirdetésként. Élesben nem sült ki, mert az Adzuna-kulcs be van állítva —
   * de egy lejárt kulcs csendben ezt hozta volna.
   */
  it("⚠️ FAIL-CLOSED: hint nélküli ország → nincs találat, nem MINDEN találat", () => {
    expect(AN_CODE, "visszakerült az accept-all").not.toMatch(/hints\.length === 0/);
    expect(AN).toContain("hints.length > 0 && hints.some");
  });

  it("GB és ES is kap ország-kulcsszavakat", () => {
    const block = /const COUNTRY_HINTS: Record<[^=]*=\s*\{([\s\S]*?)\n\};/.exec(AN);
    expect(block).not.toBeNull();
    for (const cc of ["GB", "ES"]) {
      expect(block![1], `${cc}: nincs kulcsszó-lista`).toContain(`${cc}: [`);
    }
  });

  /**
   * ⚠️ A kulcsszavak SUBSTRING-ként illeszkednek (`loc.includes(h)`), ezért egy
   * kétbetűs töredék más országot fogna: az „uk" illeszkedne az „Ukraine"-ra.
   */
  it("⚠️ nincs 3 karakternél rövidebb ország-kulcsszó (substring-csapda)", () => {
    const block = /const COUNTRY_HINTS: Record<[^=]*=\s*\{([\s\S]*?)\n\};/.exec(AN)![1];
    for (const m of block.matchAll(/"([^"]+)"/g)) {
      expect(m[1].length, `„${m[1]}" túl rövid — más országra is illeszkedne`).toBeGreaterThan(2);
    }
  });
});
