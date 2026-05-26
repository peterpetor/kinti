"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import maplibregl from "maplibre-gl";
import { createRoot, type Root } from "react-dom/client";
import type { Business } from "@/lib/types";
import { Icon } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

// MapLibre CSS-t a komponensben importáljuk, hogy csak akkor kerüljön a bundle-be,
// ha a térkép tényleg megnyílt. A komponenst az ExploreView ssr:false-szal hívja,
// így ez a fájl csak böngészőben fut.
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * BusinessMap — interaktív vektoros térkép MapLibre GL JS-szel.
 *
 * Tile-szolgáltató: OpenFreeMap (positron stílus) — vektoros, ingyenes,
 * API-kulcs nélkül, rate-limit nélkül. OSM-adatokra épül, attribúcióval.
 *
 * A markerek nem default MapLibre pin-ek, hanem custom HTML divek — a
 * `kinti-pin-v2` CSS-osztály stílusozza (téma-reaktív, NEM ferdített).
 * A popup tartalmát React-ben renderelünk (`react-dom/client` createRoot),
 * így a Next.js `<Link>` kliens-navigálni tud.
 */
export interface BusinessMapProps {
  businesses: Business[];
  /** [lng, lat] sorrendben — MapLibre konvenció. */
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  className?: string;
}

// Zürich Kreis 3 → [longitude, latitude]
const ZURICH_CENTER: [number, number] = [8.535, 47.378];

// OpenFreeMap positron — világos, OSM-alapú, kulcs nélkül.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export function BusinessMap({
  businesses,
  fallbackCenter = ZURICH_CENTER,
  fallbackZoom = 12,
  className,
}: BusinessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRootsRef = useRef<Root[]>([]);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const located = useMemo(
    () => businesses.filter((b) => b.lat != null && b.lng != null),
    [businesses],
  );

  // --- map inicializálás (csak egyszer) ---
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: fallbackCenter,
      zoom: fallbackZoom,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );

    map.on("load", () => setMapReady(true));
    mapRef.current = map;

    return () => {
      popupRootsRef.current.forEach((r) => {
        try {
          r.unmount();
        } catch {
          /* ignore */
        }
      });
      popupRootsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // fallback* értékek a kezdeti beállításhoz használtak, runtime nem változnak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- markerek (mindig friss, ha a `located` változik) ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Régi markerek + React-popup-ok takarítása
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    popupRootsRef.current.forEach((r) => {
      try {
        r.unmount();
      } catch {
        /* ignore */
      }
    });
    popupRootsRef.current = [];

    for (const b of located) {
      const pinEl = document.createElement("div");
      pinEl.className = `kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""}`;
      pinEl.innerHTML = `<span class="kinti-pin-v2__inner">${
        b.featured ? "★" : "•"
      }</span>`;

      const popupContainer = document.createElement("div");
      const root = createRoot(popupContainer);
      root.render(<BusinessPopup business={b} />);
      popupRootsRef.current.push(root);

      const popup = new maplibregl.Popup({
        offset: 36,
        closeButton: false,
        maxWidth: "260px",
      }).setDOMContent(popupContainer);

      const marker = new maplibregl.Marker({ element: pinEl, anchor: "bottom" })
        .setLngLat([b.lng!, b.lat!])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    }

    // Bounds-fitting
    if (located.length >= 2) {
      const bounds = new maplibregl.LngLatBounds();
      located.forEach((b) => bounds.extend([b.lng!, b.lat!]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 600 });
    } else if (located.length === 1) {
      map.flyTo({
        center: [located[0].lng!, located[0].lat!],
        zoom: 15,
        duration: 600,
      });
    }
  }, [located, mapReady]);

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation || !mapRef.current)
      return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          duration: 600,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 },
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-card", className)}>
      <div ref={containerRef} className="absolute inset-0" />

      {/* Liquid Glass vezérlők — jobb-felső sarok */}
      <div className="pointer-events-none absolute right-3 top-3 z-[10] grid gap-2">
        <button
          type="button"
          aria-label="Saját helyem"
          onClick={handleLocate}
          className={cn(
            "glass pointer-events-auto grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card",
            locating && "animate-pulse",
          )}
        >
          <Icon name="nav" size={16} strokeWidth={2.2} className="text-primary" />
        </button>
        <button
          type="button"
          aria-label="Nagyítás"
          onClick={() => mapRef.current?.zoomIn()}
          className="glass pointer-events-auto grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          aria-label="Kicsinyítés"
          onClick={() => mapRef.current?.zoomOut()}
          className="glass pointer-events-auto grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card"
        >
          <span className="text-[18px] font-extrabold leading-none">−</span>
        </button>
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

// --- popup tartalom (React) ------------------------------------------------

function BusinessPopup({ business: b }: { business: Business }) {
  const logoUrl = mediaUrl(b.logoKey);
  return (
    <article className="p-3">
      <div className="flex gap-3">
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-primary-soft"
          style={!logoUrl && b.photo ? { background: b.photo } : undefined}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wide text-primary">
              {b.categoryLabel}
            </span>
            <span className="text-[10px] text-ink-faint">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink">
              <Icon name="star" size={10} filled className="text-star" />
              {b.rating.toFixed(1)}
            </span>
          </div>
          <h3 className="truncate text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
            {b.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] font-medium text-ink-muted">
            {b.address}
          </p>
        </div>
      </div>

      <Link
        href={`/szaknevsor/${b.id}`}
        className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-3 text-[12px] font-bold text-white"
      >
        Profil megnyitása
        <Icon name="arrowRight" size={12} strokeWidth={2.4} />
      </Link>
    </article>
  );
}
