"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KintiLogo, Icon } from "@/components/ui";

const DONE_KEY = "kinti_onboarded";
const INTENT_KEY = "kinti_intent";

/**
 * Élethelyzet-alapú belépési pontok. A kezdőlap „Mit szeretnél?" rácsa
 * feladat-orientált; ez itt JOURNEY-orientált (új user gyors orientálása).
 */
const INTENTS = [
  { id: "move", emoji: "🧳", title: "Kiköltözöm Svájcba", sub: "Lépésről lépésre, határidőkkel", href: "/kikoltozes" },
  { id: "job", emoji: "💼", title: "Állást keresek", sub: "Magyar-barát svájci állások", href: "/allasok" },
  { id: "pro", emoji: "🔧", title: "Szakembert keresek", sub: "Magyar vállalkozók a környékeden", href: "/szaknevsor" },
  { id: "settle", emoji: "🌱", title: "Már kint élek", sub: "Közösség, ügyek, beilleszkedés", href: "/kozosseg" },
];

/**
 * OnboardingGate — egyszeri „Mire van szükséged?" üdvözlő a kezdőlapon.
 *
 * A CountryGate (z-120) ALATT rendereljük (z-110): első indításkor előbb az
 * ország-választó, és amint az eltűnik, ez bukkan elő. Választás → a releváns
 * modulra navigál + megjegyzi (localStorage), így legközelebb nem ugrik fel.
 */
export function OnboardingGate() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setShow(localStorage.getItem(DONE_KEY) !== "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (!mounted || !show) return null;

  const finish = (intent: string | null, href?: string) => {
    try {
      localStorage.setItem(DONE_KEY, "1");
      if (intent) localStorage.setItem(INTENT_KEY, intent);
    } catch {
      /* ignore */
    }
    setShow(false);
    if (href) router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col overflow-y-auto bg-gradient-to-b from-primary to-[#23533d] px-6 pb-10 pt-[calc(env(safe-area-inset-top)+3rem)] text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="text-center">
          <KintiLogo size={44} className="mx-auto" />
          <h1 className="mt-4 text-balance text-[26px] font-extrabold tracking-tight">
            Mire van most szükséged?
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-white/85">
            Megmutatjuk, hol kezdd — a többit bármikor felfedezheted.
          </p>
        </header>

        <div className="mt-8 grid gap-3">
          {INTENTS.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => finish(it.id, it.href)}
              className="flex items-center gap-4 rounded-2xl border border-white/25 bg-white/[0.12] px-4 py-4 text-left transition hover:bg-white/20 active:scale-[0.98]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-[26px]" aria-hidden="true">
                {it.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-extrabold tracking-tight">{it.title}</span>
                <span className="block text-[12.5px] text-white/80">{it.sub}</span>
              </span>
              <Icon name="chevR" size={18} strokeWidth={2.6} className="shrink-0 text-white/70" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => finish(null)}
          className="mx-auto mt-7 text-[13px] font-bold text-white/75 underline underline-offset-2 hover:text-white"
        >
          Csak körülnézek
        </button>
      </div>
    </div>
  );
}
