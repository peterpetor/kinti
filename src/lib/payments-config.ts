// src/lib/payments-config.ts
//
// A Paddle (Billing) Price ID-k konfigurációja. Országonként bővíthető (most
// csak CH aktív). Az értékek NEXT_PUBLIC env-ből jönnek (a Price ID nem titok).

export type ProductType = "kinti_pro_monthly" | "business_pro_monthly" | "job_featured";
export type CountryCode = "CH" | "AT" | "DE" | "NL"; // Bővíthető

/** Termék → ország → Paddle Price ID (`pri_...`). */
// FALLBACK Price ID-k (ÉLES, 2026-06-29 a Paddle API-val létrehozva, mind EUR).
// A Price ID NEM titok (NEXT_PUBLIC, úgyis a kliens-bundle-ben van). Azért
// hardcode-oljuk tartaléknak, mert a `process.env.NEXT_PUBLIC_*` a Cloudflare
// edge FUNCTION-ökben (szerveroldali checkout-route) NEM mindig oldódik fel
// futásidőben → enélkül „Nincs beállítva Price ID" hiba. Az env felülírhatja.
const FALLBACK_PRICES: Record<ProductType, Record<CountryCode, string>> = {
  kinti_pro_monthly: {
    CH: "pri_01kw9ys53dvqc0tjpr17zay66t", AT: "pri_01kw9ys5act5k3fpy7v81263bx",
    DE: "pri_01kw9ys5h35jxnfqckvf0sgne1", NL: "pri_01kw9ys5qr3x6dxn2j12chrft1",
  },
  business_pro_monthly: {
    CH: "pri_01kw9ys5ys0h3gesm7pdpfz6h3", AT: "pri_01kw9ys65cps9xnyj9b74gfmy7",
    DE: "pri_01kw9ys6edn7zeyw83s4hgqn9h", NL: "pri_01kw9ys6vrxs64rxtb33vfem8q",
  },
  job_featured: {
    CH: "pri_01kw9ys72bmkm2vh6bkvj7qy1p", AT: "pri_01kw9ys795nbhbkc5y4d7vrpjx",
    DE: "pri_01kw9ys7ftvgb8hbb4jm9eeymf", NL: "pri_01kw9ys7qga63mtcv690vh5jaa",
  },
};

export const PADDLE_PRICES: Record<ProductType, Partial<Record<CountryCode, string>>> = {
  kinti_pro_monthly: {
    CH: process.env.NEXT_PUBLIC_PADDLE_PRICE_KINTI_PRO_CH || FALLBACK_PRICES.kinti_pro_monthly.CH,
    AT: process.env.NEXT_PUBLIC_PADDLE_PRICE_KINTI_PRO_AT || FALLBACK_PRICES.kinti_pro_monthly.AT,
    DE: process.env.NEXT_PUBLIC_PADDLE_PRICE_KINTI_PRO_DE || FALLBACK_PRICES.kinti_pro_monthly.DE,
    NL: process.env.NEXT_PUBLIC_PADDLE_PRICE_KINTI_PRO_NL || FALLBACK_PRICES.kinti_pro_monthly.NL,
  },
  business_pro_monthly: {
    CH: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_PRO_CH || FALLBACK_PRICES.business_pro_monthly.CH,
    AT: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_PRO_AT || FALLBACK_PRICES.business_pro_monthly.AT,
    DE: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_PRO_DE || FALLBACK_PRICES.business_pro_monthly.DE,
    NL: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_PRO_NL || FALLBACK_PRICES.business_pro_monthly.NL,
  },
  job_featured: {
    CH: process.env.NEXT_PUBLIC_PADDLE_PRICE_JOB_CH || FALLBACK_PRICES.job_featured.CH,
    AT: process.env.NEXT_PUBLIC_PADDLE_PRICE_JOB_AT || FALLBACK_PRICES.job_featured.AT,
    DE: process.env.NEXT_PUBLIC_PADDLE_PRICE_JOB_DE || FALLBACK_PRICES.job_featured.DE,
    NL: process.env.NEXT_PUBLIC_PADDLE_PRICE_JOB_NL || FALLBACK_PRICES.job_featured.NL,
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
