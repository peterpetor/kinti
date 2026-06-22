// src/lib/payments-config.ts
//
// A Paddle (Billing) Price ID-k konfigurációja. Országonként bővíthető (most
// csak CH aktív). Az értékek NEXT_PUBLIC env-ből jönnek (a Price ID nem titok).

export type ProductType = "kinti_pro_monthly" | "business_pro_monthly" | "job_featured";
export type CountryCode = "CH" | "AT" | "DE" | "HU"; // Bővíthető

/** Termék → ország → Paddle Price ID (`pri_...`). */
export const PADDLE_PRICES: Record<ProductType, Partial<Record<CountryCode, string>>> = {
  kinti_pro_monthly: {
    CH: process.env.NEXT_PUBLIC_PADDLE_PRICE_KINTI_PRO || "",
  },
  business_pro_monthly: {
    CH: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_PRO || "",
  },
  job_featured: {
    CH: process.env.NEXT_PUBLIC_PADDLE_PRICE_JOB || "",
  },
};

/**
 * A megfelelő Paddle Price ID a termékhez és országhoz. Ha nincs beállítva
 * (üres env), hibát dob.
 */
export function getPriceId(product: ProductType, country: CountryCode = "CH"): string {
  const priceId = PADDLE_PRICES[product]?.[country];
  if (!priceId) {
    throw new Error(`Nincs beállítva Paddle Price ID a következőhöz: ${product} (${country})`);
  }
  return priceId;
}

/** A webhookban használt belső jogosultság-típus. */
export type EntitlementType = "user_pro" | "business_pro" | "job_featured";

/** Termék → belső jogosultság-típus (a webhook ez alapján aktivál). */
export const PRODUCT_ENTITLEMENT: Record<ProductType, EntitlementType> = {
  kinti_pro_monthly: "user_pro",
  business_pro_monthly: "business_pro",
  job_featured: "job_featured",
};

/**
 * A FIZETETT Price ID-ból vezeti le a jogosultság-típust — a webhook EZT
 * használja a custom_data helyett, hogy ne lehessen olcsó terméket fizetve
 * drága jogosultságot aktiválni. Ismeretlen Price ID → null.
 */
export function entitlementFromPriceId(
  priceId: string | null | undefined,
): EntitlementType | null {
  if (!priceId) return null;
  for (const product of Object.keys(PADDLE_PRICES) as ProductType[]) {
    const byCountry = PADDLE_PRICES[product];
    for (const v of Object.values(byCountry)) {
      if (v && v === priceId) return PRODUCT_ENTITLEMENT[product];
    }
  }
  return null;
}
