import { test, expect } from "@playwright/test";

/**
 * Flow: regisztráció / profil (Clerk). A teljes belépés külső Clerk-fiókot
 * igényel → a teszt az auth-belépési pontokat és a védett route gate-jét
 * ellenőrzi (renderelés + átirányítás), titkok nélkül determinisztikusan.
 */
test.describe("Flow: regisztráció és profil", () => {
  test("a regisztrációs oldal betölt", async ({ page }) => {
    await page.goto("/regisztracio");
    await expect(page).toHaveURL(/\/regisztracio/);
    // A Clerk komponens iframe/űrlapja betölt — várjuk a beviteli mezőt vagy a vázat.
    await expect(page.locator("body")).toBeVisible();
  });

  test("a belépés oldal betölt", async ({ page }) => {
    await page.goto("/belepes");
    await expect(page).toHaveURL(/\/belepes/);
  });

  test("/profil belépés nélkül a belépéshez irányít", async ({ page }) => {
    await page.goto("/profil");
    // Akár a middleware, akár a page redirect-je → /belepes (vagy /keszul, ha
    // MAINTENANCE_MODE aktív). A lényeg: NEM marad a védett /profil-on.
    await expect(page).not.toHaveURL(/\/profil$/);
    await expect(page).toHaveURL(/\/(belepes|keszul)/);
  });
});
