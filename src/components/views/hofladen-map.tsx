"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { PublicHofladenSpot } from "@/lib/repo";
import {
  getCategoryById,
  getPaymentMethodById,
} from "@/lib/hofladen";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';
const CH_CENTER: [number, number] = [46.82, 8.23];
const CH_ZOOM = 8;

function createHofladenIcon(open24h: boolean): L.DivIcon {
  const bg = open24h ? "#16a34a" : "#e3a233";
  return L.divIcon({
    className: "",
    html: `
      <div style="width:38px;height:38px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.22);border:2.5px solid white;">
        🌾
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
}

export function HofladenMap({
  spots,
  className,
}: {
  spots: PublicHofladenSpot[];
  className?: string;
}) {
  const icon24h = useMemo(() => createHofladenIcon(true), []);
  const iconLimited = useMemo(() => createHofladenIcon(false), []);

  const center: [number, number] = spots.length > 0
    ? [spots[0].lat, spots[0].lng]
    : CH_CENTER;

  return (
    <div className={className}>
      <MapContainer center={center} zoom={spots.length > 0 ? 10 : CH_ZOOM} className="h-full w-full rounded-card z-0" scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
          {spots.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={s.open24h ? icon24h : iconLimited}>
              <Popup maxWidth={280} minWidth={220}>
                <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: "#0e1f17" }}>
                    🌾 {s.name}
                  </div>
                  {s.locationName && (
                    <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 6 }}>
                      📍 {s.locationName}{s.cantonCode ? ` (${s.cantonCode})` : ""}
                    </div>
                  )}

                  {/* Open status */}
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 8,
                    padding: "3px 8px",
                    borderRadius: 999,
                    display: "inline-block",
                    background: s.open24h ? "#16a34a" : "#e3a233",
                    color: "white",
                  }}>
                    {s.open24h ? "🕐 24h" : `🕐 ${s.openText || "Korlátozott"}`}
                  </div>

                  {/* Kategóriák */}
                  {s.categories.length > 0 && (
                    <div style={{ fontSize: 12, marginBottom: 6 }}>
                      {s.categories.map((c) => {
                        const cat = getCategoryById(c);
                        if (!cat) return null;
                        return (
                          <span key={c} style={{
                            display: "inline-block",
                            marginRight: 4,
                            marginBottom: 4,
                            padding: "2px 6px",
                            background: "#fbf7ee",
                            borderRadius: 6,
                            fontSize: 11,
                          }}>
                            {cat.emoji} {cat.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Fizetés */}
                  {s.paymentMethods.length > 0 && (
                    <div style={{ fontSize: 11, marginBottom: 6, color: "#5c6d63" }}>
                      <strong>Fizetés:</strong>{" "}
                      {s.paymentMethods.map((p) => {
                        const pm = getPaymentMethodById(p);
                        return pm ? `${pm.emoji} ${pm.label}` : p;
                      }).join(", ")}
                    </div>
                  )}

                  {s.note && (
                    <div style={{ fontSize: 12, color: "#0e1f17", marginTop: 6, fontStyle: "italic" }}>
                      „{s.note}"
                    </div>
                  )}

                  {/* Navigate link */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      marginTop: 8,
                      textAlign: "center",
                      padding: "6px 0",
                      background: "#1d4434",
                      color: "white",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    🧭 Útvonal (Google Maps)
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
