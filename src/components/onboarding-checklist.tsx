"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { buildOnboardingSteps, onboardingProgress, type OnboardingStepId } from "@/lib/onboarding";
import { usePreferredCountry } from "@/lib/country-pref";
import { usePreferredCanton } from "@/lib/canton-pref";
import { getRegions, regionLabel, regionName } from "@/lib/regions";
import { FAVORITES_CHANGED_EVENT } from "@/components/ui/favorite-button";

/**
 * OnboardingChecklist — „Kezdd itt" aktivációs kártya a kezdőlapon.
 *
 * Az új felhasználót 3 valódi lépésen vezeti végig (régió → értesítések →
 * első kedvenc): ezek adják a személyre szabást és a visszatérés okát. A
 * haladás-sáv + az előre kipipált ország-lépés azonnali részsikert mutat.
 * Minden jel kliensoldali (localStorage / Notification API) — privacy-elv.
 *
 * Eltűnik: ha a felhasználó bezárja (X), vagy ha minden kész (egy egyszeri
 * ünneplő állapot után). A logika a lib/onboarding tiszta rétegében él.
 */

const DISMISS_KEY = "kinti.onboarding.dismissed";
const CELEBRATED_KEY = "kinti.onboarding.celebrated";

type PushState = "done" | "pending" | "unsupported" | "checking";

function readFavoriteCount(): number {
  try {
    const favs = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
    return Array.isArray(favs) ? favs.length : 0;
  } catch {
    return 0;
  }
}

export function OnboardingChecklist() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true); // amíg nem tudjuk, ne villanjon
  const [celebrated, setCelebrated] = useState(true);
  const [pushState, setPushState] = useState<PushState>("checking");
  const [favCount, setFavCount] = useState(0);
  const [regionOpen, setRegionOpen] = useState(false);

  const [country] = usePreferredCountry();
  const [canton, setCanton] = usePreferredCanton();

  // Kliensoldali jelek beolvasása (hydration-biztos: csak mount után).
  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
      setCelebrated(localStorage.getItem(CELEBRATED_KEY) === "1");
    } catch {
      /* private mode → maradnak a rejtő defaultok */
    }
    const readFavs = () => setFavCount(readFavoriteCount());
    readFavs();
    window.addEventListener(FAVORITES_CHANGED_EVENT, readFavs);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, readFavs);
  }, []);

  // Push-állapot felderítése (a PushOptin logikájának könnyű mása, csak olvasás).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supported =
          "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
        if (!supported) {
          if (!cancelled) setPushState("unsupported");
          return;
        }
        if (Notification.permission === "granted") {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (!cancelled) setPushState(sub ? "done" : "pending");
          return;
        }
        if (!cancelled) setPushState(Notification.permission === "denied" ? "unsupported" : "pending");
      } catch {
        if (!cancelled) setPushState("unsupported");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const steps = useMemo(
    () =>
      buildOnboardingSteps({
        country,
        canton,
        pushState: pushState === "checking" ? "pending" : pushState,
        favoriteCount: favCount,
      }),
    [country, canton, pushState, favCount],
  );
  const progress = useMemo(() => onboardingProgress(steps), [steps]);

  if (!mounted || dismissed) return null;
  if (progress.allDone && celebrated) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch { /* ignore */ }
  };

  // Minden kész → egyszeri ünneplő kártya, utána végleg eltűnik.
  if (progress.allDone) {
    const finish = () => {
      setCelebrated(true);
      try {
        localStorage.setItem(CELEBRATED_KEY, "1");
      } catch { /* ignore */ }
    };
    return (
      <section className="animate-fade-up rounded-card border border-success/30 bg-success/10 p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-success text-xl text-white kinti-pop">🎉</span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">A Kinti mostantól a tiéd!</p>
            <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
              Régió beállítva, értesítések élnek, az első kedvenced mentve. Jó kintlétet!
            </p>
          </div>
          <button
            type="button"
            onClick={finish}
            className="shrink-0 rounded-pill bg-success px-3.5 py-2 text-[12.5px] font-bold text-white active:scale-95"
          >
            Szuper!
          </button>
        </div>
      </section>
    );
  }

  const regions = getRegions(country);
  const rLabel = regionLabel(country);

  const stepMeta: Record<OnboardingStepId, { icon: string; title: string; hint: string }> = {
    country: { icon: "🌍", title: "Ország kiválasztva", hint: "Kész — innen tudjuk, mi vonatkozik rád." },
    region: {
      icon: "📍",
      title: canton ? `Régiód: ${regionName(country, canton)}` : `Válaszd ki a ${rLabel}od`,
      hint: "A Szaknévsor, az állások és a push erre szabódik.",
    },
    push: { icon: "🔔", title: "Kapcsold be az értesítéseket", hint: "Új szaki, állás vagy esemény a környékeden — szólunk." },
    favorite: { icon: "❤️", title: "Mentsd el az első kedvenced", hint: "Böngéssz a Szaknévsorban, és koppints a szívre." },
  };

  return (
    <section
      className="animate-fade-up rounded-card border border-line bg-surface p-4 shadow-card"
      aria-label="Kezdő lépések"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Kezdd itt</p>
          <h2 className="text-[15.5px] font-extrabold tracking-[-0.01em] text-ink">
            Tedd magadévá a Kintit — {progress.done}/{progress.total} kész
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Checklist elrejtése"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-alt text-ink-muted active:scale-90"
        >
          <Icon name="close" size={13} strokeWidth={2.4} />
        </button>
      </div>

      {/* Haladás-sáv */}
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-pill bg-surface-alt">
        <div
          className="h-full rounded-pill bg-primary transition-all duration-500"
          style={{ width: `${Math.max(progress.percent, 6)}%` }}
        />
      </div>

      <ul className="mt-3 space-y-1.5">
        {steps.map((step) => {
          const meta = stepMeta[step.id];
          const rowInner = (
            <>
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px]",
                  step.done ? "bg-success text-white" : "bg-surface-alt",
                )}
              >
                {step.done ? <Icon name="check" size={13} strokeWidth={3} /> : <span aria-hidden>{meta.icon}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[13px] font-bold", step.done ? "text-ink-muted line-through decoration-ink-faint" : "text-ink")}>
                  {meta.title}
                </span>
                {!step.done && <span className="block text-[11px] leading-snug text-ink-muted">{meta.hint}</span>}
              </span>
              {!step.done && step.id !== "region" && (
                <Icon name="chevR" size={14} className="shrink-0 text-ink-faint" />
              )}
            </>
          );

          // A régió-lépés HELYBEN nyit választót (nincs oldal-ugrás).
          if (step.id === "region" && !step.done) {
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setRegionOpen((o) => !o)}
                  className="flex w-full items-center gap-2.5 rounded-[12px] px-2 py-1.5 text-left transition hover:bg-surface-alt"
                  aria-expanded={regionOpen}
                >
                  {rowInner}
                  <Icon name={regionOpen ? "chevU" : "chevD"} size={14} className="shrink-0 text-ink-faint" />
                </button>
                {regionOpen && (
                  <div className="no-scrollbar -mx-1 mt-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                    {regions.map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => {
                          setCanton(r.code);
                          setRegionOpen(false);
                        }}
                        className="shrink-0 rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95 hover:border-primary/40 hover:text-primary"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          }

          const href = step.id === "push" ? "/ertesitesek" : step.id === "favorite" ? "/szaknevsor" : null;
          if (!step.done && href) {
            return (
              <li key={step.id}>
                <Link href={href} className="flex items-center gap-2.5 rounded-[12px] px-2 py-1.5 transition hover:bg-surface-alt active:scale-[0.99]">
                  {rowInner}
                </Link>
              </li>
            );
          }
          return (
            <li key={step.id} className="flex items-center gap-2.5 px-2 py-1.5">
              {rowInner}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
