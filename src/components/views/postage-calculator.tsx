"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  calculatePostage,
  CH_LETTER,
  CH_PARCEL,
  INTL_LETTER,
  INTL_PARCEL,
} from "@/lib/swiss-post-rates";
import type { Destination, ItemType, ServiceLevel } from "@/lib/swiss-post-rates";

// ---------------------------------------------------------------------------
// Súlysúgó – tipikus tárgyak tömege
// ---------------------------------------------------------------------------
const WEIGHT_HINTS: Record<ItemType, { label: string; weightG: number }[]> = {
  letter: [
    { label: "Normál levél (A4, 1 lap)", weightG: 20 },
    { label: "Közepes levél (3-4 lap)", weightG: 50 },
    { label: "Vastag levél / dokumentumok", weightG: 100 },
    { label: "A4 boríték (többoldalas)", weightG: 250 },
    { label: "Nagy boríték / katalógus", weightG: 500 },
    { label: "Vastag katalógus", weightG: 900 },
  ],
  parcel: [
    { label: "Kis doboz / könyv", weightG: 500 },
    { label: "Közepes csomag (2-3 könyv)", weightG: 1500 },
    { label: "Cipősdoboz méretű csomag", weightG: 3000 },
    { label: "Nagyobb doboz", weightG: 7000 },
    { label: "Nehéz csomag", weightG: 15000 },
    { label: "Maximális csomag (30 kg)", weightG: 29000 },
  ],
};

// ---------------------------------------------------------------------------
// Segédfüggvények
// ---------------------------------------------------------------------------
function formatWeight(g: number): string {
  if (g < 1000) return `${g} g`;
  const kg = g / 1000;
  return kg === Math.floor(kg) ? `${kg} kg` : `${kg.toFixed(1)} kg`;
}

function fmtPrice(chf: number): string {
  return chf.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Főkomponens
// ---------------------------------------------------------------------------
export function PostageCalculator() {
  const [itemType, setItemType] = useState<ItemType>("letter");
  const [destination, setDestination] = useState<Destination>("ch");
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>("priority");
  const [weightG, setWeightG] = useState(100);
  const [rawInput, setRawInput] = useState("100");

  // Súly korlátai a típus alapján
  const maxWeight = itemType === "letter" ? 2000 : 30000;
  const minWeight = 1;

  // Számítás
  const result = useMemo(
    () => calculatePostage(itemType, weightG, destination, serviceLevel),
    [itemType, weightG, destination, serviceLevel],
  );

  // Típusváltáskor súly visszaállítása értékes alapértékre
  function switchItemType(t: ItemType) {
    setItemType(t);
    const def = t === "letter" ? 100 : 2000;
    setWeightG(def);
    setRawInput(String(def));
  }

  function handleWeightInput(raw: string) {
    setRawInput(raw);
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= minWeight && n <= maxWeight) {
      setWeightG(n);
    }
  }

  function applyHint(g: number) {
    setWeightG(Math.min(g, maxWeight));
    setRawInput(String(Math.min(g, maxWeight)));
  }

  // Teljes díjszabás táblázathoz
  const allRates = useMemo(() => {
    const rateTable =
      itemType === "letter"
        ? destination === "ch"
          ? CH_LETTER
          : INTL_LETTER[destination as "eu" | "world"]
        : destination === "ch"
        ? CH_PARCEL
        : INTL_PARCEL[destination as "eu" | "world"];
    return [
      { level: "priority" as ServiceLevel, rate: rateTable.priority },
      { level: "economy" as ServiceLevel, rate: rateTable.economy },
    ];
  }, [itemType, destination]);

  return (
    <div className="space-y-4">
      {/* Swiss Post info sáv */}
      <div className="flex items-center gap-3 rounded-2xl bg-[#FFCC00]/15 border border-[#FFCC00]/40 px-4 py-3">
        <span className="text-2xl shrink-0">🇨🇭</span>
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-wider text-[#8a6f00]">Swiss Post</p>
          <p className="text-[11px] text-ink-muted leading-snug">
            2025-ös hivatalos díjszabás alapján — API hívás nélkül, azonnal
          </p>
        </div>
      </div>

      {/* 1. lépés: Mit küldesz? */}
      <Card title="1. Mit küldesz?" icon="📬">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { type: "letter", label: "Levél / Boríték", emoji: "✉️", sub: "max. 2 kg" },
              { type: "parcel", label: "Csomag / Doboz", emoji: "📦", sub: "max. 30 kg" },
            ] as { type: ItemType; label: string; emoji: string; sub: string }[]
          ).map(({ type, label, emoji, sub }) => (
            <button
              key={type}
              type="button"
              onClick={() => switchItemType(type)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[16px] border px-4 py-4 transition active:scale-[0.98]",
                itemType === type
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "border-line bg-surface-alt hover:bg-surface",
              )}
            >
              <span className="text-3xl">{emoji}</span>
              <span className={cn("text-[13.5px] font-extrabold", itemType === type ? "text-primary" : "text-ink")}>
                {label}
              </span>
              <span className="text-[10.5px] text-ink-muted">{sub}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 2. lépés: Hová? */}
      <Card title="2. Hová küldöd?" icon="📍">
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { dest: "ch",    label: "Svájcon belül",  flag: "🇨🇭" },
              { dest: "eu",    label: "Európa",         flag: "🇪🇺" },
              { dest: "world", label: "Világ",          flag: "🌍" },
            ] as { dest: Destination; label: string; flag: string }[]
          ).map(({ dest, label, flag }) => (
            <button
              key={dest}
              type="button"
              onClick={() => setDestination(dest)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[14px] border py-3 text-center transition active:scale-[0.98]",
                destination === dest
                  ? "border-primary/50 bg-primary/10"
                  : "border-line bg-surface-alt hover:bg-surface",
              )}
            >
              <span className="text-2xl">{flag}</span>
              <span className={cn("text-[11px] font-bold leading-tight", destination === dest ? "text-primary" : "text-ink")}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* 3. lépés: Szolgáltatás */}
      <Card title="3. Sebesség" icon="⚡">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setServiceLevel("priority")}
            className={cn(
              "rounded-[14px] border px-3 py-3 text-left transition active:scale-[0.98]",
              serviceLevel === "priority"
                ? "border-[#dc2626]/40 bg-[#dc2626]/10"
                : "border-line bg-surface-alt hover:bg-surface",
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
              <span className={cn("text-[12.5px] font-extrabold", serviceLevel === "priority" ? "text-[#dc2626]" : "text-ink")}>
                A-Post / Priority
              </span>
            </div>
            <p className="text-[10.5px] text-ink-muted">
              {destination === "ch" ? "Másnap kézbesítés" : destination === "eu" ? "3–5 munkanap" : "5–10 munkanap"}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setServiceLevel("economy")}
            className={cn(
              "rounded-[14px] border px-3 py-3 text-left transition active:scale-[0.98]",
              serviceLevel === "economy"
                ? "border-[#2563eb]/40 bg-[#2563eb]/10"
                : "border-line bg-surface-alt hover:bg-surface",
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
              <span className={cn("text-[12.5px] font-extrabold", serviceLevel === "economy" ? "text-[#2563eb]" : "text-ink")}>
                B-Post / Economy
              </span>
            </div>
            <p className="text-[10.5px] text-ink-muted">
              {destination === "ch" ? "2–3 munkanap" : destination === "eu" ? "5–10 munkanap" : "10–20 munkanap"}
            </p>
          </button>
        </div>
      </Card>

      {/* 4. lépés: Súly */}
      <Card title="4. Tömeg" icon="⚖️">
        <div className="space-y-3">
          {/* Számszerű bevitel + formázott érték */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-[12px] border border-line bg-surface-alt focus-within:ring-2 focus-within:ring-primary/30 px-3">
              <input
                type="number"
                inputMode="numeric"
                min={minWeight}
                max={maxWeight}
                value={rawInput}
                onChange={(e) => handleWeightInput(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-bold text-ink outline-none"
              />
              <span className="text-[12.5px] font-bold text-ink-muted shrink-0">g</span>
            </div>
            <span className="text-[13px] font-bold text-ink-muted w-[52px] text-right">
              {formatWeight(weightG)}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={minWeight}
            max={maxWeight}
            step={itemType === "letter" ? 10 : 100}
            value={weightG}
            onChange={(e) => {
              const v = Number(e.target.value);
              setWeightG(v);
              setRawInput(String(v));
            }}
            className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
          />

          {/* Gyors súly-sugók */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint">
              Tipikus tárgyak
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WEIGHT_HINTS[itemType].map((h) => (
                <button
                  key={h.weightG}
                  type="button"
                  onClick={() => applyHint(h.weightG)}
                  className={cn(
                    "inline-flex items-center rounded-pill border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95",
                    weightG === h.weightG
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-line bg-surface text-ink-muted hover:bg-surface-alt",
                  )}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* EREDMÉNY */}
      {"error" in result ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 text-center">
          <p className="text-[13px] font-semibold text-accent">{result.error}</p>
        </div>
      ) : (
        <div
          className="rounded-[22px] p-5 text-white shadow-pop"
          style={{ background: `linear-gradient(135deg, ${result.accentColor}, ${result.accentColor}cc)` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
            Becsült postaköltség
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[46px] font-black leading-none tracking-tight">
              {fmtPrice(result.priceCHF)}
            </span>
            <span className="text-[22px] font-bold opacity-80">CHF</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-bold">
              {result.serviceHU}
            </span>
            <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-bold">
              🕐 {result.deliveryDays}
            </span>
            <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-bold">
              ⚖️ {result.weightLabel}
            </span>
          </div>
        </div>
      )}

      {/* Teljes díjtáblázat */}
      <details className="group rounded-2xl border border-line bg-surface overflow-hidden">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-bold text-ink list-none">
          <span className="flex items-center gap-2">
            <Icon name="filter" size={14} strokeWidth={2.2} className="text-primary" />
            Teljes díjtáblázat
          </span>
          <Icon name="chevD" size={14} strokeWidth={2.2} className="text-ink-muted transition group-open:rotate-180" />
        </summary>
        <div className="px-4 pb-4 space-y-3">
          {allRates.map(({ level, rate }) => (
            <div key={level}>
              <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: rate.accentColor }}
                />
                {rate.serviceHU}
              </p>
              <div className="rounded-[12px] border border-line overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-surface-alt">
                      <th className="px-3 py-1.5 text-left font-bold text-ink-muted">Súly</th>
                      <th className="px-3 py-1.5 text-right font-bold text-ink-muted">Ár (CHF)</th>
                      <th className="px-3 py-1.5 text-right font-bold text-ink-muted">Kézbesítés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rate.tiers.map((tier, i) => (
                      <tr
                        key={i}
                        className={cn(
                          "border-t border-line",
                          weightG <= tier.maxWeightG &&
                            (i === 0 || weightG > rate.tiers[i - 1].maxWeightG) &&
                            level === serviceLevel
                            ? "bg-primary/8 font-bold"
                            : "",
                        )}
                      >
                        <td className="px-3 py-1.5 text-ink">{tier.label}</td>
                        <td className="px-3 py-1.5 text-right font-bold text-ink">
                          {fmtPrice(tier.priceCHF)}
                        </td>
                        <td className="px-3 py-1.5 text-right text-ink-muted">{rate.deliveryDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Jogi megjegyzés */}
      <div className="rounded-[14px] border border-line/60 bg-surface-alt px-4 py-3 text-[11px] leading-relaxed text-ink-faint">
        <strong className="text-ink-muted">ⓘ Megjegyzés:</strong> A díjak a Swiss Post 2025. január 1-jén életbe lépett
        hivatalos díjszabásán alapulnak. Az árakat a{" "}
        <a
          href="https://www.post.ch/en/sending-letters/rates-and-conditions/postage-calculator"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary"
        >
          post.ch kalkulátorán
        </a>{" "}
        is ellenőrizheted. A Swiss Post nyilvános, hitelesítés nélküli árszámító API-t nem biztosít.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segéd-komponensek
// ---------------------------------------------------------------------------
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-line bg-surface p-4 shadow-card">
      <h2 className="mb-3 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-ink-muted">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
