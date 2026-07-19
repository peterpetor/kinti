import Link from "next/link";
import { Icon } from "@/components/ui";
import { CountryFlag } from "@/components/ui/country-flag";
import { cn } from "@/lib/cn";
import type { GuideComparison } from "@/lib/guide-comparisons";

/** Fix oszlop-sorrend a 4 országhoz (a caption/sorok ezt feltételezik). */
const COLS = [
  { key: "ch", label: "Svájc", code: "CH" },
  { key: "at", label: "Ausztria", code: "AT" },
  { key: "de", label: "Németország", code: "DE" },
  { key: "nl", label: "Hollandia", code: "NL" },
] as const;

/**
 * Egy országos összehasonlító táblázat. A 4 oszlop valódi SVG-zászlóval fejléces
 * (a zászló-emoji Windows-on törik → CountryFlag), a téma-ikon a cím elé kerül.
 * A guide-lapon a reader ORSZÁGÁNAK oszlopa kiemelve (`currentCountry`); a
 * hub-on `currentCountry={null}` → nincs kiemelés, és a link-sor mind a 4 ország
 * teljes cikkére mutat.
 */
export function ComparisonTable({
  comparison,
  currentCountry = null,
  showNote = true,
}: {
  comparison: GuideComparison;
  currentCountry?: "CH" | "AT" | "DE" | "NL" | null;
  showNote?: boolean;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-primary-soft text-primary">
          <Icon name={comparison.icon} size={15} strokeWidth={2.4} />
        </span>
        <h2 className="text-balance text-[15px] font-extrabold tracking-[-0.01em] text-ink">{comparison.caption}</h2>
      </div>
      <p className="text-[12.5px] leading-snug text-ink-muted">{comparison.intro}</p>

      <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
        <table className="w-full min-w-[580px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-line bg-surface-alt/50">
              <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Szempont</th>
              {COLS.map((c) => {
                const here = c.code === currentCountry;
                return (
                  <th key={c.key} className={cn("px-3 py-2.5 align-bottom", here && "bg-primary-soft/60")}>
                    <span className="flex items-center gap-1.5">
                      <CountryFlag code={c.code} className="h-[12px] w-[18px]" />
                      <span className={cn("font-extrabold", here ? "text-primary" : "text-ink")}>{c.label}</span>
                    </span>
                    {here && (
                      <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-primary">● itt vagy</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.label} className="border-b border-line/60 align-top last:border-0">
                <td className="px-3 py-2.5 font-bold text-ink">{row.label}</td>
                {COLS.map((c) => {
                  const here = c.code === currentCountry;
                  return (
                    <td
                      key={c.key}
                      className={cn("px-3 py-2.5 leading-snug", here ? "bg-primary-soft/40 font-semibold text-ink" : "text-ink-muted")}
                    >
                      {row[c.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teljes cikkek mini-zászlóval — a guide-lapon a másik 3 ország, a hub-on mind a 4. */}
      <div className="flex flex-wrap items-center gap-1.5 px-0.5 pt-0.5">
        <span className="text-[11px] font-semibold text-ink-muted">A teljes cikk országonként:</span>
        {COLS.filter((c) => c.code !== currentCountry).map((c) => (
          <Link
            key={c.key}
            href={`/tudasbazis/${comparison.slugs[c.key]}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] font-bold text-primary transition active:scale-95"
          >
            <CountryFlag code={c.code} className="h-[10px] w-[15px]" />
            {c.label}
          </Link>
        ))}
      </div>

      {showNote && (
        <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
          A számok tájékoztató nagyságrendek — a pontos, aktuális értékért nézd az adott ország cikkét és a hivatalos forrást.
        </p>
      )}
    </section>
  );
}
