"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Business, Category } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString } from "@/components/ui/category-icon";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";
import { LeafletEngine } from "./map-engine-leaflet";
import { MaplibreEngine } from "./map-engine-maplibre";

export interface SosAlert {
  id: string;
  lat: number;
  lng: number;
  description: string;
  contactPhone: string;
  resolved: boolean;
}

/**
 * BusinessMap — wrapper: WebGL-detektálás + motor-választás + közös overlay-ek.
 *
 *   • Ha van működő WebGL → MaplibreEngine (szép, sima vektor).
 *   • Ha nincs / futásidőben elhasal → LeafletEngine (raszter, mindig megy).
 *
 * Közös overlay-ek (motortól független): hely-pill, kategória-pillek,
 * kiválasztott vállalkozás-kártya. A motor a térkép-vásznat + markereket +
 * lokáció/zoom vezérlőket adja.
 */
export interface BusinessMapProps {
  businesses: Business[];
  categories?: Category[];
  activeCat?: string;
  onSelectCat?: (id: string) => void;
  locationLabel?: string;
  /** [lat, lng] (wrapper konvenció — a maplibre motor belül konvertál). */
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  className?: string;
}

const ZURICH_CENTER: [number, number] = [47.378, 8.535];

type EngineChoice = "maplibre" | "leaflet";

/**
 * MapLibre opt-in: `?engine=maplibre` URL-paraméter. A WebGL automatikus
 * detektálása megbízhatatlan (Chrome néha elrejti a renderer-stringet,
 * szoftveres SwiftShader pedig némán üres vásznat rajzol). Ezért a vektoros
 * motor explicit opt-in — production-ban Leaflet a default mindenkinek.
 */
function isMaplibreRequested(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("engine") === "maplibre";
  } catch {
    return false;
  }
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

  // Engine választás — Leaflet a default, MapLibre csak ?engine=maplibre URL-re.
  const [engine, setEngine] = useState<EngineChoice>("leaflet");
  useEffect(() => {
    if (isMaplibreRequested()) setEngine("maplibre");
  }, []);

  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  
  const loadSosAlerts = useCallback(() => {
    fetch("/api/sos")
      .then((res) => res.json())
      .then((data) => setSosAlerts(Array.isArray(data) ? data : []))
      .catch(() => setSosAlerts([]));
  }, []);

  useEffect(() => {
    loadSosAlerts();
    window.addEventListener("sos-submitted", loadSosAlerts);
    return () => window.removeEventListener("sos-submitted", loadSosAlerts);
  }, [loadSosAlerts]);

  const handleSelectMarker = useCallback((id: string) => setSelectedId(id), []);
  // Ha a maplibre runtime elhasal (timeout, WebGL-hiba), automatikus fallback.
  const handleMaplibreFail = useCallback((reason: string) => {
    if (typeof console !== "undefined") {
      console.warn("[kinti map] MapLibre fallback → Leaflet:", reason);
    }
    setEngine("leaflet");
  }, []);

  useEffect(() => {
    if (selectedId && !located.some((b) => b.id === selectedId)) {
      setSelectedId(null);
    }
  }, [located, selectedId]);

  const [selectedSosId, setSelectedSosId] = useState<string | null>(null);
  const handleSelectSos = useCallback((id: string) => setSelectedSosId(id), []);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-card", className)}>
      {engine === "maplibre" ? (
        <MaplibreEngine
          located={located}
          selectedId={selected?.id ?? null}
          onSelectMarker={handleSelectMarker}
          fallbackCenter={fallbackCenter}
          fallbackZoom={fallbackZoom}
          onFail={handleMaplibreFail}
          sosAlerts={sosAlerts}
          onSelectSosAlert={handleSelectSos}
        />
      ) : (
        <LeafletEngine
          located={located}
          selectedId={selected?.id ?? null}
          onSelectMarker={handleSelectMarker}
          fallbackCenter={fallbackCenter}
          fallbackZoom={fallbackZoom}
          sosAlerts={sosAlerts}
          onSelectSosAlert={handleSelectSos}
        />
      )}

      {selectedSosId && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <SosDetailsCard
            sos={sosAlerts.find(s => s.id === selectedSosId)!}
            onClose={() => setSelectedSosId(null)}
          />
        </div>
      )}

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

// --- S.O.S. Részletek Kártya (Felugró) ---------------------------------------

function SosDetailsCard({ sos, onClose }: { sos: SosAlert, onClose: () => void }) {
  const [isMine, setIsMine] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const myAlerts = JSON.parse(localStorage.getItem("mySosAlerts") || "[]");
      if (myAlerts.includes(sos.id)) {
        setIsMine(true);
      }
    }
  }, [sos.id]);

  const handleResolve = async () => {
    if (resolving) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/sos/${sos.id}/resolve`, { method: "POST" });
      if (res.ok) {
        if (typeof window !== "undefined") {
          const myAlerts = JSON.parse(localStorage.getItem("mySosAlerts") || "[]");
          localStorage.setItem("mySosAlerts", JSON.stringify(myAlerts.filter((id: string) => id !== sos.id)));
          window.dispatchEvent(new Event('sos-submitted'));
        }
        onClose();
      } else {
        alert("Sikertelen lezárás. (Csak az tudja lezárni, aki feladta!)");
      }
    } catch {
      alert("Hiba történt a lezárás során.");
    } finally {
      setResolving(false);
    }
  };

  if (!sos) return null;

  return (
    <div className="relative w-full max-w-sm rounded-[20px] border border-red-500/20 bg-surface p-5 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted hover:bg-line"
        aria-label="Bezárás"
      >
        ✕
      </button>

      <div className="mb-4 flex items-center gap-2 text-red-600">
        <span className="text-2xl">🆘</span>
        <h3 className="text-lg font-bold tracking-tight">Közösségi S.O.S.</h3>
      </div>

      <div className="mb-6 rounded-xl bg-red-50 p-4 text-[14px] leading-relaxed text-red-900 border border-red-100">
        {sos.description}
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={`tel:${sos.contactPhone}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-bold text-surface shadow-md transition-transform hover:bg-accent active:scale-95"
        >
          <Icon name="phone" size={18} />
          Hívás ({sos.contactPhone})
        </a>

        {isMine && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-success-soft py-3 font-bold text-success-heavy transition-colors hover:bg-success/20 disabled:opacity-50"
          >
            {resolving ? "Folyamatban..." : "Megoldódott (Lezárás)"}
          </button>
        )}
      </div>
    </div>
  );
}
