"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import { FallbackTileLayer } from "./fallback-tile-layer";
import type { ListBusiness } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { cn } from "@/lib/cn";
import { clusterBusinesses, clusterBounds, clusterSize } from "@/lib/cluster";
import { useMyLocation } from "@/lib/use-my-location";
import type { SosAlert } from "@/lib/sos-repo";

import "leaflet/dist/leaflet.css";

/**
 * Leaflet (raszteres) motor — minden környezetben (VM, WebGL-nélkül is) megy.
 * Csempék: CartoDB Voyager (meleg, prémium, ingyenes).
 * Klaszterezés: zoom-szinthez igazított greedy geo-klaszter, külső csomag nélkül.
 */
export interface MapEngineProps {
  located: ListBusiness[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  fallbackCenter: [number, number]; // [lat, lng]
  fallbackZoom: number;
  sosAlerts?: SosAlert[];
  onSelectSosAlert?: (id: string) => void;
  /** Ha true, a térkép teljes képernyőn van → a Leaflet-nek újra kell mérnie. */
  fullscreen?: boolean;
  /** A kártya-carousel/marker-koppintás által KIFEJEZETTEN kiválasztott cég id-je
   *  (null a kezdő/alapértelmezett kiválasztásnál) → a térkép finoman ráúszik.
   *  A `selectedId`-től külön, mert az az alap-kártyánál is nem-null lehet, és
   *  arra NEM akarunk pásztázni (a FitToMarkers keretezi az egészet). */
  panToId?: string | null;
}

export function LeafletEngine({
  located,
  selectedId,
  onSelectMarker,
  fallbackCenter,
  fallbackZoom,
  sosAlerts = [],
  onSelectSosAlert,
  fullscreen,
  panToId,
}: MapEngineProps) {
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  // Automatikus pozíció, ha a helymeghatározás már engedélyezve van (prompt nélkül).
  const autoPosition = useMyLocation();
  const effectivePosition = myPosition ?? autoPosition;

  return (
    <MapContainer
      center={fallbackCenter}
      zoom={fallbackZoom}
      scrollWheelZoom
      zoomControl={false}
      doubleClickZoom={false}
      className="h-full w-full relative z-0"
      style={{ background: "rgb(var(--map-land))" }}
    >
      {/* CartoDB Voyager — meleg, prémium, licenc-mentes */}
      <FallbackTileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      <ClusteredMarkers
        located={located}
        selectedId={selectedId}
        onSelectMarker={onSelectMarker}
      />

      {sosAlerts.map((sos) => (
        <Marker
          key={sos.id}
          position={[sos.lat, sos.lng]}
          icon={SOS_ICON}
          eventHandlers={{
            click: () => onSelectSosAlert?.(sos.id),
          }}
        />
      ))}

      {effectivePosition && (
        <Marker position={effectivePosition} icon={ME_ICON} interactive={false} />
      )}

      <FitToMarkers businesses={located} sosAlerts={sosAlerts} />
      <PanToSelected id={panToId ?? null} businesses={located} />
      <Controls onLocate={setMyPosition} />
      <InvalidateSize trigger={fullscreen} />
    </MapContainer>
  );
}

/**
 * Fullscreen-váltáskor (konténer-méret változás) a Leaflet-nek újra kell mérnie.
 * Több próbálkozás, mert a fullscreen-layout (100dvh + safe-area) később ül le —
 * egyetlen hívás üres (szürke) térképet hagyhat.
 */
function InvalidateSize({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const timers = [60, 220, 450, 800].map((d) => setTimeout(() => map.invalidateSize(), d));
    return () => timers.forEach(clearTimeout);
  }, [trigger, map]);
  return null;
}

// ---------------------------------------------------------------------------
// Klaszterezett markerek — zoom-figyeléssel
// ---------------------------------------------------------------------------

function ClusteredMarkers({
  located,
  selectedId,
  onSelectMarker,
}: {
  located: ListBusiness[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const points = useMemo(
    () => clusterBusinesses(located, zoom),
    [located, zoom],
  );

  return (
    <>
      {points.map((pt) => {
        if (pt.type === "single") {
          return (
            <Marker
              key={pt.business.id}
              position={[pt.business.lat!, pt.business.lng!]}
              icon={pinFor(pt.business, pt.business.id === selectedId)}
              eventHandlers={{ click: () => onSelectMarker(pt.business.id) }}
            />
          );
        }

        // Klaszter marker
        const sz = clusterSize(pt.count);
        return (
          <Marker
            key={pt.id}
            position={[pt.lat, pt.lng]}
            icon={clusterIconFor(pt.count, sz)}
            eventHandlers={{
              click: () => {
                // A spreadColocated minden azonos-koordinátás csoportot spirálba
                // szór → a klaszter bounds-a nem nulla-méretű, így a kattintás
                // RÁZOOMOL és a pinek (saját ikonnal) külön válnak. maxZoom 19,
                // hogy a sűrű városközpont-spirálok is jól szétnyíljanak.
                const b = clusterBounds(located, pt.itemIds);
                if (b) {
                  map.fitBounds(b, {
                    padding: [60, 60],
                    maxZoom: 19,
                    animate: true,
                  });
                }
              },
            }}
          />
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Ikon factory-k
// ---------------------------------------------------------------------------

/** „Te vagy itt" pötty — divIcon, center anchor. */
const ME_ICON = L.divIcon({
  className: "",
  html: '<div class="kinti-me-dot"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const SOS_ICON = L.divIcon({
  className: "",
  html: `
    <div class="flex h-10 w-10 items-center justify-center relative">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
      <span class="relative flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white text-lg">🆘</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const PIN_CACHE = new Map<string, L.DivIcon>();

function pinFor(b: ListBusiness, active: boolean): L.DivIcon {
  // FONTOS: a categoryLabel is a kulcsban — a magyar-kozosseg pinek ikonja az
  // altípus-labelből jön, enélkül minden szervezet az elsőként cache-elt ikont kapná.
  const key = `${b.categoryId ?? "none"}|${b.categoryLabel ?? ""}|${b.featured ? "f" : "d"}|${active ? "a" : "n"}`;
  const cached = PIN_CACHE.get(key);
  if (cached) return cached;
  const icon = L.divIcon({
    className: "",
    html: `<div class="kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""} ${active ? "kinti-pin-v2--active" : ""}">
             <span class="kinti-pin-v2__inner">${categoryIconSvgString(b.categoryId, b.categoryLabel)}</span>
           </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
  PIN_CACHE.set(key, icon);
  return icon;
}

const CLUSTER_CACHE = new Map<string, L.DivIcon>();

function clusterIconFor(count: number, sz: "sm" | "md" | "lg"): L.DivIcon {
  const key = `${count}-${sz}`;
  const cached = CLUSTER_CACHE.get(key);
  if (cached) return cached;

  const dim = sz === "lg" ? 62 : sz === "md" ? 52 : 44;
  const anchor = dim / 2;

  const icon = L.divIcon({
    className: "",
    html: `<div class="kinti-cluster kinti-cluster--${sz}">
             <div class="kinti-cluster__bubble">
               <span class="kinti-cluster__count">${count}</span>
             </div>
           </div>`,
    iconSize: [dim, dim],
    iconAnchor: [anchor, anchor],
  });
  CLUSTER_CACHE.set(key, icon);
  return icon;
}

// ---------------------------------------------------------------------------
// Helper komponensek
// ---------------------------------------------------------------------------

function FitToMarkers({ businesses, sosAlerts = [] }: { businesses: ListBusiness[], sosAlerts?: SosAlert[] }) {
  const map = useMap();
  const lastSig = useRef<string>("");

  useEffect(() => {
    const sig = businesses.map((b) => b.id).join("|") + sosAlerts.map(s => s.id).join("|");
    if (sig === lastSig.current) return;
    lastSig.current = sig;

    // Csak az érvényes koordinátájú vállalkozások: a geokódolás szerveroldalon
    // elszállhatott → null lat/lng. Ilyen értékekkel az L.latLngBounds érvénytelen
    // argumentumot kapna és szétfagyasztaná a térképet (és a React-fát).
    const geoBiz = businesses.filter(
      (b): b is ListBusiness & { lat: number; lng: number } =>
        typeof b.lat === "number" && typeof b.lng === "number",
    );

    if (geoBiz.length === 0 && sosAlerts.length === 0) return;

    if (geoBiz.length === 1 && sosAlerts.length === 0) {
      map.setView([geoBiz[0].lat, geoBiz[0].lng], 15, { animate: true });
      return;
    }

    const pts = [
      ...geoBiz.map((b) => [b.lat, b.lng] as [number, number]),
      ...sosAlerts.map((s) => [s.lat, s.lng] as [number, number])
    ];
    if (pts.length === 0) return;

    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds, { padding: [50, 70], maxZoom: 16, animate: true });
  }, [businesses, sosAlerts, map]);

  return null;
}

/**
 * A kiválasztott (carousel/marker-koppintás) céghez finoman pásztáz — a zoom-
 * szintet MEGTARTJA (nem ugrik bele/ki), így a felhasználó térbeli kontextusa
 * megmarad. Csak explicit (nem-null) kiválasztásnál mozdul; az azonos id ismételt
 * beállítására nem pásztáz újra (pl. a `located` frissülésekor).
 */
function PanToSelected({ id, businesses }: { id: string | null; businesses: ListBusiness[] }) {
  const map = useMap();
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (!id || id === prev.current) return;
    const b = businesses.find((x) => x.id === id);
    if (!b || b.lat == null || b.lng == null) return;
    prev.current = id;
    const reduce = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    map.panTo([b.lat, b.lng], { animate: !reduce, duration: 0.4 });
  }, [id, businesses, map]);
  return null;
}

function Controls({ onLocate }: { onLocate: (ll: [number, number]) => void }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  // Véd a dupla-kattintásos zoom-irányváltás ellen: 300ms tiltás minden zoom után.
  const zoomBusy = useRef(false);

  function doZoom(dir: "in" | "out", e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (zoomBusy.current) return;
    zoomBusy.current = true;
    if (dir === "in") map.zoomIn();
    else map.zoomOut();
    setTimeout(() => { zoomBusy.current = false; }, 350);
  }

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.flyTo(ll, 15, { duration: 0.6 });
        onLocate(ll);
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
          onClick={(e) => doZoom("in", e)}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card active:scale-95 transition-transform"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          aria-label="Kicsinyítés"
          onClick={(e) => doZoom("out", e)}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card active:scale-95 transition-transform"
        >
          <span className="text-[18px] font-extrabold leading-none">−</span>
        </button>
      </div>
    </div>
  );
}
