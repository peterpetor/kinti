import { test, expect } from "@playwright/test";

/**
 * Smoke — a kezdőlap betölt és a fő belépési pontok navigálnak.
 * Ez fogja meg a leggyakoribb regressziókat: routing, renderelés, CTA-linkek.
 */
test.describe("Smoke: kezdőlap és fő navigáció", () => {
  test("kezdőlap betölt és mutatja a fő belépési pontokat", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mit szeretnél?")).toBeVisible();
    await expect(page.getByRole("link", { name: /Szakembert keresek/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Vállalkozásom felviszem/ })).toBeVisible();
  });

  test("„Szakembert keresek” → Szaknévsor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Szakembert keresek/ }).click();
    await expect(page).toHaveURL(/\/szaknevsor/);
    await expect(page.getByText(/Szaknévsor/i).first()).toBeVisible();
  });

  test("„Állást keresek” → Állások", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Állást keresek/ }).click();
    await expect(page).toHaveURL(/\/allasok/);
  });

  test("„Ügyintézés Svájcban” → Ügyintézés", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Ügyintézés Svájcban/ }).click();
    await expect(page).toHaveURL(/\/ugyintezes/);
  });
});
