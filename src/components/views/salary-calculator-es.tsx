"use client";

import { useState } from "react";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { SalaryJobsCta } from "@/components/views/salary-jobs-cta";
import { cn } from "@/lib/cn";
import {
  computeSalaryES,
  salaryPercentileES,
  ES_REGIONS_LIST,
  type SalaryCalcInputES,
} from "@/lib/salary-calc-es";

/**
 * Spanyol bérkalkulátor — IRPF + Seguridad Social.
 *
 * ⚠️ A KÉT ORSZÁG-SPECIFIKUS DÖNTÉS, amitől ez nem „még egy kalkulátor":
 *
 *  1) A 12/14 PAGA VÁLASZTÓ AZ ELSŐ MEZŐ, nem egy eldugott kapcsoló. Egy magyar
 *     álláskereső Spanyolországban jellemzően éves bruttót lát a hirdetésben, és
 *     fogalma sincs, hány részletre osztják. Ugyanaz a 28 000 € 14 pagában havi
 *     2000, 12 pagában havi 2333 — enélkül összehasonlíthatatlanok az ajánlatok.
 *     Ezért a kimenet MINDKÉT havi nézetet megadja: a bérpapíron látható összeget
 *     ÉS a 12 hónapra elosztott átlagot (ezzel kell lakbért tervezni).
 *
 *  2) AZ AUTONÓM KÖZÖSSÉG NEM CSAK BENCHMARK. A brit kalkulátornál a régió csak
 *     összehasonlításra szolgál (az adó országos) — Spanyolországban viszont az
 *     IRPF fele a közösségé. Ezért itt KI KELL MONDANI, hogy a szám referencia-
 *     kulccsal készül, nem a lakóhelyed tényleges sávjával.
 */
export function SalaryCalculatorES() {
  const [form, setForm] = useState<SalaryCalcInputES & { region: string }>({
    gross: 24000,
    period: "year",
    pagas: 14,
    contract: "indefinido",
    children: 0,
    region: "MD",
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const r = computeSalaryES(form);
  const { percentile, median } = salaryPercentileES(r.netMonthlyAverage > 0 ? r.grossYearly / 12 : 0, form.region);
  const regionName = ES_REGIONS_LIST.find((p) => p.code === form.region)?.name ?? "Spanyolország";
  const fmt = (n: number) => Math.round(n).toLocaleString("hu-HU") + " €";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">💶</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-extrabold tracking-tight text-ink">Bérkalkulátor Spanyolország</h2>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Nettó bér becslése: IRPF (személyi jövedelemadó) + Seguridad Social munkavállalói
              járulék — a 12 és a 14 fizetéses modellt egyszerre mutatva.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
        {/* ⚠️ A paga-választó SZÁNDÉKOSAN a bérmező FÖLÖTT áll: a beírt havi
            összeg értelme ettől függ, tehát előbb kell eldönteni. */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Hány részletben fizetnek?
          </label>
          <div className="flex gap-2">
            {([14, 12] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setField("pagas", p)}
                className={cn(
                  "flex-1 rounded-[12px] border px-3 py-2.5 text-[13px] font-bold transition",
                  form.pagas === p
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface-alt text-ink-muted",
                )}
              >
                {p === 14 ? "14 paga" : "12 paga"}
                <span className="mt-0.5 block text-[10.5px] font-semibold opacity-80">
                  {p === 14 ? "+ nyári és karácsonyi" : "egyenlően elosztva"}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">
            Ha nem tudod, kérdezd meg az interjún — a hirdetések jellemzően csak az éves bruttót
            írják, és a kettő havi szinten nagyon máshogy néz ki.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Bruttó bér
          </label>
          <div className="flex rounded-[12px] border border-line bg-surface-alt focus-within:ring-2 focus-within:ring-primary/30 overflow-hidden">
            <input
              type="number"
              inputMode="numeric"
              value={form.gross}
              onChange={(e) => setField("gross", Math.max(0, Number(e.target.value)))}
              className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[16px] font-bold text-ink outline-none"
            />
            <div className="flex shrink-0 border-l border-line">
              {(["year", "month"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setField("period", p)}
                  className={cn(
                    "px-3 text-[12.5px] font-bold transition",
                    form.period === p ? "bg-primary text-white" : "text-ink-muted",
                  )}
                >
                  {p === "month" ? "/ paga" : "/ év"}
                </button>
              ))}
            </div>
          </div>
          {form.period === "month" && (
            <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">
              A „/ paga" EGY kifizetést jelent — {form.pagas} ilyen van egy évben.
            </p>
          )}
        </div>

        {/* Szerződéstípus — a munkanélküli-járulék kulcsa eltér */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Szerződés típusa
          </label>
          <div className="flex gap-2">
            {(["indefinido", "temporal"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setField("contract", c)}
                className={cn(
                  "flex-1 rounded-[12px] border px-3 py-2.5 text-[13px] font-bold transition",
                  form.contract === c
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface-alt text-ink-muted",
                )}
              >
                {c === "indefinido" ? "Határozatlan" : "Határozott"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Eltartott gyerekek száma
          </label>
          <select
            value={form.children ?? 0}
            onChange={(e) => setField("children", Number(e.target.value))}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n === 4 ? "4 vagy több" : n}</option>
            ))}
          </select>
          <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">
            Spanyolországban nincs havi családi pótlék — a gyerek utáni támogatás az adóban jelenik meg.
          </p>
        </div>

        {/* Közösség — benchmark + az adókulcs figyelmeztetése */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Autonóm közösség (bér-összehasonlításhoz)
          </label>
          <select
            value={form.region}
            onChange={(e) => setField("region", e.target.value)}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {ES_REGIONS_LIST.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Eredmény */}
      <section className="space-y-3 rounded-card border-2 border-primary/20 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="text-center">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
            Becsült nettó — egy kifizetés
          </p>
          <p className="text-[34px] font-extrabold leading-none tracking-tight text-ink">
            {fmt(r.netPerPaga)}
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            ≈ {fmt(r.netYearly)} / év · levonás {r.effectiveRate.toFixed(1)}%
          </p>
        </div>

        {/* ⚠️ A 14 pagás modell fő tanulsága: a havi költségvetést NEM a
            bérpapíron látott összeggel kell tervezni. */}
        {r.pagas === 14 && (
          <div className="rounded-[10px] bg-star/10 px-3 py-2.5 text-[12px] leading-snug text-ink">
            <strong>Havi tervezéshez:</strong> {fmt(r.netMonthlyAverage)} — ennyi jut egy hónapra, ha
            a két extra fizetést is szétosztod. A bankszámládon viszont 12 hónapban{" "}
            {fmt(r.netPerPaga)} lesz, júliusban és decemberben pedig ennek a duplája.
          </div>
        )}

        <div className="flex h-3.5 overflow-hidden rounded-pill bg-surface-alt">
          <Seg value={r.netYearly} total={r.grossYearly} className="bg-primary" />
          <Seg value={r.irpfYearly} total={r.grossYearly} className="bg-accent" />
          <Seg value={r.ssYearly} total={r.grossYearly} className="bg-star" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <Legend color="bg-primary" label="Nettó / év" amount={fmt(r.netYearly)} />
          <Legend color="bg-accent" label="IRPF / év" amount={fmt(r.irpfYearly)} />
          <Legend color="bg-star" label="Seguridad Social" amount={fmt(r.ssYearly)} />
          <Legend color="bg-line" label="Bruttó / év" amount={fmt(r.grossYearly)} />
        </div>

        {/* Részletes bontás (éves) */}
        <div className="mt-1 space-y-1 rounded-[10px] bg-surface-alt px-3 py-2.5 text-[12px]">
          <Row label="Bruttó / év" value={fmt(r.grossYearly)} sign="" />
          <Row label="Seguridad Social (munkavállalói)" value={fmt(r.ssYearly)} sign="−" />
          <Row label="Munkajövedelem-kedvezmény" value={fmt(r.workReduction)} sign="+" />
          <Row label="Személyi és családi minimum" value={fmt(r.personalMinimum)} sign="+" />
          <Row label="Adóalap" value={fmt(r.taxableYearly)} sign="" />
          <Row label="IRPF (becsült)" value={fmt(r.irpfYearly)} sign="−" />
          <div className="mt-1 flex items-center justify-between border-t border-line pt-1.5">
            <span className="font-bold text-ink">Nettó / év</span>
            <span className="font-extrabold text-ink">{fmt(r.netYearly)}</span>
          </div>
        </div>

        {r.belowMinimumWage && (
          <p className="rounded-[10px] bg-accent/10 px-3 py-2 text-[11.5px] leading-snug text-accent">
            ⚠️ <strong>A megadott bér a minimálbér (SMI) alatt van.</strong> Teljes munkaidőben ez
            nem jogszerű — részmunkaidőnél viszont arányosan lehet kevesebb. Ha teljes állásról van
            szó, ellenőrizd a szerződést és a rád vonatkozó kollektív szerződést (convenio).
          </p>
        )}

        {/* ⚠️ Ez a legfontosabb korlátja a becslésnek — nem a lábjegyzetbe való. */}
        <p className="rounded-[10px] bg-primary/5 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
          ℹ️ <strong>Az IRPF fele az autonóm közösségé.</strong> Ez a becslés a referencia-kulccsal
          számol, ezért <strong>Madridban valamivel több, Katalóniában valamivel kevesebb</strong>{" "}
          nettó jön ki a valóságban. A havi levonás (retención) amúgy is csak előleg — az éves
          bevallásnál (la Renta) rendeződik a különbözet.
        </p>
      </section>

      {/* Benchmark */}
      <section className="space-y-3 rounded-card border-2 border-success/20 bg-success/5 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-success/15 text-lg">📊</span>
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Jó ez a fizetés?</h3>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          A <strong className="text-ink">{fmt(r.grossYearly / 12)}</strong> havi bruttó (az éves
          összeg tizenkettede) a(z) <strong className="text-ink">{regionName}</strong> becsült
          mediánjához (<strong className="text-ink">{fmt(median)}</strong>) képest — a becslés
          szerint az ottani keresők kb. <strong className="text-ink">{percentile}%</strong>-a keres
          ennél kevesebbet.
        </p>
        <div className="h-2.5 overflow-hidden rounded-pill bg-surface-alt">
          <div className="h-full rounded-pill bg-success" style={{ width: `${percentile}%` }} />
        </div>
      </section>

      <SalaryJobsCta country="ES" grossMonthly={r.grossYearly / 12} />

      <LegalDisclaimer
        toolName="bérkalkulátor (Spanyolország)"
        variant="legal"
        notAdviceFor="adózási vagy pénzügyi"
        extraWarning="Az eredmények BECSLÉSEK a 2025-ös IRPF-sávok és a Seguridad Social munkavállalói kulcsai alapján. ⚠️ Az IRPF egyik fele az AUTONÓM KÖZÖSSÉGEDÉ, és közösségenként eltér — a becslés a referencia-kulccsal számol, nem a lakóhelyed tényleges sávjával. A számok évente változnak (járulékplafon, minimálbér, kedvezmények). A tényleges levonást a nómina mutatja, a végleges adót pedig az éves bevallás (la Renta) állapítja meg. A pontos, rád vonatkozó összegért az Agencia Tributaria hivatalos kalkulátorát vagy egy gestoríát használd."
        officialSources={[
          { label: "Agencia Tributaria — sede electrónica", url: "https://sede.agenciatributaria.gob.es/" },
          { label: "Agencia Tributaria — la Renta", url: "https://sede.agenciatributaria.gob.es/Sede/Renta.html" },
          { label: "Seguridad Social — hivatalos portál", url: "https://www.seg-social.es/" },
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
