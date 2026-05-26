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

const ICON_CACHE = new Map<string, L.DivIcon>();

function pinFor(b: Business): L.DivIcon {
  const key = b.featured ? "featured" : "default";
  const cached = ICON_CACHE.get(key);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "", // a Leaflet alapértelmezett .leaflet-div-icon kikapcsolása
    html: `<div class="kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""}">
             <span class="kinti-pin-v2__inner">${b.featured ? "★" : "•"}</span>
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
