"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { getTodayState, type QuizState } from "@/lib/quiz-daily";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * KvizDailyCard — kompakt napi-kvíz widget a főoldalon.
 *
 * Két állapot:
 *   - még nem játszott: 'Mai kvíz · 3 kérdés · 30 mp'
 *   - már játszott: 'Mai eredmény: 3/3' + streak
 */
export function KvizDailyCard() {
  const [state, setState] = useState<QuizState | null>(null);
  const [prefCountry] = usePreferredCountry();

  useEffect(() => {
    setState(getTodayState());
  }, []);

  if (!state) return null;

  const country = prefCountry ?? DEFAULT_COUNTRY;
  // CH/AT/DE-nek van kvíz-bank — NL-ben (nincs bank) ne mutassunk kvízt.
  if (country !== "CH" && country !== "AT" && country !== "DE") return null;
  const quizLabel = country === "AT" ? "Mai Osztrák Kvíz" : country === "DE" ? "Mai Német Kvíz" : "Mai Svájci Kvíz";
  const played = !!state.today;
  const score = state.today?.score ?? 0;

  return (
    <Link
      href="/kviz"
      className="flex items-center gap-3 rounded-card border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-xl">
        🎯
      </span>
      <div className="min-w-0 flex-1">
        {played ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-extrabold tracking-tight text-ink">
                Mai kvíz: {score} / 3
              </span>
              {state.streak >= 2 && (
                <span className="text-[11px] font-bold text-accent">
                  🔥 {state.streak}
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-muted">
              {score === 3 ? "Tökéletes! 🎉" : "Nézd át a válaszokat →"}
            </p>
          </>
        ) : (
          <>
            <div className="text-[15px] font-extrabold tracking-tight text-ink">
              {quizLabel}
            </div>
            <p className="text-[11px] text-ink-muted">
              3 kérdés · 30 másodperc · új kérdések naponta
            </p>
          </>
        )}
      </div>
      <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-accent" />
    </Link>
  );
}
