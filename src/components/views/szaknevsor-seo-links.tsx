"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";

export interface SeoLinkGroup {
  country: string;
  links: { href: string; label: string }[];
}

/**
 * „Magyar szakemberek régiónként" — belső-link blokk a /magyar landing-fába,
 * CSAK az aktív ország linkjeivel (user-visszajelzés: Ausztriában nézve zavaró
 * volt a svájci/német/holland linkek keveréke). Hidratálás-biztos: mount előtt
 * a CH-default renderel (= SSR-egyezés, a crawler is kap linkeket), mount után
 * a választott ország. A teljes index a /magyar hubon él.
 */
export function SzaknevsorSeoLinks({ groups }: { groups: SeoLinkGroup[] }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const active = groups.find((g) => g.country === country) ?? groups[0];
  const countryName = getCountry(active?.country ?? DEFAULT_COUNTRY)?.name ?? "";

  if (!active || active.links.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
        Magyar szakemberek régiónként · {countryName}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {active.links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center rounded-pill border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink-muted transition hover:border-primary/40 hover:text-primary"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/magyar"
          className="inline-flex items-center gap-1 rounded-pill border border-primary/40 bg-primary/10 px-2.5 py-1 text-[12px] font-extrabold text-primary transition active:scale-[0.98]"
        >
          Minden régió és szakma
          <Icon name="chevR" size={12} strokeWidth={2.6} />
        </Link>
      </div>
    </section>
  );
}
