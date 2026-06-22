"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  FLAT_SIZES,
  HEATING_TYPES,
  regionsFor,
  calculateRentCost,
  type FlatSize,
  type HeatingType,
  type Region,
} from "@/lib/rent-cost";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * RentCompare — két lakás egymás mellett, döntéstámogatáshoz.
 *
 * A részletes egy-lakás nézettel azonos motort (calculateRentCost) használja,
 * de kompakt, költség-fókuszú A/B összevetésre. Teljesen kliensoldali, ország-tudatos.
 */
interface FlatCfg {
  monthlyRent: number;
  size: FlatSize;
  heating: HeatingType;
  region: Region;
  aconto: number;
}

const DEFAULT_A: FlatCfg = { monthlyRent: 1800, size: "2-room", heating: "gas", region: "city-zh", aconto: 180 };
const DEFAULT_B: FlatCfg = { monthlyRent: 2050, size: "3-room", heating: "heatpump", region: "suburb", aconto: 200 };

const selectCls =
  "w-full rounded-[10px] border border-line bg-surface-alt px-2 py-1.5 text-[12px] font-semibold text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30";

function fmt(n: number, cur: string) {
  return `${Math.round(n).toLocaleString("hu-HU")} ${cur}`;
}

export function RentCompare() {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";
  const cur = isAT ? "EUR" : "CHF";
  const regionOptions = regionsFor(isAT ? "AT" : "CH");
  // Ha a mentett régió másik országé, az aktuális ország első régiójára esünk vissza.
  const coerceRegion = (r: Region): Region => (regionOptions.some((x) => x.id === r) ? r : regionOptions[0].id);

  const [a, setA] = useState<FlatCfg>(DEFAULT_A);
  const [b, setB] = useState<FlatCfg>(DEFAULT_B);
  const [years, setYears] = useState(3);

  const ra = useMemo(
    () => calculateRentCost({ monthlyRentChf: a.monthlyRent, size: a.size, heating: a.heating, region: coerceRegion(a.region), acontoNebenkostenChf: a.aconto, yearsToCalculate: years }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a, years, isAT],
  );
  const rb = useMemo(
    () => calculateRentCost({ monthlyRentChf: b.monthlyRent, size: b.size, heating: b.heating, region: coerceRegion(b.region), acontoNebenkostenChf: b.aconto, yearsToCalculate: years }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [b, years, isAT],
  );

  const totalA = ra.firstYearTotalCost;
  const totalB = rb.firstYearTotalCost;
  const cheaper: "A" | "B" | null = Math.abs(totalA - totalB) < 1 ? null : totalA < totalB ? "A" : "B";
  const annualDelta = Math.abs(totalA - totalB);

  return (
    <div className="space-y-4">
      {/* Input oszlopok */}
      <div className="grid grid-cols-2 gap-3">
        <FlatColumn tag="A" cfg={a} onChange={setA} highlight={cheaper === "A"} cur={cur} isAT={isAT} regionOptions={regionOptions} coerceRegion={coerceRegion} />
        <FlatColumn tag="B" cfg={b} onChange={setB} highlight={cheaper === "B"} cur={cur} isAT={isAT} regionOptions={regionOptions} coerceRegion={coerceRegion} />
      </div>

      {/* Évek (közös) */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Időtáv: <span className="text-ink">{years} év</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </section>

      {/* Verdikt */}
      <section
        className={cn(
          "rounded-card border-2 p-5 shadow-pop",
          cheaper ? "border-success/40 bg-success/5" : "border-line bg-surface",
        )}
      >
        {cheaper ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wide text-success">Olcsóbb választás (1. év)</p>
            <h2 className="mt-1 text-[20px] font-extrabold leading-tight text-ink">
              Lakás {cheaper} — évi {fmt(annualDelta, cur)}-fel kevesebb
            </h2>
            <p className="mt-1 text-[12px] leading-snug text-ink-muted">
              ≈ {fmt(annualDelta * years, cur)} különbség {years} év alatt (becsült teljes lakhatási költség alapján —
              a bér, akontó, opportunity és várható elszámolás összege).
            </p>
          </>
        ) : (
          <h2 className="text-[16px] font-extrabold text-ink">A két lakás nagyjából azonos költségű.</h2>
        )}
      </section>

      {/* Részletes összevetés */}
      <section className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-line bg-surface-alt/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          <span>Tétel</span>
          <span className="w-[5.5rem] text-right">Lakás A</span>
          <span className="w-[5.5rem] text-right">Lakás B</span>
        </div>
        <CmpRow label="Havi fix (bér + akontó)" a={a.monthlyRent + a.aconto} b={b.monthlyRent + b.aconto} cur={cur} />
        <CmpRow label={`Becsült ${isAT ? "BK" : "NK"} / év`} a={ra.estimatedActualNebenkostenPerYear} b={rb.estimatedActualNebenkostenPerYear} cur={cur} />
        <CmpRow label="Kaúció (lekötött pénz)" a={ra.kautionAmount} b={rb.kautionAmount} cur={cur} />
        <CmpRow label="Teljes 1. éves költség" a={totalA} b={totalB} cur={cur} strong />
        <CmpRow label={`Rejtett költség / ${years} év`} a={ra.totalHiddenCostOverPeriod} b={rb.totalHiddenCostOverPeriod} cur={cur} />
      </section>

      <p className="px-1 text-[11px] leading-snug text-ink-faint">
        A zölddel jelölt érték az olcsóbb az adott sorban. A becslés átlagos {isAT ? "" : "svájci "}adatokon alapul
        ({isAT ? "Betriebskosten" : "32 CHF/m²/év NK"}-becslés, 4% feltételezett hozam) — a tényleges költség eltérhet. Nem jogi vagy pénzügyi tanács.
      </p>
    </div>
  );
}

function FlatColumn({
  tag,
  cfg,
  onChange,
  highlight,
  cur,
  isAT,
  regionOptions,
  coerceRegion,
}: {
  tag: string;
  cfg: FlatCfg;
  onChange: (c: FlatCfg) => void;
  highlight: boolean;
  cur: string;
  isAT: boolean;
  regionOptions: { id: Region; label: string; emoji: string }[];
  coerceRegion: (r: Region) => Region;
}) {
  const set = (patch: Partial<FlatCfg>) => onChange({ ...cfg, ...patch });
  return (
    <div
      className={cn(
        "space-y-2.5 rounded-card border-2 p-3 shadow-card",
        highlight ? "border-success/45 bg-success/5" : "border-line bg-surface",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[13px] font-black text-white">
          {tag}
        </span>
        {highlight && <span className="text-[10px] font-black uppercase text-success">olcsóbb</span>}
      </div>

      <label className="block text-[10px] font-bold uppercase tracking-wide text-ink-faint">Havi bér ({cur})</label>
      <input
        type="number"
        min={0}
        max={20000}
        step={50}
        value={cfg.monthlyRent}
        onChange={(e) => set({ monthlyRent: Math.max(0, Number(e.target.value)) })}
        className="w-full rounded-[10px] border border-line bg-surface-alt px-2 py-1.5 text-right text-[14px] font-bold text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
      />

      <select value={cfg.size} onChange={(e) => set({ size: e.target.value as FlatSize })} className={selectCls}>
        {FLAT_SIZES.map((s) => (
          <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
        ))}
      </select>

      <select value={cfg.heating} onChange={(e) => set({ heating: e.target.value as HeatingType })} className={selectCls}>
        {HEATING_TYPES.map((h) => (
          <option key={h.id} value={h.id}>{h.emoji} {h.label}</option>
        ))}
      </select>

      <select value={coerceRegion(cfg.region)} onChange={(e) => set({ region: e.target.value as Region })} className={selectCls}>
        {regionOptions.map((r) => (
          <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>
        ))}
      </select>

      <label className="block text-[10px] font-bold uppercase tracking-wide text-ink-faint">Akontó {isAT ? "BK" : "NK"} ({cur}/hó)</label>
      <input
        type="number"
        min={0}
        max={2000}
        step={10}
        value={cfg.aconto}
        onChange={(e) => set({ aconto: Math.max(0, Number(e.target.value)) })}
        className="w-full rounded-[10px] border border-line bg-surface-alt px-2 py-1.5 text-right text-[14px] font-bold text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function CmpRow({ label, a, b, cur, strong }: { label: string; a: number; b: number; cur: string; strong?: boolean }) {
  const aBetter = a < b;
  const bBetter = b < a;
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-line px-4 py-2 last:border-b-0">
      <span className={cn("text-[12px] text-ink-muted", strong && "font-bold text-ink")}>{label}</span>
      <span
        className={cn(
          "w-[5.5rem] whitespace-nowrap text-right text-[12.5px] tabular-nums",
          strong ? "font-extrabold" : "font-semibold",
          aBetter ? "text-success" : "text-ink",
        )}
      >
        {fmt(a, cur)}
      </span>
      <span
        className={cn(
          "w-[5.5rem] whitespace-nowrap text-right text-[12.5px] tabular-nums",
          strong ? "font-extrabold" : "font-semibold",
          bBetter ? "text-success" : "text-ink",
        )}
      >
        {fmt(b, cur)}
      </span>
    </div>
  );
}
