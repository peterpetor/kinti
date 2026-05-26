"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Business } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { cn } from "@/lib/cn";
import { clusterBusinesses, clusterBounds, clusterSize } from "@/lib/cluster";

import "leaflet/dist/leaflet.css";

/**
 * Leaflet (raszteres) motor — minden környezetben (VM, WebGL-nélkül is) megy.
 * Csempék: CartoDB Voyager (meleg, prémium, ingyenes).
 * Klaszterezés: zoom-szinthez igazított greedy geo-klaszter, külső csomag nélkül.
 */
export interface MapEngineProps {
  located: Business[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  fallbackCenter: [number, number]; // [lat, lng]
  fallbackZoom: number;
}

export function LeafletEngine({
  located,
  selectedId,
  onSelectMarker,
  fallbackCenter,
  fallbackZoom,
}: MapEngineProps) {
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);

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
      <TileLayer
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

      {myPosition && (
        <Marker position={myPosition} icon={ME_ICON} interactive={false} />
      )}

      <FitToMarkers businesses={located} />
      <Controls onLocate={setMyPosition} />
    </MapContainer>
  );
}

// ---------------------------------------------------------------------------
// Klaszterezett markerek — zoom-figyeléssel
// ---------------------------------------------------------------------------

function ClusteredMarkers({
  located,
  selectedId,
  onSelectMarker,
}: {
  located: Business[];
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
                const bounds = clusterBounds(located, pt.itemIds);
                map.fitBounds(bounds, {
                  padding: [80, 80],
                  maxZoom: 15,
                  animate: true,
                });
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

const PIN_CACHE = new Map<string, L.DivIcon>();

function pinFor(b: Business, active: boolean): L.DivIcon {
  const key = `${b.categoryId ?? "none"}-${b.featured ? "f" : "d"}-${active ? "a" : "n"}`;
  const cached = PIN_CACHE.get(key);
  if (cached) return cached;
  const icon = L.divIcon({
    className: "",
    html: `<div class="kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""} ${active ? "kinti-pin-v2--active" : ""}">
             <span class="kinti-pin-v2__inner">${categoryIconSvgString(b.categoryId)}</span>
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

function FitToMarkers({ businesses }: { businesses: Business[] }) {
  const map = useMap();
  const lastSig = useRef<string>("");

  useEffect(() => {
    const sig = businesses.map((b) => b.id).join("|");
    if (sig === lastSig.current) return;
    lastSig.current = sig;
    if (businesses.length === 0) return;
    if (businesses.length === 1) {
      map.setView([businesses[0].lat!, businesses[0].lng!], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(
      businesses.map((b) => [b.lat!, b.lng!] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [50, 70], maxZoom: 16, animate: true });
  }, [businesses, map]);

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
