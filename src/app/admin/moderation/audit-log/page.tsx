import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/cn";
import { getAdminUserId } from "@/lib/admin";
import { getRecentAuditLog, getAuditStats, type AdminAuditEntry } from "@/lib/audit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Audit Log — Kinti Admin",
  robots: { index: false, follow: false },
};

interface ActionStyle { label: string; cls: string; dot: string; icon: string }

const ACTION_LABEL: Record<string, ActionStyle> = {
  approve: { label: "Jóváhagyás", cls: "bg-success/15 text-success", dot: "bg-success", icon: "✓" },
  reject: { label: "Elutasítás", cls: "bg-accent/15 text-accent", dot: "bg-accent", icon: "✕" },
  block: { label: "Tiltás", cls: "bg-accent/20 text-accent", dot: "bg-accent", icon: "⛔" },
  verify: { label: "Ellenőrzés", cls: "bg-primary/15 text-primary", dot: "bg-primary", icon: "✦" },
  delete: { label: "Törlés", cls: "bg-ink-muted/15 text-ink-muted", dot: "bg-ink-faint", icon: "🗑" },
};

const FALLBACK_ACTION = (a: string): ActionStyle => ({
  label: a, cls: "bg-ink-muted/15 text-ink-muted", dot: "bg-ink-faint", icon: "•",
});

const TARGET_LABEL: Record<string, string> = {
  reviews: "vélemény",
  businesses: "vállalkozás",
  events: "esemény",
  jobs: "álláshirdetés",
  employers: "munkáltató",
  ip: "IP-cím",
};

/** Az ISO (UTC, Z nélkül tárolt) érték → helyi Date. */
function toLocalDate(iso: string): Date {
  return new Date(iso.endsWith("Z") ? iso : iso + "Z");
}

/** Nap-fejléc: Ma / Tegnap / teljes dátum. */
function dayLabel(iso: string): string {
  const d = toLocalDate(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Ma";
  if (same(d, yest)) return "Tegnap";
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
}

function timeOnly(iso: string): string {
  return toLocalDate(iso).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
}

/** Egymást követő (DESC sorrendű) bejegyzések napi csoportokba. */
function groupByDay(entries: AdminAuditEntry[]): { label: string; items: AdminAuditEntry[] }[] {
  const groups: { label: string; items: AdminAuditEntry[] }[] = [];
  for (const e of entries) {
    const label = dayLabel(e.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }
  return groups;
}

export default async function AuditLogPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const [stats, entries] = await Promise.all([getAuditStats(), getRecentAuditLog(50)]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link
          href="/admin/moderation"
          className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
        >
          ← Vissza a Moderációra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          Admin Audit Log
        </h1>
        <p className="text-[12.5px] text-ink-muted">
          Minden admin döntés naplózva: jóváhagyás, elutasítás, IP-tiltás.
        </p>
      </header>

      {/* Quick Stats (utolsó 24 óra) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            24h döntés
          </div>
          <div className="text-2xl font-black text-ink">{stats.actions24h}</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Elutasítás
          </div>
          <div className="text-2xl font-black text-accent">{stats.rejections24h}</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Tiltás
          </div>
          <div className="text-2xl font-black text-primary">{stats.blocks24h}</div>
        </div>
      </div>

      {/* Idővonal */}
      <section className="space-y-4">
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Döntések idővonala
        </div>

        {entries.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-alt p-8 text-center text-[13px] text-ink-muted">
            Még nincs naplózott admin-döntés. Az első jóváhagyás/elutasítás után itt jelennek meg.
          </div>
        ) : (
          <div className="space-y-6">
            {groupByDay(entries).map((g) => (
              <div key={g.label}>
                <div className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-ink-faint">
                  {g.label}
                </div>
                <div className="ml-2 border-l-2 border-line">
                  {g.items.map((e) => {
                    const action = ACTION_LABEL[e.actionType] ?? FALLBACK_ACTION(e.actionType);
                    const target = TARGET_LABEL[e.targetType] ?? e.targetType;
                    return (
                      <div key={e.id} className="relative pb-4 pl-5 last:pb-0">
                        {/* sín-pötty */}
                        <span
                          className={cn(
                            "absolute -left-[9px] top-1.5 grid h-4 w-4 place-items-center rounded-full text-[9px] text-white ring-4 ring-surface",
                            action.dot,
                          )}
                          aria-hidden
                        >
                          {action.icon}
                        </span>
                        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide", action.cls)}>
                                {action.label}
                              </span>
                              <span className="text-[13px] font-bold text-ink">{target}</span>
                            </div>
                            <span className="shrink-0 text-[11px] font-semibold text-ink-faint">
                              {timeOnly(e.createdAt)}
                            </span>
                          </div>
                          {e.targetId && (
                            <p className="mt-1 truncate font-mono text-[11px] text-ink-faint">{e.targetId}</p>
                          )}
                          {e.reason && <p className="mt-0.5 text-[12px] text-ink-muted">{e.reason}</p>}
                          <p className="mt-1.5 text-[10.5px] text-ink-faint">
                            admin: <span className="font-mono">{e.adminUserId.length > 16 ? e.adminUserId.slice(0, 16) + "…" : e.adminUserId}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
