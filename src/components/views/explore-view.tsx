"use client";

import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BusinessCard, CategoryPills, Icon, SearchBar } from "@/components/ui";
import type { Business, Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CANTONS, cantonFromAddress, matchesCanton } from "@/lib/cantons";

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

  const [cat, setCat] = useState("all");
  const [q, setQ] = useState(initialQ);
  const [canton, setCanton] = useState(initialCanton);
  const [showFavs, setShowFavs] = useState(initialFav);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [view, setView] = useState<ViewMode>("list");

  // Kedvenc ID-k betöltése localStorage-ből
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
      setFavoriteIds(favs);
    } catch {
      // ignore
    }
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return businesses.filter((b) => {
      const byCat = cat === "all" || b.categoryId === cat;
      const byCanton =
        canton === "all" ||
        cantonFromAddress(b.address ?? null)?.code === canton;
      const byFav = !showFavs || favoriteIds.includes(b.id);
      const byText =
        !needle ||
        b.name.toLowerCase().includes(needle) ||
        (b.categoryLabel ?? "").toLowerCase().includes(needle) ||
        (b.address ?? "").toLowerCase().includes(needle) ||
        // Svájci kanton-keresés szövegből is: pl. "Aargau", "ZH", "Tessin", …
        matchesCanton({ address: b.address ?? null }, needle);
      return byCat && byCanton && byFav && byText;
    });
  }, [businesses, cat, canton, q, showFavs, favoriteIds]);

  const locatedCount = useMemo(
    () => filtered.filter((b) => b.lat != null && b.lng != null).length,
    [filtered],
  );

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

      {/* Szűrők sor (Kanton + Mentett kedvencek) */}
      <div className="flex flex-wrap items-center gap-2 px-5">
        {/* Kanton szűrő */}
        <label className="relative inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-2 shadow-card cursor-pointer hover:bg-surface-alt transition">
          <Icon name="pin" size={14} strokeWidth={2.2} className="shrink-0 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted select-none">
            Kanton
          </span>
          <span className="text-[13.5px] font-bold tracking-[-0.01em] text-ink pr-1">
            {locationLabel}
          </span>
          <Icon name="chevD" size={13} strokeWidth={2.2} className="text-ink-muted shrink-0" />
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            aria-label="Kanton szűrő"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            <option value="all">Egész Svájc</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </label>

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
      </div>

      {/* A kategória-pillek list-módban itt fent; map-módban a térképre úsztatva. */}
      {view === "list" && (
        <CategoryPills categories={categories} active={cat} onSelect={setCat} />
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

      {view === "list" ? (
        <div className="grid gap-2.5 px-5">
          {filtered.map((b) => (
            <BusinessCard key={b.id} business={b} href={`/szaknevsor/${b.id}`} />
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-12 text-center shadow-card">
              <Icon name="search" size={28} className="text-ink-faint" />
              <p className="text-sm font-semibold text-ink">Nincs találat</p>
              <p className="text-xs text-ink-muted">Próbálj másik kategóriát vagy keresőszót.</p>
            </div>
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
              businesses={filtered}
              categories={categories}
              activeCat={cat}
              onSelectCat={setCat}
              locationLabel={locationLabel}
              className="mb-6 h-[calc(100dvh-300px)] min-h-[460px] max-h-[640px]"
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
