"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  TARIF_SYSTEMS,
  TICKET_TYPES,
  MOBILE_APPS,
  TRANSPORT_TIPS,
  calculateGaVsHalbtax,
} from "@/lib/transport";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export function TransportGuide() {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🚆</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Svájci Tömegközlekedés
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Zóna-rendszerek (SBB, ZVV, Libero), jegy-típusok, mobil-appok és GA vs Halbtax kalkulátor — egyszerűen elmagyarázva.
            </p>
          </div>
        </div>
      </section>

      {/* Hogyan működik a zóna-rendszer */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <h2 className="text-[14px] font-extrabold text-ink flex items-center gap-1.5">
          📍 Hogy működik a zóna-rendszer?
        </h2>
        <div className="space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
          <p>
            Svájc tömegközlekedési rendszere <strong className="text-ink">zónákra</strong> van osztva.
            Egy jegy a zónák számától függ — minél több zónán mész át, annál drágább.
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Minden nagy régiónak van saját <strong className="text-ink">Tarifverbund-ja</strong> (tarif-szövetség).</li>
            <li>Egy jegyen belül szabadon átszállhatsz vonatra, buszra, villamosra.</li>
            <li>Az országos SBB-vonatokra <strong className="text-ink">külön jegy</strong> kell — ezeket a zónarendszer NEM fedi.</li>
            <li>Mobil-app (FAIRTIQ, SBB Mobile) az utazás alapján a tipikusan kedvező jegytípust választja.</li>
          </ul>
        </div>
      </section>

      {/* Tarif-szövetségek */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          🗺️ Fő Tarif-szövetségek
        </h2>
        {TARIF_SYSTEMS.map((s) => (
          <TarifCard key={s.id} system={s} />
        ))}
      </section>

      {/* Jegy-típusok */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          🎫 Jegy-típusok
        </h2>
        {TICKET_TYPES.map((t) => (
          <article key={t.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-extrabold text-ink">{t.name}</h3>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{t.description}</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10.5px]">
                  <div className="rounded-md bg-surface-alt px-2 py-1">
                    <p className="font-bold uppercase tracking-wide text-ink-muted">Ár</p>
                    <p className="font-extrabold text-ink">{t.price}</p>
                  </div>
                  <div className="rounded-md bg-surface-alt px-2 py-1">
                    <p className="font-bold uppercase tracking-wide text-ink-muted">Érvényesség</p>
                    <p className="font-extrabold text-ink">{t.validity}</p>
                  </div>
                  <div className="rounded-md bg-primary-soft px-2 py-1">
                    <p className="font-bold uppercase tracking-wide text-primary">Legjobb</p>
                    <p className="font-extrabold text-ink">{t.bestFor}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* GA vs Halbtax kalkulátor */}
      <GaVsHalbtaxCalculator />

      {/* Mobil-appok */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          📱 Mobil-appok
        </h2>
        {MOBILE_APPS.map((app) => (
          <article key={app.id} className="rounded-card border border-line bg-surface p-3.5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{app.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-extrabold text-ink">{app.name}</h3>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{app.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {app.pros.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-pill bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <a
                    href={app.iosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-pill bg-ink px-2.5 py-1 text-[10.5px] font-bold text-white"
                  >
                    🍎 iOS
                  </a>
                  <a
                    href={app.androidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-pill bg-success px-2.5 py-1 text-[10.5px] font-bold text-white"
                  >
                    🤖 Android
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Tippek */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          💡 Tippek
        </h2>
        <div className="space-y-2">
          {TRANSPORT_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 rounded-card border border-line bg-surface p-3 shadow-card">
              <span className="text-2xl shrink-0">{tip.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold text-ink">{tip.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hivatalos linkek */}
      <section className="rounded-card border border-line bg-surface-alt/60 p-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Hivatalos források
        </h3>
        <ul className="space-y-1.5">
          <li>
            <a href="https://www.sbb.ch/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">
              🔗 SBB — Schweizerische Bundesbahnen
            </a>
          </li>
          <li>
            <a href="https://www.allianceswisspass.ch/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">
              🔗 Alliance SwissPass — Halbtax & GA
            </a>
          </li>
          <li>
            <a href="https://www.fairtiq.com/de-ch" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">
              🔗 FAIRTIQ — Auto-jegy app
            </a>
          </li>
        </ul>
      </section>

      {/* Disclaimer */}
      <LegalDisclaimer
        toolName="Tömegközlekedési Kalauz"
        variant="info"
        notAdviceFor="utazási, jegyügyi vagy szerződéses"
        extraWarning="A megjelölt árak és zónák a tájékoztató publikálásakor érvényesek — időnként változnak. Jegyvásárlás előtt mindig ellenőrizd a hivatalos szolgáltató oldalán vagy alkalmazásában. A megjelölt szolgáltatókkal NEM állunk affiliate vagy kereskedelmi kapcsolatban."
        officialSources={[
          { label: "SBB", url: "https://www.sbb.ch/" },
          { label: "Alliance SwissPass", url: "https://www.allianceswisspass.ch/" },
        ]}
      />
    </div>
  );
}

function TarifCard({ system }: { system: typeof TARIF_SYSTEMS[number] }) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3 mb-2">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-white text-xl"
          style={{ backgroundColor: system.color }}
        >
          {system.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-extrabold text-ink">{system.abbreviation}</h3>
          <p className="text-[11.5px] text-ink-muted">{system.region}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Zónák</p>
          <p className="text-[18px] font-extrabold text-ink leading-none">{system.zonesCount}</p>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-ink-muted mb-2.5">{system.description}</p>

      {/* Példa zónák */}
      <div className="space-y-1 mb-3">
        {system.exampleZones.map((ez, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md bg-surface-alt px-2 py-1 text-[11px]"
          >
            <span className="text-ink">{ez.name}</span>
            <span className="font-bold text-primary">{ez.zones}</span>
          </div>
        ))}
      </div>

      {/* Árak */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-md bg-primary-soft/60 px-2 py-1.5 text-[10.5px]">
          <p className="font-bold uppercase tracking-wide text-primary">1 zóna jegy</p>
          <p className="font-extrabold text-ink">{system.singleZonePrice.toFixed(2)} CHF</p>
        </div>
        <div className="rounded-md bg-success/10 px-2 py-1.5 text-[10.5px]">
          <p className="font-bold uppercase tracking-wide text-success">Napijegy</p>
          <p className="font-extrabold text-ink">{system.dailyPrice.toFixed(2)} CHF</p>
        </div>
      </div>

      <a
        href={system.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-2.5 py-1 text-[10.5px] font-bold text-primary"
      >
        🔗 Hivatalos oldal →
      </a>
    </article>
  );
}

function GaVsHalbtaxCalculator() {
  const [avgTripPrice, setAvgTripPrice] = useState(12);
  const [tripsPerWeek, setTripsPerWeek] = useState(5);

  const result = useMemo(
    () =>
      calculateGaVsHalbtax({
        avgTripPrice,
        tripsPerWeek,
      }),
    [avgTripPrice, tripsPerWeek],
  );

  const recommendationInfo = {
    "full-price": { emoji: "🎫", label: "Maradj a sima jegyeknél", color: "#9a6b00" },
    halbtax:      { emoji: "✂️", label: "Halbtax éri meg!",          color: "#16a34a" },
    ga:           { emoji: "🎟️", label: "GA éri meg!",               color: "#1d4434" },
  };
  const rec = recommendationInfo[result.recommendation];

  return (
    <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🧮</span>
        <div>
          <h2 className="text-[15px] font-extrabold text-ink">GA vs Halbtax kalkulátor</h2>
          <p className="text-[10.5px] text-ink-muted">Add meg a tipikus utazásod adatait — kiszámoljuk, megéri-e</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Átlagos jegyár (CHF / út)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={50}
              step={1}
              value={avgTripPrice}
              onChange={(e) => setAvgTripPrice(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <input
              type="number"
              min={0}
              max={200}
              value={avgTripPrice}
              onChange={(e) => setAvgTripPrice(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-[8px] border border-line bg-surface-alt px-2 py-1 text-[13px] font-bold text-ink text-right"
            />
            <span className="text-[10.5px] font-bold text-ink-muted">CHF</span>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Heti utazások száma (oda-vissza = 2)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={tripsPerWeek}
              onChange={(e) => setTripsPerWeek(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-16 text-right text-[18px] font-extrabold text-primary">
              {tripsPerWeek}
            </span>
            <span className="text-[10.5px] font-bold text-ink-muted">/ hét</span>
          </div>
        </div>
      </div>

      {/* Eredmény */}
      <div
        className="rounded-[14px] p-4 text-center"
        style={{ backgroundColor: `${rec.color}15`, border: `2px solid ${rec.color}40` }}
      >
        <p className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: rec.color }}>
          Ajánlás
        </p>
        <p className="text-[24px] mb-1">{rec.emoji}</p>
        <p className="text-[16px] font-extrabold" style={{ color: rec.color }}>
          {rec.label}
        </p>
      </div>

      {/* Részletes táblázat */}
      <div className="space-y-1.5">
        <CostRow
          label="Sima jegyekkel"
          cost={result.fullPriceCost}
          highlight={result.recommendation === "full-price"}
        />
        <CostRow
          label="Halbtax (-50% jegyekre)"
          cost={result.halbtaxCost}
          highlight={result.recommendation === "halbtax"}
          subtitle="190 CHF Halbtax + 50% jegyár"
        />
        <CostRow
          label="GA (Generalabonnement)"
          cost={result.gaCost}
          highlight={result.recommendation === "ga"}
          subtitle="3995 CHF / év, minden tömegközlekedés"
        />
      </div>

      <p className="text-[10px] leading-snug text-ink-faint">
        Ebben az évben: {result.yearlyTrips} utazás. Számolj még gyermek-, hétvégi és family-tarifákkal.
      </p>
    </section>
  );
}

function CostRow({
  label,
  cost,
  highlight,
  subtitle,
}: {
  label: string;
  cost: number;
  highlight?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-[10px] px-3 py-2",
        highlight ? "bg-success/15 border-2 border-success/40" : "bg-white/60",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-bold text-ink">{label}</p>
        {subtitle && <p className="text-[10px] text-ink-muted">{subtitle}</p>}
      </div>
      <p className={cn("text-[14px] font-extrabold ml-2", highlight ? "text-success" : "text-ink")}>
        {cost.toLocaleString("hu-HU")} CHF
      </p>
    </div>
  );
}
