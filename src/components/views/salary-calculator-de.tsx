"use client";

import { useState } from "react";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { cn } from "@/lib/cn";
import {
  computeSalaryDE,
  salaryPercentileDE,
  DE_BUNDESLAENDER,
  type SalaryCalcInputDE,
  type Steuerklasse,
} from "@/lib/salary-calc";

const STEUERKLASSEN: { value: Steuerklasse; label: string }[] = [
  { value: 1, label: "I — egyedülálló" },
  { value: 4, label: "IV — házas, ketten kerestek" },
  { value: 3, label: "III — házas, fő kereső (Splitting)" },
  { value: 2, label: "II — egyedülálló szülő" },
];

export function SalaryCalculatorDE() {
  const [form, setForm] = useState<SalaryCalcInputDE & { land: string }>({
    gross: 3500,
    period: "month",
    steuerklasse: 1,
    kids: 0,
    churchTax: false,
    land: "BY",
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const r = computeSalaryDE(form);
  const { percentile, median } = salaryPercentileDE(r.grossMonthly, form.land);
  const fmt = (n: number) => Math.round(n).toLocaleString("de-DE") + " €";
  const inputCls = "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">💶</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Bérkalkulátor Németország</h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Nettó bér becslése: SV-járulékok (RV/AV/KV/PV) + Lohnsteuer (§32a) Steuerklasse szerint + Soli + Kirchensteuer.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
        {/* Bruttó */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">Bruttó bér</label>
          <div className="flex rounded-[12px] border border-line bg-surface-alt focus-within:ring-2 focus-within:ring-primary/30 overflow-hidden">
            <input
              type="number"
              inputMode="numeric"
              value={form.gross}
              onChange={(e) => setField("gross", Math.max(0, Number(e.target.value)))}
              className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[16px] font-bold text-ink outline-none"
            />
            <div className="flex shrink-0 border-l border-line">
              {(["month", "year"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setField("period", p)}
                  className={cn("px-3 text-[12.5px] font-bold transition", form.period === p ? "bg-primary text-white" : "text-ink-muted")}
                >
                  {p === "month" ? "/ hó" : "/ év"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Steuerklasse + gyerek */}
        <div className="grid grid-cols-2 items-end gap-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">Steuerklasse</label>
            <select value={form.steuerklasse} onChange={(e) => setField("steuerklasse", Number(e.target.value) as Steuerklasse)} className={inputCls}>
              {STEUERKLASSEN.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">Gyermek</label>
            <select value={form.kids} onChange={(e) => setField("kids", parseInt(e.target.value))} className={inputCls}>
              {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} gyermek</option>)}
            </select>
          </div>
        </div>

        {/* Bundesland (benchmark) */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">Bundesland (összehasonlításhoz)</label>
          <select value={form.land} onChange={(e) => setField("land", e.target.value)} className={inputCls}>
            {DE_BUNDESLAENDER.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        {/* Kirchensteuer */}
        <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4 py-3">
          <span className="text-[13.5px] font-semibold text-ink">Egyháztag vagyok (Kirchensteuer)</span>
          <input type="checkbox" checked={form.churchTax} onChange={(e) => setField("churchTax", e.target.checked)} className="h-5 w-5 cursor-pointer accent-primary" />
        </label>
      </div>

      {/* Eredmény */}
      <section className="space-y-3 rounded-card border-2 border-primary/20 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="text-center">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">Becsült nettó / hó</p>
          <p className="text-[34px] font-extrabold leading-none tracking-tight text-ink">{fmt(r.netMonthly)}</p>
          <p className="mt-1 text-[12px] text-ink-muted">≈ {fmt(r.netYearly)} / év · levonás {r.effectiveRate.toFixed(1)}%</p>
        </div>

        {/* Stacked bar */}
        <div className="flex h-3.5 overflow-hidden rounded-pill bg-surface-alt">
          <Seg value={r.netMonthly} total={r.grossMonthly} className="bg-primary" />
          <Seg value={r.taxMonthly + r.soliMonthly + r.churchMonthly} total={r.grossMonthly} className="bg-accent" />
          <Seg value={r.svMonthly} total={r.grossMonthly} className="bg-star" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <Legend color="bg-primary" label="Nettó" amount={fmt(r.netMonthly)} />
          <Legend color="bg-accent" label="Adó (Lohnst.+Soli+Kirche)" amount={fmt(r.taxMonthly + r.soliMonthly + r.churchMonthly)} />
          <Legend color="bg-star" label="SV-járulék" amount={fmt(r.svMonthly)} />
          <Legend color="bg-line" label="Bruttó" amount={fmt(r.grossMonthly)} />
        </div>

        {/* Részletes bontás */}
        <div className="mt-1 space-y-1 rounded-[10px] bg-surface-alt px-3 py-2.5 text-[12px]">
          <Row label="Rentenversicherung (9,3%)" value={fmt(r.rvMonthly)} />
          <Row label="Arbeitslosenvers. (1,3%)" value={fmt(r.avMonthly)} />
          <Row label="Krankenvers. (~8,55%)" value={fmt(r.kvMonthly)} />
          <Row label={`Pflegevers. (${form.kids > 0 ? "1,8%" : "2,4% gyermektelen"})`} value={fmt(r.pvMonthly)} />
          <Row label="Lohnsteuer" value={fmt(r.taxMonthly)} />
          {r.soliMonthly > 0 && <Row label="Solidaritätszuschlag" value={fmt(r.soliMonthly)} />}
          {r.churchMonthly > 0 && <Row label="Kirchensteuer (9%)" value={fmt(r.churchMonthly)} />}
        </div>
        {form.steuerklasse === 3 && (
          <p className="rounded-[10px] bg-primary/5 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
            ℹ️ A III. Steuerklasse a Splitting-előnyt mutatja (a házastárs jellemzően az V. osztályban, magasabb levonással). A háztartás együttes nettóját külön nézd.
          </p>
        )}
      </section>

      {/* Benchmark */}
      <section className="space-y-3 rounded-card border-2 border-success/20 bg-success/5 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/15 text-lg">📊</span>
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Jó ez a fizetés?</h3>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          A <strong className="text-ink">{fmt(r.grossMonthly)}</strong> havi bruttó a(z){" "}
          <strong className="text-ink">{DE_BUNDESLAENDER.find((b) => b.code === form.land)?.name}</strong> tartományi medián
          (<strong className="text-ink">{fmt(median)}</strong>) felett/alatt van — a becslés szerint a teljes munkaidős keresők
          kb. <strong className="text-ink">{percentile}%</strong>-a keres ennél kevesebbet.
        </p>
        <div className="h-2.5 overflow-hidden rounded-pill bg-surface-alt">
          <div className="h-full rounded-pill bg-success" style={{ width: `${percentile}%` }} />
        </div>
      </section>

      <LegalDisclaimer
        toolName="bérkalkulátor (DE)"
        variant="legal"
        notAdviceFor="adózási vagy pénzügyi"
        extraWarning="Az eredmények BECSLÉSEK a 2025-ös §32a EStG adótarif és SV-kulcsok alapján. A tényleges nettó függ a pontos Steuerklasse-kombinációtól (V/VI), a Krankenkasse Zusatzbeitragjától, a Kirchensteuer tartományi kulcsától (8/9%), a Freibeträgektől és az egyéni helyzettől. A pontos összeget a Lohnabrechnung tartalmazza; az éves Steuererklärunggal gyakran visszajár adó."
        officialSources={[
          { label: "BMF — Brutto-Netto-Rechner", url: "https://www.bmf-steuerrechner.de/" },
          { label: "BZSt — Steuern", url: "https://www.bzst.de/" },
        ]}
      />
    </div>
  );
}

function Seg({ value, total, className }: { value: number; total: number; className: string }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  return <div className={className} style={{ width: `${pct}%` }} />;
}

function Legend({ color, label, amount }: { color: string; label: string; amount: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color)} />
      <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-muted">{label}</span>
      <span className="text-[11.5px] font-bold text-ink">{amount}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-bold text-ink">−{value}</span>
    </div>
  );
}
