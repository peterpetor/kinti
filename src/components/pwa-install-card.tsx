"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";

const DISMISS_KEY = "kinti.pwaInstallDismissed";
const INSTALLED_KEY = "kinti.pwaInstalled";

/**
 * BeforeInstallPromptEvent — Chrome/Edge által dispatch-elt event.
 * Standard SDK-ban nincs typusa, ezért szükségünk van saját interface-re.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWAInstallCard — diszkrét „Tedd a kezdőképernyőre" promóció.
 *
 * - Chrome / Edge / Android: beforeinstallprompt event-et használ → natív telepítés
 * - iOS Safari: szöveges instrukciót mutat (Megosztás → Hozzáadás a kezdőképernyőhöz)
 * - Ha a user dismisszálta vagy már telepítette → többet nem jelenik meg
 */
export function PwaInstallCard() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Ha már installed (standalone-ban fut), vagy a user korábban elnyomta — kilépünk
    try {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (standalone) {
        window.localStorage.setItem(INSTALLED_KEY, "1");
        return;
      }
      if (window.localStorage.getItem(INSTALLED_KEY) === "1") return;
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* private mode */
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari nem támogatja a beforeinstallprompt-ot — saját detektálás
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      // Várunk pár másodpercet, hogy a user "settled" legyen
      const t = setTimeout(() => setShowIosHint(true), 4000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    // appinstalled — sikeres telepítés után rejtsük el
    const installed = () => {
      try {
        window.localStorage.setItem(INSTALLED_KEY, "1");
      } catch {
        /* private mode */
      }
      setInstallEvent(null);
    };
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode */
    }
    setInstallEvent(null);
    setShowIosHint(false);
  }

  async function nativeInstall() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") {
        try {
          window.localStorage.setItem(INSTALLED_KEY, "1");
        } catch {
          /* private mode */
        }
      }
    } catch {
      /* user megszakítja → ok */
    } finally {
      setInstallEvent(null);
    }
  }

  // Natív telepítés (Chrome / Edge / Android) — egy gomb
  if (installEvent) {
    return (
      <Card onDismiss={dismiss}>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold text-ink">
            Tedd a kezdőképernyődre!
          </p>
          <p className="text-[11.5px] leading-snug text-ink-muted">
            1 érintés, és a kinti olyan, mint egy igazi app.
          </p>
        </div>
        <button
          type="button"
          onClick={nativeInstall}
          className="shrink-0 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95"
        >
          Telepítés
        </button>
      </Card>
    );
  }

  // iOS Safari — szöveges instrukció
  if (showIosHint) {
    return (
      <Card onDismiss={dismiss}>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold text-ink">
            Tedd a kezdőképernyődre!
          </p>
          <p className="text-[11.5px] leading-snug text-ink-muted">
            iPhone-on:{" "}
            <span className="inline-flex items-center gap-0.5 align-middle">
              <span className="rounded bg-surface-alt border border-line px-1.5 py-0.5 text-[10px] font-bold">
                ⤴
              </span>
            </span>{" "}
            → „Főképernyőhöz adás"
          </p>
        </div>
      </Card>
    );
  }

  return null;
}

function Card({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div className="relative flex items-center gap-3 rounded-card border border-primary/30 bg-primary-soft/50 px-4 py-3 shadow-card">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-lg">
        📱
      </span>
      {children}
      <button
        type="button"
        aria-label="Elrejtem"
        onClick={onDismiss}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-ink-faint hover:text-ink-muted"
      >
        <Icon name="close" size={11} strokeWidth={2.4} />
      </button>
    </div>
  );
}
