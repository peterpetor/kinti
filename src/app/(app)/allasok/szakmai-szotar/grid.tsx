"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { getIndustryLessons } from "./data";

/** Ország → a fejléc alcím nyelvi megnevezése. */
const LANG_LABEL: Record<string, string> = {
  CH: "svájci",
  AT: "osztrák",
  DE: "német",
  NL: "holland",
};

/**
 * Ország-tudatos szótár-rács. A PRO-státusz a szerverről (prop) jön, az ország a
 * kliensről (localStorage) — hidratálás-biztos: mount előtt CH-lista (= SSR).
 */
export function SzakmaiSzotarGrid({ userIsPro }: { userIsPro: boolean }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const lessons = getIndustryLessons(country);
  const langLabel = LANG_LABEL[country] ?? "helyi";

  return (
    <>
      <header className="mb-6 flex flex-col items-center text-center">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">
          Szakmai Szótár 👷‍♂️🍽️
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Pörgesd végig ezeket a rövid gyorstalpalókat, mielőtt hétfőn kezdenél az új
          {" "}{langLabel} munkahelyeden! Tipikus szituációk és szakszavak, kiejtéssel.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {lessons.map((lesson) => {
          const requiresPro = !!lesson.isPro && !userIsPro;
          const href = requiresPro ? "/allasok/pro" : `/allasok/szakmai-szotar/${lesson.id}`;

          return (
            <Link
              key={lesson.id}
              href={href}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-surface p-5 shadow-sm transition hover:scale-[1.02] hover:shadow-card",
                lesson.isPro ? "border-star/40 bg-gradient-to-br from-surface to-star/5" : "border-line",
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      lesson.isPro ? "bg-star/20 text-star" : "bg-primary/10 text-primary",
                    )}
                  >
                    {lesson.industry}
                  </span>
                  <span className={cn("text-[12px] font-bold", lesson.isPro ? "text-star" : "text-accent")}>
                    +{lesson.xpReward} XP
                  </span>
                </div>
                <h2 className="text-[16px] font-extrabold text-ink group-hover:text-primary transition-colors flex items-center gap-2">
                  {lesson.title} {requiresPro && <span className="text-[14px]">🔒</span>}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                  {lesson.description}
                </p>
              </div>

              <div
                className={cn(
                  "mt-4 flex items-center gap-1.5 text-[12px] font-bold",
                  requiresPro ? "text-star" : "text-primary",
                )}
              >
                {requiresPro ? (
                  <>Prémium Feloldása <Icon name="lock" size={14} strokeWidth={2.5} /></>
                ) : (
                  <>Lecke indítása <Icon name="arrowRight" size={14} strokeWidth={2.5} /></>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
