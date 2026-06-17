import { test, expect } from "@playwright/test";

/**
 * Flow: vélemény. A vélemény beküldése Turnstile-t igényel → a teszt a
 * vállalkozás-részlet megnyitásáig és a vélemény-szekció megjelenéséig ellenőriz.
 * Adatfüggő: üres Szaknévsornál (seed nélkül) kihagyja magát.
 */
test.describe("Flow: vélemény", () => {
  test("vállalkozás megnyitása a Szaknévsorból + vélemény-szekció", async ({ page }) => {
    await page.goto("/szaknevsor");

    const cards = page.locator("a[href^='/szaknevsor/']").filter({ hasNot: page.locator("[href='/szaknevsor/uj']") });
    const count = await cards.count();
    test.skip(count === 0, "Nincs vállalkozás a Szaknévsorban (üres adatbázis) — a flow nem futtatható.");

    await cards.first().click();
    await expect(page).toHaveURL(/\/szaknevsor\/(?!uj$).+/);
    await expect(page.getByText(/vélemény/i).first()).toBeVisible();
  });
});
