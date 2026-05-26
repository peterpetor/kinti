"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Business } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { cn } from "@/lib/cn";

import "leaflet/dist/leaflet.css";

/**
 * Leaflet (raszteres) motor — minden környezetben (VM, WebGL-nélkül is) megy.
 * Csempék: CartoDB Positron (tiszta, világos, ingyenes).
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
  return (
    <MapContainer
      center={fallbackCenter}
      zoom={fallbackZoom}
      scrollWheelZoom
      zoomControl={false}
      // `z-0` + relative pozíció (Leaflet maga is `position: relative`) → saját
      // stacking-context. Enélkül a Leaflet belső panelei (z-index 200–1000)
      // legyűrnék a wrapper overlay-eit (z-10): hely-pill, kateg.-pillek, kártya.
      className="h-full w-full relative z-0"
      style={{ background: "rgb(var(--map-land))" }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {located.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat!, b.lng!]}
          icon={pinFor(b, b.id === selectedId)}
          eventHandlers={{ click: () => onSelectMarker(b.id) }}
        />
      ))}

      <FitToMarkers businesses={located} />
      <Controls />
    </MapContainer>
  );
}

const ICON_CACHE = new Map<string, L.DivIcon>();

function pinFor(b: Business, active: boolean): L.DivIcon {
  const key = `${b.categoryId ?? "none"}-${b.featured ? "f" : "d"}-${active ? "a" : "n"}`;
  const cached = ICON_CACHE.get(key);
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
  ICON_CACHE.set(key, icon);
  return icon;
}

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
    map.fitBounds(bounds, { padding: [50, 70], maxZoom: 16, animate: true });
  }, [businesses, map]);
  return null;
}

function Controls() {
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
