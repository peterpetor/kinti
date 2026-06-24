"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CANTONS } from "@/lib/cantons";
import { cn } from "@/lib/cn";
import {
  listSalaryOffers,
  saveSalaryOffer,
  type SalaryOfferInput,
} from "@/lib/salary-offers";
import {
  computeSalary,
  salaryPercentile,
  RATE_AHV,
  RATE_ALV,
  RATE_NBU,
  RATE_KTG,
  CANTON_MEDIAN_GROSS,
  type AgeBracket,
  type CivilStatus,
  type SalaryCalcInput,
} from "@/lib/salary-calc";

type SalaryForm = SalaryCalcInput;

export function SalaryCalculator() {
  const [form, setForm] = useState<SalaryForm>({
    gross: 6000,
    period: "month",
    canton: "ZH",
    age: "25-34",
    civil: "A",
    kids: 0,
    churchTax: false,
    months: 12,
  });

  const [expanded, setExpanded] = useState(false);

  // "Ajánlataim" mentés-bar állapota
  const [saveLabel, setSaveLabel] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setSavedCount(listSalaryOffers().length);
  }, []);

  function handleSaveOffer() {
    const label = saveLabel.trim();
    if (!label) return;
    const input: SalaryOfferInput = {
      gross: form.gross,
      period: form.period,
      canton: form.canton,
      age: form.age,
      civil: form.civil,
      kids: form.kids,
      churchTax: form.churchTax,
      months: form.months,
    };
    saveSalaryOffer(label, input, {
      grossMonthly,
      grossYearly,
      netMonthly,
      netYearly,
      totalDeductions,
      qstAmount: valQst,
      socialDeductions,
    });
    setSavedCount((n) => n + 1);
    setSaveLabel("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2400);
  }

  function setField<K extends keyof SalaryForm>(k: K, v: SalaryForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  // Számítás — a tiszta, tesztelt mag (lib/salary-calc).
  const {
    grossMonthly, grossYearly, valAhv, valAlv, valNbu, valKtg, valBvg,
    valQst, qstRate, socialNonPension, socialDeductions, totalDeductions,
    netMonthly, netYearly,
  } = computeSalary(form);

  // „Jó ez az ajánlat?" — percentilis a kanton mediánjához képest.
  const { percentile, median: cantonMedian } = salaryPercentile(grossMonthly, form.canton);

  // Kanton-összehasonlítás: ugyanez a bruttó a többi kantonban (nettó/hó).
  const cantonCompare = CANTONS
    .map((c) => ({
      code: c.code,
      name: c.name,
      net: computeSalary({ ...form, canton: c.code }).netMonthly,
    }))
    .sort((a, b) => b.net - a.net);
  const bestCanton = cantonCompare[0];
  const topAlternatives = cantonCompare.filter((c) => c.code !== form.canton).slice(0, 3);

  // Formatting helpers
  const formatCHF = (num: number) =>
    Math.round(num).toLocaleString("de-CH") + " CHF";
  const formatDec = (num: number) => num.toFixed(1) + "%";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            💰
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
              Bérkalkulátor Svájc
            </h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Nettó fizetés becslése forrásadóval (Quellensteuer), AHV, ALV és nyugdíjpénztár levonásokkal.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
        {/* Bruttó bér */}
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
                className={cn(
                  "px-3 text-[13px] font-bold transition-colors",
                  form.period === "month" ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-alt"
                )}
              >
                / hó
              </button>
              <button
                type="button"
                onClick={() => setField("period", "year")}
                className={cn(
                  "px-3 text-[13px] font-bold transition-colors",
                  form.period === "year" ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-alt"
                )}
              >
                / év
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Kanton */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Kanton
            </label>
            <select
              value={form.canton}
              onChange={(e) => setField("canton", e.target.value)}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {CANTONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Életkor (BVG miatt) */}
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Életkor
            </label>
            <select
              value={form.age}
              onChange={(e) => setField("age", e.target.value as AgeBracket)}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="<25">25 év alatt</option>
              <option value="25-34">25 - 34 év</option>
              <option value="35-44">35 - 44 év</option>
              <option value="45-54">45 - 54 év</option>
              <option value="55-65">55 - 65 év</option>
            </select>
          </div>
        </div>

        {/* Családi állapot */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Családi állapot (Tarifa)
          </label>
          <select
            value={form.civil}
            onChange={(e) => setField("civil", e.target.value as CivilStatus)}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="A">Egyedülálló (A tarifa)</option>
            <option value="B">Házas, 1 kereső (B tarifa)</option>
            <option value="C">Házas, 2 kereső (C tarifa)</option>
          </select>
        </div>

        {/* Gyerekek & Egyházi adó */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Gyermekek száma
            </label>
            <select
              value={form.kids}
              onChange={(e) => setField("kids", parseInt(e.target.value))}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} gyermek
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Egyházi adó?
            </label>
            <label className="flex h-[46px] cursor-pointer items-center justify-between rounded-[12px] border border-line bg-surface-alt px-4">
              <span className="text-[14px] font-semibold text-ink">Igen / Nem</span>
              <input
                type="checkbox"
                checked={form.churchTax}
                onChange={(e) => setField("churchTax", e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-primary"
              />
            </label>
          </div>
        </div>

        {/* 13. havi bér */}
        <div className="pt-2">
          <label className="flex cursor-pointer items-center gap-3 text-[13px] font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.months === 13}
              onChange={(e) => setField("months", e.target.checked ? 13 : 12)}
              className="h-4.5 w-4.5 cursor-pointer accent-primary rounded-md"
            />
            Van 13. havi fizetés (13. Monatslohn)
          </label>
        </div>
      </div>

      {/* Eredmény kártya */}
      <div className="rounded-card border-2 border-primary bg-surface overflow-hidden shadow-card">
        <div className="bg-primary/5 px-5 py-6 text-center relative">
          <span className="absolute right-3 top-3 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent">
            Becslés
          </span>
          <p className="text-[13px] font-bold uppercase tracking-wide text-primary">
            Becsült Nettó Bér
          </p>
          <div className="mt-1 flex items-end justify-center gap-2">
            <span className="text-[40px] font-black leading-none tracking-tight text-ink">
              {formatCHF(netMonthly)}
            </span>
            <span className="mb-1 text-[14px] font-bold text-ink-muted">/ hó</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-ink-muted">
            Éves nettó: {formatCHF(netYearly)}
          </p>
        </div>

        {/* Levonások részletezése */}
        <div className="border-t border-line bg-surface p-5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between font-bold text-ink hover:text-primary transition-colors"
          >
            <span>Részletes levonások (hitel/hó)</span>
            <Icon
              name="chevD"
              size={18}
              strokeWidth={2.4}
              className={cn("transition-transform duration-300", expanded && "rotate-180")}
            />
          </button>

          {expanded && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex justify-between text-[13.5px] text-ink-muted pb-2 border-b border-line">
                <span>Bruttó fizetés</span>
                <span className="font-bold text-ink">{formatCHF(grossMonthly)}</span>
              </div>
              
              <div className="flex justify-between text-[13.5px]">
                <span>AHV/IV/EO ({formatDec(RATE_AHV)})</span>
                <span className="text-accent">- {formatCHF(valAhv)}</span>
              </div>
              <div className="flex justify-between text-[13.5px]">
                <span>ALV (Munkanélküli, {formatDec(RATE_ALV)})</span>
                <span className="text-accent">- {formatCHF(valAlv)}</span>
              </div>
              <div className="flex justify-between text-[13.5px]">
                <span>NBU (Baleset, becsült ~{formatDec(RATE_NBU)})</span>
                <span className="text-accent">- {formatCHF(valNbu)}</span>
              </div>
              <div className="flex justify-between text-[13.5px]">
                <span>KTG (Betegség, becsült ~{formatDec(RATE_KTG)})</span>
                <span className="text-accent">- {formatCHF(valKtg)}</span>
              </div>
              <div className="flex justify-between text-[13.5px] pb-2 border-b border-line border-dashed">
                <span>BVG (Nyugdíj 2. pillér, korfüggő)</span>
                <span className="text-accent">- {formatCHF(valBvg)}</span>
              </div>
              
              <div className="flex justify-between text-[13.5px] pb-2 border-b border-line">
                <span>
                  Forrásadó / Quellensteuer ({form.canton}, Tarifa: {form.civil}{form.kids})
                  <br/>
                  <span className="text-[11.5px] text-ink-faint">Becsült kulcs: {formatDec(qstRate)}</span>
                </span>
                <span className="text-accent font-bold">- {formatCHF(valQst)}</span>
              </div>
              
              <div className="flex justify-between text-[14px] font-extrabold text-ink pt-1">
                <span>Nettó fizetés</span>
                <span className="text-primary">{formatCHF(netMonthly)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* „Jó ez az ajánlat?" — benchmark + nettó-bontás + kanton-összehasonlítás */}
      <section className="space-y-4 rounded-card border-2 border-success/20 bg-success/5 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/15 text-lg">📊</span>
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Jó ez az ajánlat?</h3>
        </div>

        {/* 1) Percentilis a kanton mediánjához */}
        <div>
          <div className="mb-1.5 flex items-end justify-between">
            <span className="text-[13px] font-bold text-ink">
              {percentile >= 66 ? "Erős ajánlat 💪" : percentile >= 40 ? "Tisztességes ajánlat" : "Az átlag alatt"}
            </span>
            <span className="text-[12px] font-semibold text-ink-muted">
              {CANTONS.find((c) => c.code === form.canton)?.name ?? form.canton} medián: {formatCHF(cantonMedian)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-pill bg-surface-alt">
            <div
              className="h-full rounded-pill bg-success transition-all"
              style={{ width: `${percentile}%` }}
            />
          </div>
          <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">
            A(z) <strong className="text-ink">{CANTONS.find((c) => c.code === form.canton)?.name ?? form.canton}</strong>{" "}
            kantonban a dolgozók becsült <strong className="text-success">~{percentile}%-ánál</strong> keresel többet
            ezzel a bruttóval.
          </p>
        </div>

        {/* 2) Vizuális nettó-bontás */}
        <div>
          <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Hová megy a bruttód?</p>
          <div className="flex h-4 w-full overflow-hidden rounded-pill">
            <BreakdownSeg value={netMonthly} total={grossMonthly} className="bg-primary" />
            <BreakdownSeg value={valQst} total={grossMonthly} className="bg-accent" />
            <BreakdownSeg value={socialNonPension} total={grossMonthly} className="bg-star" />
            <BreakdownSeg value={valBvg} total={grossMonthly} className="bg-[#6b8cae]" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            <LegendRow color="bg-primary" label="Nettó" amount={formatCHF(netMonthly)} />
            <LegendRow color="bg-accent" label="Forrásadó" amount={formatCHF(valQst)} />
            <LegendRow color="bg-star" label="Társadalombiztosítás" amount={formatCHF(socialNonPension)} />
            <LegendRow color="bg-[#6b8cae]" label="Nyugdíj (BVG)" amount={formatCHF(valBvg)} />
          </div>
          <p className="mt-2 rounded-[10px] bg-surface-alt px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
            ℹ️ A <strong className="text-ink">Krankenkasse</strong> (egészségbiztosítás, ~300–450 CHF/hó) <strong>nem</strong> a
            bérből vonódik — azt külön fizeted, ezért a nettóból még levonódik.
          </p>
        </div>

        {/* 3) Kanton-összehasonlítás */}
        <div>
          <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Ugyanez a bruttó más kantonban (nettó/hó)
          </p>
          {bestCanton.code === form.canton && (
            <p className="mb-2 text-[12px] font-semibold text-success">
              🏆 A te kantonod adózásilag a legkedvezőbb erre a bruttóra.
            </p>
          )}
          <div className="space-y-1.5">
            {topAlternatives.map((c) => {
              const delta = Math.round(c.net - netMonthly);
              return (
                <div
                  key={c.code}
                  className="flex items-center justify-between rounded-[10px] border border-line bg-surface px-3 py-2"
                >
                  <span className="text-[13px] font-semibold text-ink">{c.name}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-[13px] font-bold text-ink">{formatCHF(c.net)}</span>
                    <span className={cn("text-[12px] font-bold", delta > 0 ? "text-success" : "text-ink-faint")}>
                      {delta > 0 ? `+${formatCHF(delta)}` : formatCHF(delta)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* "Ajánlataim" — interjún kapott ajánlatok mentése + összehasonlítás */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/10 text-success">
            <Icon name="bookmark" size={16} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-extrabold tracking-tight text-ink">
              Mentsd el ajánlatként
            </h3>
            <p className="text-[11.5px] text-ink-muted">
              Hasonlítsd össze a különböző interjúkon kapott ajánlatokat.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder="Pl. ABB Zürich, Migros HQ Bern…"
            maxLength={60}
            className="flex-1 rounded-[10px] border border-line bg-surface-alt px-3 py-2.5 text-[13.5px] text-ink outline-none focus:ring-2 focus:ring-success/30"
          />
          <button
            type="button"
            onClick={handleSaveOffer}
            disabled={!saveLabel.trim()}
            className={cn(
              "rounded-[10px] px-4 py-2.5 text-[13.5px] font-extrabold tracking-tight transition active:scale-95",
              saveLabel.trim()
                ? "bg-success text-white shadow-card"
                : "bg-surface-alt text-ink-muted cursor-not-allowed",
            )}
          >
            Mentés
          </button>
        </div>

        {justSaved && (
          <p className="mt-2 text-[12px] font-bold text-success">
            ✓ Ajánlat mentve a böngésződben.
          </p>
        )}

        {savedCount > 0 && (
          <Link
            href="/berkalkulator/ajanlataim"
            className="mt-3 flex items-center justify-between rounded-[10px] border border-success/20 bg-success/5 px-3 py-2 text-[12.5px] font-bold text-success transition hover:bg-success/10"
          >
            <span>📊 Ajánlataim ({savedCount}) — összehasonlítás</span>
            <Icon name="chevR" size={14} strokeWidth={2.4} />
          </Link>
        )}

        <p className="mt-2 text-[11.5px] text-ink-faint">
          Csak a böngésződben tárolva — sem mi, sem mások nem látják.
        </p>
      </section>

      <LegalDisclaimer
        toolName="bérkalkulátor"
        variant="legal"
        notAdviceFor="adóügyi vagy pénzügyi"
        extraWarning="Az eredmények kizárólag becslések! A svájci forrásadó (Quellensteuer) pontos összege községenként (Gemeinde) is eltérhet, és minden évben frissül. A baleset- (NBU), betegség- (KTG) és nyugdíj- (BVG) levonások cégfüggőek. Pontos adatokat mindig a hivatalos bérpapír (Lohnabrechnung) tartalmaz."
        officialSources={[
          { label: "Svájci Adóhivatal (ESTV) - Quellensteuer", url: "https://www.estv.admin.ch/estv/de/home/quellensteuer.html" },
          { label: "Lohncomputer (Részletes svájci kalkulátor)", url: "https://lohncomputer.ch/" }
        ]}
      />
    </div>
  );
}

/** Egy szegmens a nettó-bontás sávban (szélesség = érték / bruttó). */
function BreakdownSeg({ value, total, className }: { value: number; total: number; className: string }) {
  const pct = total > 0 ? Math.max(0, (value / total) * 100) : 0;
  if (pct <= 0) return null;
  return <div className={className} style={{ width: `${pct}%` }} />;
}

/** Jelmagyarázat-sor a nettó-bontáshoz. */
function LegendRow({ color, label, amount }: { color: string; label: string; amount: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color)} />
      <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-muted">{label}</span>
      <span className="text-[11.5px] font-bold text-ink">{amount}</span>
    </div>
  );
}
