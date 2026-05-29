"use client";

import { Fragment, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Icon } from "@/components/ui";
import type { PublicRide } from "@/lib/repo";
import type { SosAlert } from "@/lib/sos-repo";
import { phoneToWhatsapp } from "@/lib/rides";
import { handleFromId } from "@/lib/handle";

/**
 * RideMap — Telekocsi Leaflet-térkép kék 🚗 markerekkel. Önálló, nem érinti
 * a Szaknévsor duál-motoros térképet (alacsony kockázat). CartoDB Positron tiles.
 */

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

/** Svájc középre. */
const CH_CENTER: [number, number] = [46.82, 8.23];
const CH_ZOOM = 7;

function createCarIcon(isRequest: boolean): L.DivIcon {
  const bg = isRequest ? "#e67e22" : "#3a6ea5";
  const emoji = isRequest ? "🙋‍♂️" : "🚗";
  return L.divIcon({
    className: "",
    html: `<div style="width:38px;height:38px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.22);border:2.5px solid white;cursor:pointer;">${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
}

/** Kisebb pont a közbeeső megállókhoz. */
function createStopIcon(isRequest: boolean): L.DivIcon {
  const bg = isRequest ? "#e67e22" : "#3a6ea5";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${bg};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.2);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

/** SOS pulzáló piros marker. */
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

const HU_MON = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
function fmtDT(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) return `${HU_MON[Number(m[2]) - 1]} ${Number(m[3])}. ${m[4]}:${m[5]}`;
  return iso;
}

export function RideMap({
  rides,
  sosAlerts = [],
  onSelectSos,
  className,
}: {
  rides: PublicRide[];
  /** Aktív SOS-riasztások — telekocsis kontextusban a sofőröknek értelmes. */
  sosAlerts?: SosAlert[];
  /** SOS-kiválasztás callback — a parent egy modal-t nyit a részletekhez. */
  onSelectSos?: (id: string) => void;
  className?: string;
}) {
  const offerIcon = useMemo(() => createCarIcon(false), []);
  const requestIcon = useMemo(() => createCarIcon(true), []);
  const offerStopIcon = useMemo(() => createStopIcon(false), []);
  const requestStopIcon = useMemo(() => createStopIcon(true), []);

  // A térkép középpontja: ha van fuvar, az első; egyébként Svájc közepe.
  const center: [number, number] = rides.length > 0
    ? [rides[0].lat, rides[0].lng]
    : CH_CENTER;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={rides.length > 0 ? 8 : CH_ZOOM}
        className="h-full w-full rounded-card z-0"
        scrollWheelZoom
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {/* Klaszterezzük a fő (indulási) markereket — a megállók + útvonal kívül marad */}
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={45}>
        {rides.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={r.isRequest ? requestIcon : offerIcon}>
            <Popup maxWidth={280} minWidth={220}>
              <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#0e1f17" }}>
                  {r.departureCity}
                  {r.waypoints.map((wp) => ` → ${wp.city}`).join("")}
                  {" → "}{r.destinationCity}
                </div>
                <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 8 }}>
                  📅 {fmtDT(r.departureTime)} · 👥 {r.isRequest ? `Keres: ${r.seats} fő` : `${r.seats} hely`}
                  {r.priceText ? ` · ${r.priceText}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "#5c6d63", marginBottom: 10 }}>
                  {r.posterName?.trim() || handleFromId(r.id)}
                  {r.notes ? ` — ${r.notes.slice(0, 80)}${r.notes.length > 80 ? "…" : ""}` : ""}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={`tel:${r.contactPhone}`}
                    style={{
                      flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 999,
                      background: "#1d4434", color: "#fff", fontWeight: 700, fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    📞 Hívás
                  </a>
                  <a
                    href={`https://wa.me/${phoneToWhatsapp(r.contactWhatsapp || r.contactPhone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 999,
                      background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        </MarkerClusterGroup>

        {/* Megálló-jelölők és polyline-ok a klaszteren kívül (vizuális útvonal). */}
        {rides.map((r) => (
          <Fragment key={`route-${r.id}`}>
            {r.waypoints.map((wp, i) => (
              <Marker key={`${r.id}-wp-${i}`} position={[wp.lat, wp.lng]} icon={r.isRequest ? requestStopIcon : offerStopIcon} />
            ))}
            {r.waypoints.length > 0 && (
              <Polyline
                positions={[
                  [r.lat, r.lng],
                  ...r.waypoints.map((wp) => [wp.lat, wp.lng] as [number, number]),
                ]}
                pathOptions={{ color: r.isRequest ? "#e67e22" : "#3a6ea5", weight: 3, opacity: 0.6, dashArray: "8 6" }}
              />
            )}
          </Fragment>
        ))}

        {/* SOS-pinek — pulzáló piros markerek a klaszteren KÍVÜL (mindig láthatók). */}
        {sosAlerts.map((sos) => (
          <Marker
            key={`sos-${sos.id}`}
            position={[sos.lat, sos.lng]}
            icon={SOS_ICON}
            eventHandlers={{
              click: () => onSelectSos?.(sos.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
