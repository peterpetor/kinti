"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker as MlMarker } from "maplibre-gl";
import type { Business } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { cn } from "@/lib/cn";

/**
 * MapLibre (vektoros) motor — szép, sima, prémium, WebGL-alapú.
 *
 * A MapLibre-t SAJÁT originról, script-tagből töltjük (/vendor/maplibre-gl.js),
 * nem webpack-bundle-ből — így a worker-blob sértetlen marad. GDPR-tiszta
 * (csak a csempék mennek a tile-szolgáltatóhoz).
 *
 * Ha a motor bármilyen okból elhasal (WebGL-hiba, timeout, betöltési hiba),
 * `onFail` callback hívja a wrappert, ami átvált Leaflet-re. Így a felhasználó
 * sosem marad üres térképpel.
 */
export interface MaplibreEngineProps {
  located: Business[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  fallbackCenter: [number, number]; // [lat, lng] (wrapper-konvenció)
  fallbackZoom: number;
  /** Hívódik, ha a MapLibre nem indul el / hibára fut — wrapper Leaflet-re vált. */
  onFail: (reason: string) => void;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : "https://tiles.openfreemap.org/styles/liberty";

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

export function MaplibreEngine({
  located,
  selectedId,
  onSelectMarker,
  fallbackCenter,
  fallbackZoom,
  onFail,
}: MaplibreEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const mlRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Map<string, { marker: MlMarker; el: HTMLElement }>>(
    new Map(),
  );
  const meMarkerRef = useRef<MlMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  const failedRef = useRef(false);

  // --- init (egyszer) ---
  useEffect(() => {
    let cancelled = false;
    let loadTimeout: ReturnType<typeof setTimeout> | null = null;

    function failOnce(reason: string) {
      if (failedRef.current) return;
      failedRef.current = true;
      onFail(reason);
    }

    loadMaplibre()
      .then((ml) => {
        if (cancelled || !containerRef.current) return;
        mlRef.current = ml;

        let map: MlMap;
        try {
          map = new ml.Map({
            container: containerRef.current,
            style: MAP_STYLE,
            // MapLibre [lng, lat] sorrendet vár
            center: [fallbackCenter[1], fallbackCenter[0]],
            zoom: fallbackZoom,
            attributionControl: false,
          });
        } catch (err) {
          failOnce(err instanceof Error ? err.message : "MapLibre init error");
          return;
        }

        map.addControl(new ml.AttributionControl({ compact: true }), "bottom-left");

        map.on("error", (e) => {
          const msg = (e as { error?: { message?: string } })?.error?.message ?? "";
          // WebGL-relevant hibák → fallback
          if (/webgl|context|gpu/i.test(msg)) failOnce(msg);
        });
        map.on("webglcontextlost", () => failOnce("WebGL context lost"));

        // 8 mp után, ha nem volt 'load', fallback (lassú / blokkolt WebGL)
        loadTimeout = setTimeout(() => failOnce("MapLibre timeout"), 8000);

        map.on("load", () => {
          if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
          }
          map.resize();
          setReady(true);
        });

        mapRef.current = map;
      })
      .catch((err) => failOnce(err instanceof Error ? err.message : "load error"));

    return () => {
      cancelled = true;
      if (loadTimeout) clearTimeout(loadTimeout);
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- markerek ---
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
        onSelectMarker(b.id);
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
  }, [located, ready, onSelectMarker]);

  // --- kiválasztott pin kiemelése ---
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      el.classList.toggle("kinti-pin-v2--active", id === selectedId);
    });
  }, [selectedId]);

  // --- "Te vagy itt" pötty ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;
    if (!myPosition) {
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      return;
    }
    if (!meMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "kinti-me-dot";
      el.style.pointerEvents = "none";
      meMarkerRef.current = new ml.Marker({ element: el, anchor: "center" })
        .setLngLat([myPosition[1], myPosition[0]])
        .addTo(map);
    } else {
      meMarkerRef.current.setLngLat([myPosition[1], myPosition[0]]);
    }
  }, [myPosition, ready]);

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation || !mapRef.current)
      return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        mapRef.current?.flyTo({
          center: [ll[1], ll[0]],
          zoom: 15,
          duration: 600,
        });
        setMyPosition(ll);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 },
    );
  }

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" />

      {/* Jobb-felül: lokáció + zoom */}
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

      {!ready && (
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
          <div className="glass rounded-pill px-4 py-2 text-[12px] font-semibold text-ink-muted shadow-card">
            Térkép betöltése…
          </div>
        </div>
      )}
    </>
  );
}
