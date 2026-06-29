"use client";

import { useState } from "react";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { cn } from "@/lib/cn";
import {
  computeSalaryNL,
  salaryPercentileNL,
  type SalaryCalcInputNL,
} from "@/lib/salary-calc";

export function SalaryCalculatorNL() {
  const [form, setForm] = useState<SalaryCalcInputNL>({
    gross: 3300,
    period: "month",
    holidayAllowance: true,
  });

  function setField<K extends keyof SalaryCalcInputNL>(k: K, v: SalaryCalcInputNL[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const r = computeSalaryNL(form);
  const { percentile, median } = salaryPercentileNL(r.grossMonthly);
  const fmt = (n: number) => Math.round(n).toLocaleString("nl-NL") + " €";
  const inputCls = "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">💶</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Bérkalkulátor Hollandia</h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Nettó bér becslése: Box 1 sávos jövedelemadó (benne a premie volksverzekeringen) − algemene heffingskorting − arbeidskorting.
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

        {/* Vakantiegeld */}
        <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4 py-3">
          <span className="min-w-0 flex-1 pr-3 text-[13.5px] font-semibold text-ink">+ 8% vakantiegeld (szabadságpénz) hozzáadása</span>
          <input type="checkbox" checked={form.holidayAllowance} onChange={(e) => setField("holidayAllowance", e.target.checked)} className="h-5 w-5 cursor-pointer accent-primary" />
        </label>
        <p className="-mt-2 text-[11px] leading-snug text-ink-faint">
          A holland havi bruttó általában NEM tartalmazza a 8% vakantiegeldet — azt jellemzően májusban fizetik ki. Ez az éves összegbe számít bele.
        </p>
      </div>

      {/* Eredmény */}
      <section className="space-y-3 rounded-card border-2 border-primary/20 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="text-center">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">Becsült nettó / hó (átlag)</p>
          <p className="text-[34px] font-extrabold leading-none tracking-tight text-ink">{fmt(r.netMonthly)}</p>
          <p className="mt-1 text-[12px] text-ink-muted">≈ {fmt(r.netYearly)} / év · levonás {r.effectiveRate.toFixed(1)}%</p>
        </div>

        {/* Stacked bar */}
        <div className="flex h-3.5 overflow-hidden rounded-pill bg-surface-alt">
          <Seg value={r.netYearly} total={r.grossYearly} className="bg-primary" />
          <Seg value={r.loonheffingYearly} total={r.grossYearly} className="bg-accent" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <Legend color="bg-primary" label="Nettó / év" amount={fmt(r.netYearly)} />
          <Legend color="bg-accent" label="Loonheffing / év" amount={fmt(r.loonheffingYearly)} />
          <Legend color="bg-line" label="Bruttó / év" amount={fmt(r.grossYearly)} />
          {r.holidayPayYearly > 0 && <Legend color="bg-star" label="Ebből vakantiegeld" amount={fmt(r.holidayPayYearly)} />}
        </div>

        {/* Részletes bontás (éves) */}
        <div className="mt-1 space-y-1 rounded-[10px] bg-surface-alt px-3 py-2.5 text-[12px]">
          <Row label="Box 1 jövedelemadó + premies" value={fmt(r.box1TaxYearly)} sign="−" />
          <Row label="Algemene heffingskorting" value={fmt(r.algemeneKortingYearly)} sign="+" />
          <Row label="Arbeidskorting" value={fmt(r.arbeidskortingYearly)} sign="+" />
          <div className="mt-1 flex items-center justify-between border-t border-line pt-1.5">
            <span className="font-bold text-ink">Loonheffing (éves levonás)</span>
            <span className="font-extrabold text-ink">−{fmt(r.loonheffingYearly)}</span>
          </div>
        </div>
        <p className="rounded-[10px] bg-primary/5 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
          ℹ️ A nettó NEM tartalmazza a munkáltatói nyugdíj-levonást (pensioenpremie) — az cégenként eltér, és tovább csökkenti a kézhez kapott összeget. A zorgverzekering (~140 €/hó) is külön megy a biztosítónak.
        </p>
      </section>

      {/* Benchmark */}
      <section className="space-y-3 rounded-card border-2 border-success/20 bg-success/5 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/15 text-lg">📊</span>
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Jó ez a fizetés?</h3>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          A <strong className="text-ink">{fmt(r.grossMonthly)}</strong> havi bruttó a holland nemzeti medián
          (<strong className="text-ink">{fmt(median)}</strong>) felett/alatt van — a becslés szerint a teljes munkaidős keresők
          kb. <strong className="text-ink">{percentile}%</strong>-a keres ennél kevesebbet.
        </p>
        <div className="h-2.5 overflow-hidden rounded-pill bg-surface-alt">
          <div className="h-full rounded-pill bg-success" style={{ width: `${percentile}%` }} />
        </div>
      </section>

      <LegalDisclaimer
        toolName="bérkalkulátor (NL)"
        variant="legal"
        notAdviceFor="adózási vagy pénzügyi"
        extraWarning="Az eredmények BECSLÉSEK a 2025-ös Box 1 adótarif és heffingskortingen alapján, AOW-kor alatti munkavállalóra. A tényleges nettó függ a munkáltatói pensioenpremie-től, a 30%-regelingtől, az egyéni levonásoktól és a pontos helyzettől. A pontos összeget a loonstrook (bérpapír) tartalmazza; az éves aangifte-vel gyakran visszajár vagy pótlandó adó."
        officialSources={[
          { label: "belastingdienst.nl — Loonheffingen", url: "https://www.belastingdienst.nl/" },
          { label: "rijksoverheid.nl — Inkomstenbelasting", url: "https://www.rijksoverheid.nl/onderwerpen/inkomstenbelasting" },
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

function Row({ label, value, sign }: { label: string; value: string; sign: "−" | "+" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className={cn("font-bold", sign === "+" ? "text-success" : "text-ink")}>{sign}{value}</span>
    </div>
  );
}
