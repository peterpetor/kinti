"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { CANTON_COORDS } from "@/lib/cantons";
import { regionName } from "@/lib/regions";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

import "leaflet/dist/leaflet.css";

const SWISS_CENTER: [number, number] = [46.82, 8.23];
const AT_CENTER: [number, number] = [47.7, 13.9];

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
}: {
  /** régió-kód → darabszám */
  counts: Record<string, number>;
  selectedCanton: string;
  onSelectCanton: (code: string) => void;
  country?: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  // Ország-tudatos közép + koordináták (CH: kanton, AT: Bundesland).
  const isAT = country === "AT";
  const COORDS: Record<string, { lat: number; lng: number }> = isAT ? AT_BUNDESLAND_COORDS : CANTON_COORDS;
  const center = isAT ? AT_CENTER : SWISS_CENTER;

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

  const entries = useMemo(
    () => Object.entries(counts).filter(([code, n]) => n > 0 && COORDS[code]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [counts, isAT],
  );
  const maxCount = useMemo(() => Math.max(1, ...entries.map(([, n]) => n)), [entries]);

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
        zoom={7}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full relative z-0"
        style={{ background: "rgb(var(--map-land))" }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {entries.map(([code, n]) => {
          const c = COORDS[code];
          return (
            <Marker
              key={code}
              position={[c.lat, c.lng]}
              icon={bubbleIcon(n, maxCount, code === selectedCanton)}
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
          {selectedCanton ? regionName(country, selectedCanton) : (isAT ? "Koppints egy tartományra" : "Koppints egy kantonra")}
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

function bubbleIcon(count: number, max: number, active: boolean): L.DivIcon {
  const key = `${count}-${max}-${active ? "a" : "n"}`;
  const cached = BUBBLE_CACHE.get(key);
  if (cached) return cached;

  const dim = 28 + Math.round((count / max) * 28); // 28..56 px, darabszám-arányos
  const bg = active ? "rgb(var(--accent))" : "rgb(var(--primary))";
  const shadow = active
    ? "box-shadow:0 0 0 3px #fff,0 4px 14px rgba(14,31,23,.32);"
    : "box-shadow:0 4px 14px rgba(14,31,23,.28);";

  const icon = L.divIcon({
    className: "",
    html: `<div style="width:${dim}px;height:${dim}px;display:grid;place-items:center;border-radius:9999px;background:${bg};color:#fff;font-size:${count > 99 ? 11 : 13}px;font-weight:800;${shadow}">${count}</div>`,
    iconSize: [dim, dim],
    iconAnchor: [dim / 2, dim / 2],
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
