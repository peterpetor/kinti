"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * OnboardingTour — első indításkor egy 3 lépéses ismertető a fő tab-ok körül.
 * localStorage-flag (`kinti.tour.done`) jelzi, hogy ne mutassuk újra.
 */
const STORAGE_KEY = "kinti.tour.done";

interface Step {
  emoji: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    emoji: "🔎",
    title: "Szaknévsor",
    body: "Találd meg a magyar fodrászt, orvost, autószerelőt — a kantonod szerint szűrve. Térképen és listában is böngészhető.",
  },
  {
    emoji: "🤝",
    title: "Piac",
    body: "Hirdetések (albérlet, állás, eladó), események és telekocsi — minden közösségi tartalom egy helyen.",
  },
  {
    emoji: "👤",
    title: "Fiókom",
    body: "Itt léphetsz be (vagy regisztrálsz) vállalkozóként a profilod kezeléséhez. Itt vannak a kedvenceid és a beállítások is.",
  },
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // kicsi késleltetés, hogy az oldal előbb beüljön (ne ugorjon a felhasználó arcába)
        const t = setTimeout(() => setOpen(true), 700);
        return () => clearTimeout(t);
      }
    } catch {
      /* sandbox / private mode → ignore */
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9997] flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Bezárás"
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative z-[1] w-full max-w-md rounded-t-[28px] sm:rounded-[28px] border border-line bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-pop animate-fade-up text-center">
        <span className="text-5xl">{s.emoji}</span>
        <h2 className="mt-3 text-[20px] font-extrabold tracking-tight text-ink">{s.title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          {s.body}
        </p>

        {/* Lépés-pontok */}
        <div className="mt-4 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-primary" : "w-1.5 bg-line",
              )}
            />
          ))}
        </div>

        {/* Vezérlők */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-pill bg-primary px-5 text-[14px] font-extrabold text-white shadow-card active:scale-[0.99]"
          >
            {isLast ? "Kezdjük!" : "Tovább"}
            <Icon name="arrowRight" size={14} strokeWidth={2.4} />
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={close}
              className="text-[12.5px] font-bold text-ink-muted active:scale-95"
            >
              Kihagyás
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
