import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  D1_NAPI_SOR_KERET,
  RIASZTAS_JELZO,
  RIASZTAS_KUSZOB,
  SOR_KOLTSEG,
  kvotaAllapot,
  kvotaEsemeny,
  kvotaUzenet,
} from "../../src/lib/quota-guard";

/**
 * Keret-őr — a 2026-08-04-i kiesés utóélete.
 *
 * A kiesés lényege: a D1 napi olvasott-sor kerete csendben elfogyott, és attól
 * kezdve MINDEN adatbázisból olvasó lap 500/503-at adott. Riasztás nem volt.
 *
 * ⚠️ Ennek az őrnek EGY dolga van: a küszöb átlépésekor megszólalni, MIELŐTT a
 * keret elfogy. Ezért a tesztek nem a „szép kód"-ot mérik, hanem a három
 * hibamódot, ami az őrt magát tenné haszontalanná:
 *   1. alábecsül (nem szól, pedig kellene),
 *   2. túl későn szól (a küszöb túl magas / a szorzó elavult),
 *   3. minden ellenőrzésnél újra szól (webhook-zaj → a fontos üzenet elvész).
 */

describe("keret-őr — becslés", () => {
  it("üres napon nulla, és nem riaszt", () => {
    const a = kvotaAllapot([]);
    expect(a.becsultSor).toBe(0);
    expect(a.riasztando).toBe(false);
    expect(a.bontas).toEqual([]);
  });

  it("a futásszámot a MÉRT sor-költséggel szorozza", () => {
    const a = kvotaAllapot([{ event: kvotaEsemeny("biz-list"), count: 10 }]);
    expect(a.becsultSor).toBe(10 * SOR_KOLTSEG["biz-list"]);
  });

  it("több lekérdezés költségét összeadja, és a legdrágábbat teszi előre", () => {
    const a = kvotaAllapot([
      { event: kvotaEsemeny("categories"), count: 100 },
      { event: kvotaEsemeny("biz-list"), count: 100 },
    ]);
    expect(a.becsultSor).toBe(100 * SOR_KOLTSEG["biz-list"] + 100 * SOR_KOLTSEG["categories"]);
    // A riasztás akkor hasznos, ha megmondja, MI eszi a keretet.
    expect(a.bontas[0].kulcs).toBe("biz-list");
  });

  it("az ismeretlen eseményeket figyelmen kívül hagyja", () => {
    // A `feature_usage_daily` tele van más `quota:`-előtag nélküli eseménnyel is,
    // és a jelző-sor (`quota:alerted`) sem lekérdezés — egyik sem költség.
    const a = kvotaAllapot([
      { event: "szaknevsor:megnyitas", count: 9999 },
      { event: RIASZTAS_JELZO, count: 1 },
    ]);
    expect(a.becsultSor).toBe(0);
  });
});

describe("keret-őr — küszöb", () => {
  /** Hány lista-kihagyás fér bele a keretbe? A valós fogyasztás mértéke. */
  const futasKeret = D1_NAPI_SOR_KERET / SOR_KOLTSEG["biz-list"];

  it("a küszöb alatt hallgat", () => {
    const futas = Math.floor(futasKeret * (RIASZTAS_KUSZOB - 0.1));
    expect(kvotaAllapot([{ event: kvotaEsemeny("biz-list"), count: futas }]).riasztando).toBe(false);
  });

  it("a küszöb fölött riaszt — MÉG a keret elfogyása előtt", () => {
    const futas = Math.ceil(futasKeret * (RIASZTAS_KUSZOB + 0.02));
    const a = kvotaAllapot([{ event: kvotaEsemeny("biz-list"), count: futas }]);
    expect(a.riasztando).toBe(true);
    // ⚠️ A LÉNYEG: a riasztás pillanatában még van hátra keret. Ha ez elbukik,
    // az őr a kiesés UTÁN szólal meg, azaz semmit sem ér.
    expect(a.becsultSor).toBeLessThan(D1_NAPI_SOR_KERET);
  });

  it("a keret túllépését is jelzi (arány > 1)", () => {
    const a = kvotaAllapot([{ event: kvotaEsemeny("biz-list"), count: Math.ceil(futasKeret * 1.5) }]);
    expect(a.arany).toBeGreaterThan(1);
    expect(a.riasztando).toBe(true);
  });

  it("a küszöb hagy időt beavatkozni — nincs 95%-os utólagos riasztás", () => {
    expect(RIASZTAS_KUSZOB).toBeLessThanOrEqual(0.8);
    expect(RIASZTAS_KUSZOB).toBeGreaterThan(0.4);
  });
});

describe("keret-őr — riasztás szövege", () => {
  it("százalékot, abszolút számot és bontást is tartalmaz", () => {
    const a = kvotaAllapot([{ event: kvotaEsemeny("biz-list"), count: 800 }]);
    const uzenet = kvotaUzenet(a);
    expect(uzenet).toContain("%");
    expect(uzenet).toContain("biz-list");
    expect(uzenet).toContain("800×");
  });

  it("⚠️ NEM használ `toLocaleString`-et (prerender-környezetben nincs teljes ICU)", () => {
    // ⚠️ A megjegyzéseket ELŐBB ki kell szedni: a fájl épp ezt a szabályt
    // dokumentálja, így a nyers szöveges keresés önmagára bukna el.
    const src = readFileSync(resolve(__dirname, "../../src/lib/quota-guard.ts"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(src).not.toContain("toLocaleString");
    expect(src).not.toContain("Intl.");
  });
});

describe("keret-őr — futásidejű fél", () => {
  const runtimeSrc = readFileSync(
    resolve(__dirname, "../../src/lib/quota-guard-runtime.ts"),
    "utf8",
  );
  const pureSrc = readFileSync(resolve(__dirname, "../../src/lib/quota-guard.ts"), "utf8");

  it("a tiszta fél NEM importál adatbázist vagy hálózatot", () => {
    // Enélkül a fenti tesztek D1-mockot igényelnének, és a logika csak
    // futó Cloudflare-környezetben lenne ellenőrizhető.
    expect(pureSrc).not.toMatch(/from "\.\/(cloudflare|repo-|monitoring)/);
  });

  it("naponta EGYSZER riaszt (jelző-sor a `feature_usage_daily`-ben)", () => {
    expect(runtimeSrc).toContain("RIASZTAS_JELZO");
    expect(runtimeSrc).toMatch(/marSzoltunk/);
  });

  it("nem minden kihagyásnál ellenőriz (az ellenőrzés maga is D1-olvasás)", () => {
    expect(runtimeSrc).toMatch(/ELLENORZES_SURUSEG\s*=\s*[2-9]/);
  });

  it("elnyeli a hibát — a keret-őr sosem törhet meg egy oldalbetöltést", () => {
    expect(runtimeSrc).toMatch(/catch\s*\{/);
  });
});

describe("keret-őr — bekötés", () => {
  const repoSrc = readFileSync(resolve(__dirname, "../../src/lib/repo-business.ts"), "utf8");

  it("a jelzés a `cached()` callbackJÉN BELÜL van (csak valódi kihagyáskor fut)", () => {
    // ⚠️ Ha a hívás a `cached(...)` ELÉ csúszna, minden kérést számolna — a
    // riasztás akkor a forgalmat mérné, nem a D1-fogyasztást, és hamis
    // riasztást adna cache-találatok tömegére.
    // ⚠️ A kulcs VERZIÓJÁRA ne kössük magunkat: a `biz:list-vN` léptetése
    // szándékos művelet (kézi cache-ürítés), nem regresszió. A teszt a
    // SORRENDET őrzi, nem a verziószámot.
    const i = repoSrc.search(/cached\("biz:list-v\d+"/);
    const j = repoSrc.indexOf('ellenorizKvota("biz-list")');
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(i);
    // …és a callback első D1-hívása előtt.
    expect(repoSrc.indexOf("getDB()", i)).toBeGreaterThan(j);
  });
});
