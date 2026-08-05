import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Alsó lap: a háttér hátrébb lép (natív iOS-minta).
 *
 * ⚠️⚠️ EZ A TESZT EGY OLYAN HIBÁT ŐRIZ, AMIT ÍRÁS KÖZBEN KAPTAM EL.
 * Az első változatom a `body`-t kicsinyítette. A BottomSheet viszont a
 * `document.body`-ba portálozik (`createPortal(..., document.body)`), tehát a
 * body transzformálása MAGÁT A LAPOT is összenyomta volna — pont azt, aminek
 * teljes méretben kell maradnia. Mérve: a portál-szintű elem 375×844 marad,
 * a fő tartalom megy 0,965-re.
 *
 * A `transform` ráadásul új tartalmazó blokkot hoz létre: a rajta BELÜLI
 * `position: fixed` elemek hozzá igazodnának. Ezért a TabBar, a toast-sín és a
 * megerősítő-dialógus a konténeren KÍVÜL maradnak.
 */

const GYOKER = resolve(__dirname, "../..");
const CSS = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8");
const SHEET = readFileSync(resolve(GYOKER, "src/components/ui/bottom-sheet.tsx"), "utf8");
/** ⚠️ KÉT KÜLÖN BottomSheet van a repóban, a hívók fele-fele arányban oszlanak
 *  meg köztük. Minden lap-szintű viselkedést MINDKETTŐBE be kell tenni. */
const SHEET_REGI = readFileSync(resolve(GYOKER, "src/components/bottom-sheet.tsx"), "utf8");
const APPMAIN = readFileSync(resolve(GYOKER, "src/components/app-main.tsx"), "utf8");

describe("háttér-mélység alsó lapnál", () => {
  it("⚠️ a transzformáció a tartalom-konténerre megy, NEM a body-ra", () => {
    expect(CSS).toContain("html[data-sheet-open] [data-app-main]");
    // A body-s alak visszacsúszása a lapot is összenyomná.
    expect(CSS).not.toMatch(/html\[data-sheet-open\]\s+body\s*\{/);
  });

  it("a horgony tényleg rajta van a tartalom-konténeren", () => {
    expect(APPMAIN).toContain("data-app-main");
  });

  it("a lap továbbra is a body-ba portálozik (ezért kell a külön konténer)", () => {
    // Ha ez valaha megváltozik, a fenti indoklás is felülvizsgálandó.
    // A JSX a `createPortal(` és a cél között hosszú, ezért a két végét
    // külön nézzük — a portál-cél a hívás UTOLSÓ argumentuma.
    expect(SHEET).toContain("createPortal(");
    expect(SHEET).toMatch(/document\.body,\s*\);/);
  });

  it("⚠️ SZÁMLÁLÓ, nem logikai jelző — egymásba nyíló lapokhoz", () => {
    // Lap fölött megerősítés: a belső bezárása nem állíthatja vissza a
    // hátteret, amíg a külső még nyitva van.
    expect(SHEET).toContain("dataset.sheetOpen");
    expect(SHEET).toMatch(/Number\(document\.documentElement\.dataset\.sheetOpen/);
  });

  it("⚠️ MINDKÉT BottomSheet állítja a jelzőt (különben a lapok fele nem mozdítja a hátteret)", () => {
    for (const [nev, src] of [["ui/bottom-sheet", SHEET], ["bottom-sheet", SHEET_REGI]] as const) {
      // ⚠️ A BEÁLLÍTÁST kell néznünk, nem a puszta jelenlétet: az első
      // változatom csak a `dataset.sheetOpen` szövegre illesztett, és a
      // takarító ág megléte miatt akkor is átment, amikor a beállító sort
      // kivettem — vagyis nem őrzött semmit.
      expect(src, `${nev}: nem ÁLLÍTJA a jelzőt`).toMatch(/dataset\.sheetOpen\s*=\s*String\(/);
      expect(src, `${nev}: nem takarít`).toMatch(/delete document\.documentElement\.dataset\.sheetOpen/);
      expect(src, `${nev}: nem számláló`).toMatch(/Number\(document\.documentElement\.dataset\.sheetOpen/);
    }
  });

  it("⚠️ a „Mégse” sziget MINDKÉT lapon elérhető", () => {
    for (const [nev, src] of [["ui/bottom-sheet", SHEET], ["bottom-sheet", SHEET_REGI]] as const) {
      expect(src, `${nev}: nincs cancelLabel`).toContain("cancelLabel");
    }
  });

  it("a mozgás a közös görbét használja, és van reduced-motion ág", () => {
    const blokk = CSS.slice(CSS.indexOf("[data-app-main] {"), CSS.indexOf("Egységes press-feedback"));
    expect(blokk).toContain("var(--kinti-ease)");
    expect(blokk).toContain("prefers-reduced-motion");
  });
});
