"use client";

import { useState, useCallback } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { MiniTrendChart } from "./MiniTrendChart";
import { MiniHistogram } from "./MiniHistogram";

const chartErrorFallback = (
  <p className="py-4 text-center text-[12px] text-ink-muted">A grafikon most nem jeleníthető meg.</p>
);

interface SalaryExpRow { industry: string; exp_bucket: string; avg_salary: number; entry_count: number; }
interface SalaryStatsRow { industry: string; avg_salary: number; median_salary: number; min_salary: number; max_salary: number; entry_count: number; }
interface TrendRow { month: string; avg_salary: number; entry_count: number; }

const EXP_ORDER = ["0–2 év", "3–5 év", "5+ év"];
const EXP_COLORS = ["text-[#0ea5e9]", "text-primary", "text-[#8b5cf6]"];

export function SalaryCard({
  stat,
  expRows,
  canton,
}: {
  stat: SalaryStatsRow;
  expRows: SalaryExpRow[];
  canton: string;
}) {
  const [showExp, setShowExp] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [trend, setTrend] = useState<TrendRow[] | null>(null);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const [showHist, setShowHist] = useState(false);
  const [hist, setHist] = useState<{ bucket_k: number; entry_count: number }[] | null>(null);
  const [loadingHist, setLoadingHist] = useState(false);

  const pct = Math.min(100, Math.round((stat.avg_salary / 200000) * 100));

  const fetchTrend = useCallback(async () => {
    if (trend) { setShowTrend(t => !t); setShowHist(false); setShowExp(false); return; }
    setLoadingTrend(true);
    setShowTrend(true); setShowHist(false); setShowExp(false);
    try {
      const res = await fetch(`/api/benchmark/trend?industry=${encodeURIComponent(stat.industry)}&canton=${canton}`);
      const data = await res.json() as { trend?: TrendRow[] };
      setTrend(data.trend ?? []);
    } catch { setTrend([]); }
    setLoadingTrend(false);
  }, [stat.industry, canton, trend]);

  const fetchHist = useCallback(async () => {
    if (hist) { setShowHist(h => !h); setShowTrend(false); setShowExp(false); return; }
    setLoadingHist(true);
    setShowHist(true); setShowTrend(false); setShowExp(false);
    try {
      const res = await fetch(`/api/benchmark/histogram?industry=${encodeURIComponent(stat.industry)}&canton=${canton}`);
      const data = await res.json() as { histogram?: { bucket_k: number; entry_count: number }[] };
      setHist(data.histogram ?? []);
    } catch { setHist([]); }
    setLoadingHist(false);
  }, [stat.industry, canton, hist]);

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-primary/40 transition-colors">
      {/* Fejléc */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-[14px] text-ink leading-snug">{stat.industry}</p>
        <span className="shrink-0 text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
          {stat.entry_count} adat
        </span>
      </div>

      {/* Medián (kiemelt) + átlag */}
      <div>
        <p className="text-[24px] font-extrabold text-ink tracking-tight">
          {stat.median_salary.toLocaleString("hu-HU")} <span className="text-[13px] font-normal text-ink-muted">CHF/év</span>
        </p>
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-primary/70 mt-0.5">
          Medián (középérték)
        </p>
        {(() => {
          const skewed = stat.median_salary > 0 && Math.abs(stat.avg_salary - stat.median_salary) / stat.median_salary > 0.1;
          return (
            <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-ink-muted">
              <span>Átlag:</span>
              <strong className="text-ink">{stat.avg_salary.toLocaleString("hu-HU")} CHF</strong>
              {skewed && (
                <span title="Az átlag jelentősen eltér a mediántól — kiugró adat torzíthatja" className="text-[11px] text-amber-600 dark:text-amber-400">⚠ eltérés</span>
              )}
            </div>
          );
        })()}
        <div className="mt-1.5 h-2 rounded-full bg-surface-alt overflow-hidden">
          <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-ink-faint mt-1">
          <span>Min {stat.min_salary.toLocaleString("hu-HU")}</span>
          <span>Max {stat.max_salary.toLocaleString("hu-HU")}</span>
        </div>
      </div>

      {/* Akciógombok — egymás alá/rácsba rendezve, hogy a keskeny kártyán is
          teljesen olvashatók legyenek (nincs vízszintes elcsúszás / levágás).
          A gombok alatt nyílnak ki a részletek (Tapasztalat / Eloszlás / Trend). */}
      <div className="space-y-2 pt-1 mt-auto">
        {expRows.length > 0 && (
          <button
            onClick={() => { setShowExp(v => !v); setShowTrend(false); setShowHist(false); }}
            className={`w-full text-[12px] font-bold py-2 px-3 rounded-lg border transition-colors
              ${showExp ? "bg-primary/10 border-primary/30 text-primary" : "border-line text-ink-muted hover:text-ink"}`}
          >
            {showExp ? "▲" : "▼"} Tapasztalat szerint
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={fetchHist}
            className={`text-[12px] font-bold py-2 px-3 rounded-lg border transition-colors
              ${showHist ? "bg-primary/10 border-primary/30 text-primary" : "border-line text-ink-muted hover:text-ink"}`}
          >
            📊 Eloszlás
          </button>
          <button
            onClick={fetchTrend}
            className={`text-[12px] font-bold py-2 px-3 rounded-lg border transition-colors
              ${showTrend ? "bg-primary/10 border-primary/30 text-primary" : "border-line text-ink-muted hover:text-ink"}`}
          >
            📈 Trend
          </button>
        </div>
      </div>

      {/* Tapasztalat bontás */}
      {showExp && (
        <div className="space-y-1.5 pt-1 border-t border-line">
          {EXP_ORDER.map((bucket, bi) => {
            const row = expRows.find(r => r.exp_bucket === bucket);
            if (!row) return null;
            return (
              <div key={bucket} className="flex items-center justify-between text-[13px]">
                <span className={`font-semibold ${EXP_COLORS[bi]}`}>{bucket}</span>
                <div className="text-right">
                  <span className="font-bold text-ink">{row.avg_salary.toLocaleString("hu-HU")} CHF</span>
                  <span className="text-ink-faint text-[11px] ml-1.5">({row.entry_count} adat)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trend grafikon */}
      {showTrend && (
        <div className="border-t border-line pt-3">
          {loadingTrend
            ? <div className="py-4 flex justify-center"><div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" /></div>
            : <ErrorBoundary label="trend-chart" fallback={chartErrorFallback}><MiniTrendChart data={trend ?? []} /></ErrorBoundary>
          }
        </div>
      )}

      {/* Hisztogram */}
      {showHist && (
        <div className="border-t border-line pt-3">
          {loadingHist
            ? <div className="py-4 flex justify-center"><div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" /></div>
            : <ErrorBoundary label="histogram" fallback={chartErrorFallback}><MiniHistogram data={hist ?? []} /></ErrorBoundary>
          }
        </div>
      )}
    </div>
  );
}
