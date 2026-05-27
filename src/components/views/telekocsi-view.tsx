"use client";

import { lazy, Suspense, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Ride } from "@/lib/repo";
import { RideCard } from "./ride-card";

/**
 * TelekocsiView — a /telekocsi oldal kliens-burkolója. Lista / Térkép váltó.
 * A térkép (Leaflet) lazy-loadolva, kizárólag a böngészőben — mint a Szaknévsornál.
 */
const RideMap =
  typeof window !== "undefined"
    ? lazy(() => import("./ride-map").then((m) => ({ default: m.RideMap })))
    : () => null;

type ViewMode = "list" | "map";

export function TelekocsiView({
  rides,
  currentUserId,
}: {
  rides: Ride[];
  currentUserId: string | null;
}) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="space-y-4">
      {/* Feladás CTA */}
      <div className="px-5">
        <Link
          href="/telekocsi/feladas"
          className="flex items-center gap-3 rounded-card border border-dashed border-[#3a6ea5]/40 bg-[#3a6ea5]/10 p-3.5 transition active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#3a6ea5] text-white text-lg">
            🚗
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
              Van szabad helyed? Hirdesd meg!
            </div>
            <div className="text-[11.5px] text-ink-muted">
              Belépés szükséges — a kapcsolat telefonon megy
            </div>
          </div>
          <Icon name="chevR" size={14} className="text-[#3a6ea5]" />
        </Link>
      </div>

      {/* Meta sor + toggle */}
      <div className="flex items-center justify-between gap-3 px-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {rides.length} aktív fuvar
        </p>
        <ViewSwitch value={view} onChange={setView} />
      </div>

      {/* Lista / Térkép */}
      {view === "list" ? (
        <div className="px-5">
          {rides.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
              <span className="text-3xl">🚗</span>
              <p className="text-[13.5px] font-semibold text-ink">Még nincs aktív fuvar</p>
              <p className="text-[12px] text-ink-muted">Légy te az első, aki meghirdeti!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {rides.map((r) => (
                <RideCard
                  key={r.id}
                  ride={r}
                  canDelete={r.posterUserId === currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-5">
          <Suspense
            fallback={
              <div className="grid h-[calc(100dvh-340px)] min-h-[380px] max-h-[560px] place-items-center rounded-card border border-line bg-surface text-[12.5px] font-semibold text-ink-muted shadow-card">
                Térkép betöltése…
              </div>
            }
          >
            <RideMap
              rides={rides}
              className="h-[calc(100dvh-340px)] min-h-[380px] max-h-[560px] overflow-hidden rounded-card border border-line shadow-card"
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

// --- Lista/Térkép váltó (a Szaknévsorból átemelt stílus, kék akcenttel) -----
function ViewSwitch({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div role="tablist" aria-label="Nézet" className="glass inline-flex rounded-pill p-0.5 text-[11.5px] font-bold">
      <SwitchBtn active={value === "list"} onClick={() => onChange("list")} label="Lista" icon="list" />
      <SwitchBtn active={value === "map"} onClick={() => onChange("map")} label="Térkép" icon="map" />
    </div>
  );
}

function SwitchBtn({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: "list" | "map" }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 transition",
        active ? "bg-[#3a6ea5] text-white shadow-card" : "text-ink-muted hover:text-ink",
      )}
    >
      <Icon name={icon} size={12} strokeWidth={2.2} />
      {label}
    </button>
  );
}
