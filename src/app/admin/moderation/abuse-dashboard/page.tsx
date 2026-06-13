import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Abuse Dashboard — Kinti Admin",
  robots: { index: false, follow: false },
};

export default async function AbuseDashboardPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link
          href="/admin/moderation"
          className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
        >
          ← Vissza a Moderációra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          Abuse Dashboard
        </h1>
        <p className="text-[12.5px] text-ink-muted">
          Rate limits, abusive IPs, content moderation trends.
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Blocklisted IPs", value: "—", color: "primary" },
          { label: "Strikes (24h)", value: "—", color: "accent" },
          { label: "Rate Limit Hits", value: "—", color: "success" },
          { label: "Pending Content", value: "—", color: "ink-muted" },
        ].map((stat, i) => (
          <div key={i} className="rounded-card border border-line bg-surface p-3 shadow-card">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {stat.label}
            </div>
            <div className={`text-2xl font-black text-${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Abusive IPs */}
        <section className="rounded-card border border-line bg-surface p-4 shadow-card">
          <h3 className="mb-3 font-bold text-ink">🔴 Top 10 Abusive IPs</h3>
          <div className="rounded-lg border border-dashed border-line bg-surface-alt p-6 text-center">
            <p className="text-[12px] text-ink-muted">
              Lekérdezés: <code className="font-mono text-[11px]">blocklist_summary</code>
            </p>
            <p className="mt-2 text-[11px] text-ink-faint">
              Rendezve: strike_count + report_count alapján
            </p>
          </div>
        </section>

        {/* Rate Limit Activity */}
        <section className="rounded-card border border-line bg-surface p-4 shadow-card">
          <h3 className="mb-3 font-bold text-ink">📊 Rate Limit Activity (24h)</h3>
          <div className="rounded-lg border border-dashed border-line bg-surface-alt p-6 text-center">
            <p className="text-[12px] text-ink-muted">
              Lekérdezés: <code className="font-mono text-[11px]">rate_limit_events</code>
            </p>
            <p className="mt-2 text-[11px] text-ink-faint">
              Csoportosítva: endpoint és IP alapján
            </p>
          </div>
        </section>
      </div>

      {/* Content Moderation Trends */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h3 className="mb-3 font-bold text-ink">📈 Content Moderation Trends</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Reviews", pending: "—", rejected: "—" },
            { label: "Businesses", pending: "—", rejected: "—" },
            { label: "Events", pending: "—", rejected: "—" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-line bg-surface-alt p-3">
              <div className="font-semibold text-ink">{item.label}</div>
              <div className="mt-2 space-y-1 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Pending:</span>
                  <span className="font-bold text-primary">{item.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Rejected:</span>
                  <span className="font-bold text-accent">{item.rejected}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Implementation Roadmap */}
      <section className="rounded-card border border-accent/20 bg-accent-soft/20 p-4">
        <h3 className="mb-3 font-bold text-ink">Implementation Roadmap</h3>
        <div className="space-y-3 text-[12px]">
          <div>
            <div className="font-semibold text-ink">✅ Database Migrations</div>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-ink-muted">
              <li><code className="font-mono">0052_admin_audit_log.sql</code> - Audit trail table</li>
              <li><code className="font-mono">0053_abuse_metrics.sql</code> - Rate limits & IP summary</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-ink">□ Backend APIs</div>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-ink-muted">
              <li>POST /api/admin/audit-log - Log moderation actions</li>
              <li>GET /api/admin/audit-log?filter=... - Query actions</li>
              <li>GET /api/admin/abuse/stats - Dashboard metrics</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-ink">□ Integration Points</div>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-ink-muted">
              <li>Hook into ModerationDecideButtons on approve/reject</li>
              <li>Hook into blocklist API on IP block</li>
              <li>Hook into strikes system on strike added</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
