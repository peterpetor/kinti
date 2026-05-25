"use client";

import { useEffect, useState } from "react";

/**
 * Service Worker regisztrálás + frissítés-figyelő.
 *
 *   • Csak production buildben fut (dev alatt a Next HMR-jét megzavarná).
 *   • Ha új SW-t észlel (`updatefound` → `installed` állapot), megjelenít
 *     egy diszkrét Liquid Glass értesítést: „Új verzió érhető el — Frissítés”.
 *     A felhasználó vezérli, ne legyen meglepetés-reload.
 *   • Üzenetet küld a SW-nek (`SKIP_WAITING`), majd a `controllerchange`
 *     eseményre újratölti az oldalt.
 *
 * A SW bejegyzése `/sw.js` — public/-ból a Cloudflare Pages közvetlenül szolgálja ki.
 */
export function SWRegister() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let cancelled = false;

    const handleControllerChange = () => {
      // Az új SW átvette az irányítást → friss kód, friss oldal.
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        if (cancelled) return;

        // 1) Ha most rögtön van „waiting” SW — már települt új verzió.
        if (reg.waiting && navigator.serviceWorker.controller) {
          setWaitingSW(reg.waiting);
        }

        // 2) Frissítések figyelése.
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingSW(next);
            }
          });
        });

        // Óránkénti enyhe update-ellenőrzés a háttérben.
        const interval = window.setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
        return () => window.clearInterval(interval);
      })
      .catch((err) => {
        console.warn("[SW] regisztráció sikertelen:", err);
      });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  if (!waitingSW || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 mx-auto max-w-md"
    >
      <div className="glass flex items-center gap-3 rounded-pill px-4 py-2.5 shadow-pop">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-primary">
          {/* mini "arrow-rotate" — inline SVG, hogy ne kelljen új Icon név */}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 15.5-6.3" />
            <path d="M21 4v5h-5" />
          </svg>
        </span>
        <span className="flex-1 text-[12.5px] font-semibold text-ink">
          Új verzió érhető el.
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-full px-2.5 py-1 text-[12px] font-bold text-ink-muted"
        >
          Később
        </button>
        <button
          type="button"
          onClick={() => waitingSW.postMessage({ type: "SKIP_WAITING" })}
          className="rounded-full bg-primary px-3 py-1 text-[12px] font-bold text-white"
        >
          Frissítés
        </button>
      </div>
    </div>
  );
}
