import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Audit Log — Kinti Admin",
  robots: { index: false, follow: false },
};

export default async function AuditLogPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

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
          Minden admin döntés naplózva: content approval/rejection, IP blocking, strikes.
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            24h Actions
          </div>
          <div className="text-2xl font-black text-ink">—</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Rejections
          </div>
          <div className="text-2xl font-black text-accent">—</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Blocks
          </div>
          <div className="text-2xl font-black text-primary">—</div>
        </div>
      </div>

      {/* Table Placeholder */}
      <section className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Recent Actions
        </div>
        <div className="rounded-card border border-dashed border-line bg-surface-alt p-8 text-center">
          <p className="text-[13px] text-ink-muted">
            📊 Audit log UI betöltődik az{" "}
            <code className="font-mono text-[11px]">admin_audit_log</code> táblából.
          </p>
          <p className="mt-2 text-[11px] text-ink-faint">
            Adatbázis lekérdezés: SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 50
          </p>
        </div>
      </section>

      {/* Implementation Notes */}
      <section className="rounded-card border border-accent/20 bg-accent-soft/20 p-4">
        <h3 className="mb-2 font-bold text-ink">Setup Checklist</h3>
        <ul className="space-y-1 text-[12px] text-ink-muted">
          <li>✅ Migration: <code className="font-mono">0052_admin_audit_log.sql</code></li>
          <li>□ API endpoint: POST /api/admin/audit-log (log actions)</li>
          <li>□ Hook: Call audit-log endpoint on every moderation decision</li>
          <li>□ UI: Render admin_audit_log table with filters</li>
        </ul>
      </section>
    </div>
  );
}
