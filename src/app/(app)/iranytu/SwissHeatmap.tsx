"use client";

import { useState, useEffect } from "react";
import { CANTONS } from "@/lib/cantons";

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

export function SwissHeatmap({ industry, period }: { industry: string; period: string }) {
  const [data, setData] = useState<HeatmapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

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

  const vals = data.map(d => d.avg_salary);
  const min = vals.length > 0 ? Math.min(...vals) : 0;
  const max = vals.length > 0 ? Math.max(...vals) : 0;
  const range = max - min || 1;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <div>
          <p className="font-bold text-[15px] text-ink">
            Hőtérkép: {industry === "all" ? "Összes iparág" : industry}
          </p>
          <p className="text-[12px] text-ink-muted">Svájci átlagbérek kantononként</p>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="relative pt-2 pb-6 px-2 overflow-x-auto">
          <div 
            className="grid gap-1.5 min-w-[340px]" 
            style={{ 
              gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
              gridTemplateRows: "repeat(6, 1fr)" 
            }}
          >
            {GRID.map(cell => {
              const row = data.find(d => d.canton_code === cell.c);
              const cantonInfo = CANTONS.find(c => c.code === cell.c);
              
              // Opacity based on value
              let bgStyle = { backgroundColor: "var(--surface-alt)", color: "var(--text-faint)" };
              let borderCls = "border border-line";
              
              if (row) {
                const intensity = 0.2 + (0.8 * (row.avg_salary - min) / range);
                bgStyle = { backgroundColor: `rgba(var(--primary), ${intensity})`, color: intensity > 0.5 ? "#fff" : "var(--text)" };
                borderCls = "border-transparent";
              }

              return (
                <div
                  key={cell.c}
                  onMouseEnter={() => setHovered(cell.c)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative flex items-center justify-center rounded-xl font-bold text-[13px] h-10 transition-transform cursor-crosshair hover:scale-110 hover:z-10 shadow-sm ${borderCls}`}
                  style={{ gridColumn: cell.x, gridRow: cell.y, ...bgStyle }}
                >
                  {cell.c}

                  {/* Tooltip */}
                  {hovered === cell.c && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-ink text-surface px-3 py-2 rounded-lg text-[12px] shadow-lg z-20 font-medium">
                      <p className="font-bold mb-0.5">{cantonInfo?.name}</p>
                      {row ? (
                        <>
                          <p>{row.avg_salary.toLocaleString("hu-HU")} CHF/év</p>
                          <p className="text-[10px] text-surface/60">{row.entry_count} adat</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-surface/60">Nincs elég adat</p>
                      )}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Színskála legenda */}
          {data.length > 0 && (
            <div className="absolute bottom-0 right-2 left-2 flex items-center justify-between text-[10px] font-medium text-ink-faint">
              <span>{min.toLocaleString("hu-HU")} CHF</span>
              <div className="flex-1 mx-4 h-1.5 rounded-full" style={{ background: "linear-gradient(to right, rgba(var(--primary), 0.2), rgba(var(--primary), 1))" }} />
              <span>{max.toLocaleString("hu-HU")} CHF</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
