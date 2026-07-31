import { describe, it, expect } from "vitest";
// @ts-expect-error — sima .mjs segéd, nincs típusdefiníciója (szándékos).
import { auditFieldLabels } from "../../scripts/audit-field-labels.mjs";

/**
 * RACSNI-TESZT az űrlapmezők hozzáférhető nevére.
 *
 * ⚠️ MIÉRT NEM NULLA A KÜSZÖB: az induló állapot 160 helykitöltős mezőből 147
 * névtelen volt. Egy „legyen 0" teszt azonnal pirosra állítaná az egész
 * futtatást, és a csapat vagy kikapcsolná, vagy összecsapná a javítást. A racsni
 * ehelyett azt köti, hogy a szám **csak csökkenhet**: az új űrlap már nem
 * romolhat, a régi pedig fokozatosan javítható.
 *
 * ⚠️ HA EZT A TESZTET ELBUKTATOD ÚJ MEZŐVEL: ne a küszöböt emeld. Adj a mezőnek
 * `aria-label`-t (ha nincs látható címkéje), vagy `id`-t + a címkére `htmlFor`-t
 * (ha VAN látható címkéje — akkor az `aria-label` rossz megoldás, mert
 * felülírná a láthatót a képernyőolvasónak).
 *
 * ⚠️ HA JAVÍTOTTÁL: vidd LEJJEBB a küszöböt, hogy a nyereség ne csússzon vissza.
 */
const KUSZOB = 96; // 2026-07-31: 147 → 96 (51 mező megjelölve)

describe("űrlapmezők hozzáférhető neve (WCAG 3.3.2)", () => {
  const { total, missing, perFile } = auditFieldLabels("src");

  it(`a névtelen, csak-helykitöltős mezők száma nem nő (küszöb: ${KUSZOB})`, () => {
    const reszletek = Object.entries(perFile)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 8)
      .map(([f, n]) => `  ${n}  ${f}`)
      .join("\n");
    expect(
      missing,
      `Névtelen mező: ${missing} (küszöb ${KUSZOB}, összes helykitöltős: ${total}).\n` +
        `Adj aria-label-t, vagy id-t + htmlFor-t. Legtöbbet érintett:\n${reszletek}`,
    ).toBeLessThanOrEqual(KUSZOB);
  });

  it("a mérés egyáltalán talál mezőket (az elemző nem néma)", () => {
    // ⚠️ Volt már, hogy a naiv regex elakadt az `onChange={(e) => …}` nyilán, és
    // 160 helyett 15 mezőt látott — a hiba ÉSZREVÉTLEN maradt volna.
    expect(total).toBeGreaterThan(100);
  });
});
