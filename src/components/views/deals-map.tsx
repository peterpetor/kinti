"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { DealReport } from "@/lib/repo";
import {
  getStoreById,
  getCategoryById,
} from "@/lib/deals";
import { useMyLocation } from "@/lib/use-my-location";

/** „Te vagy itt" pötty — egységes a többi térképpel. */
const ME_ICON = L.divIcon({
  className: "",
  html: '<div class="kinti-me-dot"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const CH_CENTER: [number, number] = [46.82, 8.23];
const CH_ZOOM = 7;

/** Bolt-szín + kedvezmény-fokozat alapján generál egy egyedi pin-t. */
function createDealIcon(storeColor: string, storeInitial: string, discountPct: number, emoji: string): L.DivIcon {
  // Nagyobb kedvezmény = nagyobb badge
  const size = discountPct >= 50 ? 48 : discountPct >= 30 ? 42 : 38;
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${storeColor};
          display:flex;align-items:center;justify-content:center;
          font-size:${size * 0.45}px;
          box-shadow:0 2px 8px rgba(0,0,0,.22);
          border:2.5px solid white;
          color:white;font-weight:900;
        ">${emoji}</div>
        <div style="
          position:absolute;top:-6px;right:-10px;
          background:#0e1f17;color:white;
          padding:2px 6px;border-radius:10px;
          font-size:10px;font-weight:900;
          border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
          white-space:nowrap;
        ">-${discountPct}%</div>
      </div>
    `,
    iconSize: [size + 20, size + 12],
    iconAnchor: [(size + 20) / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function DealsMap({
  deals,
  className,
}: {
  deals: DealReport[];
  className?: string;
}) {
  // Saját pozíció, ha a helymeghatározás már engedélyezve van (prompt nélkül).
  const myPos = useMyLocation();
  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    for (const d of deals) {
      const store = getStoreById(d.storeId);
      const cat = getCategoryById(d.categoryId);
      const key = `${d.storeId}-${d.categoryId}-${d.discountPct}`;
      if (!map.has(key)) {
        map.set(
          key,
          createDealIcon(
            store?.color ?? "#5c6d63",
            store?.initial ?? "?",
            d.discountPct,
            cat?.emoji ?? "🏷️",
          ),
        );
      }
    }
    return map;
  }, [deals]);

  const center: [number, number] = deals.length > 0
    ? [deals[0].lat, deals[0].lng]
    : CH_CENTER;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={deals.length > 0 ? 9 : CH_ZOOM}
        className="h-full w-full rounded-card z-0"
        scrollWheelZoom
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {myPos && <Marker position={myPos} icon={ME_ICON} interactive={false} />}
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={40}>
          {deals.map((d) => {
            const store = getStoreById(d.storeId);
            const cat = getCategoryById(d.categoryId);
            const key = `${d.storeId}-${d.categoryId}-${d.discountPct}`;
            const icon = icons.get(key);
            if (!icon) return null;
            return (
              <Marker key={d.id} position={[d.lat, d.lng]} icon={icon}>
                <Popup maxWidth={260} minWidth={200}>
                  <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: store?.color ?? "#5c6d63",
                          color: "white",
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {store?.label ?? d.storeId}
                      </span>
                      <span
                        style={{
                          background: "#0e1f17",
                          color: "white",
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        −{d.discountPct}%
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0e1f17", marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{cat?.emoji}</span> {cat?.label ?? d.categoryId}
                    </div>
                    {d.locationName && (
                      <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 4 }}>
                        📍 {d.locationName}
                      </div>
                    )}
                    {d.note && (
                      <div style={{ fontSize: 12, color: "#0e1f17", fontStyle: "italic", marginBottom: 6 }}>
                        „{d.note}"
                      </div>
                    )}
                    <div style={{ fontSize: 10.5, color: "#94a097" }}>
                      Lejár éjfélkor · {fmtAgo(d.createdAt)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

function fmtAgo(iso: string): string {
  const t = Date.parse(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az imént";
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  return `${h}h`;
}
