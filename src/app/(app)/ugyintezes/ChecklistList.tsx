"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/** Lapos lista-vetület egy AdminChecklist-ből (ld. page.tsx build-időbeli fv-je). */
export interface ChecklistIndexEntry {
  slug: string;
  title: string;
  emoji: string;
  summary: string;
  deadline?: string;
  stepCount: number;
}

/**
 * Ország-tudatos ügyintézési csekklista-lista. A lap statikus (force-static),
 * az ország kliensoldali → kliens-komponens. Hidratálás-biztos: mount előtt CH
 * (az SSR is azt rendereli), mount után a választott ország.
 *
 * Az `indexByCountry`-t a szülő `page.tsx` építi fel SZERVEREN — a teljes
 * `admin-checklists.ts` (lépés-szövegek, linkek, források) NEM kerül a
 * kliens-bundle-be, csak ez a lapos index.
 */
export function ChecklistList({ indexByCountry }: { indexByCountry: Record<string, ChecklistIndexEntry[]> }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  const isDE = country === "DE";
  const isNL = country === "NL";
  const checklists = indexByCountry[country] ?? indexByCountry[DEFAULT_COUNTRY];

  return (
    <>
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Milyen helyzetben vagy?
        </h2>
        <div className="grid gap-2">
          {checklists.map((c) => (
            <Link
              key={c.slug}
              href={`/ugyintezes/${c.slug}`}
              className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-2xl">
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">{c.title}</h3>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">{c.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {c.deadline && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-accent/10 px-2 py-0.5 font-bold text-accent">
                      ⏰ {c.deadline}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-0.5 font-bold text-ink-muted">
                    {c.stepCount} lépés
                  </span>
                </div>
              </div>
              <Icon name="chevR" size={14} className="mt-2 shrink-0 text-ink-muted" />
            </Link>
          ))}
        </div>
      </section>

      <LegalDisclaimer
        toolName="ügyintézés varázsló"
        variant="legal"
        notAdviceFor="jogi vagy hatósági"
        extraWarning={isAT
          ? "Az osztrák ügyintézés részletei tartományonként (Bundesland) kissé eltérhetnek és időben változnak — a csekklisták általános minták. Mindig a lakhelyed szerinti hatóságnál (Magistrat / Gemeindeamt / Finanzamt) tájékozódj."
          : isDE
          ? "A német ügyintézés részletei tartományonként (Bundesland) és városonként kissé eltérhetnek és időben változnak — a csekklisták általános minták. Mindig a lakhelyed szerinti hatóságnál (Bürgeramt / Finanzamt / Familienkasse) tájékozódj."
          : isNL
          ? "A holland ügyintézés a gemeente (önkormányzat) szerint kissé eltérhet és időben változik — a csekklisták általános minták. Mindig a lakhelyed szerinti gemeente hivatalos oldalán vagy a rijksoverheid.nl-en tájékozódj."
          : "A svájci ügyintézés kantononként és községenként ELTÉR — a csekklisták általános minták, nem a te konkrét helyzeted. Mindig a lakhelyed kantoni Migrationsamt-jánál vagy a helyi Gemeinde-nél tájékozódj."}
        officialSources={isAT ? [
          { label: "oesterreich.gv.at — Hivatalos portál", url: "https://www.oesterreich.gv.at/" },
          { label: "migration.gv.at — Migráció", url: "https://www.migration.gv.at/" },
        ] : isDE ? [
          { label: "make-it-in-germany.com — Hivatalos portál", url: "https://www.make-it-in-germany.com/" },
          { label: "ELSTER — Adóügyek", url: "https://www.elster.de/" },
        ] : isNL ? [
          { label: "rijksoverheid.nl — Hivatalos portál", url: "https://www.rijksoverheid.nl/" },
          { label: "ind.nl — Bevándorlás", url: "https://ind.nl/" },
        ] : [
          { label: "ch.ch — Hivatalos info-portál", url: "https://www.ch.ch/" },
          { label: "SEM — Migráció", url: "https://www.sem.admin.ch/" },
        ]}
      />
    </>
  );
}
