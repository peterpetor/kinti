"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { setPreferredCountry } from "@/lib/country-pref";
import { szaknevsorCountry, countryMeta, ctaProfession, type Guide } from "@/lib/tudastar";

/**
 * Konverziós CTA a cikk végén → a Kinti Szaknévsor szakemberkeresőjére, az adott
 * ORSZÁG + KATEGÓRIA szerint. Valódi <Link> (SEO-barát belső link); kattintáskor
 * beállítja a preferált országot, hogy a Szaknévsor a cikk országán nyíljon.
 */
export function TudastarCta({ guide }: { guide: Guide }) {
  const country = countryMeta(guide.country);
  const profession = ctaProfession(guide); // pl. "magyar könyvelőt", vagy null
  const cat = guide.relatedSearchCategory;
  const href = cat ? `/szaknevsor?cat=${encodeURIComponent(cat)}` : "/szaknevsor";
  const what = profession ?? "magyar szakembert";
  // „magyar könyvelőt" → gomb: „Magyar könyvelőt keresek" (tárgyeset + ige, természetes CTA).
  const buttonLabel = `${what.charAt(0).toUpperCase()}${what.slice(1)} keresek`;

  return (
    <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-xl">🔍</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-extrabold leading-tight tracking-tight text-ink">
            Szakemberre van szükséged?
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-ink-muted">
            Nem akarsz egyedül bajlódni? Keress {country?.label ?? "helyi"} {what} a Kintin —
            magyarul beszélő szakemberek, egy helyen.
          </p>
        </div>
      </div>
      <Link
        href={href}
        onClick={() => {
          try {
            setPreferredCountry(szaknevsorCountry(guide.country));
          } catch {
            /* private mode → a link akkor is navigál, csak a preferált ország marad a régi */
          }
        }}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.98]"
      >
        <Icon name="search" size={16} strokeWidth={2.4} />
        {buttonLabel}
        <Icon name="arrowRight" size={15} strokeWidth={2.4} />
      </Link>
    </section>
  );
}
