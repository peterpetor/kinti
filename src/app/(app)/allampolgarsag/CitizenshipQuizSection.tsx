"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { EinburgerungQuiz, StaatsbuergerschaftQuiz } from "@/components/views/einburgerung-quiz";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Az állampolgársági kvíz-szekció — ország-tudatos. CH: Einbürgerung-szimulátor,
 * AT: Staatsbürgerschaftstest. Mindkettő PRO-funkció (a varázsló fent ingyenes).
 */
export function CitizenshipQuizSection({ isPro }: { isPro: boolean }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  // DE: az engedély-varázsló DE-kész, de a »Leben in Deutschland« kérdésbank még
  // nincs meg — a svájci kvíz helyett inkább semmit mutatunk (nem félrevezetünk).
  if (country === "DE") return null;
  const Quiz = isAT ? StaatsbuergerschaftQuiz : EinburgerungQuiz;
  const quizName = isAT ? "Staatsbürgerschaftstest-szimulátor" : "Einbürgerung-szimulátor";

  return (
    <div className="pt-8 border-t border-line">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-bold text-ink">Készen állsz az állampolgársági vizsgára?</h2>
        <p className="text-sm text-ink-muted">
          {isAT
            ? "Teszteld le a tudásod az osztrák Staatsbürgerschaftstest témáiból: demokrácia, történelem, földrajz + a választott Bundesland kérdései."
            : "Teszteld le, hogy átmennél-e a hivatalos Einbürgerung tudásfelmérőn! Svájci történelmi és politikai kérdésekkel."}
        </p>
      </div>

      {isPro ? (
        <Quiz />
      ) : (
        <div className="rounded-card border-2 border-star/30 bg-star/5 p-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[14px] bg-star text-white">
            <Icon name="lock" size={22} strokeWidth={2.4} />
          </div>
          <p className="text-[15px] font-extrabold text-ink">A {quizName} PRO funkció</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-muted">
            A teljes állampolgársági kérdésbank a Kinti PRO előfizetéssel érhető el. Az engedély-varázsló fent ingyenes marad.
          </p>
          <Link
            href="/pro"
            className="mt-4 inline-flex items-center justify-center rounded-pill bg-star px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]"
          >
            Kinti PRO feloldása
          </Link>
        </div>
      )}
    </div>
  );
}
