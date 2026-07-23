"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, useMap } from "react-leaflet";
import { FallbackTileLayer } from "./fallback-tile-layer";
import { CANTON_COORDS } from "@/lib/cantons";
import { regionName } from "@/lib/regions";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

import "leaflet/dist/leaflet.css";

const SWISS_CENTER: [number, number] = [46.82, 8.23];
const AT_CENTER: [number, number] = [47.7, 13.9];
const DE_CENTER: [number, number] = [51.1, 10.4];
const NL_CENTER: [number, number] = [52.2, 5.4];

/** Osztrák Bundesland-centroidok (a regions.ts AT-kódjaival). A jobs/events
 *  ugyanezeket a kódokat tárolja, így a buborékok a megfelelő helyre kerülnek. */
const AT_BUNDESLAND_COORDS: Record<string, { lat: number; lng: number }> = {
  W:   { lat: 48.21, lng: 16.37 },
  NOE: { lat: 48.33, lng: 15.75 },
  OOE: { lat: 48.05, lng: 13.95 },
  STM: { lat: 47.30, lng: 14.90 },
  TIR: { lat: 47.15, lng: 11.40 },
  KTN: { lat: 46.72, lng: 14.10 },
  SBG: { lat: 47.45, lng: 13.05 },
  VBG: { lat: 47.25, lng: 9.90 },
  BGL: { lat: 47.55, lng: 16.45 },
};

/** Német Bundesland-centroidok (a regions.ts DE-kódjaival). A jobs/events
 *  ugyanezeket a kódokat tárolják, így a buborékok a megfelelő helyre kerülnek. */
const DE_BUNDESLAND_COORDS: Record<string, { lat: number; lng: number }> = {
  BW: { lat: 48.66, lng: 9.35 },
  BY: { lat: 48.79, lng: 11.50 },
  BE: { lat: 52.52, lng: 13.40 },
  BB: { lat: 52.41, lng: 13.06 },
  HB: { lat: 53.08, lng: 8.80 },
  HH: { lat: 53.55, lng: 9.99 },
  HE: { lat: 50.65, lng: 9.16 },
  MV: { lat: 53.61, lng: 12.43 },
  NI: { lat: 52.64, lng: 9.85 },
  NW: { lat: 51.43, lng: 7.66 },
  RP: { lat: 49.91, lng: 7.45 },
  SL: { lat: 49.38, lng: 6.96 },
  SN: { lat: 51.05, lng: 13.74 },
  ST: { lat: 51.95, lng: 11.69 },
  SH: { lat: 54.22, lng: 9.70 },
  TH: { lat: 50.90, lng: 11.03 },
};

/** Holland provincia-centroidok (a regions.ts NL-kódjaival). Az NL "ZH" itt
 *  Zuid-Holland — ez a tábla CSAK country="NL" mellett kerül elő. */
const NL_PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  NH: { lat: 52.60, lng: 4.92 },
  ZH: { lat: 52.02, lng: 4.49 },
  UT: { lat: 52.09, lng: 5.16 },
  NB: { lat: 51.56, lng: 5.20 },
  GE: { lat: 52.06, lng: 5.94 },
  OV: { lat: 52.44, lng: 6.44 },
  LI: { lat: 51.21, lng: 5.94 },
  FR: { lat: 53.11, lng: 5.75 },
  GR: { lat: 53.22, lng: 6.74 },
  DR: { lat: 52.86, lng: 6.62 },
  FL: { lat: 52.53, lng: 5.60 },
  ZE: { lat: 51.49, lng: 3.85 },
};

/**
 * Kanton-buborék térkép — kantononként EGY buborék a centroidján (CANTON_COORDS),
 * a darabszámmal. Olyan adatokhoz, amiknek nincs precíz lat/lng-jük, csak
 * kantonjuk (állások, események). Egy buborékra koppintva szűr (onSelectCanton).
 *
 * Ez a BusinessMap precíz-pin verziójának kanton-szintű párja: ugyanaz a
 * Leaflet-alap (csempe, fullscreen, invalidateSize), de aggregálva kantononként.
 * Újrahasznosítható (állás + esemény ugyanazt a komponenst hívja).
 */
export function CantonBubbleMap({
  counts,
  selectedCanton,
  onSelectCanton,
  country = "CH",
  coordsOverride,
  nameOf,
  formatValue,
  colorForValue,
  sizeMode = "abs",
}: {
  /** régió-kód → érték (darabszám VAGY tetszőleges mérőszám, pl. „mennyi marad") */
  counts: Record<string, number>;
  selectedCanton: string;
  onSelectCanton: (code: string) => void;
  country?: string;
  /** Opcionális koordináta-térkép (pl. város-szintű buborékokhoz) — felülírja a régió-defaultot. */
  coordsOverride?: Record<string, { lat: number; lng: number }>;
  /** Opcionális név-feloldó a kiválasztott buborékhoz (különben régió-név). */
  nameOf?: (code: string) => string;
  /** Buborék-felirat formázó (pl. „1200 €"). Alapból a nyers szám. */
  formatValue?: (v: number) => string;
  /** Buborék-szín az érték/tartomány alapján (pl. zöld→piros skála). Alapból primary/accent. */
  colorForValue?: (v: number, min: number, max: number) => string;
  /** „abs": méret = érték/max (darabszámhoz). „range": méret a min–max közti helyezés
   *  szerint (előjeles/negatív értékekhez, pl. mennyi-marad). */
  sizeMode?: "abs" | "range";
}) {
  const [fullscreen, setFullscreen] = useState(false);

  // Ország-tudatos közép + koordináták (CH: kanton, AT/DE: Bundesland, NL: provincia) — vagy override.
  const isAT = country === "AT";
  const isDE = country === "DE";
  const isNL = country === "NL";
  const COORDS: Record<string, { lat: number; lng: number }> =
    coordsOverride ?? (isDE ? DE_BUNDESLAND_COORDS : isAT ? AT_BUNDESLAND_COORDS : isNL ? NL_PROVINCE_COORDS : CANTON_COORDS);
  const center = isDE ? DE_CENTER : isAT ? AT_CENTER : isNL ? NL_CENTER : SWISS_CENTER;

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  // Érték-mód (mennyi-marad stb.): előjeles/0 érték is látszik. Count-mód: csak n>0.
  const valueMode = sizeMode === "range" || !!colorForValue || !!formatValue;
  const entries = useMemo(
    () => Object.entries(counts).filter(([code, n]) => COORDS[code] && (valueMode || n > 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [counts, country, valueMode],
  );
  const maxCount = useMemo(() => Math.max(1, ...entries.map(([, n]) => n)), [entries]);
  const minVal = useMemo(() => Math.min(0, ...entries.map(([, n]) => n)), [entries]);
  const maxVal = useMemo(() => Math.max(1, ...entries.map(([, n]) => n)), [entries]);

  return (
    <div
      className={cn(
        // A `relative` a nem-fullscreen ágban (a Tailwind a .relative-t a .fixed
        // UTÁN emittálja → különben felülírná a fullscreen `fixed`-et).
        "isolate overflow-hidden",
        fullscreen ? "fixed inset-0 z-[60]" : "relative h-[320px] rounded-card border border-line shadow-card",
      )}
    >
      <MapContainer
        center={center}
        zoom={isDE ? 6 : 7}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full relative z-0"
        style={{ background: "rgb(var(--map-land))" }}
      >
        <FallbackTileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {entries.map(([code, n]) => {
          const c = COORDS[code];
          const active = code === selectedCanton;
          // Méret: „range" módban a min–max közti helyezés (előjeles), különben érték/max.
          const frac = sizeMode === "range"
            ? (maxVal - minVal > 0 ? (n - minVal) / (maxVal - minVal) : 1)
            : n / maxCount;
          const bg = active
            ? "rgb(var(--accent))"
            : colorForValue
              ? colorForValue(n, minVal, maxVal)
              : "rgb(var(--primary))";
          const label = formatValue ? formatValue(n) : String(n);
          return (
            <Marker
              key={code}
              position={[c.lat, c.lng]}
              icon={bubbleIcon(label, frac, bg)}
              eventHandlers={{ click: () => onSelectCanton(code === selectedCanton ? "" : code) }}
            />
          );
        })}
        <InvalidateSize trigger={fullscreen} />
      </MapContainer>

      {/* Bal-felül: kiválasztott kanton / hint + teljes képernyő */}
      <div className="pointer-events-none absolute left-3 top-3 z-[20] flex items-center gap-2">
        <span className="glass pointer-events-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-bold text-ink shadow-card">
          <Icon name="pin" size={12} strokeWidth={2.2} className="text-accent" />
          {selectedCanton ? (nameOf ? nameOf(selectedCanton) : regionName(country, selectedCanton)) : (isAT || isDE ? "Koppints egy tartományra" : "Koppints egy kantonra")}
        </span>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? "Kilépés a teljes képernyőből" : "Teljes képernyő"}
          className="glass pointer-events-auto grid h-9 w-9 place-items-center rounded-[12px] text-ink shadow-card active:scale-95 transition-transform"
        >
          {fullscreen ? (
            <Icon name="close" size={16} strokeWidth={2.4} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>

      {/* Jobb-felül: szűrő törlése, ha kanton ki van választva */}
      {selectedCanton && (
        <button
          type="button"
          onClick={() => onSelectCanton("")}
          className="glass pointer-events-auto absolute right-3 top-3 z-[20] rounded-pill px-3 py-1.5 text-[12px] font-bold text-ink shadow-card active:scale-95"
        >
          ✕ Szűrő
        </button>
      )}

      {entries.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[10] grid place-items-center">
          <div className="glass pointer-events-auto rounded-pill px-4 py-2 text-[12px] font-semibold text-ink shadow-pop">
            Nincs a térképen megjeleníthető találat.
          </div>
        </div>
      )}
    </div>
  );
}

const BUBBLE_CACHE = new Map<string, L.DivIcon>();

/** label = kiírt felirat, frac = 0..1 méret-arány, bg = háttérszín (CSS). */
function bubbleIcon(label: string, frac: number, bg: string): L.DivIcon {
  const active = bg === "rgb(var(--accent))";
  const key = `${label}|${Math.round(frac * 100)}|${bg}`;
  const cached = BUBBLE_CACHE.get(key);
  if (cached) return cached;

  const clamped = Math.min(1, Math.max(0, frac));
  // Hosszabb feliratnál (pl. „1200 €") szélesebb pill, hogy elférjen.
  const wide = label.length > 3;
  const h = 28 + Math.round(clamped * 28); // 28..56 px
  const w = wide ? Math.max(h, 24 + label.length * 8) : h;
  const shadow = active
    ? "box-shadow:0 0 0 3px #fff,0 4px 14px rgba(14,31,23,.32);"
    : "box-shadow:0 4px 14px rgba(14,31,23,.28);";
  const fontSize = label.length > 5 ? 11 : 13;

  const icon = L.divIcon({
    className: "",
    html: `<div style="min-width:${w}px;height:${h}px;padding:0 ${wide ? 8 : 0}px;display:grid;place-items:center;border-radius:9999px;background:${bg};color:#fff;font-size:${fontSize}px;font-weight:800;white-space:nowrap;${shadow}">${label}</div>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
  });
  BUBBLE_CACHE.set(key, icon);
  return icon;
}

/** Fullscreen-váltáskor a Leaflet-nek újra kell mérnie a konténert (több próba). */
function InvalidateSize({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const timers = [60, 220, 450, 800].map((d) => setTimeout(() => map.invalidateSize(), d));
    return () => timers.forEach(clearTimeout);
  }, [trigger, map]);
  return null;
}
