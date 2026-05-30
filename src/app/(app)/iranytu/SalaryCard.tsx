"use client";

import { useState, useCallback } from "react";
import { MiniTrendChart } from "./MiniTrendChart";
import { MiniHistogram } from "./MiniHistogram";

interface SalaryExpRow { industry: string; exp_bucket: string; avg_salary: number; entry_count: number; }
interface SalaryStatsRow { industry: string; avg_salary: number; min_salary: number; max_salary: number; entry_count: number; }
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
      const data: any = await res.json();
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
      const data: any = await res.json();
      setHist(data.histogram ?? []);
    } catch { setHist([]); }
    setLoadingHist(false);
  }, [stat.industry, canton, hist]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 space-y-3 hover:border-primary/40 transition-colors">
      {/* Fejléc */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-[14px] text-ink leading-snug">{stat.industry}</p>
        <span className="shrink-0 text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
          {stat.entry_count} adat
        </span>
      </div>

      {/* Átlag */}
      <div>
        <p className="text-[24px] font-extrabold text-ink tracking-tight">
          {stat.avg_salary.toLocaleString("hu-HU")} <span className="text-[13px] font-normal text-ink-muted">CHF/év</span>
        </p>
        <div className="mt-1.5 h-2 rounded-full bg-surface-alt overflow-hidden">
          <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-ink-faint mt-1">
          <span>Min {stat.min_salary.toLocaleString("hu-HU")}</span>
          <span>Max {stat.max_salary.toLocaleString("hu-HU")}</span>
        </div>
      </div>

      {/* Akciógombok */}
      <div className="flex gap-2 pt-1 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {expRows.length > 0 && (
          <button
            onClick={() => { setShowExp(v => !v); setShowTrend(false); setShowHist(false); }}
            className={`shrink-0 text-[12px] font-bold py-1.5 px-3 rounded-lg border transition-colors
              ${showExp ? "bg-primary/10 border-primary/30 text-primary" : "border-line text-ink-muted hover:text-ink"}`}
          >
            {showExp ? "▲" : "▼"} Tapasztalat
          </button>
        )}
        <button
          onClick={fetchHist}
          className={`flex-1 shrink-0 text-[12px] font-bold py-1.5 px-3 rounded-lg border transition-colors
            ${showHist ? "bg-primary/10 border-primary/30 text-primary" : "border-line text-ink-muted hover:text-ink"}`}
        >
          📊 Eloszlás
        </button>
        <button
          onClick={fetchTrend}
          className={`flex-1 shrink-0 text-[12px] font-bold py-1.5 px-3 rounded-lg border transition-colors
            ${showTrend ? "bg-primary/10 border-primary/30 text-primary" : "border-line text-ink-muted hover:text-ink"}`}
        >
          📈 Trend
        </button>
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
            : <MiniTrendChart data={trend ?? []} />
          }
        </div>
      )}

      {/* Hisztogram */}
      {showHist && (
        <div className="border-t border-line pt-3">
          {loadingHist
            ? <div className="py-4 flex justify-center"><div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" /></div>
            : <MiniHistogram data={hist ?? []} />
          }
        </div>
      )}
    </div>
  );
}
