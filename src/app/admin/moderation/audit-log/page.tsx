import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { getRecentAuditLog, getAuditStats } from "@/lib/audit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Audit Log — Kinti Admin",
  robots: { index: false, follow: false },
};

const ACTION_LABEL: Record<string, { label: string; cls: string }> = {
  approve: { label: "Jóváhagyás", cls: "bg-success/15 text-success" },
  reject: { label: "Elutasítás", cls: "bg-accent/15 text-accent" },
  block: { label: "Tiltás", cls: "bg-accent/20 text-accent" },
  verify: { label: "Ellenőrzés", cls: "bg-primary/15 text-primary" },
  delete: { label: "Törlés", cls: "bg-ink-muted/15 text-ink-muted" },
};

const TARGET_LABEL: Record<string, string> = {
  reviews: "vélemény",
  businesses: "vállalkozás",
  events: "esemény",
  jobs: "álláshirdetés",
  employers: "munkáltató",
  ip: "IP-cím",
};

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
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            24h döntés
          </div>
          <div className="text-2xl font-black text-ink">{stats.actions24h}</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Elutasítás
          </div>
          <div className="text-2xl font-black text-accent">{stats.rejections24h}</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Tiltás
          </div>
          <div className="text-2xl font-black text-primary">{stats.blocks24h}</div>
        </div>
      </div>

      {/* Legutóbbi döntések */}
      <section className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Legutóbbi döntések
        </div>

        {entries.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-alt p-8 text-center text-[13px] text-ink-muted">
            Még nincs naplózott admin-döntés. Az első jóváhagyás/elutasítás után itt jelennek meg.
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            {entries.map((e, i) => {
              const action = ACTION_LABEL[e.actionType] ?? { label: e.actionType, cls: "bg-ink-muted/15 text-ink-muted" };
              const target = TARGET_LABEL[e.targetType] ?? e.targetType;
              return (
                <div
                  key={e.id}
                  className={`flex items-start justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-line/60" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${action.cls}`}>
                        {action.label}
                      </span>
                      <span className="text-[13px] font-bold text-ink">{target}</span>
                    </div>
                    {e.targetId && (
                      <p className="mt-1 truncate font-mono text-[11px] text-ink-faint">{e.targetId}</p>
                    )}
                    {e.reason && <p className="mt-0.5 text-[12px] text-ink-muted">{e.reason}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-ink-faint">
                    {new Date(e.createdAt + "Z").toLocaleString("hu-HU")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
