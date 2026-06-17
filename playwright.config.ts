import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E — a kritikus felhasználói flow-k (regisztráció → vállalkozás
 * felvétel → vélemény → profil) smoke-szintű ellenőrzése valódi böngészőben.
 *
 * FUTTATÁS:
 *   1) Helyi, bindingekkel (D1/R2/AI):   `npm run preview`  (wrangler pages dev,
 *      alapból :8788) majd külön terminálban `npm run test:e2e`.
 *      A sima `next dev` NEM elég — a D1-es oldalak elszállnak binding nélkül.
 *   2) Deploy-ra mutatva:  PLAYWRIGHT_BASE_URL=https://<preview>.pages.dev npm run test:e2e
 *
 * A böngészők egyszeri telepítése: `npx playwright install --with-deps chromium`.
 *
 * MEGJEGYZÉS: a beküldések befejezése Turnstile-t és (a profil) Clerk-belépést
 * igényel — ezeket a tesztek a flow BELÉPÉSI pontjáig + kliens-validációig
 * ellenőrzik (renderelés, navigáció, auth-gate), titkok nélkül determinisztikusan.
 * Ha MAINTENANCE_MODE=true a célkörnyezetben, minden nem-kivételezett route a
 * /keszul-re irányít → a tesztek ennek megfelelően módosítandók/kihagyandók.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8788";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    locale: "hu-HU",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
});
