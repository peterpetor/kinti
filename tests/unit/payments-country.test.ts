import { describe, it, expect } from "vitest";
import {
  PURCHASABLE_COUNTRIES,
  isPurchasableCountry,
  getPriceId,
  PADDLE_PRICES,
  type ProductType,
} from "@/lib/payments-config";
import { COUNTRIES } from "@/lib/countries";

const PRODUCTS: ProductType[] = ["kinti_pro_monthly", "business_pro_monthly", "job_featured"];

/**
 * ⚠️ Miért kell ez a teszt: a GB valós app-ország, ezért `isValidCountry("GB")`
 * igaz, és a `country` végigment a fizetési láncon — miközben a Paddle
 * Price ID-k közt nincs GB. Az angliai felhasználó így a VÁSÁRLÁS-GOMB
 * MEGNYOMÁSA UTÁN kapott „Érvénytelen ország." 400-at. A vásárolható országok
 * listája és a tényleges árak MEGLÉTE nem csúszhat szét.
 */
describe("fizetési ország-lefedettség", () => {
  it("minden vásárolhatónak jelölt országhoz VAN Price ID mindhárom termékre", () => {
    for (const country of PURCHASABLE_COUNTRIES) {
      for (const product of PRODUCTS) {
        expect(() => getPriceId(product, country), `${product}/${country}`).not.toThrow();
      }
    }
  });

  it("amihez NINCS Price ID, az nem lehet vásárolhatónak jelölve", () => {
    for (const c of COUNTRIES) {
      const hasAll = PRODUCTS.every((p) => Boolean(PADDLE_PRICES[p]?.[c.code as never]));
      if (!hasAll) {
        expect(
          isPurchasableCountry(c.code),
          `${c.code}: nincs teljes árazása, mégis vásárolhatónak van jelölve`,
        ).toBe(false);
      }
    }
  });

  it("ismeretlen/üres ország nem vásárolható", () => {
    expect(isPurchasableCountry(null)).toBe(false);
    expect(isPurchasableCountry(undefined)).toBe(false);
    expect(isPurchasableCountry("")).toBe(false);
    expect(isPurchasableCountry("XX")).toBe(false);
  });

  it("⚠️ Anglia (GB) VÁSÁROLHATÓ — 2026-07-29 óta van Paddle-ára", () => {
    // Korábban ez fordítva állt (nem volt GB-ár). Az angliai felhasználó a
    // vásárlás-gomb megnyomása UTÁN kapott 400-at; most mindhárom termékhez
    // van élő ár, tehát a gombnak működnie KELL.
    expect(isPurchasableCountry("GB")).toBe(true);
    for (const product of PRODUCTS) {
      expect(getPriceId(product, "GB")).toMatch(/^pri_/);
    }
  });

  it("MIND az 5 app-ország vásárolható (egy sem marad fizetés nélkül)", () => {
    for (const c of COUNTRIES) {
      expect(isPurchasableCountry(c.code), `${c.code} nem vásárolható`).toBe(true);
    }
  });

  it("⚠️ Spanyolország NEM app-ország — az ES-ár csak a webhookhoz kell", () => {
    // A Paddle-ben VAN spanyol ár (a user létrehozta), de Spanyolország nincs a
    // COUNTRIES-ban → a felhasználó nem tud spanyolt választani, a checkout
    // sosem kérne ES-t. Az ID-nek MÉGIS a PADDLE_PRICES-ban a helye: ha valaki
    // egy Paddle-oldali spanyol fizetési linken fizet, a webhooknak fel kell
    // ismernie a terméket — különben a pénz beérkezik, de nem aktiválunk semmit.
    expect(COUNTRIES.some((c) => c.code === "ES")).toBe(false);
    expect(isPurchasableCountry("ES")).toBe(false);
    for (const product of PRODUCTS) {
      expect(PADDLE_PRICES[product]?.["ES" as never], `${product}/ES`).toMatch(/^pri_/);
    }
  });
});
