"use client";

/**
 * Paddle.js (Billing v2) betöltése + inicializálása a kliensen — egyszer.
 * A checkout overlay-t a kinti.app-on nyitja meg (nem visz el átirányítással).
 */

interface PaddleInstance {
  Environment: { set: (env: string) => void };
  Initialize: (opts: { token?: string }) => void;
  Checkout: { open: (opts: Record<string, unknown>) => void };
  /** Lokalizált ár-előnézet (Paddle.js v2) — a /pro oldal ÉLŐ árkijelzéséhez,
   *  hogy a feltüntetett ár mindig a pénztárral egyezzen (fogyasztóvédelem). */
  PricePreview?: (req: {
    items: { priceId: string; quantity: number }[];
    address?: { countryCode?: string };
  }) => Promise<{
    data?: {
      currencyCode?: string;
      details?: {
        lineItems?: Array<{
          price?: { id?: string };
          formattedTotals?: { total?: string };
        }>;
      };
    };
  }>;
}

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

let paddlePromise: Promise<PaddleInstance> | null = null;

export function loadPaddle(): Promise<PaddleInstance> {
  if (paddlePromise) return paddlePromise;
  paddlePromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => {
      try {
        if (process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox") {
          window.Paddle!.Environment.set("sandbox");
        }
        window.Paddle!.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
        resolve(window.Paddle!);
      } catch (e) {
        reject(e);
      }
    };
    s.onerror = () => reject(new Error("Paddle.js load failed"));
    document.head.appendChild(s);
  });
  return paddlePromise;
}
