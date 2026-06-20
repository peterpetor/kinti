"use client";

import Link from "next/link";
import { useCheckout } from "@/hooks/useCheckout";
import { cn } from "@/lib/cn";
import type { ProductType } from "@/lib/payments-config";

/**
 * Kontextuális „Kiemelés" / vásárlás gomb. A Lemon Squeezy checkoutot a
 * megadott `customData`-val indítja — FONTOS, hogy a business_pro / job_featured
 * termékeknél a `businessId` / `jobId` is benne legyen, különben a webhook nem
 * tudja, mit aktiváljon a fizetés után.
 */
export function BoostCheckoutButton({
  product,
  customData,
  label,
  className,
}: {
  product: ProductType;
  customData: Record<string, string>;
  label: string;
  className?: string;
}) {
  const { startCheckout, isLoading, error } = useCheckout();

  // A fogyasztói nyilatkozat tárgya termékfüggő — ne ígérjen mindig "PRO"-t,
  // a hirdetés-kiemelés pl. csak egyetlen hirdetést emel ki.
  const subjectNoun: Record<ProductType, string> = {
    kinti_pro_monthly: "a PRO előfizetés",
    business_pro_monthly: "a vállalkozói PRO csomag",
    job_featured: "a hirdetés-kiemelés",
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => startCheckout({ product, customData })}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-pill px-4 py-2 text-[13px] font-bold transition active:scale-[0.98] disabled:opacity-60",
          className,
        )}
      >
        {isLoading ? "Átirányítás…" : label}
      </button>
      {error && <p className="mt-1 text-[11.5px] font-semibold text-accent">{error}</p>}
      {/* Fogyasztói nyilatkozat: a digitális szolgáltatás azonnali teljesítése +
          a 14 napos elállási jog elvesztésének tudomásulvétele (CRD 16(m)). */}
      <p className="mt-1.5 text-[10.5px] leading-snug text-ink-faint">
        A vásárlással kéred {subjectNoun[product]} <strong>azonnali aktiválását</strong>, és tudomásul veszed, hogy a
        teljesítéssel elveszíted a 14 napos elállási jogod (
        <Link href="/aszf" target="_blank" className="underline">ÁSZF 1.1</Link>). A fizetést a
        Lemon Squeezy (Merchant of Record) bonyolítja.
      </p>
    </div>
  );
}
