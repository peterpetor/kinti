"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { FallbackTileLayer } from "./fallback-tile-layer";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { KintiEvent } from "@/lib/types";
import { useMyLocation } from "@/lib/use-my-location";
import { EVENT_TAGS } from "./events-tags";

const ME_ICON = L.divIcon({ className: "", html: '<div class="kinti-me-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const CENTERS: Record<string, [number, number]> = {
  CH: [46.82, 8.23], AT: [47.59, 14.14], DE: [51.1, 10.4], NL: [52.13, 5.29],
};

function tagIcon(tag: string): L.DivIcon {
  const t = EVENT_TAGS[tag] ?? EVENT_TAGS.egyeb;
  return L.divIcon({
    className: "",
    html: `<div style="width:38px;height:38px;border-radius:50%;background:${t.color};display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.22);border:2.5px solid white;">${t.emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
}

export function EventsMap({ events, className, country = "CH" }: { events: KintiEvent[]; className?: string; country?: string }) {
  const myPos = useMyLocation();
  const icons = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    for (const e of events) if (e.tag && !m.has(e.tag)) m.set(e.tag, tagIcon(e.tag));
    return m;
  }, [events]);

  const withCoords = events.filter((e) => e.lat != null && e.lng != null);
  const center: [number, number] = withCoords.length > 0
    ? [withCoords[0].lat as number, withCoords[0].lng as number]
    : CENTERS[country] ?? CENTERS.CH;

  return (
    <div className={className}>
      <MapContainer center={center} zoom={withCoords.length > 0 ? 7 : country === "DE" ? 6 : 7} className="h-full w-full rounded-card z-0" scrollWheelZoom>
        <FallbackTileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {myPos && <Marker position={myPos} icon={ME_ICON} interactive={false} />}
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={40}>
          {withCoords.map((e) => {
            const t = EVENT_TAGS[e.tag ?? "egyeb"] ?? EVENT_TAGS.egyeb;
            return (
              <Marker key={e.id} position={[e.lat as number, e.lng as number]} icon={icons.get(e.tag ?? "egyeb") ?? tagIcon("egyeb")}>
                <Popup maxWidth={260} minWidth={200}>
                  <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: t.color, color: "white", padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                      {t.emoji} {t.label}
                    </span>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0e1f17", margin: "4px 0" }}>{e.title}</div>
                    {(e.dateDay || e.startTime) && (
                      <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 2 }}>
                        🗓️ {[e.dateDay, e.dateMonth].filter(Boolean).join(". ")}{e.dateMonth ? "." : ""} {e.startTime ?? ""}
                      </div>
                    )}
                    {e.venue && <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 2 }}>📍 {e.venue}</div>}
                    {e.description && <div style={{ fontSize: 12, color: "#0e1f17", marginTop: 4 }}>{e.description}</div>}
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
