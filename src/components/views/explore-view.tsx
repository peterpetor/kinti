"use client";

import { useMemo, useState, lazy, Suspense } from "react";
import { BusinessCard, CategoryPills, Icon, SearchBar } from "@/components/ui";
import type { Business, Category } from "@/lib/types";
import { cn } from "@/lib/cn";

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
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return businesses.filter((b) => {
      const byCat = cat === "all" || b.categoryId === cat;
      const byText =
        !needle ||
        b.name.toLowerCase().includes(needle) ||
        (b.categoryLabel ?? "").toLowerCase().includes(needle) ||
        (b.address ?? "").toLowerCase().includes(needle);
      return byCat && byText;
    });
  }, [businesses, cat, q]);

  const locatedCount = useMemo(
    () => filtered.filter((b) => b.lat != null && b.lng != null).length,
    [filtered],
  );

  return (
    <div className="space-y-3">
      <div className="px-5">
        <SearchBar value={q} onChange={setQ} />
      </div>

      <CategoryPills categories={categories} active={cat} onSelect={setCat} />

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
              className="mb-6 h-[calc(100dvh-380px)] min-h-[380px] max-h-[560px]"
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
