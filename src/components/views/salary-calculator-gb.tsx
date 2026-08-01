"use client";

import { useState } from "react";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { SalaryJobsCta } from "@/components/views/salary-jobs-cta";
import { cn } from "@/lib/cn";
import {
  computeSalaryGB,
  salaryPercentileGB,
  GB_REGIONS_LIST,
  type SalaryCalcInputGB,
} from "@/lib/salary-calc";

/**
 * Brit bérkalkulátor — PAYE + National Insurance (Anglia/Wales/É-Írország).
 * ⚠️ Skócia eltérő adósávokkal működik; a Kinti csak Angliát kezeli országként.
 */
export function SalaryCalculatorGB() {
  const [form, setForm] = useState<SalaryCalcInputGB & { region: string }>({
    gross: 2900,
    period: "month",
    pension: true,
    studentLoanPlan2: false,
    region: "LDN",
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const r = computeSalaryGB(form);
  const { percentile, median } = salaryPercentileGB(r.grossMonthly, form.region);
  const regionName = GB_REGIONS_LIST.find((p) => p.code === form.region)?.name ?? "Anglia";
  const fmt = (n: number) => "£" + Math.round(n).toLocaleString("en-GB");

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">💷</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-extrabold tracking-tight text-ink">Bérkalkulátor Anglia</h2>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Nettó bér becslése: PAYE jövedelemadó (Personal Allowance után) + National Insurance
              (Class 1), opcionálisan nyugdíjjal és diákhitellel.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
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

        {/* Nyugdíj (auto-enrolment) */}
        <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4 py-3">
          <span className="min-w-0 flex-1 pr-3 text-[13.5px] font-semibold text-ink">
            Munkahelyi nyugdíj (auto-enrolment, 5%)
            <span className="mt-0.5 block text-[11.5px] font-medium text-ink-muted">
              Alapból mindenkit beléptetnek — ki lehet lépni, de a munkáltatói 3% is elveszne.
            </span>
          </span>
          <input type="checkbox" checked={!!form.pension} onChange={(e) => setField("pension", e.target.checked)} className="h-5 w-5 shrink-0 cursor-pointer accent-primary" />
        </label>

        {/* Diákhitel */}
        <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4 py-3">
          <span className="min-w-0 flex-1 pr-3 text-[13.5px] font-semibold text-ink">
            Diákhitel-törlesztés (Plan 2)
            <span className="mt-0.5 block text-[11.5px] font-medium text-ink-muted">
              Csak brit egyetemi hitelnél — magyar diplomával nem releváns.
            </span>
          </span>
          <input type="checkbox" checked={!!form.studentLoanPlan2} onChange={(e) => setField("studentLoanPlan2", e.target.checked)} className="h-5 w-5 shrink-0 cursor-pointer accent-primary" />
        </label>

        {/* Régió (benchmark) — az adó ORSZÁGOS, ez csak a viszonyítás */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Régió (bér-összehasonlításhoz)
          </label>
          <select
            value={form.region}
            onChange={(e) => setField("region", e.target.value)}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {GB_REGIONS_LIST.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Eredmény */}
      <section className="space-y-3 rounded-card border-2 border-primary/20 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="text-center">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">Becsült nettó / hó (take-home)</p>
          <p className="text-[34px] font-extrabold leading-none tracking-tight text-ink">{fmt(r.netMonthly)}</p>
          <p className="mt-1 text-[12px] text-ink-muted">≈ {fmt(r.netYearly)} / év · levonás {r.effectiveRate.toFixed(1)}%</p>
        </div>

        <div className="flex h-3.5 overflow-hidden rounded-pill bg-surface-alt">
          <Seg value={r.netYearly} total={r.grossYearly} className="bg-primary" />
          <Seg value={r.incomeTaxYearly} total={r.grossYearly} className="bg-accent" />
          <Seg value={r.niYearly} total={r.grossYearly} className="bg-star" />
          <Seg value={r.pensionYearly + r.studentLoanYearly} total={r.grossYearly} className="bg-ink-muted" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <Legend color="bg-primary" label="Nettó / év" amount={fmt(r.netYearly)} />
          <Legend color="bg-accent" label="Income Tax / év" amount={fmt(r.incomeTaxYearly)} />
          <Legend color="bg-star" label="National Insurance" amount={fmt(r.niYearly)} />
          <Legend color="bg-line" label="Bruttó / év" amount={fmt(r.grossYearly)} />
        </div>

        {/* Részletes bontás (éves) */}
        <div className="mt-1 space-y-1 rounded-[10px] bg-surface-alt px-3 py-2.5 text-[12px]">
          <Row label="Personal Allowance (adómentes)" value={fmt(r.personalAllowance)} sign="+" />
          <Row label="Adóalap (a mentes rész után)" value={fmt(r.taxableYearly)} sign="" />
          <Row label="Income Tax (PAYE)" value={fmt(r.incomeTaxYearly)} sign="−" />
          <Row label="National Insurance (Class 1)" value={fmt(r.niYearly)} sign="−" />
          {r.pensionYearly > 0 && <Row label="Nyugdíj (auto-enrolment 5%)" value={fmt(r.pensionYearly)} sign="−" />}
          {r.studentLoanYearly > 0 && <Row label="Diákhitel (Plan 2, 9%)" value={fmt(r.studentLoanYearly)} sign="−" />}
          <div className="mt-1 flex items-center justify-between border-t border-line pt-1.5">
            <span className="font-bold text-ink">Nettó (take-home) / év</span>
            <span className="font-extrabold text-ink">{fmt(r.netYearly)}</span>
          </div>
        </div>

        {/* ⚠️ A 60%-os csapda — a brit adórendszer leggyakrabban félreértett része */}
        {r.inTaperTrap && (
          <p className="rounded-[10px] bg-accent/10 px-3 py-2 text-[11.5px] leading-snug text-accent">
            ⚠️ <strong>60%-os sáv:</strong> £100 000 fölött a Personal Allowance minden extra
            £2 után £1-gyel csökken, így £100 000 és £125 140 között a tényleges marginális
            adókulcs <strong>~60%</strong> (nem 40%). Sokan ilyenkor nyugdíjba tolják a bér egy
            részét — ez visszaadhatja a mentességet.
          </p>
        )}

        <p className="rounded-[10px] bg-primary/5 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
          ℹ️ Az adóév <strong>április 6-tól április 5-ig</strong> tart (nem naptári év). A nettó nem
          tartalmazza a <strong>council taxet</strong> (ez külön, a lakóhelyed önkormányzatának megy),
          és nincs külön egészségbiztosítási díj sem — az NHS-t az adó fedezi.
        </p>
      </section>

      {/* Benchmark */}
      <section className="space-y-3 rounded-card border-2 border-success/20 bg-success/5 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/15 text-lg">📊</span>
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Jó ez a fizetés?</h3>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          A <strong className="text-ink">{fmt(r.grossMonthly)}</strong> havi bruttó a(z){" "}
          <strong className="text-ink">{regionName}</strong> régió becsült mediánjához (
          <strong className="text-ink">{fmt(median)}</strong>) képest — a becslés szerint az ottani
          teljes munkaidős keresők kb. <strong className="text-ink">{percentile}%</strong>-a keres
          ennél kevesebbet.
        </p>
        <div className="h-2.5 overflow-hidden rounded-pill bg-surface-alt">
          <div className="h-full rounded-pill bg-success" style={{ width: `${percentile}%` }} />
        </div>
      </section>

      <SalaryJobsCta country="GB" grossMonthly={r.grossMonthly} />

      <LegalDisclaimer
        toolName="bérkalkulátor (Anglia)"
        variant="legal"
        notAdviceFor="adózási vagy pénzügyi"
        extraWarning="Az eredmények BECSLÉSEK a 2025/26-os angol/walesi/észak-írországi adósávok és a Class 1 National Insurance alapján, nyugdíjkor alatti munkavállalóra. ⚠️ SKÓCIA eltérő jövedelemadó-sávokkal működik — ott a becslés nem érvényes. A tényleges levonás függ a tax code-odtól (rossz kód esetén emergency tax jöhet), a munkáltatói nyugdíj-konstrukciótól (salary sacrifice más eredményt ad) és az egyéni körülményeidtől. A pontos összeget a payslip mutatja; a túlfizetést a HMRC Personal Tax Accountban igényelheted vissza."
        officialSources={[
          { label: "gov.uk — Income Tax rates and allowances", url: "https://www.gov.uk/income-tax-rates" },
          { label: "gov.uk — National Insurance rates", url: "https://www.gov.uk/national-insurance-rates-letters" },
          { label: "gov.uk — Estimate your Income Tax", url: "https://www.gov.uk/estimate-income-tax" },
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

function Row({ label, value, sign }: { label: string; value: string; sign: "−" | "+" | "" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className={cn("font-bold", sign === "+" ? "text-success" : "text-ink")}>{sign}{value}</span>
    </div>
  );
}
