import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * `next/dynamic({ ssr: false })` — MINDIG kell mellé `loading`.
 *
 * ⚠️⚠️ VALÓS, MÉRT HIBÁBÓL (2026-08-06). A kezdőlap kiszolgált HTML-je ezt
 * tartalmazta:
 *
 *   <!--$?--><template id="B:0">   ← a lap-szintű határ SOHA nem fejeződött be
 *   <!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">
 *
 * Az `ssr: false` SSR közben „kliens-oldali renderre bailoutol”. Ha van
 * `loading`, a bailout ODA korlátozódik. Ha NINCS, a legközelebbi
 * Suspense-határig kúszik fel — a kezdőlapon ez a ROUTE-szintű határ
 * (loading.tsx) volt, tehát a szerver a teljes lap helyett a betöltő
 * csontvázat küldte, és a tartalmat a böngészőnek kellett felépítenie.
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

  it("⚠️ minden `ssr: false` mellett van `loading`", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const src = readFileSync(resolve(GYOKER, f), "utf8");
      // A `dynamic(...)` beállítás-objektumai: `{ ssr: false ... }`.
      const talalatok = src.match(/\{\s*ssr:\s*false[^}]*\}/g) ?? [];
      for (const t of talalatok) {
        if (!t.includes("loading")) vetkesek.push(`${f}: ${t.replace(/\s+/g, " ")}`);
      }
    }
    expect(
      vetkesek,
      `\`loading\` nélkül az EGÉSZ lap kliens-renderre esik: ${vetkesek.slice(0, 6).join(" | ")}`,
    ).toEqual([]);
  });

  it("a minta NEM riaszt a szabályos alakra", () => {
    // Mindkét irányban ellenőrizni kell, különben egy túl szigorú szűrőt
    // egyszerűen kikapcsolnának.
    const jo = "{ ssr: false, loading: () => null }";
    const rossz = "{ ssr: false }";
    const minta = /\{\s*ssr:\s*false[^}]*\}/;
    expect(minta.test(jo) && jo.includes("loading")).toBe(true);
    expect(minta.test(rossz) && !rossz.includes("loading")).toBe(true);
  });
});
