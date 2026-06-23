"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  ROADS,
  calculateFine,
  calculateFineAT,
  type RoadType,
  type FineResult,
} from "@/lib/speeding-fine";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

const SEVERITY_META: Record<FineResult["severity"], { label: string; color: string; emoji: string }> = {
  "no-fine":       { label: "Nincs büntetés",         color: "#16a34a", emoji: "✅" },
  "ordnungsbusse": { label: "Ordnungsbusse (fix)",    color: "#3a6ea5", emoji: "📋" },
  "mittelschwer":  { label: "Közepes súlyú",          color: "#e3a233", emoji: "⚠️" },
  "schwer":        { label: "Súlyos",                  color: "#dc2626", emoji: "🚨" },
  "raser":         { label: "Raserdelikt (bűncs.)",   color: "#7f1d1d", emoji: "🚔" },
};

/** Osztrák súlyossági címkék (a szín/emoji közös, csak a felirat tér el). */
const AT_LABELS: Record<FineResult["severity"], string> = {
  "no-fine":       "Nincs büntetés",
  "ordnungsbusse": "Organmandat / Strafe",
  "mittelschwer":  "Führerscheinentzug",
  "schwer":        "Súlyos (3 hó entzug)",
  "raser":         "Extrém — „Rasen”",
};

export function SpeedingCalculator() {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";
  const cur = isAT ? "EUR" : "CHF";
  const [roadType, setRoadType] = useState<RoadType>("highway");
  const [speedLimit, setSpeedLimit] = useState(120);
  const [actualSpeed, setActualSpeed] = useState(135);
  const [monthlyIncome, setMonthlyIncome] = useState(5500);

  const road = ROADS.find((r) => r.type === roadType)!;

  const result = useMemo(
    () =>
      isAT
        ? calculateFineAT({ roadType, speedLimit, actualSpeed })
        : calculateFine({
            roadType,
            speedLimit,
            actualSpeed,
            monthlyNetIncomeChf: monthlyIncome,
          }),
    [isAT, roadType, speedLimit, actualSpeed, monthlyIncome],
  );

  function changeRoadType(t: RoadType) {
    const r = ROADS.find((x) => x.type === t)!;
    setRoadType(t);
    setSpeedLimit(r.defaultSpeedLimit);
    // Auto-állítás: az aktuális sebesség kicsit a limit fölé
    setActualSpeed(r.defaultSpeedLimit + 15);
  }

  const meta = SEVERITY_META[result.severity];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🚓</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Gyorshajtás bírság-BECSLŐ
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {isAT ? (
                <>Tájékoztató becslés a publikus osztrák szabályok (StVO / FSG) alapján. <strong className="text-ink">NEM hivatalos büntetés-megállapítás</strong> — a tényleges szankciót a hatóság (Bezirkshauptmannschaft / LPD) szabja meg.</>
              ) : (
                <>Tájékoztató becslés a publikus svájci szabályok (OBV 2026) alapján. <strong className="text-ink">NEM hivatalos büntetés-megállapítás</strong> — a tényleges szankciót minden esetben a kantoni hatóság szabja meg.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Road type */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          1. Hol történt?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROADS.map((r) => (
            <button
              key={r.type}
              type="button"
              onClick={() => changeRoadType(r.type)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[12px] border-2 px-2 py-3 transition active:scale-95",
                roadType === r.type ? "border-primary bg-primary-soft" : "border-line bg-surface",
              )}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-[11px] font-bold text-ink text-center leading-tight">
                {r.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Megengedett:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {road.speedLimits.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeedLimit(s)}
                className={cn(
                  "rounded-pill px-3 py-1 text-[12px] font-bold transition",
                  speedLimit === s
                    ? "bg-primary text-white shadow-card"
                    : "border border-line bg-surface text-ink-muted",
                )}
              >
                {s} km/h
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Actual speed slider */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          2. Hány km/h-val haladtál?
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={speedLimit}
            max={speedLimit + 100}
            step={1}
            value={actualSpeed}
            onChange={(e) => setActualSpeed(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <div className="min-w-[5rem] text-right">
            <div className="text-[24px] font-extrabold leading-none text-primary">{actualSpeed}</div>
            <div className="text-[11px] font-bold uppercase text-ink-faint">km/h</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11.5px] text-ink-muted">
          <span>Limit: {speedLimit} km/h</span>
          <span className="font-bold">
            Túllépés: +{actualSpeed - speedLimit} km/h
            <span className="text-ink-faint ml-1">(−5 tolerancia)</span>
          </span>
        </div>
      </section>

      {/* Income — csak CH (Ausztriában a bírság NEM jövedelem-arányos) */}
      {!isAT && (
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          3. Havi nettó jövedelem (CHF)
        </label>
        <p className="mb-3 text-[11.5px] leading-snug text-ink-faint">
          A büntetőeljárásnál a bírság jövedelem-arányos. Csak akkor releváns, ha közepes vagy súlyos a túllépés.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2000}
            max={15000}
            step={100}
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <input
            type="number"
            min={0}
            max={50000}
            value={monthlyIncome || ""}
            onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
            className="w-20 rounded-[8px] border border-line bg-surface-alt px-2 py-1 text-[13px] font-bold text-ink text-right outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-[11px] font-bold text-ink-muted">CHF</span>
        </div>
      </section>
      )}

      {/* Eredmény */}
      <section
        className="rounded-card border-2 p-5 shadow-pop"
        style={{ backgroundColor: meta.color + "14", borderColor: meta.color + "66" }}
      >
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">{meta.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
              {isAT ? AT_LABELS[result.severity] : meta.label}
            </p>
            <h2 className="mt-1 text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              {result.severity === "no-fine"
                ? "Rendben — nincs büntetés"
                : `~ ${result.estimatedFineChf.toLocaleString("hu-HU")} ${cur} bírság`}
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink">
              {result.description}
            </p>

            {result.daysOfFine && result.tagessatzChf && (
              <div className="mt-3 rounded-[10px] bg-white/60 px-3 py-2 text-[11.5px]">
                <strong className="text-ink">{result.daysOfFine} napi pénz</strong> × {result.tagessatzChf} CHF =
                <strong> {result.estimatedFineChf.toLocaleString("hu-HU")} CHF</strong>
              </div>
            )}
          </div>
        </div>

        {/* Konsequencák */}
        {(result.licenseSuspension || result.prisonInfo) && (
          <div className="mt-4 space-y-2 border-t border-current/20 pt-4">
            {result.licenseSuspension && (
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">🪪</span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                    Jogosítvány-bevonás
                  </p>
                  <p className="text-[13px] font-bold text-ink">{result.licenseSuspension}</p>
                </div>
              </div>
            )}
            {result.prisonInfo && (
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">⛓️</span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                    Börtön
                  </p>
                  <p className="text-[13px] font-bold text-ink">{result.prisonInfo}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {result.legalNote && (
          <p className="mt-3 text-[11px] leading-snug text-ink-muted italic">
            ⓘ {result.legalNote}
          </p>
        )}
      </section>

      {/* Számítás-info */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h3 className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Hogyan számolódik?
        </h3>
        <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-ink-muted">
          {isAT ? (
            <>
              <li>
                <strong className="text-ink">Mért sebesség − ~5 km/h tolerancia</strong> = tényleges túllépés.
              </li>
              <li>
                <strong className="text-ink">Organmandat / Strafverfügung</strong>: fix pénzbírság kis-közepes
                túllépésnél, jogosítvány-következmény nélkül. A bírság NEM jövedelem-arányos.
              </li>
              <li>
                <strong className="text-ink">Führerscheinentzug</strong>: innerorts +40 / außerorts +50 km/h
                fölött kötelező jogosítvány-bevonás + Vormerkung (min. 2 hét – 1 hónap, súlyosabbnál 3 hónap).
              </li>
              <li>
                <strong className="text-ink">„Rasen” (2024)</strong>: extrém túllépésnél (innerorts +80 /
                außerorts +90 km/h fölött) a jármű lefoglalható, sőt elkobozható.
              </li>
            </>
          ) : (
            <>
              <li>
                <strong className="text-ink">Mért sebesség − 5 km/h Messtoleranz</strong> = tényleges túllépés.
              </li>
              <li>
                <strong className="text-ink">Ordnungsbusse</strong> (fix bírság): kis túllépés. Nincs jogi
                következmény, nincs jogosítvány-bevonás.
              </li>
              <li>
                <strong className="text-ink">Mittelschwer / Schwer</strong>: büntetőeljárás. A bírság a Tagessatz
                (havi nettó × 12 / 360) × napi-pénz száma.
              </li>
              <li>
                <strong className="text-ink">Raserdelikt</strong>: rendkívüli túllépés (városban +50, autópályán
                +80 km/h fölött) — bűncselekmény, börtön kötelező.
              </li>
            </>
          )}
        </ul>
      </section>

      {/* Egységes jogi disclaimer */}
      <LegalDisclaimer
        toolName="gyorshajtás bírság-becslő"
        variant="legal"
        notAdviceFor="jogi vagy büntetőjogi"
        extraWarning={isAT
          ? "A tényleges büntetést a hatóság (Bezirkshauptmannschaft / LPD) szabja meg, az enyhítő/súlyosító körülmények (visszaesés, Vormerkung, baleset, alkohol) figyelembevételével. A sávok tájékoztató jellegűek és időben változnak. Az eszköz NEM helyettesít ügyvédet."
          : "A tényleges büntetést a kantoni hatóság szabja meg, figyelembe véve enyhítő/súlyosító körülményeket (visszaesés, próbaidő, baleset, alkohol). Az eszköz NEM helyettesít ügyvédet — büntetőeljárás esetén fordulj ügyvédhez."}
        officialSources={isAT ? [
          { label: "oesterreich.gv.at — Strassenverkehr", url: "https://www.oesterreich.gv.at/themen/freizeit_und_strassenverkehr.html" },
          { label: "RIS — StVO / FSG", url: "https://www.ris.bka.gv.at/" },
        ] : [
          { label: "ASTRA — Strassen", url: "https://www.astra.admin.ch/" },
          { label: "OBV — Ordnungsbussenverordnung", url: "https://www.fedlex.admin.ch/eli/cc/2019/729/de" },
        ]}
      />
    </div>
  );
}
