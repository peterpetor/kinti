"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile widget — `script` betöltés + render.
 *
 * Miért nem `next/script`?  A Turnstile script bekérése egyszer-elég, és csak
 * akkor, ha a felhasználó a hirdetésfeladó űrlapra ér — itt explicit IIFE-szerű
 * useEffectben kérjük le. A widget `data-callback`-jén kapjuk meg a tokent,
 * amit a szülő formnak átadunk az `onToken` propon át.
 *
 * GDPR: a Turnstile a Google reCAPTCHA-val ellentétben NEM küld PII-t (IP-én
 * kívül semmit), nincs harmadik-fél cookie, és az EU adatközpontból megy.
 */

interface TurnstileWidgetProps {
  /** A `NEXT_PUBLIC_TURNSTILE_SITE_KEY` érték. */
  siteKey: string;
  onToken: (token: string) => void;
  /** Stílus-hangolás a szülő nézethez (méret, margó). */
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptLoading: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script betöltése sikertelen."));
    document.head.appendChild(script);
  });
  return scriptLoading;
}

export function TurnstileWidget({ siteKey, onToken, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // `siteKey` praktikusan nem változik runtime közben; az `onToken`-t
    // szándékosan kihagyjuk, hogy ne renderelje újra a widgetet minden form-tipikus
    // state-frissítésnél.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <div ref={containerRef} className={className} />;
}
