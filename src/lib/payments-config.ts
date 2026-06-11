// src/lib/payments-config.ts

/**
 * A Lemon Squeezy Variant ID-k konfigurációja.
 * Később, ha lesz osztrák (EUR) vagy német piac is,
 * itt egyszerűen hozzáadjuk a többi ország Variant ID-ját.
 */

export type ProductType = "kinti_pro_monthly" | "business_pro_monthly" | "job_featured";
export type CountryCode = "CH" | "AT" | "DE" | "HU"; // Bővíthető

// Ezeket az ID-kat a Lemon Squeezy-ből fogjuk megkapni a felhasználótól.
// Az env változókból olvassuk be, de fallbackként meg lehet adni defaultokat is.
export const LEMON_VARIANTS: Record<ProductType, Partial<Record<CountryCode, string>>> = {
  kinti_pro_monthly: {
    CH: process.env.NEXT_PUBLIC_LS_KINTI_PRO_CH || "REPLACE_WITH_CH_VARIANT",
    AT: process.env.NEXT_PUBLIC_LS_KINTI_PRO_AT || "REPLACE_WITH_AT_VARIANT",
  },
  business_pro_monthly: {
    CH: process.env.NEXT_PUBLIC_LS_BIZ_PRO_CH || "REPLACE_WITH_CH_VARIANT",
    AT: process.env.NEXT_PUBLIC_LS_BIZ_PRO_AT || "REPLACE_WITH_AT_VARIANT",
  },
  job_featured: {
    CH: process.env.NEXT_PUBLIC_LS_JOB_CH || "REPLACE_WITH_CH_VARIANT",
    AT: process.env.NEXT_PUBLIC_LS_JOB_AT || "REPLACE_WITH_AT_VARIANT",
  },
};

/**
 * Visszaadja a megfelelő Variant ID-t a termék típusához és a kért országhoz.
 * Ha az adott országnak még nincs beállítva Variant ID, hibát dob.
 */
export function getVariantId(product: ProductType, country: CountryCode = "CH"): string {
  const variantId = LEMON_VARIANTS[product]?.[country];
  if (!variantId || variantId.startsWith("REPLACE")) {
    throw new Error(`Nincs beállítva Lemon Squeezy Variant ID a következőhöz: ${product} (${country})`);
  }
  return variantId;
}
