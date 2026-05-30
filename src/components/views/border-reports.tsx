"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { BORDER_CROSSINGS, COUNTRY_FLAGS, type BorderCrossing } from "@/lib/border-crossings";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

type BorderStatus = "strict" | "moderate" | "easy" | "closed" | "traffic";

interface BorderReport {
  id: string;
  crossingId: string;
  status: BorderStatus;
  note: string | null;
  createdAt: string;
  expiresAt: string;
}

const STATUS_META: Record<BorderStatus, { label: string; emoji: string; color: string; bg: string }> = {
  strict:   { label: "Szigorú ellenőrzés", emoji: "🚨", color: "#e74c3c", bg: "bg-red-50 border-red-200" },
  moderate: { label: "Mérsékelt ellenőrzés", emoji: "🟡", color: "#e3a233", bg: "bg-yellow-50 border-yellow-200" },
  easy:     { label: "Lazább, gyors átkelés", emoji: "✅", color: "#27ae60", bg: "bg-green-50 border-green-200" },
  closed:   { label: "Zárva", emoji: "⛔", color: "#7f8c8d", bg: "bg-gray-100 border-gray-300" },
  traffic:  { label: "Dugó / forgalom", emoji: "🚗", color: "#3a6ea5", bg: "bg-blue-50 border-blue-200" },
};

/**
 * BorderReports — közösségi határátkelő-figyelő.
 *
 * Lista az aktív (4h TTL) jelentésekről + jelentés-leadás bármelyik átkelőre.
 * Auto-refresh 60mp.
 */
export function BorderReports({ turnstileSiteKey = "" }: { turnstileSiteKey?: string }) {
  const [reports, setReports] = useState<BorderReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCountry, setFilterCountry] = useState<string>("all");

  const load = useCallback(() => {
    fetch("/api/border-reports")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  // Csoportosítva crossing_id szerint, legutóbbi elöl
  const byCrossing = useMemo(() => {
    const m = new Map<string, BorderReport[]>();
    for (const r of reports) {
      const arr = m.get(r.crossingId) ?? [];
      arr.push(r);
      m.set(r.crossingId, arr);
    }
    return m;
  }, [reports]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const c of BORDER_CROSSINGS) set.add(c.country);
    return Array.from(set);
  }, []);

  const filteredCrossings = useMemo(() => {
    return BORDER_CROSSINGS.filter((c) => filterCountry === "all" || c.country === filterCountry);
  }, [filterCountry]);

  // Csak azok az átkelők látszanak, amiken van jelentés VAGY popular = true
  const visibleCrossings = useMemo(() => {
    return filteredCrossings.filter((c) => c.popular || byCrossing.has(c.id));
  }, [filteredCrossings, byCrossing]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[14.5px] font-extrabold text-ink">🚓 Élő határátkelő-jelentések</h2>
          <p className="text-[11px] text-ink-muted">
            {reports.length} aktív · közösségi jelentések (4h TTL)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="shrink-0 rounded-pill bg-primary px-3 py-1.5 text-[11.5px] font-bold text-white shadow-card active:scale-95"
        >
          + Jelentés
        </button>
      </div>

      {/* Country filter */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        <FilterPill active={filterCountry === "all"} onClick={() => setFilterCountry("all")} label="Mind" />
        {countries.map((c) => (
          <FilterPill
            key={c}
            active={filterCountry === c}
            onClick={() => setFilterCountry(c)}
            label={`${COUNTRY_FLAGS[c as keyof typeof COUNTRY_FLAGS]} ${c}`}
          />
        ))}
      </div>

      {/* Crossings */}
      {visibleCrossings.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-8 text-center text-[12.5px] text-ink-muted">
          Nincs jelentés.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleCrossings.map((crossing) => (
            <CrossingCard
              key={crossing.id}
              crossing={crossing}
              reports={byCrossing.get(crossing.id) ?? []}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ReportForm
          turnstileSiteKey={turnstileSiteKey}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div className="mt-4 pb-4">
        <LegalDisclaimer
          toolName="Határátkelő figyelő"
          variant="info"
          notAdviceFor="hivatalos vagy hivatalos határátkelési"
          extraWarning="A jelentéseket a közösség tagjai, névtelenül töltik fel aktuális tapasztalataik alapján. A kinti.app üzemeltetője nem tudja garantálni az adatok pontosságát, frissességét vagy hitelességét. Az információk kizárólag tájékoztató jellegűek, hivatalos utazási döntésekhez kérjük, mindig tájékozódj a hivatalos állami vagy rendőrségi forrásokból."
        />
      </div>
    </div>
  );
}

function CrossingCard({ crossing, reports }: { crossing: BorderCrossing; reports: BorderReport[] }) {
  const latest = reports[0];
  const flag = COUNTRY_FLAGS[crossing.country];

  return (
    <article
      className={cn(
        "rounded-card border-2 px-4 py-3 shadow-card",
        latest ? STATUS_META[latest.status].bg : "border-line bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{flag}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
            {crossing.name}
          </h3>
          <p className="text-[10.5px] uppercase tracking-wide text-ink-muted">
            CH {crossing.canton} ↔ {crossing.country}
            {crossing.type === "highway" && " · Autópálya"}
          </p>

          {latest ? (
            <div className="mt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10.5px] font-bold text-white"
                  style={{ backgroundColor: STATUS_META[latest.status].color }}
                >
                  {STATUS_META[latest.status].emoji} {STATUS_META[latest.status].label}
                </span>
                <span className="text-[10.5px] text-ink-faint">{fmtAgo(latest.createdAt)}</span>
                {reports.length > 1 && (
                  <span className="text-[10.5px] text-ink-muted">
                    +{reports.length - 1} további jelentés
                  </span>
                )}
              </div>
              {latest.note && (
                <p className="mt-1.5 text-[12px] leading-snug text-ink italic">
                  „{latest.note}"
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-[11.5px] text-ink-faint">
              Nincs friss jelentés erről az átkelőről.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill px-3 py-1 text-[11.5px] font-bold transition",
        active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted",
      )}
    >
      {label}
    </button>
  );
}

function ReportForm({
  turnstileSiteKey,
  onClose,
  onSuccess,
}: {
  turnstileSiteKey: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [crossingId, setCrossingId] = useState("");
  const [status, setStatus] = useState<BorderStatus>("strict");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!crossingId) {
      setErr("Válassz határátkelőt.");
      return;
    }
    if (!turnstileToken) {
      setErr("Várd meg a robot-ellenőrzést.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/border-reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ crossingId, status, note: note.trim(), turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Hiba.");
        turnstileRef.current?.reset();
        return;
      }
      onSuccess();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hálózati hiba.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-ink/40 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-3 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold text-ink">🚓 Határ-jelentés</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Melyik határátkelő?
          </label>
          <select
            value={crossingId}
            onChange={(e) => setCrossingId(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] font-medium text-ink"
          >
            <option value="">— Válassz —</option>
            {BORDER_CROSSINGS.map((c) => (
              <option key={c.id} value={c.id}>
                {COUNTRY_FLAGS[c.country]} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Milyen a helyzet?
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(STATUS_META) as BorderStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[10px] border px-2.5 py-2 text-[11.5px] font-bold transition",
                  status === s
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-line bg-surface text-ink-muted",
                )}
              >
                <span>{STATUS_META[s].emoji}</span>
                <span className="truncate">{STATUS_META[s].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Megjegyzés (opcionális)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Pl. 'Minden autót megállítanak', 'Csak random ellenőrzés'…"
            maxLength={200}
            className="h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink"
          />
        </div>

        {turnstileSiteKey && (
          <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
        )}

        {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-pill border border-line bg-surface-alt py-2.5 text-[12.5px] font-bold text-ink-muted"
          >
            Mégsem
          </button>
          <button
            type="submit"
            disabled={busy || !turnstileToken}
            className="flex-1 rounded-pill bg-primary py-2.5 text-[12.5px] font-bold text-white shadow-card disabled:opacity-60"
          >
            {busy ? "Küldés…" : "Jelentés küldése"}
          </button>
        </div>

        <p className="text-[10.5px] leading-snug text-ink-faint">
          A jelentés 4 órán át látható. Anonim — sem fiók, sem email nem kell.
        </p>
      </form>
    </div>
  );
}

function fmtAgo(iso: string): string {
  const t = Date.parse(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az imént";
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return new Date(t).toLocaleDateString("hu-HU");
}
