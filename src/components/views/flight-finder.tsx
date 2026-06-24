"use client";

import { useMemo, useState, useEffect } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import {
  getFlightConfig,
  getSeason,
  estimatePrice,
  skyscannerUrl,
  googleFlightsUrl,
  kiwiUrl,
  getOrigin,
  getDestination,
  type FlightConfig,
  type SeasonInfo,
  type Direction,
} from "@/lib/flights";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

const HU_MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];
const HU_WEEKDAYS = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];

export function FlightFinder() {
  // Ország-tudatos. Hidratálás-biztos: mount előtt CH (egyezik az SSR-rel).
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const config = getFlightConfig(country);

  const [direction, setDirection] = useState<Direction>("out");
  const [originCode, setOriginCode] = useState<string>(config?.origins[0]?.code ?? "ZRH");

  // Ország-váltáskor a kiválasztott reptér igazodjon az új országhoz.
  useEffect(() => {
    if (config && !config.origins.some((o) => o.code === originCode)) {
      setOriginCode(config.origins[0].code);
    }
  }, [config, originCode]);

  const today = new Date();
  const initial = new Date(today);
  initial.setDate(initial.getDate() + 21);
  const [outDate, setOutDate] = useState<Date>(initial);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [calYear, setCalYear] = useState(initial.getFullYear());
  const [calMonth, setCalMonth] = useState(initial.getMonth());

  // A rendereléshez MINDIG az aktuális ország configjában létező reptér-kódot
  // használjuk. Ország-váltáskor (CH→AT) egy átmeneti renderben az originCode még
  // a régi (ZRH), ami nincs az AT configban — az effektív kód ilyenkor a fő hubra
  // esik vissza, így a reptér-keresés sosem ad undefined-et (különben crash).
  const effectiveCode =
    config && config.origins.some((o) => o.code === originCode)
      ? originCode
      : config?.origins[0]?.code ?? originCode;

  const estimate = useMemo(
    () => (config ? estimatePrice(outDate, effectiveCode, config) : null),
    [outDate, effectiveCode, config],
  );
  const relevantAirlines = useMemo(
    () => (config ? config.airlines.filter((a) => a.routes.includes(effectiveCode)) : []),
    [config, effectiveCode],
  );

  // Olyan ország, ahol nincs járat-konfig (DE/NL) — barátságos üzenet.
  if (!config) {
    return (
      <div className="space-y-2 rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <span className="text-4xl">✈️</span>
        <p className="text-[15px] font-extrabold text-ink">A járatfigyelő hamarosan a te országodban is</p>
        <p className="mx-auto max-w-sm text-[12.5px] leading-relaxed text-ink-muted">
          Jelenleg a Svájc ↔ Budapest és az Ausztria ↔ Budapest útvonalakra van. A te országodhoz is
          hozzáadjuk a repterekkel és tippekkel.
        </p>
      </div>
    );
  }

  const fromCode = getOrigin(direction, effectiveCode);
  const toCode = getDestination(direction, effectiveCode);
  const airports = [config.home, ...config.origins];
  const fromAirport = airports.find((a) => a.code === fromCode) ?? config.origins[0];
  const toAirport = airports.find((a) => a.code === toCode) ?? config.home;
  const cur = config.currency;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">✈️</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Repülőjegy-figyelő · {config.originFlag} ↔ {config.homeFlag}
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Becsült ár-sáv + szezonális tippek + foglalási oldal-linkek mindkét irányban.
            </p>
          </div>
        </div>
      </section>

      {/* 0. Irány-toggle */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Melyik irány?</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection("out")}
            className={cn("rounded-[12px] border-2 px-3 py-3 transition active:scale-95 text-center", direction === "out" ? "border-primary bg-primary-soft" : "border-line bg-surface")}
          >
            <div className="text-[15px] font-extrabold text-ink">{config.originFlag} → {config.homeFlag}</div>
            <div className="mt-0.5 text-[11.5px] text-ink-muted">Haza, Budapestre</div>
          </button>
          <button
            type="button"
            onClick={() => setDirection("home")}
            className={cn("rounded-[12px] border-2 px-3 py-3 transition active:scale-95 text-center", direction === "home" ? "border-primary bg-primary-soft" : "border-line bg-surface")}
          >
            <div className="text-[15px] font-extrabold text-ink">{config.homeFlag} → {config.originFlag}</div>
            <div className="mt-0.5 text-[11.5px] text-ink-muted">Vissza Budapestről</div>
          </button>
        </div>
      </section>

      {/* 1. Reptér-választó */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="block mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          {direction === "out" ? "Honnan indulsz?" : "Hova érkezel?"}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {config.origins.map((ap) => (
            <button
              key={ap.code}
              type="button"
              onClick={() => setOriginCode(ap.code)}
              className={cn("rounded-[12px] border-2 px-2 py-3 transition active:scale-95", effectiveCode === ap.code ? "border-primary bg-primary-soft" : "border-line bg-surface")}
            >
              <div className="text-[18px] font-extrabold text-ink">{ap.code}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-muted">{ap.city}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[14px] font-extrabold text-ink">
          <span>{fromAirport.code} {fromAirport.emoji}</span>
          <span className="text-ink-faint">→</span>
          <span>{toAirport.code} {toAirport.emoji}</span>
        </div>
      </section>

      {/* 2. Naptár */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Mikor utazol?</label>
          <p className="text-[11.5px] text-ink-faint">Színek = becsült ár-sáv</p>
        </div>
        <FlightCalendar
          year={calYear}
          month={calMonth}
          selectedOut={outDate}
          selectedReturn={returnDate}
          seasons={config.seasons}
          onChangeMonth={(y, m) => { setCalYear(y); setCalMonth(m); }}
          onSelectDate={(d) => {
            if (!returnDate && d > outDate) setReturnDate(d);
            else { setOutDate(d); setReturnDate(null); }
          }}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-[10px] border border-line bg-surface-alt px-3 py-2">
            <p className="font-bold text-ink-muted">Oda</p>
            <p className="text-[13px] font-extrabold text-ink">{fmtDate(outDate)}</p>
          </div>
          <div className="rounded-[10px] border border-line bg-surface-alt px-3 py-2">
            <p className="font-bold text-ink-muted">Vissza</p>
            <p className="text-[13px] font-extrabold text-ink">{returnDate ? fmtDate(returnDate) : "Egyirányú"}</p>
            {returnDate && (
              <button type="button" onClick={() => setReturnDate(null)} className="text-[11px] font-bold text-primary underline mt-0.5">✕ Csak oda</button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Becsült ár */}
      {estimate && (
        <PriceEstimateCard estimate={estimate} seasons={config.seasons} currency={cur} date={outDate} fromCode={fromCode} toCode={toCode} primaryHub={config.origins[0].code} originCode={effectiveCode} />
      )}

      {/* 4. Foglalási linkek */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-2">
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-muted">🔍 Aktuális árak ellenőrzése</h3>
        <BookingLink href={skyscannerUrl(fromCode, toCode, outDate, returnDate)} label="Skyscanner" desc="Több szolgáltatót összevet, áttekintő naptár" icon="🔭" />
        <BookingLink href={googleFlightsUrl(fromCode, toCode)} label="Google Flights" desc="Gyors keresés + ár-figyelő" icon="🔍" />
        <BookingLink href={kiwiUrl(fromCode, toCode, outDate, returnDate)} label="Kiwi.com" desc="Kombinált járatok (multi-city), vonat+repülő" icon="🥝" />
      </section>

      {/* 5. Légitársaságok */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-2">
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-muted">✈️ Légitársaságok ({effectiveCode})</h3>
        {relevantAirlines.length === 0 ? (
          <p className="text-[12px] text-ink-muted">Erről a reptérről nincs jellemző direktjárat — próbáld a fő hubot, vagy nézd a foglalási linkeket (átszállással).</p>
        ) : (
          relevantAirlines.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-[12px] border border-line bg-surface-alt p-3 transition active:scale-[0.99]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white text-base" style={{ backgroundColor: a.color }}>{a.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-extrabold text-ink">{a.name}</span>
                  <span className="text-[10.5px] font-bold uppercase rounded-pill bg-surface px-1.5 py-0.5 text-ink-muted">{a.type === "low-cost" ? "Low-cost" : "Full-service"}</span>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{a.notes}</p>
              </div>
              <Icon name="chevR" size={13} className="text-ink-faint shrink-0 mt-2" />
            </a>
          ))
        )}
      </section>

      {/* 6. Tippek */}
      <section className="space-y-2">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">💡 Tippek a {config.originFlag} → {config.homeFlag} útra</h3>
        {config.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 rounded-card border border-line bg-surface p-3 shadow-card">
            <span className="text-2xl shrink-0">{tip.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold text-ink">{tip.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">{tip.body}</p>
            </div>
          </div>
        ))}
      </section>

      <LegalDisclaimer
        toolName="repülőjegy-figyelő"
        variant="legal"
        notAdviceFor="pénzügyi vagy utazási"
        extraWarning="A megjelenített árak BECSLÉSEK, nem real-time foglalási árak. A foglalási oldal-linkek paraméterezett keresésre visznek; semmilyen szerződéses kapcsolatban nem állunk a Skyscanner / Google Flights / Kiwi / légitársaságok-kal. A jegy árát, feltételeit és érvényességét MINDIG az adott foglalási oldalon ellenőrizd a fizetés előtt."
        officialSources={[
          { label: "Skyscanner", url: "https://www.skyscanner.com/" },
          { label: "Google Flights", url: "https://www.google.com/travel/flights" },
          { label: "Kiwi.com", url: "https://www.kiwi.com/" },
        ]}
      />
    </div>
  );
}

function PriceEstimateCard({
  estimate, seasons, currency, date, fromCode, toCode, primaryHub, originCode,
}: {
  estimate: ReturnType<typeof estimatePrice>;
  seasons: SeasonInfo[];
  currency: string;
  date: Date;
  fromCode: string;
  toCode: string;
  primaryHub: string;
  originCode: string;
}) {
  const season = seasons.find((s) => s.id === estimate.season)!;
  const dow = date.getDay();
  const isWeekend = dow === 5 || dow === 0;
  const isMidweek = dow === 2 || dow === 3;

  return (
    <section className="rounded-card border-2 p-5 shadow-pop" style={{ borderColor: `${season.color}66`, backgroundColor: `${season.color}0d` }}>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-3xl">{season.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: season.color }}>{season.label}</p>
          <h2 className="text-[15px] font-extrabold text-ink">{fmtDate(date)} ({HU_WEEKDAYS[(dow + 6) % 7]})</h2>
        </div>
      </div>
      <p className="text-[11.5px] leading-relaxed text-ink-muted mb-3">{season.description}</p>
      <div className="space-y-2">
        <PriceBar label="Fapados (low-cost)" min={estimate.lowCostMin} max={estimate.lowCostMax} currency={currency} color="#16a34a" />
        <PriceBar label="Hagyományos (full-service)" min={estimate.fullServiceMin} max={estimate.fullServiceMax} currency={currency} color="#dc2626" />
      </div>
      <p className="mt-3 text-[11.5px] text-ink-faint italic">
        Egyirányú, gazdaságos osztály, kézipoggyász alap. {fromCode} → {toCode}.{" "}
        Az árak {originCode}{originCode === primaryHub ? " (fő hub)" : ""} reptérre/ről alapulnak; az ellenkező irány hasonló {currency}-sávban.{" "}
        {isMidweek && "🌟 Hét közepe — olcsóbb mint hétvégén."}
        {isWeekend && "⚠️ Hétvégi nap — kb. 15% drágább mint kedden/szerdán."}
      </p>
    </section>
  );
}

function PriceBar({ label, min, max, currency, color }: { label: string; min: number; max: number; currency: string; color: string }) {
  return (
    <div className="rounded-[10px] bg-surface px-3 py-2 border border-line">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold text-ink">{label}</p>
        <p className="text-[14px] font-extrabold" style={{ color }}>{min}–{max} {currency}</p>
      </div>
    </div>
  );
}

function BookingLink({ href, label, desc, icon }: { href: string; label: string; desc: string; icon: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[12px] border border-line bg-surface-alt p-3 transition active:scale-[0.99] hover:border-primary/40">
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold text-ink">{label}</p>
        <p className="mt-0.5 text-[11px] text-ink-muted">{desc}</p>
      </div>
      <Icon name="chevR" size={13} className="text-primary shrink-0" />
    </a>
  );
}

function FlightCalendar({
  year, month, selectedOut, selectedReturn, seasons, onChangeMonth, onSelectDate,
}: {
  year: number;
  month: number;
  selectedOut: Date;
  selectedReturn: Date | null;
  seasons: SeasonInfo[];
  onChangeMonth: (y: number, m: number) => void;
  onSelectDate: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells = useMemo(() => buildMonth(year, month), [year, month]);

  function prev() { if (month === 0) onChangeMonth(year - 1, 11); else onChangeMonth(year, month - 1); }
  function next() { if (month === 11) onChangeMonth(year + 1, 0); else onChangeMonth(year, month + 1); }
  function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prev} className="grid h-8 w-8 place-items-center rounded-pill text-ink-muted active:scale-95"><Icon name="arrowLeft" size={14} strokeWidth={2.4} /></button>
        <h4 className="text-[13.5px] font-extrabold text-ink">{HU_MONTHS[month]} {year}</h4>
        <button type="button" onClick={next} className="grid h-8 w-8 place-items-center rounded-pill text-ink-muted active:scale-95"><Icon name="arrowRight" size={14} strokeWidth={2.4} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-1 text-center text-[11px] font-bold uppercase tracking-wide text-ink-faint">
        {HU_WEEKDAYS.map((d) => (<div key={d}>{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {cells.map((c, idx) => {
          if (!c) return <div key={idx} />;
          const date = new Date(year, month, c);
          const past = date < today;
          const seasonInfo = seasons.find((s) => s.id === getSeason(date))!;
          const isOut = isSameDay(date, selectedOut);
          const isReturn = selectedReturn && isSameDay(date, selectedReturn);
          const inRange = selectedReturn && date > selectedOut && date < selectedReturn;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => !past && onSelectDate(date)}
              disabled={past}
              className={cn(
                "aspect-square rounded-[8px] text-[12px] font-bold transition relative",
                past ? "text-ink-faint cursor-not-allowed opacity-40" : "text-ink",
                isOut && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
                isReturn && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
                inRange && "bg-primary-soft/50",
              )}
              style={{ backgroundColor: !past && !inRange ? `${seasonInfo.color}26` : undefined }}
            >
              {c}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {seasons.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10.5px] font-bold" style={{ backgroundColor: `${s.color}26`, color: s.color }}>{s.emoji} {s.label}</span>
        ))}
      </div>
    </div>
  );
}

function buildMonth(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const firstDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function fmtDate(d: Date): string {
  const dayName = ["vas.", "hét.", "kedd", "szer.", "csüt.", "pén.", "szo."][d.getDay()];
  return `${HU_MONTHS[d.getMonth()].slice(0, 3)}. ${d.getDate()}. (${dayName})`;
}
