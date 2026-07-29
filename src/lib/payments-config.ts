// src/lib/payments-config.ts
//
// A Paddle (Billing) Price ID-k konfigurációja. Országonként bővíthető (most
// csak CH aktív). Az értékek NEXT_PUBLIC env-ből jönnek (a Price ID nem titok).

export type ProductType = "kinti_pro_monthly" | "business_pro_monthly" | "job_featured";
export type CountryCode = "CH" | "AT" | "DE" | "NL" | "GB" | "ES"; // Bővíthető

/**
 * Fizetési PIAC: minden app-ország, PLUSZ olyan Paddle-piac, amihez már van ár,
 * de még nincs mögötte app-ország.
 *
 * ⚠️ 2026-07-29-ig ilyen volt az ES (a Paddle-ben megvolt mind a három spanyol
 * ár, de Spanyolország még nem volt app-ország). **Ez megszűnt: az ES már valódi
 * app-ország**, tehát a két halmaz jelenleg EGYBEESIK. A típust szándékosan
 * megtartjuk külön névvel, mert a különbség bármikor visszatérhet: ha egy új
 * piacra előbb készül el a Paddle-ár, mint a tartalom, az ID-nek AKKOR IS itt a
 * helye — az `entitlementFromPriceId` ebből a táblából ismeri fel a kifizetett
 * terméket, enélkül a webhook `null` jogosultságot kapna, és a **pénz beérkezne
 * anélkül, hogy bármit aktiválnánk**.
 */
export type PriceMarket = CountryCode;

/** Termék → piac → Paddle Price ID (`pri_...`). */
// FALLBACK Price ID-k (ÉLES). A Price ID NEM titok (NEXT_PUBLIC, úgyis a
// kliens-bundle-ben van). Azért hardcode-oljuk tartaléknak, mert a
// `process.env.NEXT_PUBLIC_*` a Cloudflare edge FUNCTION-ökben (szerveroldali
// checkout-route) NEM mindig oldódik fel futásidőben → enélkül „Nincs beállítva
// Price ID" hiba. Az env felülírhatja.
//
// Forrás:
//   • CH/AT/DE/NL — 2026-06-29, Paddle API-val létrehozva (mind EUR).
//   • GB/ES       — 2026-07-28, a user hozta létre (mind EUR). A Paddle-ben a
//     `custom_data.country` az angolnál **"EN"** (nyelvkód!), nálunk viszont az
//     ország-kód **"GB"** (ld. countries.ts: „Anglia") — ez a leképezés, ne
//     lepődj meg rajta, ha a Paddle-dashboardot nézed.
const FALLBACK_PRICES: Record<ProductType, Partial<Record<PriceMarket, string>>> = {
  kinti_pro_monthly: {
    CH: "pri_01kw9ys53dvqc0tjpr17zay66t", AT: "pri_01kw9ys5act5k3fpy7v81263bx",
    DE: "pri_01kw9ys5h35jxnfqckvf0sgne1", NL: "pri_01kw9ys5qr3x6dxn2j12chrft1",
    GB: "pri_01kynhr893fy1hjz3n3e30hfm2", ES: "pri_01kynhsy9w203e3ffejnt4rxj2",
  },
  business_pro_monthly: {
    CH: "pri_01kw9ys5ys0h3gesm7pdpfz6h3", AT: "pri_01kw9ys65cps9xnyj9b74gfmy7",
    DE: "pri_01kw9ys6edn7zeyw83s4hgqn9h", NL: "pri_01kw9ys6vrxs64rxtb33vfem8q",
    GB: "pri_01kynhj3bkwqrz7dv67vsp5s04", ES: "pri_01kynhmgdp5t5exqde7m3dq4r9",
  },
  job_featured: {
    CH: "pri_01kw9ys72bmkm2vh6bkvj7qy1p", AT: "pri_01kw9ys795nbhbkc5y4d7vrpjx",
    DE: "pri_01kw9ys7ftvgb8hbb4jm9eeymf", NL: "pri_01kw9ys7qga63mtcv690vh5jaa",
    GB: "pri_01kynhakn6yvfgm65rdm9q2f8m", ES: "pri_01kynhf49nnx3hfh0tvnmb09x9",
  },
};

// FORRÁS = a hardcode-olt FALLBACK_PRICES (NEM a process.env). A `NEXT_PUBLIC_*`
// process.env a Cloudflare edge FUNCTION-ben megbízhatatlan: hol üres, hol egy
// NEM LÉTEZŐ ID-t adott vissza (`transaction_price_not_found` a checkouton). A
// Price ID-k publikusak és stabilak → a kódba égetett érték a megbízható forrás.
// Ár-összeg módosítása a Paddle dashboardon (ugyanaz az ID marad) → nincs kódváltás.
export const PADDLE_PRICES: Record<ProductType, Partial<Record<PriceMarket, string>>> = FALLBACK_PRICES;

/**
 * A megfelelő Paddle Price ID a termékhez és országhoz. Ha nincs beállítva
 * (üres env), hibát dob.
 */
/**
 * Mely országokból lehet TÉNYLEGESEN fizetni (van hozzá Paddle Price ID).
 *
 * ⚠️ 2026-07-29: **ANGLIA (GB) BEKERÜLT** — mindhárom termékhez létrejött az ár
 * a Paddle-ben. Eddig a GB valós app-ország volt (`isValidCountry("GB")` igaz),
 * de nem volt hozzá Price ID → az angliai felhasználó a GOMB MEGNYOMÁSA UTÁN
 * futott falba („Érvénytelen ország." 400). Ez most megszűnt.
 *
 * ⚠️ 2026-07-29: **SPANYOLORSZÁG (ES) IS BEKERÜLT** — a Paddle-árak már
 * korábban elkészültek, most lett mellé app-ország (`countries.ts`). Ezzel a
 * PURCHASABLE_COUNTRIES pontosan lefedi a `COUNTRIES` listát.
 *
 * Új ország bekapcsolása: Paddle-ár mindhárom termékre → `FALLBACK_PRICES` →
 * fel ebbe a halmazba.
 */
export const PURCHASABLE_COUNTRIES: readonly CountryCode[] = ["CH", "AT", "DE", "NL", "GB", "ES"];

/** Van-e élő Paddle-ár ehhez az országhoz? (UI-gate ÉS API-validáció ebből.) */
export function isPurchasableCountry(country: string | null | undefined): country is CountryCode {
  return !!country && (PURCHASABLE_COUNTRIES as readonly string[]).includes(country);
}

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
