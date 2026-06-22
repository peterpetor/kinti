import { useState } from "react";
import { ProductType, CountryCode } from "@/lib/payments-config";
import { loadPaddle } from "@/lib/paddle-client";

interface CheckoutOptions {
  product: ProductType;
  country?: CountryCode;
  customData?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
}

/**
 * A szerver létrehoz egy Paddle transactiont (a validált adatokkal), a kliens
 * pedig a Paddle.js overlay-ben megnyitja — a felhasználó a kinti.app-on marad.
 */
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

      const data = (await res.json()) as { transactionId?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a fizetés inicializálásakor");
      }

      if (data.transactionId) {
        const paddle = await loadPaddle();
        paddle.Checkout.open({ transactionId: data.transactionId });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ismeretlen hiba";
      setError(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading, error };
}
