"use client";

import { useState, useEffect } from "react";
import { CANTONS } from "@/lib/cantons";
import { cn } from "@/lib/cn";

const GRID = [
  { c: "SH", x: 5, y: 1 }, { c: "TG", x: 6, y: 1 }, { c: "SG", x: 7, y: 1 },
  { c: "BS", x: 3, y: 2 }, { c: "BL", x: 4, y: 2 }, { c: "AG", x: 5, y: 2 }, { c: "ZH", x: 6, y: 2 }, { c: "AR", x: 7, y: 2 }, { c: "AI", x: 8, y: 2 },
  { c: "JU", x: 2, y: 3 }, { c: "SO", x: 3, y: 3 }, { c: "LU", x: 4, y: 3 }, { c: "ZG", x: 5, y: 3 }, { c: "SZ", x: 6, y: 3 }, { c: "GL", x: 7, y: 3 },
  { c: "NE", x: 1, y: 4 }, { c: "BE", x: 2, y: 4 }, { c: "OW", x: 3, y: 4 }, { c: "NW", x: 4, y: 4 }, { c: "UR", x: 5, y: 4 }, { c: "GR", x: 6, y: 4 },
  { c: "VD", x: 1, y: 5 }, { c: "FR", x: 2, y: 5 }, { c: "VS", x: 3, y: 5 }, { c: "TI", x: 4, y: 5 },
  { c: "GE", x: 1, y: 6 },
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
    { p: 0, r: 37, g: 99, b: 235 },   // #2563eb kék
    { p: 0.5, r: 245, g: 158, b: 11 }, // #f59e0b sárga/borostyán
    { p: 1, r: 220, g: 38, b: 38 },    // #dc2626 vörös
  ];
  const [lo, hi] = c <= 0.5 ? [stops[0], stops[1]] : [stops[1], stops[2]];
  const f = (c - lo.p) / (hi.p - lo.p || 1);
  const r = Math.round(lo.r + (hi.r - lo.r) * f);
  const g = Math.round(lo.g + (hi.g - lo.g) * f);
  const b = Math.round(lo.b + (hi.b - lo.b) * f);
  return `rgb(${r}, ${g}, ${b})`;
}

export function SwissHeatmap({ industry, period }: { industry: string; period: string }) {
  const [data, setData] = useState<HeatmapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/benchmark/heatmap?industry=${encodeURIComponent(industry)}&period=${period}`);
        const d = await res.json() as { heatmap?: HeatmapRow[] };
        if (active) setData(d.heatmap || []);
      } catch {
        if (active) setData([]);
      }
      if (active) setLoading(false);
    };
    fetchHeatmap();
    return () => { active = false; };
  }, [industry, period]);

  const vals = data.map((d) => d.avg_salary);
  const min = vals.length > 0 ? Math.min(...vals) : 0;
  const max = vals.length > 0 ? Math.max(...vals) : 0;
  const range = max - min || 1;

  const byCode = new Map(data.map((d) => [d.canton_code, d]));
  const selRow = selected ? byCode.get(selected) : undefined;
  const selName = selected ? (CANTONS.find((c) => c.code === selected)?.name ?? selected) : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <div>
          <p className="font-bold text-[15px] text-ink">
            Hőtérkép: {industry === "all" ? "Összes iparág" : industry}
          </p>
          <p className="text-[12px] text-ink-muted">Átlagbérek kantononként — minél vörösebb, annál magasabb</p>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Kanton-rács — minden kanton mindig látszik (adat nélkül halvány). */}
          <div className="no-scrollbar overflow-x-auto">
            <div
              className="grid gap-1.5 min-w-[360px]"
              style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gridTemplateRows: "repeat(6, 1fr)" }}
            >
              {GRID.map((cell) => {
                const row = byCode.get(cell.c);
                const hasData = !!row;
                const t = hasData ? (row!.avg_salary - min) / range : 0;
                const isSel = selected === cell.c;
                const cantonName = CANTONS.find((c) => c.code === cell.c)?.name ?? cell.c;
                return (
                  <button
                    type="button"
                    key={cell.c}
                    onClick={() => setSelected(isSel ? null : cell.c)}
                    onMouseEnter={() => setSelected(cell.c)}
                    title={hasData ? `${cantonName}: ${row!.avg_salary.toLocaleString("hu-HU")} CHF/év` : `${cantonName}: nincs elég adat`}
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

          {/* Kiválasztott/hover kanton kiírása — touch-barát, nincs levágódó tooltip. */}
          <div className="min-h-[20px] text-center text-[12.5px]">
            {selected ? (
              selRow ? (
                <span className="text-ink">
                  <strong>{selName}</strong>: {selRow.avg_salary.toLocaleString("hu-HU")} CHF/év{" "}
                  <span className="text-ink-faint">({selRow.entry_count} adat)</span>
                </span>
              ) : (
                <span className="text-ink-faint">
                  <strong className="text-ink-muted">{selName}</strong>: nincs elég adat
                </span>
              )
            ) : (
              <span className="text-ink-faint">Koppints egy kantonra a részletekért</span>
            )}
          </div>

          {/* Színskála-legenda */}
          {data.length > 0 ? (
            <div className="flex items-center gap-2 text-[11px] font-medium text-ink-faint">
              <span className="whitespace-nowrap">{min.toLocaleString("hu-HU")}</span>
              <div
                className="flex-1 h-2 rounded-full"
                style={{ background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})` }}
              />
              <span className="whitespace-nowrap">{max.toLocaleString("hu-HU")} CHF</span>
            </div>
          ) : (
            <p className="text-center text-[12px] text-ink-faint">Ehhez a szűréshez még nincs elég adat a hőtérképhez.</p>
          )}
        </>
      )}
    </div>
  );
}
