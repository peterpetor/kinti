"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { SalaryJobsCta } from "@/components/views/salary-jobs-cta";
import { cn } from "@/lib/cn";
import {
  computeSalaryAT,
  salaryPercentileAT,
  AT_BUNDESLAENDER,
  AT_FAMILIENBONUS_PER_KID,
  type SalaryCalcInputAT,
} from "@/lib/salary-calc";

export function SalaryCalculatorAT() {
  const [form, setForm] = useState<SalaryCalcInputAT & { bundesland: string }>({
    gross: 3000,
    period: "month",
    months: 14,
    kids: 0,
    soleEarner: false,
    bundesland: "W",
  });
  const [expanded, setExpanded] = useState(false);

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const r = computeSalaryAT(form);
  const { percentile, median } = salaryPercentileAT(r.grossMonthly, form.bundesland);

  const fmt = (n: number) => Math.round(n).toLocaleString("de-AT") + " €";
  const has14 = form.months === 14;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            💶
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Bérkalkulátor Ausztria</h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Nettó bér becslése: SV-járulékok (ÖGK) + Lohnsteuer + 13./14. havi (Urlaubs-/Weihnachtsgeld) kedvező adózása.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
        {/* Bruttó */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Bruttó bér
          </label>
          <div className="flex rounded-[12px] border border-line bg-surface-alt focus-within:ring-2 focus-within:ring-primary/30 transition-all overflow-hidden">
            <input
              type="number"
              min={0}
              step={100}
              value={form.gross || ""}
              onChange={(e) => setField("gross", parseInt(e.target.value) || 0)}
              className="w-full bg-transparent px-4 py-3 text-[16px] font-bold text-ink outline-none"
            />
            <div className="flex border-l border-line bg-surface">
              <button
                type="button"
                onClick={() => setField("period", "month")}
                className={cn("px-3 text-[13px] font-bold transition-colors", form.period === "month" ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-alt")}
              >
                / hó
              </button>
              <button
                type="button"
                onClick={() => setField("period", "year")}
                className={cn("px-3 text-[13px] font-bold transition-colors", form.period === "year" ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-alt")}
              >
                / év
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">
            {has14
              ? "14× konvenció: a megadott havi bér × 14 (12 rendes + Urlaubs- és Weihnachtsgeld)."
              : "12× konvenció: nincs 13./14. havi."}
          </p>
        </div>

        {/* 14. havi toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4 py-3">
          <span className="text-[13.5px] font-semibold text-ink">13./14. havi fizetés (14×)</span>
          <input
            type="checkbox"
            checked={has14}
            onChange={(e) => setField("months", e.target.checked ? 14 : 12)}
            className="h-5 w-5 cursor-pointer accent-primary"
          />
        </label>

        <div className="grid grid-cols-2 items-end gap-4">
          {/* Gyerekek (Familienbonus) */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Gyermek (Familienbonus)
            </label>
            <select
              value={form.kids}
              onChange={(e) => setField("kids", parseInt(e.target.value))}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} gyermek</option>
              ))}
            </select>
          </div>
          {/* Bundesland (benchmark) */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Bundesland
            </label>
            <select
              value={form.bundesland}
              onChange={(e) => setField("bundesland", e.target.value)}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {AT_BUNDESLAENDER.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alleinverdiener */}
        <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4 py-3">
          <span className="text-[13.5px] font-semibold text-ink">
            Egyedüli kereső (Alleinverdiener)
            <span className="block text-[11px] font-normal text-ink-faint">gyerekkel — extra adójóváírás</span>
          </span>
          <input
            type="checkbox"
            checked={form.soleEarner}
            onChange={(e) => setField("soleEarner", e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-primary"
          />
        </label>
      </div>

      {/* Eredmény kártya */}
      <div className="rounded-card border-2 border-primary bg-surface overflow-hidden shadow-card">
        <div className="bg-primary/5 px-5 py-6 text-center relative">
          <span className="absolute right-3 top-3 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent">
            Becslés
          </span>
          <p className="text-[13px] font-bold uppercase tracking-wide text-primary">Becsült nettó bér</p>
          <div className="mt-1 flex items-end justify-center gap-2">
            <span className="text-[40px] font-black leading-none tracking-tight text-ink">{fmt(r.netMonthly)}</span>
            <span className="mb-1 text-[14px] font-bold text-ink-muted">/ hó</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-ink-muted">
            Éves nettó: {fmt(r.netYearly)} {has14 && <span className="text-ink-faint">(14×, a 13./14.-gyel)</span>}
          </p>
        </div>

        {/* Levonások */}
        <div className="border-t border-line bg-surface p-5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between font-bold text-ink hover:text-primary transition-colors"
          >
            <span>Részletes levonások (havi)</span>
            <Icon name="chevD" size={18} strokeWidth={2.4} className={cn("transition-transform duration-300", expanded && "rotate-180")} />
          </button>

          {expanded && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex justify-between text-[13.5px] text-ink-muted pb-2 border-b border-line">
                <span>Bruttó (laufend / hó)</span>
                <span className="font-bold text-ink">{fmt(r.grossMonthly)}</span>
              </div>
              <div className="flex justify-between text-[13.5px]">
                <span>SV-járulék ({r.svRate.toFixed(2)}%)<br /><span className="text-[11.5px] text-ink-faint">Nyugdíj, ÖGK-egészség, munkanélküli…</span></span>
                <span className="text-accent">- {fmt(r.svMonthly)}</span>
              </div>
              <div className="flex justify-between text-[13.5px] pb-2 border-b border-line">
                <span>Lohnsteuer (jövedelemadó)<br /><span className="text-[11.5px] text-ink-faint">Absetzbeträge után (Verkehr{form.kids > 0 ? " + Familienbonus" : ""})</span></span>
                <span className="text-accent">- {fmt(r.taxMonthly)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-extrabold text-ink pt-1">
                <span>Nettó (laufend / hó)</span>
                <span className="text-primary">{fmt(r.netMonthly)}</span>
              </div>

              {has14 && (
                <div className="mt-3 rounded-[10px] bg-success/5 border border-success/20 px-3 py-2.5">
                  <p className="text-[12px] font-bold text-ink mb-1.5">13./14. havi (Sonderzahlung) — kedvező adózás</p>
                  <div className="flex justify-between text-[12.5px] text-ink-muted">
                    <span>Bruttó (2 hó)</span><span className="font-bold text-ink">{fmt(r.specialGross)}</span>
                  </div>
                  <div className="flex justify-between text-[12.5px] text-ink-muted">
                    <span>SV ({/* special */}17,07%)</span><span className="text-accent">- {fmt(r.specialSv)}</span>
                  </div>
                  <div className="flex justify-between text-[12.5px] text-ink-muted">
                    <span>Adó (6%, 620 € mentes)</span><span className="text-accent">- {fmt(r.specialTax)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-extrabold text-ink pt-1 border-t border-success/20 mt-1">
                    <span>Nettó extra (évente)</span><span className="text-success">{fmt(r.specialNet)}</span>
                  </div>
                </div>
              )}

              <p className="text-[11.5px] leading-snug text-ink-faint pt-1">
                Teljes levonási kulcs: ~{r.effectiveRate.toFixed(1)}% (SV + Lohnsteuer az éves bruttóra).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Benchmark */}
      <section className="space-y-4 rounded-card border-2 border-success/20 bg-success/5 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/15 text-lg">📊</span>
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Jó ez a fizetés?</h3>
        </div>

        <div>
          <div className="mb-1.5 flex items-end justify-between">
            <span className="text-[13px] font-bold text-ink">
              {percentile >= 66 ? "Erős fizetés 💪" : percentile >= 40 ? "Tisztességes" : "Az átlag alatt"}
            </span>
            <span className="text-[12px] font-semibold text-ink-muted">
              {AT_BUNDESLAENDER.find((b) => b.code === form.bundesland)?.name} medián: {fmt(median)}/hó
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-pill bg-surface-alt">
            <div className="h-full rounded-pill bg-success transition-all" style={{ width: `${percentile}%` }} />
          </div>
          <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">
            A becslés szerint a teljes munkaidős dolgozók <strong className="text-success">~{percentile}%-ánál</strong> keresel többet ezzel a bruttóval.
          </p>
        </div>

        {/* Nettó-bontás */}
        <div>
          <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Hová megy a bruttód? (laufend)</p>
          <div className="flex h-4 w-full overflow-hidden rounded-pill">
            <Seg value={r.netMonthly} total={r.grossMonthly} className="bg-primary" />
            <Seg value={r.taxMonthly} total={r.grossMonthly} className="bg-accent" />
            <Seg value={r.svMonthly} total={r.grossMonthly} className="bg-star" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            <Legend color="bg-primary" label="Nettó" amount={fmt(r.netMonthly)} />
            <Legend color="bg-accent" label="Lohnsteuer" amount={fmt(r.taxMonthly)} />
            <Legend color="bg-star" label="SV-járulék" amount={fmt(r.svMonthly)} />
          </div>
          <p className="mt-2 rounded-[10px] bg-surface-alt px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
            ℹ️ A svájcival ellentétben az <strong className="text-ink">egészségbiztosítás (ÖGK)</strong> MÁR benne van az SV-ben — nincs külön havi Krankenkasse-díj.
          </p>
        </div>

        {form.kids > 0 && (
          <p className="rounded-[10px] bg-primary/5 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
            👨‍👩‍👧 A <strong className="text-ink">Familienbonus Plus</strong> ({form.kids} × {AT_FAMILIENBONUS_PER_KID.toLocaleString("de-AT")} €/év) már beszámítva. A <strong className="text-ink">Familienbeihilfe</strong> (családi pótlék) ezen FELÜL jár — lásd a Tudásbázist.
          </p>
        )}
      </section>

      {/* Bérkalkulátor → állások tölcsér (kiemelt elöl; 0 találat = láthatatlan). */}
      <SalaryJobsCta country="AT" grossMonthly={r.grossMonthly} />

      <LegalDisclaimer
        toolName="bérkalkulátor"
        variant="legal"
        notAdviceFor="adóügyi vagy pénzügyi"
        extraWarning="Az eredmények BECSLÉSEK a 2025-ös Lohnsteuer-sávok és SV-kulcsok alapján. A tényleges nettó függ a pontos Absetzbeträgektől (Pendlerpauschale, Sonderausgaben, AVAB/AEAB), a kollektív szerződéstől és az egyéni helyzettől. A pontos összeget a Lohnzettel/Gehaltsabrechnung tartalmazza; az év végi Arbeitnehmerveranlagunggal gyakran visszajár adó."
        officialSources={[
          { label: "BMF — Brutto-Netto-Rechner", url: "https://www.bmf.gv.at/services/berechnungsprogramme/berechnung-arbeitnehmer.html" },
          { label: "ÖGK — Beiträge", url: "https://www.gesundheitskasse.at/" },
        ]}
      />
    </div>
  );
}

function Seg({ value, total, className }: { value: number; total: number; className: string }) {
  const pct = total > 0 ? Math.max(0, (value / total) * 100) : 0;
  if (pct <= 0) return null;
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
