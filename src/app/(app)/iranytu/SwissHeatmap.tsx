"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/skeleton";
import { benchRegionName, benchCurrency } from "./region-util";

/** CH-rács (8×6) — a kantonok geográfiai elrendezése. */
const CH_GRID = [
  { c: "SH", x: 5, y: 1 }, { c: "TG", x: 6, y: 1 }, { c: "SG", x: 7, y: 1 },
  { c: "BS", x: 3, y: 2 }, { c: "BL", x: 4, y: 2 }, { c: "AG", x: 5, y: 2 }, { c: "ZH", x: 6, y: 2 }, { c: "AR", x: 7, y: 2 }, { c: "AI", x: 8, y: 2 },
  { c: "JU", x: 2, y: 3 }, { c: "SO", x: 3, y: 3 }, { c: "LU", x: 4, y: 3 }, { c: "ZG", x: 5, y: 3 }, { c: "SZ", x: 6, y: 3 }, { c: "GL", x: 7, y: 3 },
  { c: "NE", x: 1, y: 4 }, { c: "BE", x: 2, y: 4 }, { c: "OW", x: 3, y: 4 }, { c: "NW", x: 4, y: 4 }, { c: "UR", x: 5, y: 4 }, { c: "GR", x: 6, y: 4 },
  { c: "VD", x: 1, y: 5 }, { c: "FR", x: 2, y: 5 }, { c: "VS", x: 3, y: 5 }, { c: "TI", x: 4, y: 5 },
  { c: "GE", x: 1, y: 6 },
];

/** AT-rács (5×3) — a 9 Bundesland nagyjából földrajzi elrendezése (nyugat→kelet).
 *  5 oszlop, hogy a teljes szélességbe kiférjen (ne vágódjon le a jobb széle). */
const AT_GRID = [
  { c: "OOE", x: 3, y: 1 }, { c: "NOE", x: 4, y: 1 }, { c: "W", x: 5, y: 1 },
  { c: "VBG", x: 1, y: 2 }, { c: "TIR", x: 2, y: 2 }, { c: "SBG", x: 3, y: 2 }, { c: "STM", x: 4, y: 2 }, { c: "BGL", x: 5, y: 2 },
  { c: "KTN", x: 3, y: 3 },
];

/** DE-rács (6×5) — a 16 Bundesland nagyjából földrajzi elrendezése (észak→dél, nyugat→kelet). */
const DE_GRID = [
  { c: "SH", x: 3, y: 1 }, { c: "HH", x: 4, y: 1 }, { c: "MV", x: 5, y: 1 },
  { c: "HB", x: 2, y: 2 }, { c: "NI", x: 3, y: 2 }, { c: "BB", x: 5, y: 2 }, { c: "BE", x: 6, y: 2 },
  { c: "NW", x: 1, y: 3 }, { c: "HE", x: 3, y: 3 }, { c: "ST", x: 4, y: 3 }, { c: "SN", x: 5, y: 3 },
  { c: "RP", x: 1, y: 4 }, { c: "TH", x: 3, y: 4 },
  { c: "SL", x: 1, y: 5 }, { c: "BW", x: 2, y: 5 }, { c: "BY", x: 4, y: 5 },
];
// Hollandia — 12 provincia, kb. földrajzi elrendezésben (4 oszlop × 5 sor).
const NL_GRID = [
  { c: "FR", x: 2, y: 1 }, { c: "GR", x: 3, y: 1 },
  { c: "NH", x: 1, y: 2 }, { c: "FL", x: 2, y: 2 }, { c: "DR", x: 3, y: 2 }, { c: "OV", x: 4, y: 2 },
  { c: "ZH", x: 1, y: 3 }, { c: "UT", x: 2, y: 3 }, { c: "GE", x: 3, y: 3 },
  { c: "ZE", x: 1, y: 4 }, { c: "NB", x: 2, y: 4 },
  { c: "LI", x: 3, y: 5 },
];

interface HeatmapRow {
  canton_code: string;
  avg_salary: number;
  entry_count: number;
}

/** Hőszín: t∈[0,1] → hideg kék (alacsony bér) → sárga → vörös (magas bér). */
function heatColor(t: number): string {
  const c = Math.max(0, Math.min(1, t));
  const stops = [
    { p: 0, r: 37, g: 99, b: 235 },
    { p: 0.5, r: 245, g: 158, b: 11 },
    { p: 1, r: 220, g: 38, b: 38 },
  ];
  const [lo, hi] = c <= 0.5 ? [stops[0], stops[1]] : [stops[1], stops[2]];
  const f = (c - lo.p) / (hi.p - lo.p || 1);
  const r = Math.round(lo.r + (hi.r - lo.r) * f);
  const g = Math.round(lo.g + (hi.g - lo.g) * f);
  const b = Math.round(lo.b + (hi.b - lo.b) * f);
  return `rgb(${r}, ${g}, ${b})`;
}

export function SwissHeatmap({ industry, period, country = "CH" }: { industry: string; period: string; country?: string }) {
  const [data, setData] = useState<HeatmapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const isAT = country === "AT";
  const isDE = country === "DE";
  const isNL = country === "NL";
  const grid = isDE ? DE_GRID : isAT ? AT_GRID : isNL ? NL_GRID : CH_GRID;
  const cols = isDE ? 6 : isAT ? 5 : isNL ? 4 : 8;
  const rows = isDE ? 5 : isAT ? 3 : isNL ? 5 : 6;
  const cur = benchCurrency(country);
  const regionWord = isNL ? "provinciánként" : isAT || isDE ? "Bundeslandonként" : "kantononként";

  useEffect(() => {
    let active = true;
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/benchmark/heatmap?industry=${encodeURIComponent(industry)}&period=${period}&country=${country}`);
        const d = await res.json() as { heatmap?: HeatmapRow[] };
        if (active) setData(d.heatmap || []);
      } catch {
        if (active) setData([]);
      }
      if (active) setLoading(false);
    };
    fetchHeatmap();
    return () => { active = false; };
  }, [industry, period, country]);

  const vals = data.map((d) => d.avg_salary);
  const min = vals.length > 0 ? Math.min(...vals) : 0;
  const max = vals.length > 0 ? Math.max(...vals) : 0;
  const range = max - min || 1;

  const byCode = new Map(data.map((d) => [d.canton_code, d]));
  const selRow = selected ? byCode.get(selected) : undefined;
  const selName = selected ? benchRegionName(country, selected) : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <div>
          <p className="font-bold text-[15px] text-ink">
            Hőtérkép: {industry === "all" ? "Összes iparág" : industry}
          </p>
          <p className="text-[12px] text-ink-muted">Átlagbérek {regionWord} — minél vörösebb, annál magasabb</p>
        </div>
      </div>

      {loading ? (
        <div className="no-scrollbar overflow-x-auto" aria-busy="true" aria-live="polite">
          <span className="sr-only">Hőtérkép betöltése…</span>
          <div
            className={cn("grid gap-1.5", isAT || isDE ? "w-full" : "min-w-[360px]")}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
          >
            {grid.map((cell) => (
              <Skeleton
                key={cell.c}
                className="aspect-square rounded-md"
                style={{ gridColumn: cell.x, gridRow: cell.y }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="no-scrollbar overflow-x-auto">
            <div
              className={cn("grid gap-1.5", isAT || isDE ? "w-full" : "min-w-[360px]")}
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
            >
              {grid.map((cell) => {
                const row = byCode.get(cell.c);
                const hasData = !!row;
                const t = hasData ? (row!.avg_salary - min) / range : 0;
                const isSel = selected === cell.c;
                const regionName = benchRegionName(country, cell.c);
                return (
                  <button
                    type="button"
                    key={cell.c}
                    onClick={() => setSelected(isSel ? null : cell.c)}
                    onMouseEnter={() => setSelected(cell.c)}
                    title={hasData ? `${regionName}: ${row!.avg_salary.toLocaleString("hu-HU")} ${cur}/év` : `${regionName}: nincs elég adat`}
                    style={{
                      gridColumn: cell.x,
                      gridRow: cell.y,
                      backgroundColor: hasData ? heatColor(t) : undefined,
                    }}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-lg text-[12px] font-extrabold transition-transform",
                      hasData ? "text-white shadow-sm hover:scale-105" : "border border-line bg-surface-alt text-ink-faint hover:scale-105",
                      isSel && "ring-2 ring-ink/70 scale-105 relative z-10",
                    )}
                  >
                    {cell.c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-[20px] text-center text-[12.5px]">
            {selected ? (
              selRow ? (
                <span className="text-ink">
                  <strong>{selName}</strong>: {selRow.avg_salary.toLocaleString("hu-HU")} {cur}/év{" "}
                  <span className="text-ink-faint">({selRow.entry_count} adat)</span>
                </span>
              ) : (
                <span className="text-ink-faint">
                  <strong className="text-ink-muted">{selName}</strong>: nincs elég adat
                </span>
              )
            ) : (
              <span className="text-ink-faint">Koppints egy {isAT || isDE ? "tartományra" : "kantonra"} a részletekért</span>
            )}
          </div>

          {data.length > 0 ? (
            <div className="flex items-center gap-2 text-[11px] font-medium text-ink-faint">
              <span className="whitespace-nowrap">{min.toLocaleString("hu-HU")}</span>
              <div
                className="flex-1 h-2 rounded-full"
                style={{ background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})` }}
              />
              <span className="whitespace-nowrap">{max.toLocaleString("hu-HU")} {cur}</span>
            </div>
          ) : (
            <p className="text-center text-[12px] text-ink-faint">Ehhez a szűréshez még nincs elég adat a hőtérképhez.</p>
          )}
        </>
      )}
    </div>
  );
}
