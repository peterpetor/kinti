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

/**
 * Simplified Quellensteuer (Withholding Tax) estimates.
 * Based roughly on 7000 CHF/month gross salary in 2024/2025.
 * A = Egyedülálló (Single, no kids)
 * B = Házas, 1 keresős (Married, 1 income, no kids)
 * C = Házas, 2 keresős (Married, 2 incomes, no kids) -> Approx slightly higher than B.
 * 
 * Kids reduce the rate significantly, but for simplicity we ask for kids and subtract a flat ~2-3% per kid.
 */
const QST_RATES: Record<string, { A: number; B: number; C: number }> = {
  ZH: { A: 8.5, B: 5.0, C: 8.0 },
  BE: { A: 13.0, B: 9.0, C: 12.0 },
  LU: { A: 10.0, B: 6.0, C: 9.5 },
  UR: { A: 7.5, B: 4.0, C: 7.0 },
  SZ: { A: 6.5, B: 3.5, C: 6.0 },
  OW: { A: 8.5, B: 5.0, C: 8.0 },
  NW: { A: 7.5, B: 4.0, C: 7.0 },
  GL: { A: 10.0, B: 6.5, C: 9.5 },
  ZG: { A: 4.5, B: 2.0, C: 4.0 },
  FR: { A: 12.5, B: 8.5, C: 12.0 },
  SO: { A: 11.5, B: 8.0, C: 11.0 },
  BS: { A: 12.5, B: 8.5, C: 12.0 },
  BL: { A: 11.5, B: 8.0, C: 11.0 },
  SH: { A: 11.0, B: 7.5, C: 10.5 },
  AR: { A: 11.0, B: 7.5, C: 10.5 },
  AI: { A: 8.5, B: 5.0, C: 8.0 },
  SG: { A: 11.0, B: 7.5, C: 10.5 },
  GR: { A: 9.5, B: 6.0, C: 9.0 },
  AG: { A: 10.0, B: 6.5, C: 9.5 },
  TG: { A: 10.5, B: 7.0, C: 10.0 },
  TI: { A: 11.0, B: 7.5, C: 10.5 },
  VD: { A: 13.5, B: 9.5, C: 13.0 },
  VS: { A: 10.5, B: 7.0, C: 10.0 },
  NE: { A: 14.0, B: 10.0, C: 13.5 },
  GE: { A: 13.0, B: 9.0, C: 12.5 },
  JU: { A: 13.0, B: 9.0, C: 12.5 },
};

// Social security employee share
const RATE_AHV = 5.3; // AHV/IV/EO (10.6% total -> 5.3% employee)
const RATE_ALV = 1.1; // ALV (Unemployment) up to 148k CHF
const RATE_NBU = 1.2; // Non-occupational accident (varies, avg 1.2%)
const RATE_KTG = 0.8; // Daily sickness allowance (varies, avg 0.8%)

type AgeBracket = "<25" | "25-34" | "35-44" | "45-54" | "55-65";
type CivilStatus = "A" | "B" | "C"; // A: Single, B: Married (1 inc), C: Married (2 inc)
type PayPeriod = "month" | "year";

interface SalaryForm {
  gross: number;
  period: PayPeriod;
  canton: string;
  age: AgeBracket;
  civil: CivilStatus;
  kids: number;
  churchTax: boolean;
  months: number; // usually 12 or 13
}

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

  // Calculate values
  const grossMonthly = form.period === "month" ? form.gross : form.gross / form.months;
  const grossYearly = form.period === "year" ? form.gross : form.gross * form.months;

  // BVG Deduction (Pensionskasse 2nd Pillar)
  // Simplified: only coordinated salary (Gross - 25725) is insured.
  const bvgAgeRates: Record<AgeBracket, number> = {
    "<25": 1.0, // Only risk insurance
    "25-34": 3.5, // 7% total -> 3.5% employee
    "35-44": 5.0, // 10% -> 5%
    "45-54": 7.5, // 15% -> 7.5%
    "55-65": 9.0, // 18% -> 9%
  };
  const bvgRate = bvgAgeRates[form.age];
  // Calculate BVG on monthly basis (approx coordinated deduction ~2143 CHF/m)
  const coordinatedSalaryMonthly = Math.max(0, grossMonthly - 2143);
  const valBvg = (coordinatedSalaryMonthly * bvgRate) / 100;

  // AHV/ALV/NBU/KTG
  const valAhv = (grossMonthly * RATE_AHV) / 100;
  const valAlv = (grossMonthly * RATE_ALV) / 100;
  const valNbu = (grossMonthly * RATE_NBU) / 100;
  const valKtg = (grossMonthly * RATE_KTG) / 100;

  const socialDeductions = valAhv + valAlv + valNbu + valKtg + valBvg;

  // Quellensteuer (Withholding Tax)
  // Base rate from dictionary
  const cantonRates = QST_RATES[form.canton] || QST_RATES["ZH"];
  let qstRate = cantonRates[form.civil];
  
  // Kids reduce the rate (~2% per kid, up to a minimum of 0%)
  if (form.kids > 0) {
    qstRate = Math.max(0, qstRate - form.kids * 2.2);
  }
  // Church tax adds approx 0.8% - 1.2% depending on canton
  if (form.churchTax) {
    qstRate += 1.0;
  }
  // Cap at 0
  qstRate = Math.max(0, qstRate);

  const valQst = (grossMonthly * qstRate) / 100;

  // Net salary
  const totalDeductions = socialDeductions + valQst;
  const netMonthly = grossMonthly - totalDeductions;
  const netYearly = netMonthly * form.months;

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
        <div className="bg-primary/5 px-5 py-6 text-center">
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

        <p className="mt-2 text-[10.5px] text-ink-faint">
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
