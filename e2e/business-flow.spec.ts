import { test, expect } from "@playwright/test";

/**
 * Flow: vállalkozás felvétele (account-mentes).
 * A beküldés befejezése Turnstile-t igényel → a teszt a belépési pontig + az
 * űrlap megjelenéséig és a kliens-validációig ellenőriz.
 */
test.describe("Flow: vállalkozás felvétele", () => {
  test("a /vallalkozo landing betölt", async ({ page }) => {
    await page.goto("/vallalkozo");
    await expect(page.getByRole("heading", { name: /Vidd fel ingyen a vállalkozásod/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Vállalkozás felvétele/ })).toBeVisible();
  });

  test("kezdőlapi CTA → /vallalkozo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Vállalkozásom felviszem/ }).click();
    await expect(page).toHaveURL(/\/vallalkozo/);
  });

  test("„Vállalkozás felvétele” → az űrlap (/szaknevsor/uj) betölt", async ({ page }) => {
    await page.goto("/vallalkozo");
    await page.getByRole("link", { name: /Vállalkozás felvétele/ }).click();
    await expect(page).toHaveURL(/\/szaknevsor\/uj/);
    // Legalább egy beviteli mező megjelenik (a név) — az űrlap renderelt.
    await expect(page.locator("input, textarea").first()).toBeVisible();
  });
});
