"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { getGuides } from "@/lib/guides";
import { GuideSearch } from "@/components/guide-search";
import { OfflineGuidesButton } from "@/components/offline-guides-button";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { foldSearchText } from "@/lib/sql-fold";

/**
 * Ország-tudatos tudásbázis-lista + kereső. Hidratálás-biztos: mount előtt CH
 * (az SSR is azt rendereli), mount után a választott ország guide-jai.
 */
export function GuideList() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const guides = getGuides(country);

  const index = guides.map((g) => ({
    slug: g.slug,
    title: g.title,
    summary: g.summary,
    icon: g.icon,
    hay: foldSearchText(
      [
        g.title,
        g.summary,
        ...(g.tldr ?? []),
        ...g.sections.flatMap((s) => [s.heading, s.body?.join(" ") ?? "", s.bullets?.join(" ") ?? ""]),
      ].join(" "),
    ),
  }));

  return (
    <>
      <GuideSearch guides={index} />

      <OfflineGuidesButton paths={["/tudasbazis", ...guides.map((g) => `/tudasbazis/${g.slug}`)]} />

      <div className="grid gap-2.5">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/tudasbazis/${g.slug}`}
            className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
              <Icon name={g.icon} size={19} strokeWidth={2.3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold tracking-[-0.01em] text-ink">{g.title}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">{g.summary}</span>
            </span>
            <Icon name="chevR" size={16} strokeWidth={2.2} className="mt-1 shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>
    </>
  );
}
