"use client";

import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { getHousingSources } from "@/lib/housing-sources";

/**
 * „Hol keress még albérletet?" — ország-tudatos link-out a fő bérlési
 * portálokra (a job-sources-section mintája). Csak KILINKEL (új lap,
 * nofollow) — idegen hirdetést nem tárolunk és nem jelenítünk meg (ld. a
 * lib/housing-sources jogi keretét) — így a börze sosem „üres": a közösségi
 * hirdetések fölött mindig ott a teljes piaci kínálat.
 */
export function HousingSourcesSection() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const data = getHousingSources(country);
  const countryName = getCountry(country)?.name ?? country;

  if (!data) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <header className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon name="key" size={17} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
            Hol keress még albérletet?
          </h2>
          <p className="text-[12px] text-ink-muted">A fő bérlési portálok · {countryName}</p>
        </div>
      </header>

      <ul className="mt-3 space-y-1.5">
        {data.sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group flex items-start gap-2.5 rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 transition active:scale-[0.99] hover:bg-surface"
            >
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-ink">{s.name}</span>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{s.note}</p>
              </div>
              <span className="mt-0.5 shrink-0 text-ink-faint transition group-hover:text-primary" aria-hidden>
                <Icon name="arrowRight" size={15} strokeWidth={2.4} className="-rotate-45" />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 rounded-[10px] border border-accent/25 bg-accent/5 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
        💡 {data.tip}
      </p>

      <p className="mt-2 px-1 text-[10.5px] leading-snug text-ink-faint">
        Külső, független oldalak — tartalmukért nem felelünk. Ha ott találtál kiadó
        szobát, a szerződés előtt itt is érvényesek a kaució-csalás elleni tippjeink.
      </p>
    </section>
  );
}
