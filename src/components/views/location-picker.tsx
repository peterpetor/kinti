"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, useMapEvents, useMap } from "react-leaflet";
import { FallbackTileLayer } from "./fallback-tile-layer";
import { MapAutoResize } from "./map-controls";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PIN = L.divIcon({
  className: "",
  html: '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#c8392e;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

/** A térkép közepét a `center` propra állítja, amikor az VÁLTOZIK (pl. város-váltás). */
function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    // A kezdeti középre-állítást a MapContainer `center` propja MÁR elintézi. A
    // mount-kori setView viszont akkor futna, amikor a modal-konténer még nincs
    // beméretezve (0 méret) → a Leaflet „Attempted to load an infinite number of
    // tiles" hibát dob a _resetView-ban → route-error („Hoppá"). Ezért az elsőt
    // kihagyjuk, és csak VALÓDI center-változáskor, bemért konténernél állítunk.
    if (first.current) { first.current = false; return; }
    try {
      const c = map.getContainer();
      if (c && c.clientWidth > 0 && c.clientHeight > 0) map.setView(center, map.getZoom());
    } catch { /* átmeneti Leaflet-belső hiba — ne döntse le az oldalt */ }
  }, [center, map]);
  return null;
}

/**
 * LocationPicker — koppints a térképre a pontos hely megadásához (precíz pin v2).
 * A `center` a választott város; `value` a kiválasztott pont (vagy null).
 */
export function LocationPicker({
  center,
  value,
  onChange,
  className,
}: {
  center: [number, number];
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <MapContainer center={value ? [value.lat, value.lng] : center} zoom={12} className="h-full w-full rounded-card z-0" scrollWheelZoom>
        <FallbackTileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MapAutoResize />
        <Recenter center={center} />
        <ClickCapture onPick={(lat, lng) => onChange({ lat, lng })} />
        {value && <Marker position={[value.lat, value.lng]} icon={PIN} />}
      </MapContainer>
    </div>
  );
}
