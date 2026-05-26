"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Business } from "@/lib/types";
import { Icon } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

// A Leaflet CSS-t a komponensben importáljuk, hogy csak akkor töltődjön be, ha
// tényleg térképet rendereltünk. A komponenst az ExploreView ssr:false-szal
// hívja, így ez a fájl SOHA nem fut szerveren.
import "leaflet/dist/leaflet.css";

/**
 * BusinessMap — interaktív, raszteres Leaflet-térkép a kinti pinjeivel.
 *
 * Miért Leaflet és nem MapLibre? A MapLibre WebGL-t és Web-Workert igényel,
 * ami a Cloudflare `next-on-pages` edge-bundle-ben nem töltődik be megbízhatóan
 * (üres térkép, néma hiba). A Leaflet sima `<img>` raszter-csempéket rajzol a
 * DOM-ba — se WebGL, se worker —, ezért ebben a környezetben sziklaszilárd.
 *
 * Csempék: CartoDB Voyager (ingyenes, kulcs nélkül) — világos, tiszta stílus.
 * Pin: `L.divIcon` HTML + a `kinti-pin-v2` CSS (egyenes-álló, nem ferde).
 */
export interface BusinessMapProps {
  businesses: Business[];
  /** [lat, lng] sorrendben (Leaflet-konvenció). */
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  className?: string;
}

const ZURICH_CENTER: [number, number] = [47.378, 8.535];

export function BusinessMap({
  businesses,
  fallbackCenter = ZURICH_CENTER,
  fallbackZoom = 13,
  className,
}: BusinessMapProps) {
  const located = useMemo(
    () => businesses.filter((b) => b.lat != null && b.lng != null),
    [businesses],
  );

  return (
    // `isolate` → saját stacking-context, hogy a Leaflet magas z-index-ű
    // rétegei (panek, vezérlők ~1000) NE ússzanak a lebegő TabBar fölé.
    <div className={cn("relative isolate", className)}>
      <MapContainer
        center={fallbackCenter}
        zoom={fallbackZoom}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full rounded-card"
        style={{ background: "rgb(var(--map-land))" }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {located.map((b) => (
          <Marker key={b.id} position={[b.lat!, b.lng!]} icon={pinFor(b)}>
            <Popup>
              <BusinessPopup business={b} />
            </Popup>
          </Marker>
        ))}

        <FitToMarkers businesses={located} />
        <MapControls />
      </MapContainer>

      {located.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[400] grid place-items-center">
          <div className="glass pointer-events-auto rounded-pill px-4 py-2 text-[12px] font-semibold text-ink shadow-pop">
            Ehhez a szűrőhöz nincs térképi találat.
          </div>
        </div>
      )}
    </div>
  );
}

// --- pin (divIcon) ----------------------------------------------------------

/**
 * Kategória → vonalas SVG-ikon path-ek (24px viewBox, Lucide-stílus). A pin
 * fejébe renderelődnek fehér currentColor-ral. Új kategóriához itt vegyél fel
 * path-tömböt; ismeretlen kategória → pötty.
 */
const CATEGORY_ICON_PATHS: Record<string, string[]> = {
  fodrasz: [
    // olló
    "M9 6a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
    "M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
    "M8.12 8.12L12 12",
    "M20 4L8.12 15.88",
    "M14.8 14.8L20 20",
  ],
  autoszer: [
    // villáskulcs
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  ],
  orvos: [
    // pulzus
    "M22 12h-4l-3 9L9 3l-3 9H2",
  ],
  ugyved: [
    // aktatáska
    "M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z",
    "M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  ],
  pek: [
    // búzakalász
    "M12 21V9",
    "M12 9c-2 0-3-2-3-4c2 0 3 2 3 4z",
    "M12 9c2 0 3-2 3-4c-2 0-3 2-3 4z",
    "M12 15c-2 0-3-2-3-4c2 0 3 2 3 4z",
    "M12 15c2 0 3-2 3-4c-2 0-3 2-3 4z",
  ],
  etterem: [
    // evőeszköz (villa + kés)
    "M6 3v18",
    "M4 3v4a2 2 0 0 0 4 0V3",
    "M18 21V3c2 1 3 3 3 6s-1 4-3 5",
  ],
  villany: [
    // villám
    "M13 2L3 14h9l-1 8l10-12h-9l1-8z",
  ],
  fordito: [
    // beszédbuborék + sorok
    "M4 5h16v10H9l-4 4V15H4z",
    "M8 9h8",
    "M8 12h5",
  ],
  takarito: [
    // spray-flakon
    "M7 9h8v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z",
    "M9 9V6h4v3",
    "M10 6V4h2v2",
    "M17 5h.01",
    "M19 7h.01",
    "M17 9h.01",
  ],
  it: [
    // kód-zárójelek
    "M16 6l6 6l-6 6",
    "M8 6l-6 6l6 6",
  ],
};

/** A pin fejébe kerülő SVG (vagy pötty, ha ismeretlen a kategória). */
function iconSvgFor(categoryId: string | null): string {
  const paths = categoryId ? CATEGORY_ICON_PATHS[categoryId] : undefined;
  if (!paths) {
    return `<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>`;
  }
  const inner = paths.map((d) => `<path d="${d}"/>`).join("");
  return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const ICON_CACHE = new Map<string, L.DivIcon>();

function pinFor(b: Business): L.DivIcon {
  const key = `${b.categoryId ?? "none"}-${b.featured ? "f" : "d"}`;
  const cached = ICON_CACHE.get(key);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "", // a Leaflet alapértelmezett .leaflet-div-icon kikapcsolása
    html: `<div class="kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""}">
             <span class="kinti-pin-v2__inner">${iconSvgFor(b.categoryId)}</span>
           </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42], // a tűvég hegye a koordinátán
    popupAnchor: [0, -38],
  });
  ICON_CACHE.set(key, icon);
  return icon;
}

// --- popup tartalom ---------------------------------------------------------

function BusinessPopup({ business: b }: { business: Business }) {
  const logoUrl = mediaUrl(b.logoKey);
  return (
    <article className="p-3">
      <div className="flex gap-3">
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-primary-soft"
          style={!logoUrl && b.photo ? { background: b.photo } : undefined}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wide text-primary">
              {b.categoryLabel}
            </span>
            <span className="text-[10px] text-ink-faint">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink">
              <Icon name="star" size={10} filled className="text-star" />
              {b.rating.toFixed(1)}
            </span>
          </div>
          <h3 className="truncate text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
            {b.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] font-medium text-ink-muted">
            {b.address}
          </p>
        </div>
      </div>

      <Link
        href={`/szaknevsor/${b.id}`}
        className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-3 text-[12px] font-bold text-white"
      >
        Profil megnyitása
        <Icon name="arrowRight" size={12} strokeWidth={2.4} />
      </Link>
    </article>
  );
}

// --- vezérlők ---------------------------------------------------------------

/** Auto-fit a markerek bounding-box-ára (csak ha 2+ van; egynél fix zoom). */
function FitToMarkers({ businesses }: { businesses: Business[] }) {
  const map = useMap();
  const lastSig = useRef<string>("");
  useEffect(() => {
    const sig = businesses.map((b) => b.id).join("|");
    if (sig === lastSig.current) return;
    lastSig.current = sig;

    if (businesses.length === 0) return;
    if (businesses.length === 1) {
      const [b] = businesses;
      map.setView([b.lat!, b.lng!], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(
      businesses.map((b) => [b.lat!, b.lng!] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
  }, [businesses, map]);
  return null;
}

/** Liquid Glass overlay: lokáció + zoom. */
function MapControls() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 0.6 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "none" }}>
      <div
        className="leaflet-control"
        style={{ pointerEvents: "auto", margin: "12px 12px 0 0", display: "grid", gap: 8 }}
      >
        <button
          type="button"
          aria-label="Saját helyem"
          onClick={handleLocate}
          className={cn(
            "glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card",
            locating && "animate-pulse",
          )}
        >
          <Icon name="nav" size={16} strokeWidth={2.2} className="text-primary" />
        </button>
        <button
          type="button"
          aria-label="Nagyítás"
          onClick={() => map.zoomIn()}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          aria-label="Kicsinyítés"
          onClick={() => map.zoomOut()}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card"
        >
          <span className="text-[18px] font-extrabold leading-none">−</span>
        </button>
      </div>
    </div>
  );
}
