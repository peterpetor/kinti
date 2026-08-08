"use client";

/**
 * useProductPrice — a termék ára ÚGY, AHOGY A FELHASZNÁLÓ FIZETNI FOGJA.
 *
 * ⚠️⚠️ MIÉRT KELL, HOLOTT A `usePaddlePrices` MÁR LÉTEZIK: az csak a `/pro`
 * oldalon fut. A vásárlás-gombok és a rájuk mutató szövegek a kódban BEÉGETETT
 * „19 €" / „49 €" címkével mentek ki — Androidon a felhasználó ezt látta, majd
 * a Play pénztárában forintot (2026-08-08-i user-jelzés: „19 €" a gombon,
 * 7400 Ft a Play-ben). Ez megtévesztő, és fogyasztóvédelmileg a legérzékenyebb
 * pont.
 *
 * ⚠️ A WEBEN NINCS BAJ, és ezt szándékosan nem is bolygatjuk: a Paddle-ár
 * minden országban ugyanaz (19 € / 49 €), tehát a statikus címke ott IGAZ.
 * A hook ezért weben egyáltalán nem hálózik — csak az Android-appban kérdez.
 *
 * ⚠️ A Play a KÉSZÜLÉK Play-régiója szerint áraz, nem az app ország-választása
 * szerint: magyar Play-fiókkal forint jön akkor is, ha az app Németországra
 * van állítva. Ezért az árat MINDIG a Play-től kell kérni, nem átszámolni.
 *
 * ⚠️ Egyetlen Digital Goods-hívás fut modul-szinten megosztva, akárhány
 * komponens használja — enélkül minden gomb külön lekérdezést indítana.
 */
import { useEffect, useState } from "react";
import { isAndroidApp } from "@/lib/android-app";
import type { ProductType } from "@/lib/payments-config";

/** Havi díjas termékek — ezekhez „/ hó" utótag jár. */
const HAVI: ReadonlySet<ProductType> = new Set<ProductType>(["kinti_pro_monthly", "business_pro_monthly"]);

/**
 * A Paddle (web) ára. Ez minden országban ugyanaz, ezért statikus — és ez az
 * Android-ág tartaléka is, ha a Play-lekérdezés nem elérhető.
 * ⚠️ Ha a Paddle-ár változik, ITT kell átírni (a `price-display.test.ts` őrzi,
 * hogy a UI ne írjon máshol saját, kézzel beírt árat).
 */
export const STATIKUS_AR: Record<ProductType, string> = {
  kinti_pro_monthly: "19 €",
  business_pro_monthly: "19 €",
  job_featured: "49 €",
};

const TERMEKEK: ProductType[] = ["kinti_pro_monthly", "business_pro_monthly", "job_featured"];

let playKeres: Promise<Partial<Record<ProductType, string>>> | null = null;

function playArak(): Promise<Partial<Record<ProductType, string>>> {
  playKeres ??= import("@/lib/play-billing")
    .then((m) => m.getPlayPrices(TERMEKEK))
    .catch(() => ({}));
  return playKeres;
}

/**
 * A megjelenítendő ár, periódus-utótaggal együtt (pl. „19 € / hó", „7 400 Ft / hó").
 * Androidon a Play valódi árát adja, weben és tartalékként a statikus Paddle-árat.
 */
export function useProductPrice(product: ProductType): string {
  const [playAr, setPlayAr] = useState<string | null>(null);

  useEffect(() => {
    if (!isAndroidApp()) return;
    let cancelled = false;
    playArak().then((arak) => {
      const a = arak[product];
      if (!cancelled && a) setPlayAr(a);
    });
    return () => {
      cancelled = true;
    };
  }, [product]);

  const alap = playAr ?? STATIKUS_AR[product];
  return HAVI.has(product) ? `${alap} / hó` : alap;
}
