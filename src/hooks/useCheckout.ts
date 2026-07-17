import { useState } from "react";
import { ProductType, CountryCode } from "@/lib/payments-config";
import { loadPaddle } from "@/lib/paddle-client";
import { usePreferredCountry } from "@/lib/country-pref";
import { isValidCountry } from "@/lib/countries";
import { isAndroidApp } from "@/lib/android-app";
import { purchaseOnPlay } from "@/lib/play-billing";

interface CheckoutOptions {
  product: ProductType;
  country?: CountryCode;
  customData?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
  /** Email-only cégkezelő út: a /szaknevsor/kezeles/<token> oldal tokene —
   *  Clerk-bejelentkezés nélkül vásárolható vele Szaknévsor PRO (a szerver a
   *  tokenből oldja fel a céget; kizárólag business_pro-ra érvényes).
   *  Android-appban a token-os út nem él (a Play Billing fiókhoz köt) — ott
   *  a szokásos bejelentkezős út marad. */
  manageToken?: string;
}

/**
 * Webes út: a szerver létrehoz egy Paddle transactiont (a validált adatokkal),
 * a kliens pedig a Paddle.js overlay-ben megnyitja — a felhasználó a
 * kinti.app-on marad.
 *
 * ANDROID-APP (Google Play / TWA) út: a Play szabályzata szerint az appban
 * KIZÁRÓLAG a Google Play fizetési rendszere használható — a Paddle ott soha
 * nem nyílhat meg. Ilyenkor a vásárlás a Play Billingen fut
 * (lib/play-billing.ts), a purchaseTokent a szerver ellenőrzi és aktiválja.
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefCountry] = usePreferredCountry();

  const startCheckout = async (options: CheckoutOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Android-app: Google Play Billing — Paddle TILOS ebben a kontextusban.
      if (isAndroidApp()) {
        const result = await purchaseOnPlay(options.product, options.customData ?? {});
        if (result.ok) {
          // Az aktiválás szerver-oldalon megtörtént — friss státusz betöltése.
          window.location.reload();
        } else if (result.error) {
          setError(result.error);
        }
        return;
      }

      // Webes út (Paddle). A user választott országa adja a Price ID-t
      // (országonkénti ár), ha a hívó nem ad meg explicit országot.
      const country: CountryCode =
        options.country ?? (isValidCountry(prefCountry) ? (prefCountry as CountryCode) : "CH");

      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...options, country }),
      });

      const data = (await res.json()) as { transactionId?: string; error?: string };

      if (!res.ok) {
        // Nincs bejelentkezve → ne hibaüzenet legyen, hanem vigyük a belépésre,
        // és hozzuk vissza ide (minden vásárlás-gombra egységesen).
        if (res.status === 401) {
          const back = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/belepes?redirect_url=${back}`;
          return;
        }
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
