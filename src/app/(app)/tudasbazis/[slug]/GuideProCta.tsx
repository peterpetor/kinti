"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { setPreferredCountry } from "@/lib/country-pref";
import type { RelatedCategory } from "@/lib/guides";

/**
 * Kapcsolódó szakemberek → a Szaknévsor kereső, a cikk kategóriái szerint.
 * Valódi belső <Link> (SEO-barát); kattintáskor a cikk ORSZÁGÁRA állítja a
 * preferált országot, hogy a Szaknévsor a helyes országon nyíljon.
 */
export function GuideProCta({ country, categories }: { country: string; categories: RelatedCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
        Kapcsolódó szakemberek
      </h2>
      <div className="grid gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/szaknevsor?cat=${encodeURIComponent(c.id)}`}
            onClick={() => {
              try {
                setPreferredCountry(country);
              } catch {
                /* private mode → a link akkor is navigál */
              }
            }}
            className="flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary-soft/40 p-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
              <Icon name="list" size={15} strokeWidth={2.3} />
            </span>
            <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">
              {c.label} a Szaknévsorban
            </span>
            <Icon name="chevR" size={14} className="shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}
