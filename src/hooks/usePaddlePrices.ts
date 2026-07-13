"use client";

/**
 * usePaddlePrices — a 3 termék ÉLŐ, lokalizált (áfás) ára a Paddle-től
 * (PricePreview), a user országának Price ID-jára. Így a /pro oldalon
 * feltüntetett ár garantáltan egyezik a pénztárral (a fix „19 €" félrevezető
 * volt pl. CH-ban, ahol a checkout CHF-ben terhelhet). Hiba esetén `null`
 * — a UI ilyenkor a statikus tájékoztató árat mutatja „a végső árat a
 * pénztár mutatja" jelzéssel.
 */
import { useEffect, useState } from "react";
import { loadPaddle } from "@/lib/paddle-client";
import { getPriceId, type CountryCode, type ProductType } from "@/lib/payments-config";
import { isAndroidApp } from "@/lib/android-app";
import { getPlayPrices } from "@/lib/play-billing";

const PRODUCTS: ProductType[] = ["kinti_pro_monthly", "business_pro_monthly", "job_featured"];

export interface LivePrices {
  /** Formázott VÉGSŐ (áfás) ár termékenként, pl. "CHF 19.00" / "19,00 €". */
  total: Partial<Record<ProductType, string>>;
  currency: string | null;
}

export function usePaddlePrices(country: CountryCode): LivePrices | null {
  const [prices, setPrices] = useState<LivePrices | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Android-app (Google Play): a Paddle.js NEM töltődhet be — az árak a
        // Play Billingtől jönnek (Digital Goods API), ha elérhető.
        if (isAndroidApp()) {
          const total = await getPlayPrices(PRODUCTS);
          if (!cancelled && Object.keys(total).length > 0) {
            setPrices({ total, currency: null });
          }
          return;
        }
        const ids = PRODUCTS.map((p) => {
          try { return getPriceId(p, country); } catch { return ""; }
        });
        if (ids.every((id) => !id)) return;
        const paddle = await loadPaddle();
        if (typeof paddle.PricePreview !== "function") return;
        const res = await paddle.PricePreview({
          items: ids.filter(Boolean).map((priceId) => ({ priceId, quantity: 1 })),
          address: { countryCode: country },
        });
        const lineItems = res?.data?.details?.lineItems ?? [];
        const total: Partial<Record<ProductType, string>> = {};
        for (const li of lineItems) {
          const idx = ids.indexOf(li.price?.id ?? "");
          const t = li.formattedTotals?.total;
          if (idx >= 0 && t) total[PRODUCTS[idx]] = t;
        }
        if (!cancelled && Object.keys(total).length > 0) {
          setPrices({ total, currency: res?.data?.currencyCode ?? null });
        }
      } catch {
        /* Paddle nem elérhető / adblocker → statikus fallback a UI-ban */
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

  return prices;
}
