"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Business, Category } from "@/lib/types";
import { Icon } from "@/components/ui";
import { categoryIconSvgString, CategoryIcon } from "@/components/ui/category-icon";
import { mediaImageUrl } from "@/lib/media";
import { parseWorkingHoursStrict, calculateBusinessHoursStatus } from "@/lib/hours";
import { cn } from "@/lib/cn";
import { ErrorBoundary } from "@/components/error-boundary";
import { LeafletEngine } from "./map-engine-leaflet";
import { MaplibreEngine } from "./map-engine-maplibre";
import { mapEngine } from "@/lib/map-config";
import { spreadColocated } from "@/lib/cluster";
import { haversineKm, formatDistanceKm } from "@/lib/distance";
import { TelLink } from "@/components/business-analytics-tracker";

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
  /** GPS-pozíció, ha a user engedélyezte — a lenti kártya ekkor a legközelebbit mutatja. */
  userPos?: { lat: number; lng: number } | null;
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
  userPos = null,
  fallbackCenter = ZURICH_CENTER,
  fallbackZoom = 13,
  className,
}: BusinessMapProps) {
  // Azonos koordinátán álló (pl. város-középre geokódolt AT) vállalkozások
  // szétpöckölése, hogy nagyításkor külön-külön kattinthatók legyenek.
  const located = useMemo(
    () => spreadColocated(businesses.filter((b) => b.lat != null && b.lng != null)),
    [businesses],
  );

  // Alapértelmezett (kiválasztás előtti) kártya: a kiemelt (PRO) mindig elöl
  // (P2B-átláthatóság), utána — ha van GPS-pozíció — a TÉNYLEGESEN legközelebbi,
  // nem csak "az első a listában" (ami korábban gyakorlatilag véletlenszerű volt,
  // ha nem volt sem kiemelt, sem eltérő értékelésű találat).
  const defaultBiz = useMemo(() => {
    const featuredBiz = located.find((b) => b.featured);
    if (featuredBiz) return featuredBiz;
    if (userPos) {
      let nearest: Business | null = null;
      let nearestDist = Infinity;
      for (const b of located) {
        if (b.lat == null || b.lng == null) continue;
        const d = haversineKm(userPos.lat, userPos.lng, b.lat, b.lng);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = b;
        }
      }
      if (nearest) return nearest;
    }
    return located[0] ?? null;
  }, [located, userPos]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = located.find((b) => b.id === selectedId) ?? defaultBiz ?? null;
  const selectedDist =
    selected && userPos && selected.lat != null && selected.lng != null
      ? haversineKm(userPos.lat, userPos.lng, selected.lat, selected.lng)
      : null;

  // Engine választás — a default a NEXT_PUBLIC_MAP_ENGINE flagből (alapból "leaflet",
  // amíg be nem állítod). A `?engine=maplibre` URL felülírja (manuális teszt).
  const [engine, setEngine] = useState<EngineChoice>(mapEngine());
  useEffect(() => {
    if (isMaplibreRequested()) setEngine("maplibre");
  }, []);

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

  const [fullscreen, setFullscreen] = useState(false);

  // Fullscreen: body-scroll zár + Escape-kilépés.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  return (
    <div
      className={cn(
        // FONTOS: a `relative` NEM lehet az alap-osztályban, mert a Tailwind a
        // `.relative`-t a `.fixed` UTÁN emittálja → felülírná a fullscreen `fixed`-et
        // (a térkép nem menne teljes képernyőre, 0 magas maradna → üres).
        "isolate overflow-hidden",
        fullscreen ? "fixed inset-0 z-[60] rounded-none" : cn("relative rounded-card", className),
      )}
    >
      {/* Granuláris hiba-határ: ha a térkép-motor (Leaflet/MapLibre) futásidőben
          elhasal (WebGL, lib-hiba), csak a térkép helyén jelenik meg fallback —
          a lista, a kategória-pillek és a kiválasztott kártya tovább működnek. */}
      <ErrorBoundary
        label="business-map"
        fallback={
          <div className="grid min-h-[280px] place-items-center bg-surface-alt px-6 text-center">
            <div>
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-accent/15 text-xl">🗺️</div>
              <p className="text-[13px] font-semibold text-ink">A térkép most nem tölthető be.</p>
              <p className="mt-1 text-[12px] text-ink-muted">A lista és az elérhetőségek továbbra is elérhetők.</p>
            </div>
          </div>
        }
      >
        {engine === "maplibre" ? (
          <MaplibreEngine
            located={located}
            selectedId={selected?.id ?? null}
            onSelectMarker={handleSelectMarker}
            fallbackCenter={fallbackCenter}
            fallbackZoom={fallbackZoom}
            onFail={handleMaplibreFail}
          />
        ) : (
          <LeafletEngine
            located={located}
            selectedId={selected?.id ?? null}
            onSelectMarker={handleSelectMarker}
            fallbackCenter={fallbackCenter}
            fallbackZoom={fallbackZoom}
            fullscreen={fullscreen}
          />
        )}
      </ErrorBoundary>

      {/* Bal-felül: hely-pill + teljes képernyő kapcsoló */}
      <div className="pointer-events-none absolute left-3 top-3 z-[20] flex items-center gap-2">
        <span className="glass pointer-events-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-card">
          <Icon name="pin" size={13} strokeWidth={2.2} className="text-accent" />
          {locationLabel}
        </span>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? "Kilépés a teljes képernyőből" : "Teljes képernyő"}
          className="glass pointer-events-auto grid h-9 w-9 place-items-center rounded-[12px] text-ink shadow-card active:scale-95 transition-transform"
        >
          {fullscreen ? (
            <Icon name="close" size={16} strokeWidth={2.4} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>

      {/* Alul: kategória-pillek + kiválasztott kártya. A térkép a lebegő alsó
          nav-sáv mögé nyúlik, ezért a tartalmat a nav (+ safe-area) fölé emeljük,
          különben a kategória-pillek kitakarnák a menü-ikonokat. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[10] flex flex-col gap-2 px-3 pt-3",
          // Teljes-képernyőn a térkép a lebegő nav-sáv mögé nyúlik → a tartalmat
          // a nav fölé emeljük. Beágyazott nézetben viszont a térkép a nav FÖLÖTT
          // ér véget, így ott a tartalom a térkép aljára kerül (kis padding).
          fullscreen ? "pb-[calc(env(safe-area-inset-bottom)+5.5rem)]" : "pb-3",
        )}
      >
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

        {selected && <SelectedCard business={selected} distanceKm={selectedDist} />}
      </div>

      {located.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center pb-[calc(env(safe-area-inset-bottom)+6rem)]">
          <div className="glass pointer-events-auto rounded-pill px-4 py-2 text-[12px] font-semibold text-ink shadow-pop">
            Ehhez a szűrőhöz nincs térképi találat.
          </div>
        </div>
      )}
    </div>
  );
}

// --- alsó vállalkozás-kártya ------------------------------------------------

function SelectedCard({ business: b, distanceKm }: { business: Business; distanceKm?: number | null }) {
  const logoUrl = mediaImageUrl(b.logoKey, { width: 120 });
  // Live státusz CSAK ismert nyitvatartásnál (nincs kitalált 8–18 default).
  const knownHours = parseWorkingHoursStrict(b.workingHours ?? null);
  const openStatus = knownHours ? calculateBusinessHoursStatus(knownHours) : null;
  const openTextTrim = b.openText?.trim() || null;
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 shadow-pop">
      <Link
        href={`/szaknevsor/${b.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 transition active:scale-[0.99]"
      >
      <div
        className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[14px] bg-primary-soft"
        style={!logoUrl && b.photo ? { background: b.photo } : undefined}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" width={48} height={48} />
        ) : (
          // Nincs logó → kategória-ikon (ne legyen üres szürke doboz).
          <div className="grid h-full w-full place-items-center text-primary/70">
            <CategoryIcon categoryId={b.categoryId} categoryLabel={b.categoryLabel} size={26} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
          {b.categoryLabel}
          <span className="text-ink-faint">·</span>
          {b.reviews > 0 ? (
            <span className="inline-flex items-center gap-0.5 text-ink">
              <Icon name="star" size={10} filled className="text-star" />
              {b.rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-ink-faint">Új</span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
          {b.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] text-ink-muted">
          {/* Táv CSAK valódi GPS-számolásból (a user pozíciójából) — ez mutatja
              meg, hogy a kártyán látott hely valójában hol van hozzá képest. */}
          {distanceKm != null && (
            <>
              <span className="inline-flex shrink-0 items-center gap-0.5">
                <Icon name="nav" size={10} strokeWidth={2.2} />
                {formatDistanceKm(distanceKm)}
              </span>
              {(openStatus || openTextTrim) && <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-ink-faint" />}
            </>
          )}
          {/* Csak VALÓS státusz: ismert nyitvatartásnál nyitva/zárva; egyébként a
              szabad-szöveges openText, vagy semmi (nincs kitalált státusz). */}
          {openStatus ? (
            <span className={cn("truncate", openStatus.isOpen ? "font-semibold text-success" : "text-accent")}>
              {openStatus.isOpen ? "Nyitva" : "Zárva"}
            </span>
          ) : openTextTrim ? (
            <span className="truncate">{openTextTrim}</span>
          ) : null}
        </div>
      </div>
      </Link>
      {b.phone && (
        // TelLink: a térképi hívás is számítson az analitikába (phoneClicks) és
        // a hívás-utáni vélemény-kérőbe — eddig sima <a> volt, egyik sem futott.
        <TelLink
          businessId={b.id}
          phone={b.phone}
          businessName={b.name}
          stopPropagation
          aria-label={`${b.name} hívása`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-success text-white active:scale-95"
        >
          <Icon name="phone" size={16} strokeWidth={2.4} />
        </TelLink>
      )}
      <Link
        href={`/szaknevsor/${b.id}`}
        aria-label="Részletek"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-primary text-white active:scale-95"
      >
        <Icon name="arrowRight" size={16} strokeWidth={2.4} />
      </Link>
    </div>
  );
}

