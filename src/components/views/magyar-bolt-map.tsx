"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import { FallbackTileLayer } from "./fallback-tile-layer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/cn";
import { useMyLocation } from "@/lib/use-my-location";
import { BOLT_CATEGORIES, boltCategory, type BoltSpot } from "@/lib/magyar-bolt";

const ME_ICON = L.divIcon({ className: "", html: '<div class="kinti-me-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';
const CENTERS: Record<string, [number, number]> = { CH: [46.82, 8.23], AT: [47.59, 14.14], DE: [51.1, 10.4], NL: [52.13, 5.29] };
const FALLBACK = { emoji: "📍", color: "#5c6d63" };

function catIcon(category: string | null): L.DivIcon {
  const c = boltCategory(category) ?? FALLBACK;
  return L.divIcon({
    className: "",
    html: `<div style="width:38px;height:38px;border-radius:50%;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.22);border:2.5px solid white;">${c.emoji}</div>`,
    iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -19],
  });
}

/** A térkép-konténer méretváltása után (pl. fullscreen) a leaflet-nek újra kell
 *  számolnia a csempéket, különben szürke/levágott marad. */
function MapResizer({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 220);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

/** Popup-tartalom saját „jelentve" állapottal — a jelentés után azonnali visszajelzést ad. */
function SpotPopupBody({ s, onReport }: { s: BoltSpot; onReport: (id: string) => void }) {
  const [reported, setReported] = useState(false);
  const c = boltCategory(s.category);
  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      {c && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: c.color, color: "white", padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
          {c.emoji} {c.label}
        </span>
      )}
      <div style={{ fontSize: 15, fontWeight: 800, color: "#0e1f17", margin: "4px 0" }}>{s.name}</div>
      {s.locationName && <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 2 }}>📍 {s.locationName}</div>}
      {s.note && <div style={{ fontSize: 12, color: "#0e1f17", marginTop: 4 }}>{s.note}</div>}
      {reported ? (
        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: "#1d4434" }}>✓ Köszönjük, jeleztük! Ha többen is jelzik, levesszük.</div>
      ) : (
        <button
          type="button"
          onClick={() => { onReport(s.id); setReported(true); }}
          style={{ marginTop: 8, fontSize: 11, color: "#94a097", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          🚩 Hibás / megszűnt? Jelentem
        </button>
      )}
    </div>
  );
}

export function MagyarBoltMap({
  spots, country = "CH", className, onReport,
}: { spots: BoltSpot[]; country?: string; className?: string; onReport: (id: string) => void }) {
  const myPos = useMyLocation();
  const [fs, setFs] = useState(false);
  const icons = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    for (const c of BOLT_CATEGORIES) m.set(c.id, catIcon(c.id));
    m.set("__none", catIcon(null));
    return m;
  }, []);

  const center: [number, number] = spots.length > 0 ? [spots[0].lat, spots[0].lng] : CENTERS[country] ?? CENTERS.CH;

  // ESC = kilépés a teljes képernyőből.
  useEffect(() => {
    if (!fs) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFs(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fs]);

  return (
    <div className={fs ? "fixed inset-0 z-[1000] bg-white" : cn("relative", className)}>
      <MapContainer center={center} zoom={spots.length > 0 ? 8 : 7} className="h-full w-full rounded-card z-0" scrollWheelZoom>
        <FallbackTileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MapResizer trigger={fs} />
        {myPos && <Marker position={myPos} icon={ME_ICON} interactive={false} />}
        <>
          {spots.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={icons.get(s.category ?? "__none") ?? icons.get("__none")!}>
              <Popup maxWidth={260} minWidth={200}>
                <SpotPopupBody s={s} onReport={onReport} />
              </Popup>
            </Marker>
          ))}
        </>
      </MapContainer>

      <button
        type="button"
        onClick={() => setFs((v) => !v)}
        aria-label={fs ? "Kilépés a teljes képernyőből" : "Teljes képernyő"}
        className="absolute right-2 top-2 z-[1000] grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-white/95 text-[16px] text-ink shadow-card active:scale-95"
      >
        {fs ? "✕" : "⛶"}
      </button>
    </div>
  );
}
