"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * „Telepítés a kezdőképernyőre” UI — Liquid Glass kártya.
 *
 * Két ágat kezel:
 *
 *  1) Chromium/Edge/Samsung: a böngésző tüzeli a `beforeinstallprompt`
 *     eseményt — elnyeljük (preventDefault) és csak akkor mutatjuk a saját
 *     gombunkat, ha tényleg telepíthető. Kattintásra `prompt()` → a böngésző
 *     hozza a natív megerősítő párbeszédet.
 *
 *  2) iOS Safari: ott NINCS `beforeinstallprompt`, helyette a Share menü →
 *     „Hozzáadás a Főképernyőhöz”. Ezt egy magyar nyelvű, ikonos tipp-szöveggel
 *     mutatjuk meg, csak ha még nem fut standalone módban.
 *
 * Ha az app már telepített (display-mode: standalone | navigator.standalone),
 * vagy a felhasználó egy munkamenetben elutasította („Most nem”), nem
 * tolakszunk vissza.
 */

// A `beforeinstallprompt` típusa még nincs a lib.dom-ban; minimális saját interface.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Phase = "hidden" | "available" | "ios-hint" | "installing" | "installed" | "dismissed";

const SESSION_KEY = "kinti:install:dismissed";

export function InstallPrompt({ className }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Már telepítve / standalone módban? Akkor el is rejtjük.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari saját jelzése
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setPhase("installed");
      return;
    }

    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      setPhase("dismissed");
      return;
    }

    // 2) iOS Safari detektálás (a `beforeinstallprompt` ott nem érkezik soha).
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    if (isIOS && isSafari) {
      setPhase("ios-hint");
      // tovább nem várunk — beforeinstallprompt itt nem jön.
    }

    // 3) Chromium/Edge/Samsung — a natív promptot magunkhoz vesszük.
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setPhase("available");
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setPhase("installed");
      setDeferred(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  if (phase === "hidden" || phase === "installed" || phase === "dismissed") return null;

  async function handleInstall() {
    if (!deferred) return;
    setPhase("installing");
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setPhase("installed");
      } else {
        setPhase("dismissed");
        window.sessionStorage.setItem(SESSION_KEY, "1");
      }
    } catch {
      setPhase("available");
    } finally {
      setDeferred(null);
    }
  }

  function handleDismiss() {
    setPhase("dismissed");
    window.sessionStorage.setItem(SESSION_KEY, "1");
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card border border-line bg-surface p-4 shadow-card",
        className,
      )}
    >
      {/* dekoratív, halvány glass-shine */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-soft" />
      <div className="relative flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-primary text-white shadow-card">
          <Icon name="arrowUp" size={18} strokeWidth={2.4} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-extrabold tracking-tight text-ink">
            Tedd ki a kezdőképernyőre
          </h3>

          {phase === "ios-hint" ? (
            <p className="mt-1 text-pretty text-[12.5px] leading-relaxed text-ink-muted">
              iPhone-on a böngésző alsó sávjában a{" "}
              <span className="inline-flex translate-y-[2px] items-center justify-center rounded-md border border-line bg-surface-alt p-[3px] align-baseline">
                {/* Szándékosan az iOS-glyph: a Safari VALÓDI megosztás-gombjára mutatunk. */}
                <Icon name="shareIos" size={11} strokeWidth={2.2} className="text-primary" />
              </span>{" "}
              Megosztás → <strong className="font-bold text-ink">Hozzáadás a főképernyőhöz</strong>.
            </p>
          ) : (
            <p className="mt-1 text-pretty text-[12.5px] leading-relaxed text-ink-muted">
              Egy érintéssel teljes képernyős kinti — gyorsabb indulás, offline mód, push-előkészített.
            </p>
          )}

          <div className="mt-2.5 flex items-center gap-2">
            {phase === "available" || phase === "installing" ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={phase === "installing"}
                className={cn(
                  "glass inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[12.5px] font-bold tracking-[-0.01em] text-ink",
                  phase === "installing" && "opacity-60",
                )}
              >
                <Icon name="arrowUp" size={13} strokeWidth={2.4} className="text-primary" />
                {phase === "installing" ? "Telepítés…" : "Telepítés"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-pill px-3 py-2 text-[12px] font-semibold text-ink-muted"
            >
              {phase === "ios-hint" ? "Rendben" : "Most nem"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
