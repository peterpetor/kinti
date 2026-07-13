"use client";

/**
 * Google Play Billing a TWA-ban (Digital Goods API + Payment Request API).
 *
 * Az Android-appban (lásd lib/android-app.ts) a Paddle helyett EZ a fizetési
 * út: a Chrome a Play Billinget a `https://play.google.com/billing` payment
 * methoddal éri el, ha a TWA-ban engedélyezve van a Play Billing delegáció
 * (twa-manifest.json: playBilling.enabled). A vásárlás után kapott
 * purchaseTokent a szerver ellenőrzi a Google Play Developer API-val
 * (/api/payments/play/verify) — a kliensnek elhinni SOHA nem szabad.
 *
 * A Play Console-ban a termék-azonosítók SZÓRÓL SZÓRA a ProductType nevek:
 *   kinti_pro_monthly (előfizetés), business_pro_monthly (előfizetés),
 *   job_featured (egyszeri, "consumable" NEM — sima managed product).
 */
import type { ProductType } from "@/lib/payments-config";

const PLAY_BILLING_METHOD = "https://play.google.com/billing";

interface DigitalGoodsItemDetails {
  itemId: string;
  title: string;
  price: { currency: string; value: string };
}

interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<DigitalGoodsItemDetails[]>;
  listPurchases(): Promise<Array<{ itemId: string; purchaseToken: string }>>;
}

declare global {
  interface Window {
    getDigitalGoodsService?: (paymentMethod: string) => Promise<DigitalGoodsService>;
  }
}

async function getService(): Promise<DigitalGoodsService | null> {
  if (typeof window === "undefined" || !window.getDigitalGoodsService) return null;
  try {
    return await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
  } catch {
    return null; // nem TWA-ból fut / nincs Play Billing delegáció
  }
}

/** Elérhető-e a Play Billing ebben a környezetben? */
export async function isPlayBillingAvailable(): Promise<boolean> {
  return (await getService()) !== null;
}

/**
 * A termékek ÉLŐ, lokalizált árai a Play-től (a /pro oldal árkijelzéséhez).
 * Hiba/nem-elérhetőség esetén üres objektum — a UI statikus árat mutat.
 */
export async function getPlayPrices(
  products: ProductType[],
): Promise<Partial<Record<ProductType, string>>> {
  const service = await getService();
  if (!service) return {};
  try {
    const details = await service.getDetails(products);
    const out: Partial<Record<ProductType, string>> = {};
    for (const d of details) {
      const formatted = new Intl.NumberFormat("hu-HU", {
        style: "currency",
        currency: d.price.currency,
      }).format(Number(d.price.value));
      out[d.itemId as ProductType] = formatted;
    }
    return out;
  } catch {
    return {};
  }
}

export interface PlayPurchaseResult {
  ok: boolean;
  error?: string;
}

/**
 * Vásárlás a Play Billingen át + szerver-oldali ellenőrzés/aktiválás.
 * A response.complete() CSAK a szerver-verify UTÁN fut — így a Play a
 * tranzakciót addig nem zárja le, amíg a jogosultság nincs aktiválva.
 */
export async function purchaseOnPlay(
  product: ProductType,
  customData: Record<string, string>,
): Promise<PlayPurchaseResult> {
  const service = await getService();
  if (!service) {
    return {
      ok: false,
      error: "A Google Play fizetés itt nem érhető el. Frissítsd az alkalmazást a Play Áruházból.",
    };
  }

  try {
    // A Play felülírja a totalt a valós árral — a shape kötelező, az érték nem számít.
    const request = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: product } }],
      { total: { label: "Összesen", amount: { currency: "EUR", value: "0" } } },
    );
    const response = await request.show();
    const purchaseToken = (response.details as { purchaseToken?: string }).purchaseToken;

    if (!purchaseToken) {
      await response.complete("fail");
      return { ok: false, error: "A Google Play nem adott vissza vásárlás-azonosítót." };
    }

    const res = await fetch("/api/payments/play/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, purchaseToken, customData }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };

    await response.complete(res.ok && data.ok ? "success" : "fail");
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "A vásárlás ellenőrzése nem sikerült." };
    }
    return { ok: true };
  } catch (err) {
    // A user bezárta a Play-lapot → AbortError; ne mutassunk hibát.
    if (err instanceof Error && err.name === "AbortError") return { ok: false };
    return { ok: false, error: "A Google Play fizetés megszakadt. Próbáld újra." };
  }
}

/**
 * „Vásárlások visszaállítása" — a Play-en élő vásárlások újra-ellenőrzése a
 * szerverrel (pl. újratelepítés után, vagy előfizetés-megújulás szinkronjához).
 */
export async function restorePlayPurchases(): Promise<number> {
  const service = await getService();
  if (!service) return 0;
  try {
    const purchases = await service.listPurchases();
    let restored = 0;
    for (const p of purchases) {
      const res = await fetch("/api/payments/play/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: p.itemId, purchaseToken: p.purchaseToken, customData: {} }),
      });
      if (res.ok) restored++;
    }
    return restored;
  } catch {
    return 0;
  }
}
