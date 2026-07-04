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
  AT_TARIF_SYSTEMS,
  AT_TICKET_TYPES,
  AT_MOBILE_APPS,
  AT_TRANSPORT_TIPS,
  calculateAtTransport,
  DE_TARIF_SYSTEMS,
  DE_TICKET_TYPES,
  DE_MOBILE_APPS,
  DE_TRANSPORT_TIPS,
  calculateDeTransport,
  NL_TARIF_SYSTEMS,
  NL_TICKET_TYPES,
  NL_MOBILE_APPS,
  NL_TRANSPORT_TIPS,
  calculateNlTransport,
} from "@/lib/transport";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export function TransportGuide() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  const isDE = country === "DE";
  const isNL = country === "NL";
  const cur = country === "CH" ? "CHF" : "EUR";
  const tarifSystems = isNL ? NL_TARIF_SYSTEMS : isDE ? DE_TARIF_SYSTEMS : isAT ? AT_TARIF_SYSTEMS : TARIF_SYSTEMS;
  const ticketTypes = isNL ? NL_TICKET_TYPES : isDE ? DE_TICKET_TYPES : isAT ? AT_TICKET_TYPES : TICKET_TYPES;
  const mobileApps = isNL ? NL_MOBILE_APPS : isDE ? DE_MOBILE_APPS : isAT ? AT_MOBILE_APPS : MOBILE_APPS;
  const tips = isNL ? NL_TRANSPORT_TIPS : isDE ? DE_TRANSPORT_TIPS : isAT ? AT_TRANSPORT_TIPS : TRANSPORT_TIPS;
  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🚆</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              {isNL ? "Holland Tömegközlekedés" : isDE ? "Német Tömegközlekedés" : isAT ? "Osztrák Tömegközlekedés" : "Svájci Tömegközlekedés"}
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {isNL
                ? "OVpay / OV-chipkaart (in- és uitchecken), NS-vonatok, GVB/RET/HTM, jegytípusok, appok (NS, 9292) és Dal Voordeel-kalkulátor — egyszerűen elmagyarázva."
                : isDE
                ? "Deutsche Bahn, Verkehrsverbünde (VBB, MVV, HVV), jegytípusok, DB Navigator és Deutschlandticket-kalkulátor — egyszerűen elmagyarázva."
                : isAT
                ? "Wiener Linien, ÖBB, VOR, jegytípusok, mobilappok és Klimaticket-kalkulátor — egyszerűen elmagyarázva."
                : "Zónarendszerek (SBB, ZVV, Libero), jegytípusok, mobilappok és GA vs Halbtax kalkulátor — egyszerűen elmagyarázva."}
            </p>
          </div>
        </div>
      </section>

      {/* Hogyan működik a zóna-rendszer */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <h2 className="text-[14px] font-extrabold text-ink flex items-center gap-1.5">
          📍 {isNL ? "Hogy működik a fizetés (OVpay)?" : "Hogy működik a zónarendszer?"}
        </h2>
        <div className="space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
          {isNL ? (
            <>
              <p>Hollandiában NINCS zóna-jegy — a rendszer <strong className="text-ink">táv-alapú (per km)</strong>, és az <strong className="text-ink">OVpay / OV-chipkaart</strong> köré épül.</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Beszálláskor <strong className="text-ink">BE-jelentkezel (inchecken)</strong>, kiszálláskor <strong className="text-ink">KI (uitchecken)</strong> — érintős bankkártyával/telefonnal (OVpay) vagy OV-chipkaarttal.</li>
                <li>Ha elfelejtesz kijelentkezni, a rendszer magas <strong className="text-ink">büntetődíjat</strong> von le (~4–20 €) — a felét sokszor visszaigényelheted az appban.</li>
                <li>A vonat (<strong className="text-ink">NS</strong>) és a városi közlekedés (<strong className="text-ink">GVB / RET / HTM</strong>) is ugyanígy, táv-alapon megy.</li>
                <li>Kedvezményhez / bérlethez (pl. <strong className="text-ink">Dal Voordeel</strong>) névre szóló (persoonlijke) OV-chipkaart kell; a <strong className="text-ink">9292</strong> app tervez door-to-door.</li>
              </ul>
            </>
          ) : isDE ? (
            <>
              <p>Németországban minden régiónak van <strong className="text-ink">Verkehrsverbundja</strong> (pl. VBB Berlin, MVV München) — a helyi jegy zóna/ár-fokozat alapú. Az országos szuper-ajánlat a <strong className="text-ink">Deutschlandticket</strong>.</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>A <strong className="text-ink">Deutschlandticket (58 €/hó)</strong> az EGÉSZ ország összes helyi és regionális közlekedését fedezi (U/S-Bahn, Tram, Bus, RB/RE-vonat).</li>
                <li>A távolsági gyorsvonatra (<strong className="text-ink">ICE/IC/EC</strong>) külön DB-jegy kell — azt a D-Ticket NEM fedi.</li>
                <li>Egy helyi jegyen belül jellemzően szabadon átszállhatsz a járművek közt (egy irányba, megszakítás nélkül).</li>
                <li>A <strong className="text-ink">DB Navigator</strong> app intézi az országos menetrendet, jegyet és a Sparpreis-akciókat.</li>
              </ul>
            </>
          ) : isAT ? (
            <>
              <p>Ausztriában minden régiónak van <strong className="text-ink">Verkehrsverbundja</strong>. Bécs egyetlen zóna (<strong className="text-ink">Kernzone Wien</strong>); ott a jegy idő-alapú.</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Bécsen belül egy jegyen szabadon átszállhatsz <strong className="text-ink">U-Bahn / Bim / Bus</strong> között.</li>
                <li>A Kernzonén kívül (VOR — ingázóknak, pl. Sopron felé) zóna-alapú a tarifa.</li>
                <li>Az országos <strong className="text-ink">Klimaticket Österreich</strong> MINDEN tömegközlekedést fedez egész Ausztriában.</li>
                <li>Bécsi lakosként a <strong className="text-ink">Jahreskarte (365 €/év — napi 1 €)</strong> verhetetlen.</li>
              </ul>
            </>
          ) : (
            <>
              <p>
                Svájc tömegközlekedési rendszere <strong className="text-ink">zónákra</strong> van osztva.
                Egy jegy a zónák számától függ — minél több zónán mész át, annál drágább.
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Minden nagy régiónak van saját <strong className="text-ink">Tarifverbundja</strong> (tarifaszövetség).</li>
                <li>Egy jegyen belül szabadon átszállhatsz vonatra, buszra, villamosra.</li>
                <li>Az országos SBB-vonatokra <strong className="text-ink">külön jegy</strong> kell — ezeket a zónarendszer NEM fedi.</li>
                <li>Mobil-app (FAIRTIQ, SBB Mobile) az utazás alapján a tipikusan kedvező jegytípust választja.</li>
              </ul>
            </>
          )}
        </div>
      </section>

      {/* Tarif-szövetségek */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          🗺️ Fő Tarifaszövetségek
        </h2>
        {tarifSystems.map((s) => (
          <TarifCard key={s.id} system={s} cur={cur} />
        ))}
      </section>

      {/* Jegy-típusok */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          🎫 Jegytípusok
        </h2>
        {ticketTypes.map((t) => (
          <article key={t.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-extrabold text-ink">{t.name}</h3>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{t.description}</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11.5px]">
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
          📱 Mobilalkalmazások
        </h2>
        {mobileApps.map((app) => (
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
                      className="inline-flex items-center rounded-pill bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success"
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
                    className="rounded-pill bg-ink px-2.5 py-1 text-[11.5px] font-bold text-white"
                  >
                    🍎 iOS
                  </a>
                  <a
                    href={app.androidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-pill bg-success px-2.5 py-1 text-[11.5px] font-bold text-white"
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
          {tips.map((tip, i) => (
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
          {isNL ? (
            <>
              <li><a href="https://www.ns.nl/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 NS — Nederlandse Spoorwegen</a></li>
              <li><a href="https://www.ovpay.nl/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 OVpay — érintős fizetés</a></li>
              <li><a href="https://9292.nl/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 9292 — országos útvonaltervező</a></li>
            </>
          ) : isDE ? (
            <>
              <li><a href="https://www.bahn.de/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 Deutsche Bahn (DB)</a></li>
              <li><a href="https://www.deutschlandticket.de/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 Deutschlandticket — hivatalos info</a></li>
              <li><a href="https://www.vbb.de/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 VBB (Berlin-Brandenburg)</a></li>
            </>
          ) : isAT ? (
            <>
              <li><a href="https://www.oebb.at/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 ÖBB — Österreichische Bundesbahnen</a></li>
              <li><a href="https://www.wienerlinien.at/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 Wiener Linien</a></li>
              <li><a href="https://www.klimaticket.at/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 Klimaticket Österreich</a></li>
            </>
          ) : (
            <>
              <li><a href="https://www.sbb.ch/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 SBB — Schweizerische Bundesbahnen</a></li>
              <li><a href="https://www.allianceswisspass.ch/" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 Alliance SwissPass — Halbtax & GA</a></li>
              <li><a href="https://www.fairtiq.com/de-ch" target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-primary underline break-all">🔗 FAIRTIQ — Auto-jegy app</a></li>
            </>
          )}
        </ul>
      </section>

      {/* Disclaimer */}
      <LegalDisclaimer
        toolName="Tömegközlekedési Kalauz"
        variant="info"
        notAdviceFor="utazási, jegyügyi vagy szerződéses"
        extraWarning="A megjelölt árak és zónák a tájékoztató publikálásakor érvényesek — időnként változnak. Jegyvásárlás előtt mindig ellenőrizd a hivatalos szolgáltató oldalán vagy alkalmazásában. A megjelölt szolgáltatókkal NEM állunk affiliate vagy kereskedelmi kapcsolatban."
        officialSources={isNL ? [
          { label: "NS — Nederlandse Spoorwegen", url: "https://www.ns.nl/" },
          { label: "OVpay", url: "https://www.ovpay.nl/" },
        ] : isDE ? [
          { label: "Deutsche Bahn", url: "https://www.bahn.de/" },
          { label: "Deutschlandticket", url: "https://www.deutschlandticket.de/" },
        ] : isAT ? [
          { label: "ÖBB", url: "https://www.oebb.at/" },
          { label: "Wiener Linien", url: "https://www.wienerlinien.at/" },
        ] : [
          { label: "SBB", url: "https://www.sbb.ch/" },
          { label: "Alliance SwissPass", url: "https://www.allianceswisspass.ch/" },
        ]}
      />
    </div>
  );
}

function TarifCard({ system, cur }: { system: typeof TARIF_SYSTEMS[number]; cur: string }) {
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
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Zónák</p>
          <p className="text-[18px] font-extrabold text-ink leading-none">{system.zonesCount > 0 ? system.zonesCount : "—"}</p>
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
        <div className="rounded-md bg-primary-soft/60 px-2 py-1.5 text-[11.5px]">
          <p className="font-bold uppercase tracking-wide text-primary">Egyszeri jegy</p>
          <p className="font-extrabold text-ink">{system.singleZonePrice.toFixed(2)} {cur}</p>
        </div>
        <div className="rounded-md bg-success/10 px-2 py-1.5 text-[11.5px]">
          <p className="font-bold uppercase tracking-wide text-success">Napijegy</p>
          <p className="font-extrabold text-ink">{system.dailyPrice > 0 ? `${system.dailyPrice.toFixed(2)} ${cur}` : "—"}</p>
        </div>
      </div>

      <a
        href={system.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-2.5 py-1 text-[11.5px] font-bold text-primary"
      >
        🔗 Hivatalos oldal →
      </a>
    </article>
  );
}

function GaVsHalbtaxCalculator() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  const isDE = country === "DE";
  const isNL = country === "NL";
  const cur = country === "CH" ? "CHF" : "EUR";
  const [avgTripPrice, setAvgTripPrice] = useState(isDE ? 3.5 : isAT ? 3 : isNL ? 4 : 12);
  const [tripsPerWeek, setTripsPerWeek] = useState(5);

  const chResult = useMemo(() => calculateGaVsHalbtax({ avgTripPrice, tripsPerWeek }), [avgTripPrice, tripsPerWeek]);
  const atResult = useMemo(() => calculateAtTransport({ avgTripPrice, tripsPerWeek }), [avgTripPrice, tripsPerWeek]);
  const deResult = useMemo(() => calculateDeTransport({ avgTripPrice, tripsPerWeek }), [avgTripPrice, tripsPerWeek]);
  const nlResult = useMemo(() => calculateNlTransport({ avgTripPrice, tripsPerWeek }), [avgTripPrice, tripsPerWeek]);
  const yearlyTrips = isNL ? nlResult.yearlyTrips : isDE ? deResult.yearlyTrips : isAT ? atResult.yearlyTrips : chResult.yearlyTrips;

  const rec = isNL
    ? ({
        "full-price":   { emoji: "🎫", label: "Maradj a losse rittennél", color: "#9a6b00" },
        "dal-voordeel": { emoji: "✂️", label: "Dal Voordeel éri meg!",     color: "#1d4434" },
      } as const)[nlResult.recommendation]
    : isDE
    ? ({
        "full-price":       { emoji: "🎫", label: "Maradj az egyes jegyeknél", color: "#9a6b00" },
        deutschlandticket:  { emoji: "🇩🇪", label: "Deutschlandticket éri meg!", color: "#1d4434" },
      } as const)[deResult.recommendation]
    : isAT
    ? ({
        "full-price": { emoji: "🎫", label: "Maradj az egyes jegyeknél", color: "#9a6b00" },
        jahreskarte:  { emoji: "🎟️", label: "Jahreskarte Wien éri meg!", color: "#16a34a" },
        klimaticket:  { emoji: "🌍", label: "Klimaticket éri meg!",       color: "#1d4434" },
      } as const)[atResult.recommendation]
    : ({
        "full-price": { emoji: "🎫", label: "Maradj a sima jegyeknél", color: "#9a6b00" },
        halbtax:      { emoji: "✂️", label: "Halbtax éri meg!",          color: "#16a34a" },
        ga:           { emoji: "🎟️", label: "GA éri meg!",               color: "#1d4434" },
      } as const)[chResult.recommendation];

  return (
    <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🧮</span>
        <div>
          <h2 className="text-[15px] font-extrabold text-ink">{isNL ? "Dal Voordeel kalkulátor" : isDE ? "Deutschlandticket kalkulátor" : isAT ? "Klimaticket kalkulátor" : "GA vs Halbtax kalkulátor"}</h2>
          <p className="text-[11.5px] text-ink-muted">Add meg a tipikus utazásod adatait — kiszámoljuk, megéri-e</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block mb-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Átlagos jegyár ({cur} / út)
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
            <span className="text-[11.5px] font-bold text-ink-muted">{cur}</span>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
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
            <span className="text-[11.5px] font-bold text-ink-muted">/ hét</span>
          </div>
        </div>
      </div>

      {/* Eredmény */}
      <div
        className="rounded-[14px] p-4 text-center"
        style={{ backgroundColor: `${rec.color}15`, border: `2px solid ${rec.color}40` }}
      >
        <p className="text-[11.5px] font-bold uppercase tracking-wider mb-1" style={{ color: rec.color }}>
          Ajánlás
        </p>
        <p className="text-[24px] mb-1">{rec.emoji}</p>
        <p className="text-[16px] font-extrabold" style={{ color: rec.color }}>
          {rec.label}
        </p>
      </div>

      {/* Részletes táblázat */}
      <div className="space-y-1.5">
        {isNL ? (
          <>
            <CostRow label="Losse ritten (egyes utak)" cost={nlResult.fullPriceCost} highlight={nlResult.recommendation === "full-price"} cur={cur} />
            <CostRow label="NS Dal Voordeel (-40%)" cost={nlResult.dalVoordeelCost} highlight={nlResult.recommendation === "dal-voordeel"} subtitle="~5,60 € / hó + a jegyek 60%-a (40% kedvezmény csúcsidőn kívül)" cur={cur} />
          </>
        ) : isDE ? (
          <>
            <CostRow label="Egyes jegyekkel" cost={deResult.fullPriceCost} highlight={deResult.recommendation === "full-price"} cur={cur} />
            <CostRow label="Deutschlandticket" cost={deResult.deutschlandticketCost} highlight={deResult.recommendation === "deutschlandticket"} subtitle="58 € / hó = 696 € / év — egész Németország (helyi+regionális)" cur={cur} />
          </>
        ) : isAT ? (
          <>
            <CostRow label="Egyes jegyekkel" cost={atResult.fullPriceCost} highlight={atResult.recommendation === "full-price"} cur={cur} />
            <CostRow label="Jahreskarte Wien" cost={atResult.jahreskarteCost} highlight={atResult.recommendation === "jahreskarte"} subtitle="365 € / év — korlátlan Bécsben" cur={cur} />
            <CostRow label="Klimaticket Österreich" cost={atResult.klimaticketCost} highlight={atResult.recommendation === "klimaticket"} subtitle="~1095 € / év — egész Ausztria" cur={cur} />
          </>
        ) : (
          <>
            <CostRow label="Sima jegyekkel" cost={chResult.fullPriceCost} highlight={chResult.recommendation === "full-price"} cur={cur} />
            <CostRow label="Halbtax (-50% jegyekre)" cost={chResult.halbtaxCost} highlight={chResult.recommendation === "halbtax"} subtitle="190 CHF Halbtax + 50% jegyár" cur={cur} />
            <CostRow label="GA (Generalabonnement)" cost={chResult.gaCost} highlight={chResult.recommendation === "ga"} subtitle="3995 CHF / év, minden tömegközlekedés" cur={cur} />
          </>
        )}
      </div>

      <p className="text-[11px] leading-snug text-ink-faint">
        Ebben az évben: {yearlyTrips} utazás. {isNL ? "A Dal Voordeel csak csúcsidőn KÍVÜL (dal) és hétvégén ad 40%-ot; a napi ingázónak a Traject Vrij útvonal-bérlet lehet jobb." : isDE ? "A Deutschlandticket csak helyi+regionális; ICE/IC-hez külön DB-jegy (Sparpreis/BahnCard)." : isAT ? "Számolj még kedvezményekkel (Vorteilscard, fiatal/szenior tarifák)." : "Számolj még gyermek-, hétvégi és family-tarifákkal."}
      </p>
    </section>
  );
}

function CostRow({
  label,
  cost,
  highlight,
  subtitle,
  cur,
}: {
  label: string;
  cost: number;
  highlight?: boolean;
  subtitle?: string;
  cur: string;
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
        {subtitle && <p className="text-[11px] text-ink-muted">{subtitle}</p>}
      </div>
      <p className={cn("text-[14px] font-extrabold ml-2", highlight ? "text-success" : "text-ink")}>
        {cost.toLocaleString("hu-HU")} {cur}
      </p>
    </div>
  );
}
