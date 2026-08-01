"use client";

/**
 * usePaddlePrices — a 3 termék ÉLŐ, lokalizált, ADÓVAL EGYÜTTES ára.
 *
 * ⚠️ MINDKÉT FIZETÉSI ÚT BRUTTÓBAN ÁRAZ — ez élesben ellenőrizve:
 *   • Paddle (web):  DE 15,97 + 3,03 =  19,00 €   (a `total` a végösszeg)
 *   • Google Play:   HU 8690 Ft, „1847 Ft adót tartalmaz" (27% belül),
 *                    a Console szerint a VAT-kötelezettség a Google-é.
 * Vagyis a feltüntetett összeg AZ, amit a vásárló fizet — nem jön rá adó.
 *
 * A hook célja, hogy a képernyőn látható ár SOHA ne térjen el a ténylegesen
 * levont összegtől: weben a Paddle PricePreview, Androidon a Play Digital
 * Goods API adja. Ha egyik sem elérhető → `null`, és a UI a statikus
 * tájékoztató árat mutatja „a pontos végösszeget a pénztár mutatja" jelzéssel.
 */
import { useEffect, useState } from "react";
import { loadPaddle } from "@/lib/paddle-client";
import { getPriceId, type CountryCode, type ProductType } from "@/lib/payments-config";
import { isAndroidApp } from "@/lib/android-app";

const PRODUCTS: ProductType[] = ["kinti_pro_monthly", "business_pro_monthly", "job_featured"];

export interface LivePrices {
  /**
   * Formázott, ADÓVAL EGYÜTTES végösszeg termékenként — pontosan az, amit a
   * pénztár levon. Pl. "19,00 €" (Paddle/web) vagy "8 690,00 Ft" (Play).
   */
  total: Partial<Record<ProductType, string>>;
  currency: string | null;
}

export function usePaddlePrices(country: CountryCode): LivePrices | null {
  const [prices, setPrices] = useState<LivePrices | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ⚠️ ANDROID: A PLAY VALÓDI ÁRÁT MUTATJUK (2026-08-02, user-jelzés).
        //
        // Korábban itt egyszerűen `return` állt, azzal az indokkal, hogy a Play a
        // KÉSZÜLÉK régiója szerint konvertál, és az EUR/CHF-et váró CH/AT/DE/NL
        // közönségnek a HUF félrevezető — ezért a UI a statikus „19 €"-t adta.
        //
        // Csakhogy ettől az app MÁST MUTATOTT, MINT AMIT LEVONT: egy magyar
        // Play-fiókkal a képernyőn „19 €" állt, a Play viszont 8690 Ft-ot
        // terhelt (≈22,3 €). Egy árnak SOHA nem szabad eltérnie a ténylegesen
        // levont összegtől — ez fogyasztóvédelmileg is a legérzékenyebb pont.
        //
        // A feltételezés amúgy is hibás volt: a célközönség külföldön élő
        // MAGYAR, akik jellemzően megtartják a magyar Play-fiókjukat.
        //
        // A `getPlayPrices` a Digital Goods API-ból a Play SAJÁT, lokalizált,
        // adóval együttes árát adja — pontosan azt, amit a pénztár is levon.
        // Ha nem elérhető (nincs Play Billing delegáció), marad a statikus ár.
        if (isAndroidApp()) {
          const { getPlayPrices } = await import("@/lib/play-billing");
          const playTotal = await getPlayPrices(PRODUCTS);
          if (!cancelled && Object.keys(playTotal).length > 0) {
            setPrices({ total: playTotal, currency: null });
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
