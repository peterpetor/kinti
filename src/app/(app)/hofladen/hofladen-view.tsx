"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PublicHofladenSpot } from "@/lib/repo";
import {
  HOFLADEN_CATEGORIES,
  getCategoryById,
  getPaymentMethodById,
} from "@/lib/hofladen";
import { HofladenReporter } from "@/components/views/hofladen-reporter";

const HofladenMap =
  typeof window !== "undefined"
    ? lazy(() => import("@/components/views/hofladen-map").then((m) => ({ default: m.HofladenMap })))
    : () => null;

type ViewMode = "map" | "list";

export function HofladenView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [view, setView] = useState<ViewMode>("map");
  const [spots, setSpots] = useState<PublicHofladenSpot[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filter24h, setFilter24h] = useState(false);
  const [reporterOpen, setReporterOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/hofladen")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSpots(Array.isArray(data) ? data : []))
      .catch(() => setSpots([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return spots.filter((s) => {
      if (filterCategory !== "all" && !s.categories.includes(filterCategory)) return false;
      if (filter24h && !s.open24h) return false;
      return true;
    });
  }, [spots, filterCategory, filter24h]);

  return (
    <div className="space-y-4">
      {/* Header CTA */}
      <div className="px-5">
        <button
          type="button"
          onClick={() => setReporterOpen(true)}
          className="flex w-full items-center gap-3 rounded-card border-2 border-dashed border-success/40 bg-success/5 p-3.5 transition active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-success text-white text-lg">
            🌾
          </span>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-[14px] font-extrabold text-ink">Tudsz egy helyet?</div>
            <div className="text-[11.5px] text-ink-muted">
              Add hozzá — 3-4 érintés, és a térképre kerül.
            </div>
          </div>
          <Icon name="chevR" size={14} className="text-success shrink-0" />
        </button>
      </div>

      {/* Filter pillek — kategóriák */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-6 pb-0.5">
        <FilterPill
          active={filterCategory === "all"}
          onClick={() => setFilterCategory("all")}
          label={`Mind (${spots.length})`}
        />
        {HOFLADEN_CATEGORIES.map((c) => {
          const count = spots.filter((s) => s.categories.includes(c.id)).length;
          if (count === 0) return null;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilterCategory(c.id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold transition",
                filterCategory === c.id
                  ? "bg-primary text-white shadow-card"
                  : "border border-line bg-surface text-ink-muted",
              )}
            >
              <span>{c.emoji}</span>
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Meta + 24h toggle + view */}
      <div className="flex items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-2">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
            {filtered.length} hely
          </p>
          <button
            type="button"
            onClick={() => setFilter24h((v) => !v)}
            className={cn(
              "rounded-pill px-2.5 py-1 text-[10.5px] font-bold transition",
              filter24h ? "bg-success text-white" : "border border-line bg-surface text-ink-muted",
            )}
          >
            🕐 Csak 24h
          </button>
        </div>
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
            <HofladenMap
              spots={filtered}
              className="h-[calc(100dvh-340px)] min-h-[400px] max-h-[600px] overflow-hidden rounded-card border border-line shadow-card"
            />
          </Suspense>
        </div>
      ) : (
        <div className="px-5">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-2.5">
              {filtered.map((s) => (
                <SpotCard key={s.id} spot={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {reporterOpen && (
        <HofladenReporter
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

function SpotCard({ spot }: { spot: PublicHofladenSpot }) {
  return (
    <article className="rounded-card border border-line bg-surface p-3.5 shadow-card space-y-2">
      <div className="flex items-start gap-2.5">
        <span className="text-2xl shrink-0">🌾</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-extrabold text-ink">{spot.name}</h3>
          {spot.locationName && (
            <p className="text-[11.5px] text-ink-muted">
              📍 {spot.locationName}{spot.cantonCode ? ` · ${spot.cantonCode}` : ""}
            </p>
          )}
        </div>
        <span
          className={cn(
            "rounded-pill px-2 py-0.5 text-[10px] font-bold shrink-0",
            spot.open24h ? "bg-success text-white" : "bg-[#e3a233] text-white",
          )}
        >
          {spot.open24h ? "24h" : spot.openText || "Korl."}
        </span>
      </div>

      {spot.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {spot.categories.map((c) => {
            const cat = getCategoryById(c);
            if (!cat) return null;
            return (
              <span key={c} className="inline-flex items-center gap-1 rounded-md bg-surface-alt px-1.5 py-0.5 text-[10.5px] font-bold text-ink-muted">
                {cat.emoji} {cat.label}
              </span>
            );
          })}
        </div>
      )}

      {spot.paymentMethods.length > 0 && (
        <p className="text-[11px] text-ink-muted">
          <strong>Fizetés:</strong>{" "}
          {spot.paymentMethods.map((p) => {
            const pm = getPaymentMethodById(p);
            return pm ? `${pm.emoji} ${pm.label}` : p;
          }).join(", ")}
        </p>
      )}

      {spot.note && (
        <p className="text-[12px] italic text-ink">„{spot.note}"</p>
      )}

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-pill bg-primary py-2 text-center text-[11.5px] font-bold text-white shadow-card active:scale-95"
      >
        🧭 Útvonal
      </a>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
      <span className="text-4xl">🌾</span>
      <p className="text-[13.5px] font-bold text-ink">Még nincs ilyen kategóriájú hely</p>
      <p className="text-[12px] text-ink-muted">Légy te az első, aki feldob egyet!</p>
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
