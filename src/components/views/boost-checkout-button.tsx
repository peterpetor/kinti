"use client";

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
    </div>
  );
}
