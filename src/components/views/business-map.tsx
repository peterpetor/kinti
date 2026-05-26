"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Map as MlMap, Marker as MlMarker } from "maplibre-gl";
import type { Business, Category } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

/**
 * BusinessMap — vektoros MapLibre GL térkép app-réteggel (mockup-kompozíció).
 *
 * A MapLibre-t SAJÁT originról, script-tagből töltjük (/vendor/maplibre-gl.js),
 * NEM webpack-bundle-ből — így a worker-blobja sértetlen marad (a bundle-elt
 * verzió a next-on-pages edge-build alatt nem renderelt). GDPR-tiszta:
 * harmadik-fél JS-CDN nincs; csak a csempék mennek a tile-szolgáltatóhoz.
 *
 * Csempék: OpenFreeMap (ingyenes, kulcs nélkül). Ha be van állítva
 * NEXT_PUBLIC_MAPTILER_KEY, a szebb MapTiler stílusra vált.
 */
export interface BusinessMapProps {
  businesses: Business[];
  categories?: Category[];
  activeCat?: string;
  onSelectCat?: (id: string) => void;
  locationLabel?: string;
  /** [lng, lat] (MapLibre). */
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  className?: string;
}

// Zürich Kreis 3 → [lng, lat]
const ZURICH_CENTER: [number, number] = [8.535, 47.378];

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : "https://tiles.openfreemap.org/styles/liberty";

// --- MapLibre self-hosted loader (egyszer fut) ------------------------------
declare global {
  interface Window {
    maplibregl?: typeof import("maplibre-gl");
  }
}

let loaderPromise: Promise<typeof import("maplibre-gl")> | null = null;

function loadMaplibre(): Promise<typeof import("maplibre-gl")> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (!document.querySelector("link[data-maplibre]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/vendor/maplibre-gl.css";
      link.dataset.maplibre = "1";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "/vendor/maplibre-gl.js";
    script.async = true;
    script.onload = () =>
      window.maplibregl
        ? resolve(window.maplibregl)
        : reject(new Error("A térkép-motor nem töltött be."));
    script.onerror = () => reject(new Error("A térkép-motor betöltése sikertelen."));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const mlRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Map<string, { marker: MlMarker; el: HTMLElement }>>(
    new Map(),
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const located = useMemo(
    () => businesses.filter((b) => b.lat != null && b.lng != null),
    [businesses],
  );

  const defaultBiz = useMemo(
    () => located.find((b) => b.featured) ?? located[0] ?? null,
    [located],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = located.find((b) => b.id === selectedId) ?? defaultBiz ?? null;

  // --- map init (egyszer) ---
  useEffect(() => {
    let cancelled = false;
    loadMaplibre()
      .then((ml) => {
        if (cancelled || !containerRef.current) return;
        mlRef.current = ml;
        const map = new ml.Map({
          container: containerRef.current,
          style: MAP_STYLE,
          center: fallbackCenter,
          zoom: fallbackZoom,
          attributionControl: false,
        });
        map.addControl(new ml.AttributionControl({ compact: true }), "bottom-left");
        map.on("error", (e) => {
          const msg = (e as { error?: { message?: string } })?.error?.message;
          setError((prev) => prev ?? msg ?? "Térkép-hiba.");
        });
        map.on("load", () => {
          map.resize();
          setReady(true);
        });
        mapRef.current = map;
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Térkép-hiba."));

    return () => {
      cancelled = true;
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- markerek (located változására) ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    for (const b of located) {
      const el = document.createElement("div");
      el.className = `kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""}`;
      el.innerHTML = `<span class="kinti-pin-v2__inner">${categoryIconSvgString(b.categoryId)}</span>`;
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        setSelectedId(b.id);
      });
      const marker = new ml.Marker({ element: el, anchor: "bottom" })
        .setLngLat([b.lng!, b.lat!])
        .addTo(map);
      markersRef.current.set(b.id, { marker, el });
    }

    if (located.length >= 2) {
      const bounds = new ml.LngLatBounds();
      located.forEach((b) => bounds.extend([b.lng!, b.lat!]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
    } else if (located.length === 1) {
      map.flyTo({ center: [located[0].lng!, located[0].lat!], zoom: 15, duration: 600 });
    }
  }, [located, ready]);

  // --- kiválasztott pin kiemelése ---
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      el.classList.toggle("kinti-pin-v2--active", id === selected?.id);
    });
  }, [selected]);

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
    <div className={cn("relative isolate overflow-hidden rounded-card", className)}>
      <div ref={containerRef} className="absolute inset-0" />

      {/* Bal-felül: hely-pill */}
      <div className="pointer-events-none absolute left-3 top-3 z-[10]">
        <span className="glass pointer-events-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-card">
          <Icon name="pin" size={13} strokeWidth={2.2} className="text-accent" />
          {locationLabel}
        </span>
      </div>

      {/* Jobb-felül: vezérlők */}
      <div className="absolute right-3 top-3 z-[10] grid gap-2">
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
          onClick={() => mapRef.current?.zoomIn()}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          aria-label="Kicsinyítés"
          onClick={() => mapRef.current?.zoomOut()}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card"
        >
          <span className="text-[18px] font-extrabold leading-none">−</span>
        </button>
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
                      "grid h-4 w-4 place-items-center [&>svg]:h-3.5 [&>svg]:w-3.5",
                      on ? "text-white" : "text-primary",
                    )}
                    dangerouslySetInnerHTML={{ __html: categoryIconSvgString(c.id) }}
                  />
                  {c.label}
                </button>
              );
            })}
          </div>
        )}

        {selected && <SelectedCard business={selected} />}
      </div>

      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
          <div className="glass rounded-pill px-4 py-2 text-[12px] font-semibold text-ink-muted shadow-card">
            Térkép betöltése…
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-[20] grid place-items-center p-6">
          <div className="max-w-xs rounded-card border border-accent/30 bg-surface p-4 text-center shadow-pop">
            <p className="text-[12.5px] font-bold text-ink">Térkép-hiba</p>
            <p className="mt-1 break-words text-[11px] leading-snug text-ink-muted">{error}</p>
          </div>
        </div>
      )}

      {ready && located.length === 0 && !error && (
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
          <div className="glass rounded-pill px-4 py-2 text-[12px] font-semibold text-ink shadow-pop">
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
