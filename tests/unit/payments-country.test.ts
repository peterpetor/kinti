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

  it("⚠️ Anglia egyelőre NEM vásárolható (amíg nincs GBP-ár a Paddle-ben)", () => {
    // Ha ez a teszt elbukik, mert felvetted a GB-árat: vedd fel a GB-t a
    // PURCHASABLE_COUNTRIES-ba is, és fordítsd meg ezt az elvárást.
    expect(isPurchasableCountry("GB")).toBe(false);
  });
});
