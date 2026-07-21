"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker as MlMarker } from "maplibre-gl";
import type { ListBusiness } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { cn } from "@/lib/cn";
import { pmtilesUrl, mapStyleUrl } from "@/lib/map-config";
import { clusterBusinesses, clusterBounds, clusterSize } from "@/lib/cluster";
import { useMyLocation } from "@/lib/use-my-location";
import type { SosAlert } from "@/lib/sos-repo";

/**
 * MapLibre (vektoros) motor — szép, sima, prémium, WebGL-alapú.
 * Klaszterezés: ugyanaz a greedy geo-klaszter mint a Leaflet-motorban,
 * zoom-eseményre újrarendereli a markereket.
 *
 * Ha a motor bármilyen okból elhasal (WebGL-hiba, timeout),
 * `onFail` callback hívja a wrappert, ami átvált Leaflet-re.
 */
export interface MaplibreEngineProps {
  located: ListBusiness[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  fallbackCenter: [number, number]; // [lat, lng] (wrapper-konvenció)
  fallbackZoom: number;
  onFail: (reason: string) => void;
  sosAlerts?: SosAlert[];
  onSelectSosAlert?: (id: string) => void;
  /** Kifejezetten kiválasztott cég (carousel/marker) → finom pásztázás. Ld. a
   *  Leaflet-motor azonos nevű propját. */
  panToId?: string | null;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
// Self-hosted stílus (PMTiles@R2) elsőbbséget élvez, ha be van állítva (map-config).
// Üres flag esetén marad a régi MapTiler/OpenFreeMap — azaz a PMTiles-út inaktív.
const MAP_STYLE =
  mapStyleUrl() ||
  (MAPTILER_KEY
    ? `https://api.maptiler.com/maps/bright-v2/style.json?key=${MAPTILER_KEY}`
    : "https://tiles.openfreemap.org/styles/liberty");

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
  sosAlerts = [],
  panToId,
}: MaplibreEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const mlRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Map<string, { marker: MlMarker; el: HTMLElement }>>(new Map());
  const meMarkerRef = useRef<MlMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(fallbackZoom);
  const [locating, setLocating] = useState(false);
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  // Automatikus pozíció, ha a helymeghatározás már engedélyezve van (prompt nélkül).
  const autoPosition = useMyLocation();
  const effectivePosition = myPosition ?? autoPosition;
  const failedRef = useRef(false);
  const sosMarkersRef = useRef<Map<string, MlMarker>>(new Map());
  const prevPanRef = useRef<string | null>(null);

  // Kifejezett kiválasztás (carousel/marker) → finom pásztázás a cég koordinátájára,
  // a zoom megtartásával. Azonos id-re nem pásztáz újra (pl. located-frissülésnél).
  useEffect(() => {
    if (!panToId || panToId === prevPanRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    const b = located.find((x) => x.id === panToId);
    if (!b || b.lat == null || b.lng == null) return;
    prevPanRef.current = panToId;
    const reduce = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({ center: [b.lng, b.lat], duration: reduce ? 0 : 400 });
  }, [panToId, located]);

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
      .then(async (ml) => {
        if (cancelled || !containerRef.current) return;
        mlRef.current = ml;

        // PMTiles-protokoll regisztrálása, ha self-hosted PMTiles-t használunk
        // (a stílus `pmtiles://` forrása enélkül nem oldódna fel). Best-effort:
        // hiba esetén a térkép nem dől, csak a self-hosted forrás nem tölt.
        if (pmtilesUrl()) {
          try {
            const { Protocol } = await import("pmtiles");
            const protocol = new Protocol();
            (ml as unknown as { addProtocol: (n: string, h: unknown) => void }).addProtocol(
              "pmtiles",
              protocol.tile,
            );
          } catch {
            /* pmtiles betöltési hiba — a régi stílusra esik vissza */
          }
        }

        let map: MlMap;
        try {
          map = new ml.Map({
            container: containerRef.current,
            style: MAP_STYLE,
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
          if (/webgl|context|gpu/i.test(msg)) failOnce(msg);
        });
        map.on("webglcontextlost", () => failOnce("WebGL context lost"));

        loadTimeout = setTimeout(() => failOnce("MapLibre timeout"), 8000);

        map.on("load", () => {
          if (loadTimeout) { clearTimeout(loadTimeout); loadTimeout = null; }
          map.resize();
          setReady(true);
        });

        // Zoom tracking a klaszterezéshez
        map.on("zoomend", () => setZoom(Math.round(map.getZoom())));

        mapRef.current = map;
      })
      .catch((err) => failOnce(err instanceof Error ? err.message : "load error"));

    return () => {
      cancelled = true;
      if (loadTimeout) clearTimeout(loadTimeout);
      // A marker-ref-eket MÁS effektek töltik fel (klaszterezés), ezért
      // unmountkor a PILLANATNYI tartalmat kell takarítani — nem a mount-kori
      // snapshotot (az szivárogtatná a később hozzáadott markereket). Az
      // ESLint ref-cleanup heurisztikája erre nem illik, ezért elnyomjuk.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const markers = markersRef.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const sosMarkers = sosMarkersRef.current;
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      sosMarkers.forEach((marker) => marker.remove());
      sosMarkers.clear();
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- klaszterezett markerek ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    const points = clusterBusinesses(located, zoom);

    for (const pt of points) {
      if (pt.type === "single") {
        const b = pt.business;
        const el = document.createElement("div");
        el.className = `kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""}`;
        el.innerHTML = `<span class="kinti-pin-v2__inner">${categoryIconSvgString(b.categoryId, b.categoryLabel)}</span>`;
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          onSelectMarker(b.id);
        });
        const marker = new ml.Marker({ element: el, anchor: "bottom" })
          .setLngLat([b.lng!, b.lat!])
          .addTo(map);
        markersRef.current.set(b.id, { marker, el });
      } else {
        // Klaszter buborék
        const sz = clusterSize(pt.count);
        const el = document.createElement("div");
        el.className = `kinti-cluster kinti-cluster--${sz}`;
        el.innerHTML = `<div class="kinti-cluster__bubble"><span class="kinti-cluster__count">${pt.count}</span></div>`;
        el.style.cursor = "pointer";
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const bounds = clusterBounds(located, pt.itemIds);
          if (!bounds) return;
          // MapLibre [lng, lat] sorrendben vár
          map.fitBounds(
            [
              [bounds[0][1], bounds[0][0]],
              [bounds[1][1], bounds[1][0]],
            ],
            { padding: 80, maxZoom: 15, duration: 600 },
          );
        });
        const marker = new ml.Marker({ element: el, anchor: "center" })
          .setLngLat([pt.lng, pt.lat])
          .addTo(map);
        markersRef.current.set(pt.id, { marker, el });
      }
    }

    // Kamera igazítás az összes ponthoz (csak ha még nem zoomoltunk klaszterre)
    if (located.length >= 2) {
      const bounds = new ml.LngLatBounds();
      located.forEach((b) => bounds.extend([b.lng!, b.lat!]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
    } else if (located.length === 1) {
      map.flyTo({ center: [located[0].lng!, located[0].lat!], zoom: 15, duration: 600 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [located, ready]);

  // --- markerek újraszámítása zoom-változásra ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    const points = clusterBusinesses(located, zoom);

    for (const pt of points) {
      if (pt.type === "single") {
        const b = pt.business;
        const el = document.createElement("div");
        el.className = `kinti-pin-v2 ${b.featured ? "kinti-pin-v2--featured" : ""} ${b.id === selectedId ? "kinti-pin-v2--active" : ""}`;
        el.innerHTML = `<span class="kinti-pin-v2__inner">${categoryIconSvgString(b.categoryId, b.categoryLabel)}</span>`;
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          onSelectMarker(b.id);
        });
        const marker = new ml.Marker({ element: el, anchor: "bottom" })
          .setLngLat([b.lng!, b.lat!])
          .addTo(map);
        markersRef.current.set(b.id, { marker, el });
      } else {
        const sz = clusterSize(pt.count);
        const el = document.createElement("div");
        el.className = `kinti-cluster kinti-cluster--${sz}`;
        el.innerHTML = `<div class="kinti-cluster__bubble"><span class="kinti-cluster__count">${pt.count}</span></div>`;
        el.style.cursor = "pointer";
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const bounds = clusterBounds(located, pt.itemIds);
          if (!bounds) return;
          map.fitBounds(
            [[bounds[0][1], bounds[0][0]], [bounds[1][1], bounds[1][0]]],
            { padding: 80, maxZoom: 15, duration: 600 },
          );
        });
        const marker = new ml.Marker({ element: el, anchor: "center" })
          .setLngLat([pt.lng, pt.lat])
          .addTo(map);
        markersRef.current.set(pt.id, { marker, el });
      }
    }
  }, [zoom, located, ready, selectedId, onSelectMarker]);

  // --- SOS markerek renderelése ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;

    // Remove old SOS markers
    sosMarkersRef.current.forEach((marker) => marker.remove());
    sosMarkersRef.current.clear();

    sosAlerts.forEach((sos) => {
      const el = document.createElement("div");
      el.className = "flex h-10 w-10 items-center justify-center relative cursor-pointer";
      el.innerHTML = `
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span class="relative flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white text-lg">🆘</span>
      `;

      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        alert(`S.O.S. Segítségkérés:\n\n${sos.description}\n\nKapcsolat:\nWhatsApp: wa.me/${sos.contactPhone.replace('+', '')}\nTelefon: ${sos.contactPhone}`);
      });

      const marker = new ml.Marker({ element: el, anchor: "center" })
        .setLngLat([sos.lng, sos.lat])
        .addTo(map);

      sosMarkersRef.current.set(sos.id, marker);
    });
  }, [sosAlerts, ready]);

  // --- kiválasztott pin kiemelése ---
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      el.classList.toggle("kinti-pin-v2--active", id === selectedId);
    });
  }, [selectedId]);

  // --- „Te vagy itt" pötty ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;
    if (!effectivePosition) {
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      return;
    }
    if (!meMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "kinti-me-dot";
      el.style.pointerEvents = "none";
      meMarkerRef.current = new ml.Marker({ element: el, anchor: "center" })
        .setLngLat([effectivePosition[1], effectivePosition[0]])
        .addTo(map);
    } else {
      meMarkerRef.current.setLngLat([effectivePosition[1], effectivePosition[0]]);
    }
  }, [effectivePosition, ready]);

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        mapRef.current?.flyTo({ center: [ll[1], ll[0]], zoom: 15, duration: 600 });
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
