"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Business, Category } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

import "leaflet/dist/leaflet.css";

/**
 * BusinessMap — raszteres Leaflet-térkép app-réteggel (mockup-kompozíció):
 *   • kategória-ikonos pinek (kinti-pin-v2)
 *   • bal-felül: hely-pill
 *   • jobb-felül: lokáció + zoom vezérlők
 *   • alul: kategória-szűrő pillek + a kiválasztott vállalkozás kártyája
 *
 * Pin koppintásra a kártya frissül (Leaflet-buborék helyett). Csempék:
 * CartoDB Voyager (ingyenes, kulcs nélkül).
 */
export interface BusinessMapProps {
  businesses: Business[];
  categories?: Category[];
  activeCat?: string;
  onSelectCat?: (id: string) => void;
  locationLabel?: string;
  /** [lat, lng] (Leaflet). */
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  className?: string;
}

const ZURICH_CENTER: [number, number] = [47.378, 8.535];

export function BusinessMap({
  businesses,
  categories,
  activeCat = "all",
  onSelectCat,
  locationLabel = "Zürich · Kreis 3",
  fallbackCenter = ZURICH_CENTER,
  fallbackZoom = 13,
  className,
}: BusinessMapProps) {
  const located = useMemo(
    () => businesses.filter((b) => b.lat != null && b.lng != null),
    [businesses],
  );

  // Kiválasztott vállalkozás az alsó kártyához. Default: első kiemelt, ill. első.
  const defaultBiz = useMemo(
    () => located.find((b) => b.featured) ?? located[0] ?? null,
    [located],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    located.find((b) => b.id === selectedId) ?? defaultBiz ?? null;

  // Ha a szűrt lista változik és a kiválasztott kiesett, visszaállunk.
  useEffect(() => {
    if (selectedId && !located.some((b) => b.id === selectedId)) {
      setSelectedId(null);
    }
  }, [located, selectedId]);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-card", className)}>
      <MapContainer
        center={fallbackCenter}
        zoom={fallbackZoom}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "rgb(var(--map-land))" }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {located.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat!, b.lng!]}
            icon={pinFor(b, b.id === selected?.id)}
            eventHandlers={{ click: () => setSelectedId(b.id) }}
          />
        ))}

        <FitToMarkers businesses={located} />
        <MapControls />
      </MapContainer>

      {/* Bal-felül: hely-pill */}
      <div className="pointer-events-none absolute left-3 top-3 z-[10]">
        <span className="glass pointer-events-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-card">
          <Icon name="pin" size={13} strokeWidth={2.2} className="text-accent" />
          {locationLabel}
        </span>
      </div>

      {/* Alul: kategória-pillek + kiválasztott kártya */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[10] flex flex-col gap-2 p-3">
        {categories && categories.length > 0 && (
          <div className="no-scrollbar pointer-events-auto -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
            {categories.map((c) => {
              const on = c.id === activeCat;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCat?.(c.id)}
                  className={cn(
                    "inline-flex flex-none items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-bold tracking-[-0.01em] shadow-card transition",
                    on ? "bg-primary text-white" : "glass text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 place-items-center",
                      on ? "text-white" : "text-primary",
                    )}
                  >
                    <CategoryGlyph categoryId={c.id} />
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>
        )}

        {selected && <SelectedCard business={selected} />}
      </div>

      {located.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
          <div className="glass pointer-events-auto rounded-pill px-4 py-2 text-[12px] font-semibold text-ink shadow-pop">
            Ehhez a szűrőhöz nincs térképi találat.
          </div>
        </div>
      )}
    </div>
  );
}

// --- alsó vállalkozás-kártya ------------------------------------------------

function SelectedCard({ business: b }: { business: Business }) {
  const logoUrl = mediaUrl(b.logoKey);
  return (
    <Link
      href={`/szaknevsor/${b.id}`}
      className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 shadow-pop transition active:scale-[0.99]"
    >
      <div
        className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[14px] bg-primary-soft"
        style={!logoUrl && b.photo ? { background: b.photo } : undefined}
      >
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          {b.categoryLabel}
          <span className="text-ink-faint">·</span>
          <span className="inline-flex items-center gap-0.5 text-ink">
            <Icon name="star" size={10} filled className="text-star" />
            {b.rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
          {b.name}
        </div>
        <div className="mt-0.5 text-[11.5px] text-ink-muted">
          {b.distText ?? ""}
          {b.distText && " · "}
          <span className={b.openNow ? "font-semibold text-success" : "text-accent"}>
            {b.openNow ? "Nyitva" : "Zárva"}
          </span>
        </div>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-primary text-white">
        <Icon name="arrowRight" size={16} strokeWidth={2.4} />
      </span>
    </Link>
  );
}

/** React-oldali kategória-ikon a pillekhez (inline, hogy ne kelljen extra import). */
function CategoryGlyph({ categoryId }: { categoryId: string }) {
  return (
    <span
      className="grid h-4 w-4 place-items-center [&>svg]:h-3.5 [&>svg]:w-3.5"
      dangerouslySetInnerHTML={{ __html: categoryIconSvgString(categoryId) }}
    />
  );
}

// --- pin (divIcon) ----------------------------------------------------------

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

// --- vezérlők ---------------------------------------------------------------

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
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
  }, [businesses, map]);
  return null;
}

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
