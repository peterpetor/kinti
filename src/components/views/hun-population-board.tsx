"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";

interface RegionRow {
  regionCode: string;
  regionName: string;
  regionLevel: string;
  count: number;
  year: number;
}
interface Summary {
  level: string;
  total: number;
  year: number;
  source: string;
  sourceUrl: string | null;
  top: RegionRow[];
}

/** A megjelenített szint magyar felirata — SZÁNDÉKOSAN külön a lib/regions.ts
 *  REGION_LABEL-jétől: NL-nél ott "provincia" a szűrő-szint címkéje, ITT viszont
 *  a finomabb, névvel azonosítható "település" szintet mutatjuk (ld.
 *  repo-hun-population.ts DISPLAY_LEVEL kommentje). */
const LEVEL_LABEL: Record<string, string> = {
  canton: "kanton",
  bundesland: "tartomány",
  gemeente: "település",
};

export function HunPopulationBoard() {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "Svájc";

  const [summary, setSummary] = useState<Summary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/hun-population?country=${country}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ summary: Summary | null }>) : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.summary) {
          setSummary(d.summary);
          setState("ready");
        } else {
          setState("empty");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  if (state === "loading") {
    return <div className="h-64 animate-pulse rounded-card bg-surface-alt/60" aria-hidden />;
  }

  if (state === "error") {
    return (
      <p className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12.5px] text-ink-muted">
        A statisztika most nem tölthető be — próbáld később.
      </p>
    );
  }

  if (state === "empty" || !summary) {
    return (
      <p className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted">
        {countryName}ra egyelőre nincs hivatalos statisztikánk — ezt hamarosan pótoljuk.
      </p>
    );
  }

  const levelLabel = LEVEL_LABEL[summary.level] ?? "régió";
  const maxCount = summary.top[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Hivatalos statisztika · {summary.year}
        </p>
        <p className="mt-1 text-[22px] font-extrabold tracking-tight text-ink">
          {summary.total.toLocaleString("hu-HU")} magyar
        </p>
        <p className="text-[12.5px] text-ink-muted">él hivatalos nyilvántartás szerint {countryName}ban</p>
      </div>

      <div className="space-y-1.5">
        {summary.top.map((r, i) => (
          <div key={r.regionCode} className="flex items-center gap-3 rounded-[12px] border border-line bg-surface px-3.5 py-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-extrabold text-primary">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">{r.regionName}</span>
            <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-alt">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(6, (r.count / maxCount) * 100)}%` }} />
            </div>
            <span className="w-14 shrink-0 text-right text-[12.5px] font-bold text-ink-muted">
              {r.count.toLocaleString("hu-HU")}
            </span>
          </div>
        ))}
      </div>

      <p className="flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-ink-faint">
        <Icon name="document" size={12} strokeWidth={2.2} className="mt-0.5 shrink-0" />
        <span>
          Forrás: {summary.source} ({summary.year}) — {levelLabel} szerinti hivatalos bontás.
          {summary.sourceUrl && (
            <>
              {" "}
              <a href={summary.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">
                Eredeti adat →
              </a>
            </>
          )}
        </span>
      </p>
    </div>
  );
}
