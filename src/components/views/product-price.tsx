"use client";

/**
 * ProductPrice — a termék ára szövegközben, kliens-oldalon feloldva.
 *
 * ⚠️ MIÉRT KOMPONENS ÉS NEM CSAK A HOOK: az árat SZERVER-komponensben renderelt
 * szövegbe is be kell tudni tenni (pl. a hirdetés-feladó tájékoztatója), ahol
 * hook nem használható. Ez a pár soros kliens-sziget megoldja.
 *
 * Az ár Androidon a Google Play valódi, lokalizált összege, weben a statikus
 * Paddle-ár — ld. `useProductPrice`.
 */
import { useProductPrice } from "@/hooks/useProductPrice";
import type { ProductType } from "@/lib/payments-config";

export function ProductPrice({ product }: { product: ProductType }) {
  return <>{useProductPrice(product)}</>;
}
