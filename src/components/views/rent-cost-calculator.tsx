"use client";

import { useMemo, useState } from "react";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  FLAT_SIZES,
  HEATING_TYPES,
  calculateRentCost,
  MAX_KAUTION_MONTHS,
  KAUTION_INSURANCE_RATE,
  OPPORTUNITY_COST_RATE,
  regionsFor,
  type FlatSize,
  type HeatingType,
  type Region,
} from "@/lib/rent-cost";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { RentCompare } from "@/components/views/rent-compare";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export function RentCostCalculator() {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";
  const cur = isAT ? "EUR" : "CHF";
  const regionOptions = regionsFor(isAT ? "AT" : "CH");
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [monthlyRent, setMonthlyRent] = usePersistedState("kinti_calc_rent_monthly", 1800);
  const [size, setSize] = usePersistedState<FlatSize>("kinti_calc_rent_size", "2-room");
  const [heating, setHeating] = usePersistedState<HeatingType>("kinti_calc_rent_heating", "gas");
  const [region, setRegion] = usePersistedState<Region>("kinti_calc_rent_region", "city-zh");
  // Ha a mentett régió másik országé, az aktuális ország első régióját használjuk.
  const effectiveRegion = regionOptions.some((r) => r.id === region) ? region : regionOptions[0].id;
  const [acontoNebenkosten, setAcontoNebenkosten] = usePersistedState("kinti_calc_rent_aconto", 180);
  const [years, setYears] = usePersistedState("kinti_calc_rent_years", 3);

  const result = useMemo(
    () =>
      calculateRentCost({
        monthlyRentChf: monthlyRent,
        size,
        heating,
        region: effectiveRegion,
        acontoNebenkostenChf: acontoNebenkosten,
        yearsToCalculate: years,
      }),
    [monthlyRent, size, heating, effectiveRegion, acontoNebenkosten, years],
  );

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🏠</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Bérlés rejtett-költség BECSLŐ
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              <strong className="text-ink">{isAT ? "Kaution" : "Mietkaution"}</strong> blokkolása + <strong className="text-ink">{isAT ? "Betriebskosten" : "Nebenkosten"}</strong> év végi
              elszámolás tájékoztató becsléssel. NEM jogi vagy pénzügyi tanács.
            </p>
          </div>
        </div>
      </section>

      {/* Mód-váltó: egy lakás részletesen / két lakás összehasonlítása */}
      <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-surface-alt/60 p-1">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={cn(
            "rounded-pill px-3 py-2 text-[13px] font-bold transition",
            mode === "single" ? "bg-primary text-white shadow-card" : "text-ink-muted",
          )}
        >
          Egy lakás
        </button>
        <button
          type="button"
          onClick={() => setMode("compare")}
          className={cn(
            "rounded-pill px-3 py-2 text-[13px] font-bold transition",
            mode === "compare" ? "bg-primary text-white shadow-card" : "text-ink-muted",
          )}
        >
          2 lakás összevetése
        </button>
      </div>

      {mode === "compare" && <RentCompare />}

      {mode === "single" && (
      <>
      {/* 1. Bérleti díj */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          1. Havi bérleti díj (kalt, Nebenkosten nélkül)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={500}
            max={5000}
            step={50}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <input
            type="number"
            min={0}
            max={20000}
            step={50}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Math.max(0, Number(e.target.value)))}
            className="w-24 rounded-[10px] border border-line bg-surface-alt px-2 py-1 text-[14px] font-bold text-ink text-right outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-[11px] font-bold text-ink-muted">{cur}</span>
        </div>
      </section>

      {/* 2. Lakás méret */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          2. Lakás méret
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FLAT_SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSize(s.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[12px] border-2 p-2 transition active:scale-95",
                size === s.id ? "border-primary bg-primary-soft" : "border-line bg-surface",
              )}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-[11.5px] font-bold text-ink">{s.label}</span>
              <span className="text-[10.5px] text-ink-faint">{s.m2Min}-{s.m2Max} m²</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Fűtés-típus */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          3. Fűtés-típus
        </label>
        <div className="grid grid-cols-3 gap-2">
          {HEATING_TYPES.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHeating(h.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[10px] border-2 p-2 transition active:scale-95",
                heating === h.id ? "border-primary bg-primary-soft" : "border-line bg-surface",
              )}
            >
              <span className="text-xl">{h.emoji}</span>
              <span className="text-[11.5px] font-bold text-ink">{h.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Régió */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          4. Régió
        </label>
        <div className="grid grid-cols-2 gap-2">
          {regionOptions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegion(r.id)}
              className={cn(
                "flex items-center gap-2 rounded-[10px] border-2 p-2.5 transition active:scale-95",
                effectiveRegion === r.id ? "border-primary bg-primary-soft" : "border-line bg-surface",
              )}
            >
              <span className="text-lg">{r.emoji}</span>
              <span className="text-[12px] font-bold text-ink text-left">{r.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Akontó Nebenkosten */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          5. Akontó Nebenkosten (havi, ahogy a szerződésben)
        </label>
        <p className="mb-2 text-[11.5px] leading-snug text-ink-faint">
          A bérleti szerződésben általában külön szerepel: pl. „Mietzins 1800 + NK 180".
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={600}
            step={10}
            value={acontoNebenkosten}
            onChange={(e) => setAcontoNebenkosten(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <input
            type="number"
            min={0}
            max={2000}
            value={acontoNebenkosten}
            onChange={(e) => setAcontoNebenkosten(Math.max(0, Number(e.target.value)))}
            className="w-24 rounded-[10px] border border-line bg-surface-alt px-2 py-1 text-[14px] font-bold text-ink text-right outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-[11px] font-bold text-ink-muted">{cur}</span>
        </div>
      </section>

      {/* 6. Évek */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          6. Hány évre kalkulálsz? <span className="text-ink">{years} év</span>
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

      {/* ========== EREDMÉNYEK ========== */}

      {/* Kaúció kártya */}
      <section className="rounded-card border-2 border-[#9b59b6]/40 bg-gradient-to-br from-[#fdf4ff] to-surface p-5 shadow-pop">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">🔒</span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9b59b6]">
              {isAT ? "Kaution (kaúció)" : "Mietkaution (kaúció) — OR 257e §"}
            </p>
            <h2 className="text-[16px] font-extrabold text-ink">
              {isAT ? `Általában ${MAX_KAUTION_MONTHS} havi bruttó bérleti díj` : `Max ${MAX_KAUTION_MONTHS} havi nettó bérleti díj`}
            </h2>
          </div>
        </div>

        <div className="space-y-2">
          <ResultRow
            label="Kaúció összege"
            value={`${result.kautionAmount.toLocaleString("hu-HU")} ${cur}`}
            sub={`${monthlyRent} ${cur} × ${MAX_KAUTION_MONTHS} hó (${isAT ? "Sparbuch/letéti számla" : "kötött Mietkautionskonto"})`}
          />
          <ResultRow
            label="Évi rejtett költség (opportunity)"
            value={`-${Math.round(result.kautionOpportunityCostPerYear).toLocaleString("hu-HU")} ${cur}`}
            sub={`${(OPPORTUNITY_COST_RATE * 100).toFixed(0)}% hozam-elmaradás (ETF/befektetés helyett kötött számla)`}
            negative
          />
          {isAT ? (
            <ResultRow
              label="Provision (ingatlanos jutalék, ha van)"
              value={`${(monthlyRent * 2).toLocaleString("hu-HU")} ${cur}`}
              sub="Max 2 havi bruttó bérleti díj + ÁFA — EGYSZERI költség, ha ingatlanoson keresztül bérelsz. Sok hirdetés provisionsfrei (jutalékmentes)."
              negative
            />
          ) : (
            <ResultRow
              label="Kaúció-biztosítás alternatíva"
              value={`-${Math.round(result.insurancePremiumPerYear).toLocaleString("hu-HU")} ${cur}/év`}
              sub={`${(KAUTION_INSURANCE_RATE * 100).toFixed(0)}% éves díj (nem ad vissza pénzt — pl. SwissCaution, SmartCaution)`}
              negative
            />
          )}
        </div>

        <div className="mt-3 rounded-[10px] bg-white/60 px-3 py-2 text-[11.5px] leading-relaxed text-ink">
          💡 <strong>Tipp:</strong> {isAT
            ? "a kaúciót a bérbeadó köteles kamatozó számlán (Sparbuch) tartani, és kiköltözéskor kamatostul visszaadni. Keress provisionsfrei (jutalékmentes) hirdetést — így megspórolod a 2 havi Provisiont."
            : "ha hosszú távra (5+ év) maradnál, a készpénz-kaúció jobb (visszakapod). Rövid távra (1-2 év) vagy ha nincs likviditásod, a Mietkautionsversicherung megoldás lehet — de az éves díj „elveszett” pénz."}
        </div>
      </section>

      {/* Nebenkosten kártya */}
      <section className="rounded-card border-2 border-[#e3a233]/40 bg-[#fff8ed] p-5 shadow-pop">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">🌡️</span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9a6b00]">
              {isAT ? "Betriebskosten" : "Nebenkosten"} (rezsi) év végi elszámolás
            </p>
            <h2 className="text-[16px] font-extrabold text-ink">
              {result.settlementDirection === "underpaid"
                ? "Várhatóan utánfizetés"
                : result.settlementDirection === "overpaid"
                ? "Várhatóan visszatérítés"
                : "Akontó nagyjából lefedi"}
            </h2>
          </div>
        </div>

        <div className="space-y-2">
          <ResultRow
            label={`Becsült tényleges éves ${isAT ? "Betriebskosten" : "Nebenkosten"}`}
            value={`${result.estimatedActualNebenkostenPerYear.toLocaleString("hu-HU")} ${cur}`}
            sub="Becslés a méret, fűtés-típus és régió alapján — a tényleges szerződéstől függ."
          />
          <ResultRow
            label="Akontó éves összege"
            value={`${result.acontoNebenkostenPerYear.toLocaleString("hu-HU")} ${cur}`}
            sub={`${acontoNebenkosten} ${cur}/hó × 12`}
          />
          <div className="border-t border-current/20 pt-2">
            <ResultRow
              label={
                result.settlementDirection === "underpaid"
                  ? "Várt utánfizetés (NK-elszámoláskor)"
                  : result.settlementDirection === "overpaid"
                  ? "Várt visszatérítés (NK-elszámoláskor)"
                  : "Különbség"
              }
              value={`${result.nebenkostenSettlementPerYear > 0 ? "-" : "+"}${Math.abs(result.nebenkostenSettlementPerYear).toLocaleString("hu-HU")} ${cur}/év`}
              sub="Pozitív különbség (utánfizetés) — emeld az akontót a következő évre, hogy ne kelljen egyszerre kifizetni."
              negative={result.nebenkostenSettlementPerYear > 0}
            />
          </div>
        </div>

        <div className="mt-3 rounded-[10px] bg-white/60 px-3 py-2 text-[11.5px] leading-relaxed text-ink">
          💡 <strong>Tipp:</strong> a bérleti szerződésben mindig kérd a Nebenkosten-tételek
          <strong> részletes bontását</strong> (Heizung, Warmwasser, Hauswart, Allgemeinstrom stb.).
          Túl alacsony akontó = nagy utánfizetés-meglepetés; túl magas akontó = a pénzed nem
          kamatozik egész évben.
        </div>
      </section>

      {/* Összesítő */}
      <section className="rounded-card border-2 border-primary/40 bg-primary-soft p-5 shadow-pop">
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-2">
          Teljes éves lakhatási költség (becsült)
        </p>
        <p className="text-[32px] font-extrabold leading-none text-ink">
          {result.firstYearTotalCost.toLocaleString("hu-HU")} {cur}
        </p>
        <p className="mt-1 text-[11.5px] text-ink-muted">
          Bér + akontó + opportunity + várható elszámolás (1. év)
        </p>

        <div className="mt-4 border-t border-primary/30 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-1">
            Teljes rejtett költség {years} év alatt
          </p>
          <p className="text-[24px] font-extrabold leading-none text-accent">
            {Math.round(result.totalHiddenCostOverPeriod).toLocaleString("hu-HU")} {cur}
          </p>
          <p className="mt-1 text-[11.5px] text-ink-muted">
            Csak az opportunity + utánfizetés-kockázat — a bért nem tartalmazza
          </p>
        </div>
      </section>

      {/* Tippek-szekció */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-2.5">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          📋 Mit kérdezz a bérléskor?
        </h3>
        <ul className="space-y-1.5 text-[12px] leading-relaxed text-ink-muted">
          {isAT ? (
            <>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Kaution-számla (Sparbuch):</strong> a kaúciót a bérbeadó
                köteles a TE nevedre, kamatozó számlán tartani — kiköltözéskor kamatostul jár vissza.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Betriebskosten-tételek bontása</strong> a szerződésben. Ha
                csak „BK 180 EUR" áll, kérd a részletezést.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Provisionsfrei (jutalékmentes)</strong> hirdetést keress —
                így megspórolod a max 2 havi ingatlanos-jutalékot (Provision).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Richtwert / Mietzinsobergrenze:</strong> régi (Altbau)
                lakásnál törvényi felső díjhatár lehet. Vita esetén: Arbeiterkammer (AK) vagy Mietervereinigung.</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Mietkautionskonto neve:</strong> melyik banknál vezeti? (A te
                nevedre kell, nem a bérbeadóéra.)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">NK-tételek részletes bontása</strong> a szerződésben. Ha
                csak „NK 180 CHF" áll, kérd a részletezést.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Mietzinsreduktion</strong> a hivatalos referencia-kamatláb
                csökkenésekor — a bérlő kérheti.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span><strong className="text-ink">Kiköltözéskor:</strong> a kaúciót a bérbeadó max 30-60 nap
                múlva köteles felszabadítani, a végszámla után. Ha vita van: Mieterverband segít.</span>
              </li>
            </>
          )}
        </ul>
      </section>
      </>
      )}

      {/* Disclaimer */}
      <LegalDisclaimer
        toolName="lakásbérlés rejtett-költség becslő"
        variant="legal"
        notAdviceFor="jogi, pénzügyi vagy ingatlan"
        extraWarning={isAT
          ? "A Betriebskosten-becslés átlagos adatokat használ — a TE konkrét lakásod tényleges költsége jelentősen eltérhet a fűtés-állapottól és szokásoktól. Az 'opportunity cost' feltételezett 4% éves hozam alapján — befektetési tanácsnak NEM minősül. A Provision/Kaution/Richtwert szabályok időben változnak; bérleti vita esetén fordulj az Arbeiterkammer-hez (AK) vagy a Mietervereinigung-hoz."
          : "A Nebenkosten-becslés átlagos svájci adatokat használ (32 CHF/m²/év alaprátával) — a TE konkrét lakásod tényleges költsége jelentősen eltérhet a fűtés-állapottól, lakói szokásoktól, télies időjárástól. Az 'opportunity cost' számítás feltételezett 4% éves hozam alapján — befektetési tanácsnak NEM minősül. Bérleti vita vagy elszámolás-kifogás esetén fordulj a kantoni Mieterverband-hoz vagy szakképzett bérleti-jogászhoz."}
        officialSources={isAT ? [
          { label: "Arbeiterkammer (AK) — Wohnen/Miete", url: "https://www.arbeiterkammer.at/" },
          { label: "Mietervereinigung", url: "https://mietervereinigung.at/" },
          { label: "oesterreich.gv.at — Wohnen", url: "https://www.oesterreich.gv.at/themen/bauen_wohnen_und_umwelt.html" },
        ] : [
          { label: "Mieterverband (mv.ch)", url: "https://www.mieterverband.ch/" },
          { label: "ch.ch — Bérlés", url: "https://www.ch.ch/de/wohnen/" },
          { label: "OR 257e § (kaúció)", url: "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_257_e" },
        ]}
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  sub,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  negative?: boolean;
}) {
  return (
    <div className="rounded-[10px] bg-white/60 px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-bold text-ink">{label}</span>
        <span className={cn("text-[14px] font-extrabold whitespace-nowrap", negative ? "text-accent" : "text-ink")}>
          {value}
        </span>
      </div>
      {sub && (
        <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{sub}</p>
      )}
    </div>
  );
}
