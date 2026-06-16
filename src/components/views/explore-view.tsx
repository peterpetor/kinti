"use client";

import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BusinessCard, CategoryPills, Icon, SearchBar } from "@/components/ui";
import { FAVORITES_CHANGED_EVENT } from "@/components/ui/favorite-button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { Business, Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CANTONS, cantonFromAddress, matchesCanton } from "@/lib/cantons";
import { readPreferredCanton, setPreferredCanton } from "@/lib/canton-pref";
import { calculateBusinessHoursStatus, parseWorkingHours } from "@/lib/hours";
import { haversineKm } from "@/lib/distance";
import { AISearchBar } from "./ai-search";
import { PushOptin } from "@/components/push-optin";

const RADIUS_OPTIONS_KM = [5, 10, 20, 50] as const;
type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];
const RADIUS_LS_KEY = "kinti_radius_km";

/**
 * ExploreView (Szaknévsor) — szerverről kapja a teljes adatkészletet, és
 * kliens-oldalon szűr kategóriára + szabad szövegre. Két nézet közt válthatunk:
 *
 *   • „Lista”   →  BusinessCard kártyák (kompakt, görgethető lista)
 *   • „Térkép”  →  Leaflet-térkép (OpenStreetMap csempék, divIcon markerek)
 *
 * A térkép nehéz (Leaflet + lokál CSS + `window`), ezért lazy-loadolva, kizárólag
 * a böngészőben („ssr: false”): csak akkor kerül a bundle-be, ha a felhasználó
 * tényleg átvált rá. A statikus lista így villámgyorsan megjelenik.
 */
const BusinessMap =
  typeof window !== "undefined"
    ? lazy(() => import("./business-map").then((m) => ({ default: m.BusinessMap })))
    : () => null;

type ViewMode = "list" | "map";

export function ExploreView({
  categories,
  businesses,
}: {
  categories: Category[];
  businesses: Business[];
}) {
  // ?q és ?canton URL-paraméterek (a főoldalról / keresőből érkezve) → kezdő szűrők
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") ?? "";
  const initialCanton = searchParams?.get("canton") ?? "all";
  const initialFav = searchParams?.get("fav") === "1";
  const initialCat = searchParams?.get("cat") ?? "all";

  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState(initialQ);
  const [canton, setCanton] = useState(initialCanton);
  const [showFavs, setShowFavs] = useState(initialFav);
  const [openNow, setOpenNow] = useState(false);
  const [minYears, setMinYears] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [cantonSheetOpen, setCantonSheetOpen] = useState(false);

  // Ha nem URL-ből érkezett kanton, a felhasználó preferált kantonjára szűrünk
  // alapból (kanton-személyre szabás). A hidratálás után, hogy ne legyen mismatch.
  useEffect(() => {
    if (!searchParams?.get("canton")) {
      const pref = readPreferredCanton();
      if (pref) setCanton(pref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Radius-search állapot (lat/lng = user böngészőjének poz.; ha null → kikapcsolva)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(20);
  const [geoState, setGeoState] = useState<"idle" | "loading" | "denied" | "error">("idle");

  // Kedvenc ID-k + radius-preferencia betöltése localStorage-ből
  useEffect(() => {
    const readFavs = () => {
      try {
        const favs = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
        setFavoriteIds(Array.isArray(favs) ? favs.map(String) : []);
      } catch {
        // ignore
      }
    };
    readFavs();
    // A kártyák szív-toggle-je ezt szórja → a szűrő (Mentett kedvencek) szinkronban marad.
    window.addEventListener(FAVORITES_CHANGED_EVENT, readFavs);
    try {
      const saved = Number(localStorage.getItem(RADIUS_LS_KEY));
      if (RADIUS_OPTIONS_KM.includes(saved as RadiusKm)) {
        setRadiusKm(saved as RadiusKm);
      }
    } catch {
      // ignore
    }
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, readFavs);
  }, []);

  function requestGeolocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState("idle");
      },
      (err) => {
        setGeoState(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }

  function clearGeolocation() {
    setUserPos(null);
    setGeoState("idle");
  }

  function handleRadiusChange(km: RadiusKm) {
    setRadiusKm(km);
    try {
      localStorage.setItem(RADIUS_LS_KEY, String(km));
    } catch {
      // ignore
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const withDistance = businesses
      .filter((b) => {
        const byCat = cat === "all" || b.categoryId === cat;
        const byCanton =
          canton === "all" ||
          cantonFromAddress(b.address ?? null)?.code === canton;
        const byFav = !showFavs || favoriteIds.includes(b.id);
        const byOpen =
          !openNow ||
          (b.workingHours
            ? calculateBusinessHoursStatus(parseWorkingHours(b.workingHours)).isOpen
            : false);
        const byYears = minYears === 0 || (b.yearsHere ?? 0) >= minYears;
        const byText =
          !needle ||
          b.name.toLowerCase().includes(needle) ||
          (b.categoryLabel ?? "").toLowerCase().includes(needle) ||
          // Specialitás-keresés a bemutatkozó szövegben is.
          (b.blurb ?? "").toLowerCase().includes(needle) ||
          (b.address ?? "").toLowerCase().includes(needle) ||
          // Svájci kanton-keresés szövegből is: pl. "Aargau", "ZH", "Tessin", …
          matchesCanton({ address: b.address ?? null }, needle);
        return byCat && byCanton && byFav && byOpen && byYears && byText;
      })
      .map((b) => {
        const dist =
          userPos && b.lat != null && b.lng != null
            ? haversineKm(userPos.lat, userPos.lng, b.lat, b.lng)
            : null;
        return { b, dist };
      });

    // Radius-szűrés: a koordináta nélküli rekordok ilyenkor kiesnek.
    const radiusFiltered = userPos
      ? withDistance.filter(({ dist }) => dist != null && dist <= radiusKm)
      : withDistance;

    // Rendezés: a PRO (featured) vállalkozások mindig elöl ("top pinning"),
    // azon belül a közelebbi (ha van helymeghatározás), majd magasabb értékelés.
    radiusFiltered.sort((a, b) => {
      if (a.b.featured !== b.b.featured) return a.b.featured ? -1 : 1;
      const byDist = (a.dist ?? Infinity) - (b.dist ?? Infinity);
      if (byDist !== 0) return byDist;
      return (b.b.rating ?? 0) - (a.b.rating ?? 0);
    });

    return radiusFiltered;
  }, [businesses, cat, canton, q, showFavs, openNow, minYears, favoriteIds, userPos, radiusKm]);

  const locatedCount = useMemo(
    () => filtered.filter(({ b }) => b.lat != null && b.lng != null).length,
    [filtered],
  );

  const filteredBusinesses = useMemo(() => filtered.map(({ b }) => b), [filtered]);

  // Csak azokat a kategóriákat mutatjuk a pill-sorban, amikben TÉNYLEG van
  // vállalkozás (+ „Mind", + az épp kiválasztott) — így nincs üres, irreleváns
  // kategória, és a sor rövid/letisztult marad.
  const visibleCategories = useMemo(() => {
    const present = new Set(businesses.map((b) => b.categoryId));
    return categories.filter((c) => c.id === "all" || c.id === cat || present.has(c.id));
  }, [categories, businesses, cat]);

  // A térkép hely-pillhez: a kiválasztott kanton neve, vagy "Egész Svájc"
  const locationLabel = useMemo(() => {
    if (canton === "all") return "Egész Svájc";
    const found = CANTONS.find((c) => c.code === canton);
    return found ? `${found.name} (${found.code})` : canton;
  }, [canton]);

  return (
    <div className="space-y-3">
      <div className="px-5">
        <SearchBar value={q} onChange={setQ} />
      </div>

      {/* AI természetes nyelvű kereső */}
      <div className="px-5">
        <AISearchBar
          onApplyCategory={setCat}
          onApplyCanton={setCanton}
          onApplyQuery={setQ}
        />
      </div>

      {/* Szűrők sor (Kanton + Mentett kedvencek) */}
      <div className="flex flex-wrap items-center gap-2 px-5">
        {/* Kanton szűrő — natív alsó lap (BottomSheet) */}
        <button
          type="button"
          onClick={() => setCantonSheetOpen(true)}
          className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-2 shadow-card transition hover:bg-surface-alt active:scale-[0.97]"
        >
          <Icon name="pin" size={14} strokeWidth={2.2} className="shrink-0 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Kanton</span>
          <span className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">{locationLabel}</span>
          <Icon name="chevD" size={13} strokeWidth={2.2} className="text-ink-muted shrink-0" />
        </button>
        <BottomSheet open={cantonSheetOpen} onClose={() => setCantonSheetOpen(false)} title="Válassz kantont">
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[{ code: "all", name: "Egész Svájc" }, ...CANTONS].map((c) => {
              const active = canton === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCanton(c.code);
                    setPreferredCanton(c.code); // az app tanul a kézi választásból
                    setCantonSheetOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-1 rounded-xl border px-3 py-2.5 text-left text-[13.5px] font-bold transition active:scale-[0.97]",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-line bg-surface text-ink hover:bg-surface-alt",
                  )}
                >
                  <span className="truncate">
                    {c.name}
                    {c.code !== "all" ? ` (${c.code})` : ""}
                  </span>
                  {active && <Icon name="check" size={15} strokeWidth={3} className="shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </BottomSheet>

        {/* Kedvencek szűrő */}
        <button
          type="button"
          onClick={() => setShowFavs(!showFavs)}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            showFavs
              ? "bg-accent/10 border-accent/30 text-accent font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt"
          )}
        >
          <Icon
            name="heart"
            size={14}
            strokeWidth={2.2}
            filled={showFavs}
            className={cn("shrink-0", showFavs ? "text-accent" : "text-ink-muted")}
          />
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            Mentett kedvencek
          </span>
        </button>

        {/* Most nyitva szűrő */}
        <button
          type="button"
          onClick={() => setOpenNow((v) => !v)}
          aria-pressed={openNow}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            openNow
              ? "bg-success/10 border-success/30 text-success font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              openNow ? "bg-success animate-pulse" : "bg-ink-faint",
            )}
          />
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            Most nyitva
          </span>
        </button>

        {/* Tapasztalat (év) szűrő — Advanced search */}
        <select
          value={minYears}
          onChange={(e) => setMinYears(Number(e.target.value))}
          aria-label="Szűrés tapasztalatra"
          className={cn(
            "inline-flex items-center rounded-pill border px-3 py-2 text-[11.5px] font-bold tracking-wide shadow-card transition cursor-pointer outline-none",
            minYears > 0
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <option value={0}>Tapasztalat</option>
          <option value={3}>3+ év</option>
          <option value={5}>5+ év</option>
          <option value={10}>10+ év</option>
        </select>

        {/* Közelemben / radius-szűrő */}
        <button
          type="button"
          onClick={userPos ? clearGeolocation : requestGeolocation}
          aria-pressed={userPos != null}
          disabled={geoState === "loading"}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            userPos
              ? "bg-primary/10 border-primary/30 text-primary font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
            geoState === "loading" && "opacity-60 cursor-wait",
          )}
        >
          <Icon
            name="pin"
            size={12}
            strokeWidth={2.4}
            className={cn("shrink-0", userPos ? "text-primary" : "text-ink-muted")}
          />
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            {geoState === "loading"
              ? "Helymeghatározás…"
              : userPos
                ? `${radiusKm} km-en belül · ✕`
                : "Közelemben"}
          </span>
        </button>

        {/* Radius választó — csak ha aktív a helymeghatározás */}
        {userPos && (
          <label className="relative inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary/5 px-3 py-2 shadow-card cursor-pointer transition hover:bg-primary/10">
            <span className="text-[11px] font-bold uppercase tracking-wide text-primary/70 select-none">
              Sugár
            </span>
            <span className="text-[13px] font-bold tracking-[-0.01em] text-primary pr-1">
              {radiusKm} km
            </span>
            <Icon name="chevD" size={13} strokeWidth={2.2} className="text-primary/70 shrink-0" />
            <select
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value) as RadiusKm)}
              aria-label="Keresési sugár"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {RADIUS_OPTIONS_KM.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Geo-hiba visszajelzés */}
      {(geoState === "denied" || geoState === "error") && (
        <div className="mx-5 rounded-card border border-accent/30 bg-accent/5 px-4 py-2 text-[12px] text-accent">
          {geoState === "denied"
            ? "Helymeghatározás letiltva. Engedélyezd a böngésződ beállításaiban, hogy a közeli vállalkozásokat lásd."
            : "Nem sikerült lekérni a helyzeted. Próbáld újra később."}
        </div>
      )}

      {/* Self-service CTA — vállalkozói regisztráció */}
      <div className="px-5">
        <Link
          href="/vallalkozo"
          className="flex items-center gap-3 rounded-card border border-primary/25 bg-primary-soft px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
            <Icon name="plus" size={17} strokeWidth={2.6} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Svájci vállalkozásod van? Add hozzá ingyen!
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Gyors regisztráció, és 1 perc alatt fent vagy.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
        </Link>

        {/* Lead gen CTA — árajánlat-kérés */}
        <Link
          href="/szaknevsor/ajanlatkeres"
          className="flex items-center gap-3 rounded-card border border-accent/25 bg-accent/5 px-4 py-3 shadow-card transition active:scale-[0.99] mt-2"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-accent text-white">
            <Icon name="send" size={17} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Kérj árajánlatot egyszerre mindenkitől!
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Egy űrlap — több vállalkozó válaszol neked.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-accent" />
        </Link>

        {/* Push-feliratkozás: új vállalkozás/állás/esemény a kantonodban */}
        <div className="mt-2">
          <PushOptin />
        </div>
      </div>

      {/* A kategória-pillek list-módban itt fent; map-módban a térképre úsztatva. */}
      {view === "list" && (
        <CategoryPills categories={visibleCategories} active={cat} onSelect={setCat} />
      )}

      {/* Lista / Térkép váltó + meta-sor */}
      <div className="flex items-center justify-between gap-3 px-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {filtered.length} találat
          {view === "map" && locatedCount < filtered.length && (
            <span className="ml-1 normal-case tracking-normal text-ink-faint">
              ({locatedCount} térképen)
            </span>
          )}
        </p>
        <ViewSwitch value={view} onChange={setView} />
      </div>

      {/* Kontextuális supply-CTA: ha egy szűrt kategóriában/kantonban kevés a
          találat, ott a legnagyobb a hiányérzet → magas szándékú ajánlás-pont. */}
      {view === "list" &&
        filtered.length > 0 &&
        filtered.length <= 4 &&
        (cat !== "all" || canton !== "all") && (
          <div className="px-5">
            <Link
              href="/szaknevsor/ajanlas"
              className="flex items-center gap-3 rounded-card border border-primary/30 bg-primary-soft px-4 py-3 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
                <Icon name="plus" size={17} strokeWidth={2.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold tracking-[-0.01em] text-ink">
                  Kevés a találat — ismersz többet?
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Ajánlj egy magyar vállalkozást 30 mp alatt — mi ellenőrizzük és felvesszük.
                </span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
            </Link>
          </div>
        )}

      {view === "list" ? (
        <div className="grid gap-2.5 px-5">
          {filtered.map(({ b, dist }) => (
            <BusinessCard
              key={b.id}
              business={b}
              href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
              distanceKm={dist}
              showFavorite
            />
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-12 text-center shadow-card">
              <Icon name={showFavs ? "heart" : "search"} size={28} className="text-ink-faint" />
              <p className="text-sm font-semibold text-ink">
                {showFavs ? "Nincs mentett kedvenced" : "Nincs találat"}
              </p>
              <p className="text-xs text-ink-muted">
                {showFavs
                  ? "Nyomd meg a szívet egy vállalkozás kártyáján, és itt gyűjtöd a kedvenceidet."
                  : userPos
                    ? `Nincs vállalkozás ${radiusKm} km-en belül. Növeld a sugarat vagy kapcsold ki a helymeghatározást.`
                    : "Próbálj másik kategóriát vagy keresőszót."}
              </p>
              {!showFavs && (
                <Link
                  href="/szaknevsor/ajanlas"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95"
                >
                  <Icon name="plus" size={13} strokeWidth={2.6} /> Ajánlj egy magyar vállalkozást
                </Link>
              )}
            </div>
          )}

          {/* Hiányzik valaki? — közösségi ajánlás a lista alján */}
          {filtered.length > 0 && (
            <Link
              href="/szaknevsor/ajanlas"
              className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary">
                <Icon name="plus" size={17} strokeWidth={2.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold tracking-[-0.01em] text-ink">
                  Hiányzik egy magyar vállalkozás?
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Ajánld 30 mp alatt — mi ellenőrizzük és felvesszük.
                </span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
            </Link>
          )}
        </div>
      ) : (
        <div className="px-5">
          <Suspense
            fallback={
              <div className="mb-6 grid h-[calc(100dvh-380px)] min-h-[380px] max-h-[560px] place-items-center rounded-card border border-line bg-surface text-[12.5px] font-semibold text-ink-muted shadow-card">
                Térkép betöltése…
              </div>
            }
          >
            <BusinessMap
              businesses={filteredBusinesses}
              categories={visibleCategories}
              activeCat={cat}
              onSelectCat={setCat}
              locationLabel={locationLabel}
              className="mb-2 h-[calc(100dvh-350px)] min-h-[400px] max-h-[580px]"
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

// --- nézet-váltó (Liquid Glass szegmentált gomb) ----------------------------
function ViewSwitch({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Nézet"
      className="glass inline-flex rounded-pill p-0.5 text-[11.5px] font-bold"
    >
      <SwitchBtn active={value === "list"} onClick={() => onChange("list")} label="Lista" icon="list" />
      <SwitchBtn active={value === "map"} onClick={() => onChange("map")} label="Térkép" icon="map" />
    </div>
  );
}

function SwitchBtn({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: "list" | "map";
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 transition",
        active
          ? "bg-primary text-white shadow-card"
          : "text-ink-muted hover:text-ink",
      )}
    >
      <Icon name={icon} size={12} strokeWidth={2.2} />
      {label}
    </button>
  );
}
