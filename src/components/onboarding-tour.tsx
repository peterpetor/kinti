"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * OnboardingTour — első indításkor egy többszörös bemutató a fő tartalmakról.
 * localStorage-flag (`kinti.tour.done`) jelzi, hogy ne mutassuk újra.
 */
const STORAGE_KEY = "kinti.tour.done";

interface Step {
  emoji: string;
  title: string;
  body: string;
  /** Ha van, "Mutasd!" gomb a step-en, ami direkt navigál. */
  cta?: { href: string; label: string };
}

const STEPS: Step[] = [
  {
    emoji: "👋",
    title: "Üdv a kinti-n!",
    body: "A Svájcban élő magyaroknak. Nincs fiók, nincs email-kérés — egyszerűen használd. Mutatunk 4 dolgot, ami biztosan jól fog jönni.",
  },
  {
    emoji: "🔎",
    title: "Szaknévsor",
    body: "Találd meg a magyar fodrászt, orvost, autószerelőt — a kantonod szerint szűrve. Térképen és listában is böngészhető.",
    cta: { href: "/szaknevsor", label: "Mutasd!" },
  },
  {
    emoji: "🤝",
    title: "Közösség",
    body: "Események és hirdetések egy helyen — magyar bulik, albérlet, állás, eladó. A felső füleken válthatsz Események és Hirdetések közt.",
    cta: { href: "/kozosseg", label: "Mutasd!" },
  },
  {
    emoji: "🚗",
    title: "Telekocsi",
    body: "Fuvart kínálsz vagy keresel? Itt megtalálod — Zürichből Bp-re, Bernből Ausztriába. A magyar közösségen belül.",
    cta: { href: "/telekocsi", label: "Mutasd!" },
  },
  {
    emoji: "📌",
    title: "Saját posztjaim & Súgó",
    body: "Mindent amit feladsz, megtalálod a Saját posztjaim oldalon. Bárhol elakadsz — nyisd meg a Segítség oldalt!",
    cta: { href: "/segitseg", label: "Súgóhoz" },
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
          {s.cta && (
            <Link
              href={s.cta.href}
              onClick={close}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-pill border border-primary/40 bg-surface px-5 text-[13.5px] font-bold text-primary active:scale-[0.99]"
            >
              {s.cta.label} <Icon name="arrowRight" size={13} strokeWidth={2.4} />
            </Link>
          )}
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
