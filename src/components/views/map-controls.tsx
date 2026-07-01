"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Közös térkép-vezérlők a kisebb (alacsony volumenű) Leaflet-térképekhez
 * (akció / esemény / magyar bolt) — hogy a szaknévsor-térképpel EGYSÉGESEK
 * legyenek: jobb-felső zoom + saját-hely gomb, és a szürke-csempe elleni
 * automatikus újramérés.
 */

/**
 * A lazy-mountolt térkép-konténer VÉGLEGES mérete később ül le (Suspense +
 * `calc(100dvh-…)` + safe-area) → a Leaflet a rossz mérettel indul és a látható
 * terület csempéit sosem kéri le (SZÜRKE térkép). Több időzített `invalidateSize`
 * garantálja, hogy a végleges méretre újraszámol. A `trigger` váltásakor (pl.
 * fullscreen) is újramér.
 */
export function MapAutoResize({ trigger }: { trigger?: unknown }) {
  const map = useMap();
  useEffect(() => {
    const safeInvalidate = () => {
      try {
        const c = map.getContainer();
        // CSAK valós, nem-nulla méretnél mérünk újra. Ha a konténer épp 0/átmeneti
        // méretű (a lazy-mount + layout még ül le), az `invalidateSize` a Leaflet
        // belsejében „Attempted to load an infinite number of tiles" hibát dobhat,
        // ami a route-error boundaryt („Hoppá") váltja ki. A méret-őr + try/catch
        // garantálja, hogy egy átmeneti rossz állapot SOHA ne döntse le az oldalt;
        // a következő (már stabil méretű) időzítés úgyis betölti a csempéket.
        if (c && c.clientWidth > 0 && c.clientHeight > 0) {
          map.invalidateSize({ animate: false });
        }
      } catch { /* átmeneti Leaflet-belső hiba — elnyeljük, a következő tick javít */ }
    };
    const timers = [80, 260, 500, 900].map((d) => setTimeout(safeInvalidate, d));
    return () => timers.forEach(clearTimeout);
  }, [trigger, map]);
  return null;
}

/**
 * Jobb-felső zoom (+/−) és — opcionálisan — saját-hely gomb. A `zoomControl={false}`
 * MapContainer mellé kell tenni (a beépített bal-felső vezérlő helyett).
 */
export function MapZoomControls({ locate = true }: { locate?: boolean }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  // Véd a dupla-kattintásos zoom-irányváltás ellen: rövid tiltás minden zoom után.
  const zoomBusy = useRef(false);

  function doZoom(dir: "in" | "out", e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (zoomBusy.current) return;
    zoomBusy.current = true;
    if (dir === "in") map.zoomIn();
    else map.zoomOut();
    setTimeout(() => { zoomBusy.current = false; }, 350);
  }

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 0.6 }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "none" }}>
      <div className="leaflet-control" style={{ pointerEvents: "auto", margin: "12px 12px 0 0", display: "grid", gap: 8 }}>
        {locate && (
          <button
            type="button"
            aria-label="Saját helyem"
            onClick={handleLocate}
            className={cn("glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card", locating && "animate-pulse")}
          >
            <Icon name="nav" size={16} strokeWidth={2.2} className="text-primary" />
          </button>
        )}
        <button
          type="button"
          aria-label="Nagyítás"
          onClick={(e) => doZoom("in", e)}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card active:scale-95 transition-transform"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          aria-label="Kicsinyítés"
          onClick={(e) => doZoom("out", e)}
          className="glass grid h-10 w-10 place-items-center rounded-[12px] text-ink shadow-card active:scale-95 transition-transform"
        >
          <span className="text-[18px] font-extrabold leading-none">−</span>
        </button>
      </div>
    </div>
  );
}
