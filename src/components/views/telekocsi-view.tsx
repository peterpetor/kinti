"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PublicRide } from "@/lib/repo";
import type { SosAlert } from "@/lib/sos-repo";
import { RideCard } from "./ride-card";
import { PushOptin } from "@/components/push-optin";
import { SosModal } from "./sos-modal";
import { SosDetailsCard } from "@/components/sos-details-card";

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
  rides: PublicRide[];
  currentUserId: string | null;
}) {
  const [view, setView] = useState<ViewMode>("list");
  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [packagesOnly, setPackagesOnly] = useState(false);

  // SOS — riasztások a térképen + feladás modal
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [selectedSosId, setSelectedSosId] = useState<string | null>(null);

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

  const packageCount = useMemo(() => rides.filter((r) => r.acceptsPackages).length, [rides]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rides.filter((r) => {
      // Szöveg: indulás, érkezés, megállók, poszter, package note
      const byText =
        !needle ||
        r.departureCity.toLowerCase().includes(needle) ||
        r.destinationCity.toLowerCase().includes(needle) ||
        r.posterName.toLowerCase().includes(needle) ||
        r.waypoints.some((wp) => wp.city.toLowerCase().includes(needle)) ||
        (r.notes ?? "").toLowerCase().includes(needle) ||
        (r.packageNote ?? "").toLowerCase().includes(needle);
      // Dátum: ha kiválasztott, az indulás napja >= szűrő dátuma
      const byDate =
        !dateFilter || r.departureTime.slice(0, 10) >= dateFilter;
      // Csomagszállítás szűrő
      const byPkg = !packagesOnly || r.acceptsPackages;
      return byText && byDate && byPkg;
    });
  }, [rides, q, dateFilter, packagesOnly]);

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
              Utaznál? Hirdess vagy keress fuvart!
            </div>
            <div className="text-[11.5px] text-ink-muted">
              Nincs regisztráció — a kapcsolat telefonon vagy WhatsAppon megy
            </div>
          </div>
          <Icon name="chevR" size={14} className="text-[#3a6ea5] shrink-0" />
        </Link>
      </div>

      {/* Jogi figyelemfelhívás (Non-profit) */}
      <div className="px-5">
        <div className="flex items-start gap-2.5 rounded-[14px] border border-[#e3a233]/40 bg-[#fff8ed] p-3 shadow-sm">
          <span className="shrink-0 text-base leading-none">⚖️</span>
          <div className="min-w-0 flex-1 text-[11.5px] leading-snug text-[#9a6b00]">
            <strong>Szigorúan non-profit!</strong> A Telekocsi kizárólag költségmegosztásos (cost-sharing) 
            utakra használható. A sofőr csak a benzin és az útdíj arányos megtérítését kérheti. 
            Az üzletszerű személyfuvarozás (illegális taxi) azonnali, végleges kitiltást von maga után!
          </div>
        </div>
      </div>

      <div className="px-5">
        <PushOptin />
      </div>

      {/* Kereső + dátumszűrő */}
      <div className="space-y-2 px-5">
        <div className="flex items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3 py-2.5 shadow-card">
          <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keresés (város, megálló, név…)"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-ink-faint"
          />
          {q && (
            <button type="button" aria-label="Törlés" onClick={() => setQ("")} className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-surface-alt text-ink-muted">
              <Icon name="close" size={13} strokeWidth={2.4} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 text-[12.5px] font-bold shadow-card">
            <Icon name="calendar" size={12} strokeWidth={2.2} className="shrink-0 text-[#3a6ea5]" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-ink outline-none"
            />
          </label>
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter("")}
              className="text-[11.5px] font-bold text-[#3a6ea5]"
            >
              Szűrő törlése
            </button>
          )}
          {packageCount > 0 && (
            <button
              type="button"
              onClick={() => setPackagesOnly((v) => !v)}
              aria-pressed={packagesOnly}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-[12.5px] font-bold shadow-card transition",
                packagesOnly
                  ? "bg-[#e3a233] text-white"
                  : "border border-line bg-surface text-ink",
              )}
            >
              📦 Csomagot vállalók ({packageCount})
            </button>
          )}
        </div>
      </div>

      {/* Meta sor + toggle */}
      <div className="flex items-center justify-between gap-3 px-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {filtered.length} fuvar{filtered.length !== rides.length && ` (összesen ${rides.length})`}
        </p>
        <ViewSwitch value={view} onChange={setView} />
      </div>

      {/* Lista / Térkép */}
      {view === "list" ? (
        <div className="px-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
              <span className="text-3xl">🚗</span>
              <p className="text-[13.5px] font-semibold text-ink">Még nincs aktív fuvar</p>
              <p className="text-[12px] text-ink-muted">Légy te az első, aki meghirdeti!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((r) => (
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
        <div className="px-5 space-y-2">
          {/* SOS-bar a térkép fölött — feladás gomb + aktív riasztások jelzése */}
          <div className="flex items-center gap-2 rounded-card border border-red-500/30 bg-red-50 px-3 py-2 shadow-card">
            <span className="text-base">🆘</span>
            <p className="min-w-0 flex-1 text-[11.5px] leading-snug text-red-900">
              <strong>Bajban vagy az úton?</strong>{" "}
              <span className="text-red-800/80">
                {sosAlerts.length > 0
                  ? `${sosAlerts.length} aktív riasztás a térképen.`
                  : "Küldj S.O.S.-t a kinti közösségnek."}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              className="shrink-0 rounded-pill bg-red-600 hover:bg-red-700 active:scale-95 px-3 py-1.5 text-[11.5px] font-bold text-white shadow-card"
            >
              S.O.S. leadása
            </button>
          </div>

          <Suspense
            fallback={
              <div className="grid h-[calc(100dvh-380px)] min-h-[360px] max-h-[540px] place-items-center rounded-card border border-line bg-surface text-[12.5px] font-semibold text-ink-muted shadow-card">
                Térkép betöltése…
              </div>
            }
          >
            <RideMap
              rides={filtered}
              sosAlerts={sosAlerts}
              onSelectSos={(id) => setSelectedSosId(id)}
              className="h-[calc(100dvh-380px)] min-h-[360px] max-h-[540px] overflow-hidden rounded-card border border-line shadow-card"
            />
          </Suspense>
        </div>
      )}

      {/* SOS-feladás modal */}
      {sosModalOpen && (
        <SosModal
          onClose={() => setSosModalOpen(false)}
          onSuccess={() => {
            setSosModalOpen(false);
            loadSosAlerts();
          }}
        />
      )}

      {/* SOS-részletek a térképen kattintott pinhez */}
      {selectedSosId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSosId(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SosDetailsCard
              sos={sosAlerts.find((s) => s.id === selectedSosId)!}
              onClose={() => setSelectedSosId(null)}
            />
          </div>
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
