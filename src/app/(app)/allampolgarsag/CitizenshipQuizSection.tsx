"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { EinburgerungQuiz } from "@/components/views/einburgerung-quiz";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Az állampolgársági kvíz-szekció — ország-tudatos. CH-ban a meglévő svájci
 * Einbürgerung-kvíz (PRO). AT-ben az osztrák Staatsbürgerschaftstest kérdésbank
 * külön nagy tartalom → egyelőre „hamarosan" jegyzet (a varázsló fent ingyenes).
 */
export function CitizenshipQuizSection({ isPro }: { isPro: boolean }) {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";

  return (
    <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-bold">Készen állsz az állampolgársági vizsgára?</h2>
        <p className="text-sm text-neutral-500">
          {isAT
            ? "Az osztrák Staatsbürgerschaftstest (osztrák történelem, intézmények + tartományi kérdések) szimulátora hamarosan!"
            : "Teszteld le, hogy átmennél-e a hivatalos Einbürgerung tudásfelmérőn! Svájci történelmi és politikai kérdésekkel."}
        </p>
      </div>

      {isAT ? (
        <div className="rounded-card border border-line bg-surface-alt/50 p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[14px] bg-primary/10 text-primary text-2xl">🇦🇹</div>
          <p className="text-[15px] font-extrabold text-ink">Osztrák állampolgársági teszt — hamarosan</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-muted">
            A Staatsbürgerschaftstest szimulátor (osztrák kérdésbank) készül. Az állampolgárság-varázsló fent már most segít a timeline-ban.
          </p>
        </div>
      ) : isPro ? (
        <EinburgerungQuiz />
      ) : (
        <div className="rounded-card border-2 border-[#e3a233]/30 bg-[#e3a233]/5 p-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[14px] bg-[#e3a233] text-white">
            <Icon name="lock" size={22} strokeWidth={2.4} />
          </div>
          <p className="text-[15px] font-extrabold text-ink">Az Einbürgerung-szimulátor PRO funkció</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-muted">
            A teljes állampolgársági kérdésbank a Kinti PRO előfizetéssel érhető el. Az engedély-varázsló fent ingyenes marad.
          </p>
          <Link
            href="/pro"
            className="mt-4 inline-flex items-center justify-center rounded-pill bg-[#e3a233] px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]"
          >
            Kinti PRO feloldása
          </Link>
        </div>
      )}
    </div>
  );
}
