import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * `next/dynamic({ ssr: false })` — MINDIG kell mellé SAJÁT `<Suspense>`.
 *
 * ⚠️⚠️ VALÓS, MÉRT HIBÁBÓL (2026-08-06). A kezdőlap kiszolgált HTML-je ezt
 * tartalmazta:
 *
 *   <!--$?--><template id="B:0">   ← a lap-szintű határ SOHA nem fejeződött be
 *   <!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">
 *
 * Az `ssr: false` SSR közben „kliens-oldali renderre bailoutol”, és a bailout a
 * LEGKÖZELEBBI Suspense-határig kúszik fel. A kezdőlapon nem volt saját határ,
 * ezért a ROUTE-szintű határig (loading.tsx) ért: a szerver a teljes lap helyett
 * a betöltő csontvázat küldte ki, a tartalmat a böngészőnek kellett felépítenie.
 *
 * ⚠️ A `loading:` NEM ELÉG — ezt MEGMÉRTEM. Hozzáadása után a kiszolgált HTML-ben
 * a függő `<!--$?-->` határ és a hiányzó lezárás (`completeBoundary` = 0)
 * VÁLTOZATLAN maradt. A `loading` a kliens-oldali chunk-betöltés állapotát adja,
 * az SSR-bailoutot nem fogja meg. Ami megfogja: egy valódi `<Suspense>` a
 * komponens körül — ezért tiszta a /szaknevsor, ahol a lusta térkép abban ül.
 *
 * ⚠️ A TÜNET NEM LÁTSZOTT: a lap „működött”, csak minden szerver-render kárba
 * ment, és a konzol React #419-et dobott. Pontosan ezért kell teszt: emberi
 * szemmel nem tűnik fel.
 */

const GYOKER = resolve(__dirname, "../..");

describe("lusta komponensek határa", () => {
  const fajlok = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));

  it("legalább néhány tsx-et megtalált (a keresés se romolhat el némán)", () => {
    expect(fajlok.length).toBeGreaterThan(50);
  });

  it("⚠️ minden `ssr: false`-t tartalmazó modulban van `<Suspense>` határ is", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const src = readFileSync(resolve(GYOKER, f), "utf8");
      if (!/ssr:\s*false/.test(src)) continue;
      // Elég a modul-szintű jelenlét: a burkoló lehet segédfüggvényben is
      // (home-lazy `hatarral`), nem kell minden exportnál külön JSX.
      if (!/<Suspense/.test(src)) vetkesek.push(f);
    }
    expect(
      vetkesek,
      `saját \`<Suspense>\` nélkül az EGÉSZ lap kliens-renderre esik: ${vetkesek.join(", ")}`,
    ).toEqual([]);
  });

  it("a szűrő tényleg megkülönbözteti a két alakot", () => {
    // Mindkét irányban ellenőrizni kell, különben egy túl szigorú szabályt
    // egyszerűen kikapcsolnának.
    const jo = "const X = dynamic(f, { ssr: false }); const Y = <Suspense><X /></Suspense>;";
    const rossz = "const X = dynamic(f, { ssr: false });";
    expect(/ssr:\s*false/.test(jo) && /<Suspense/.test(jo)).toBe(true);
    expect(/ssr:\s*false/.test(rossz) && !/<Suspense/.test(rossz)).toBe(true);
  });
});
