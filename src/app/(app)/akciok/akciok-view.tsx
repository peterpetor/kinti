"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { DealReport } from "@/lib/repo";
import {
  getStoreById,
  getCategoryById,
  DEAL_STORES,
} from "@/lib/deals";
import { DealReporter } from "@/components/views/deal-reporter";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

// Lazy-load — a Leaflet csak böngészőben
const DealsMap =
  typeof window !== "undefined"
    ? lazy(() => import("@/components/views/deals-map").then((m) => ({ default: m.DealsMap })))
    : () => null;

type ViewMode = "map" | "list";

/** Durva ország-bbox — az akciók (lat/lng) ország szerinti szűréséhez. */
function inCountryBox(lat: number, lng: number, country: string): boolean {
  if (country === "AT") return lat >= 46.3 && lat <= 49.1 && lng >= 9.5 && lng <= 17.2;
  return lat >= 45.7 && lat <= 47.9 && lng >= 5.8 && lng <= 10.6; // CH
}

export function AkciokView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [view, setView] = useState<ViewMode>("map");
  const [deals, setDeals] = useState<DealReport[]>([]);
  const [filterStore, setFilterStore] = useState<string>("all");
  const [reporterOpen, setReporterOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/deals")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDeals(Array.isArray(data) ? data : []))
      .catch(() => setDeals([]));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 90_000);
    return () => clearInterval(t);
  }, [load]);

  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;

  // Ország-szűrt akciók (bbox) — AT-ben ne látszódjanak a svájci akciók.
  const countryDeals = useMemo(
    () => deals.filter((d) => inCountryBox(d.lat, d.lng, country)),
    [deals, country],
  );
  const filtered = useMemo(() => {
    if (filterStore === "all") return countryDeals;
    return countryDeals.filter((d) => d.storeId === filterStore);
  }, [countryDeals, filterStore]);

  return (
    <div className="space-y-4">
      {/* Header — CTA + nézet-váltó */}
      <div className="space-y-2 px-5">
        <button
          type="button"
          onClick={() => setReporterOpen(true)}
          className="flex w-full items-center gap-3 rounded-card border-2 border-dashed border-accent/40 bg-accent/5 p-3.5 transition active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-lg">
            🏷️
          </span>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-[14px] font-extrabold text-ink">Láttál akciót?</div>
            <div className="text-[11.5px] text-ink-muted">
              3 érintés: bolt → kategória → kedvezmény. 30 másodperc.
            </div>
          </div>
          <Icon name="chevR" size={14} className="text-accent shrink-0" />
        </button>
      </div>

      {/* Filter pillek — boltok */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-6 pb-0.5">
        <FilterPill active={filterStore === "all"} onClick={() => setFilterStore("all")} label={`Mind (${countryDeals.length})`} />
        {DEAL_STORES.map((s) => {
          const count = countryDeals.filter((d) => d.storeId === s.id).length;
          if (count === 0) return null;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilterStore(s.id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold transition",
                filterStore === s.id
                  ? "text-white shadow-card"
                  : "border border-line bg-surface text-ink-muted",
              )}
              style={filterStore === s.id ? { backgroundColor: s.color } : undefined}
            >
              <span
                className="grid h-4 w-4 place-items-center rounded-full text-[8.5px] font-extrabold text-white"
                style={{ backgroundColor: filterStore === s.id ? "rgba(255,255,255,0.2)" : s.color }}
              >
                {s.initial}
              </span>
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Meta + view toggle */}
      <div className="flex items-center justify-between gap-3 px-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {filtered.length} aktív akció · lejár éjfélkor
        </p>
        <div className="flex gap-1 rounded-pill border border-line bg-surface-alt p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn(
              "rounded-pill px-3 py-1 transition",
              view === "map" ? "bg-surface text-ink shadow-card" : "text-ink-muted",
            )}
          >
            📍 Térkép
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "rounded-pill px-3 py-1 transition",
              view === "list" ? "bg-surface text-ink shadow-card" : "text-ink-muted",
            )}
          >
            📋 Lista
          </button>
        </div>
      </div>

      {/* Térkép / Lista */}
      {view === "map" ? (
        <div className="px-5">
          <Suspense
            fallback={
              <div className="grid h-[calc(100dvh-340px)] min-h-[400px] place-items-center rounded-card border border-line bg-surface text-[12.5px] font-semibold text-ink-muted shadow-card">
                Térkép betöltése…
              </div>
            }
          >
            <DealsMap
              deals={filtered}
              country={country}
              className="h-[calc(100dvh-340px)] min-h-[400px] max-h-[600px] overflow-hidden rounded-card border border-line shadow-card"
            />
          </Suspense>
        </div>
      ) : (
        <div className="px-5">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-2">
              {filtered.map((d) => (
                <DealListCard key={d.id} deal={d} />
              ))}
            </div>
          )}
        </div>
      )}

      {reporterOpen && (
        <DealReporter
          turnstileSiteKey={turnstileSiteKey}
          onClose={() => setReporterOpen(false)}
          onSuccess={() => {
            setReporterOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function DealListCard({ deal }: { deal: DealReport }) {
  const store = getStoreById(deal.storeId);
  const cat = getCategoryById(deal.categoryId);

  return (
    <article className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-card">
      <span className="text-2xl shrink-0">{cat?.emoji ?? "🏷️"}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 text-[11px] font-extrabold text-white"
            style={{ backgroundColor: store?.color ?? "#5c6d63" }}
          >
            {store?.label ?? deal.storeId}
          </span>
          <span className="inline-flex items-center rounded-pill bg-accent px-1.5 py-0.5 text-[11.5px] font-extrabold text-white">
            −{deal.discountPct}%
          </span>
        </div>
        <p className="mt-0.5 text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
          {cat?.label ?? deal.categoryId}
        </p>
        {deal.locationName && (
          <p className="text-[11.5px] text-ink-muted truncate">📍 {deal.locationName}</p>
        )}
        {deal.note && (
          <p className="text-[11.5px] italic text-ink-muted truncate">„{deal.note}"</p>
        )}
      </div>
      <span className="shrink-0 text-[11px] text-ink-faint">{fmtAgo(deal.createdAt)}</span>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
      <span className="text-4xl">🏷️</span>
      <p className="text-[13.5px] font-bold text-ink">Még nincs friss akció</p>
      <p className="text-[12px] text-ink-muted">
        Légy te az első, aki feldob egy leárazást! 30 másodperc, csak 3 érintés.
      </p>
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill px-3 py-1.5 text-[11.5px] font-bold transition",
        active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted",
      )}
    >
      {label}
    </button>
  );
}

function fmtAgo(iso: string): string {
  const t = Date.parse(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "imént";
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  return `${h}h`;
}
