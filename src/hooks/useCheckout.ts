import { useState } from "react";
import { ProductType, CountryCode } from "@/lib/payments-config";

interface CheckoutOptions {
  product: ProductType;
  country?: CountryCode;
  customData?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
}

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (options: CheckoutOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a fizetés inicializálásakor");
      }

      if (data.url) {
        // Átirányítás a Lemon Squeezy fizetési oldalára
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading, error };
}
