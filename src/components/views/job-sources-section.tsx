"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { getJobSources } from "@/lib/job-sources";

/** EU-országok, ahova a Feedback Jobs közvetít (Svájc kimarad — SECO-engedély). */
const PLACEMENT_COUNTRIES = new Set(["AT", "DE", "NL"]);

/**
 * „Hol keress még állást?" — ország-tudatos, hivatalos álláskereső-források.
 *
 * Csak KILINKEL a hivatalos/fő portálokra (deep-link, új lap) — nem tárol idegen
 * hirdetést, így jogtiszta, mégis sosem üres. A választott országhoz igazodik
 * (`usePreferredCountry`, hidratálás-biztos: mount előtt CH-default = SSR-egyezés).
 */
export function JobSourcesSection() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const data = getJobSources(country);
  const countryName = getCountry(country)?.name ?? country;

  if (!data) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <header className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon name="briefcase" size={17} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
            Hol keress még állást?
          </h2>
          <p className="text-[12px] text-ink-muted">
            Hivatalos és fő portálok · {countryName}
          </p>
        </div>
      </header>

      {PLACEMENT_COUNTRIES.has(country) && (
        <div className="mt-3 rounded-card border-2 border-primary/30 bg-primary-soft/50 p-4">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl shrink-0">🤝</span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-extrabold text-ink">Profi segítség az álláskeresésben</p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                A <strong>Feedback Jobs</strong> (a Kinti üzemeltetője) ingyen segít EU-s állást találni — töltsd fel a CV-d, és felvesszük veled a kapcsolatot. A díjat a munkáltató fizeti, neked semmibe sem kerül.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/allasok/profil"
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95"
            >
              <Icon name="upload" size={14} strokeWidth={2.4} /> Töltsd fel a CV-d
            </Link>
            <a
              href="https://feedbackjobs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-bold text-primary hover:underline"
            >
              feedbackjobs.com ↗
            </a>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13.5px] font-bold text-ink">{s.name}</span>
                  {s.official && (
                    <span className="shrink-0 rounded-full bg-success/12 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-success">
                      Hivatalos
                    </span>
                  )}
                </div>
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
    </section>
  );
}
