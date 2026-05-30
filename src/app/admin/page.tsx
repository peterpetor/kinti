import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { getAdminUserId } from "@/lib/admin";
import { AdminVerifyToggle } from "@/components/views/admin-verify-toggle";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminCopyManageButton } from "@/components/admin/admin-copy-manage-button";
import {
  getAdminStats,
  listOpenReports,
  listPendingEvents,
  listBusinessesForAdmin,
  listBulletinsForAdmin,
  listPendingBulletins,
  listEventsForAdmin,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Admin — kinti", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const [stats, openReports, pendingEvents, pendingBulletins, businesses, bulletins, events] =
    await Promise.all([
      getAdminStats(),
      listOpenReports(),
      listPendingEvents(),
      listPendingBulletins(),
      listBusinessesForAdmin(),
      listBulletinsForAdmin(),
      listEventsForAdmin(),
    ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Kinti Admin</p>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Moderációs dashboard</h1>
        <p className="text-[12.5px] text-ink-muted">
          Csak admin email-címek érik el (<code className="text-[11px]">ADMIN_EMAILS</code> env).
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Vállalkozás" value={stats.businesses} sub={`${stats.businessesVerified} verified`} />
        <Stat label="Hirdetés" value={stats.bulletinsActive} sub="aktív" />
        <Stat label="Esemény" value={stats.eventsApproved} sub="jóváhagyva" />
        <Stat label="Vélemény" value={stats.reviews} />
        <Stat label="Push" value={stats.pushSubscriptions} sub="feliratkozó" />
        <Stat label="Nyitott jelentés" value={openReports.length} accent={openReports.length > 0} />
      </section>

      {/* Open reports */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Folyamatban lévő jelentések ({openReports.length})
        </h2>
        {openReports.length === 0 ? (
          <Empty label="Nincs nyitott jelentés. 🎉" />
        ) : (
          <div className="space-y-2">
            {openReports.map((r) => (
              <div key={r.id} className="rounded-card border border-line bg-surface p-3 shadow-card">
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                  <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-accent">{r.contentType}</span>
                  <span className="text-ink-faint">{fmtAgo(r.createdAt)}</span>
                </div>
                {r.excerpt && (
                  <p className="mt-1.5 text-[13px] font-semibold text-ink truncate">{r.excerpt}</p>
                )}
                {r.reason && (
                  <p className="mt-1 text-[12px] italic text-ink-muted">„{r.reason}"</p>
                )}
                <div className="mt-2 flex gap-2">
                  <a
                    href={`/api/report/moderate/${r.moderateToken}?action=keep`}
                    className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-3 py-1 text-[11.5px] font-bold text-ink"
                  >
                    ↩︎ Visszaállítás
                  </a>
                  <a
                    href={`/api/report/moderate/${r.moderateToken}?action=remove`}
                    className="inline-flex items-center gap-1 rounded-pill bg-accent px-3 py-1 text-[11.5px] font-bold text-white"
                  >
                    🗑 Törlés
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending events */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Jóváhagyásra váró események ({pendingEvents.length})
        </h2>
        {pendingEvents.length === 0 ? (
          <Empty label="Nincs várakozó esemény." />
        ) : (
          <div className="space-y-2">
            {pendingEvents.map((e) => (
              <div key={e.id} className="rounded-card border border-line bg-surface p-3 shadow-card">
                <p className="text-[13.5px] font-bold text-ink">{e.title}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  📅 {e.eventDate ?? "?"}
                  {e.startTime ? ` ${e.startTime}` : ""}
                  {e.venue ? ` · 📍 ${e.venue}` : ""}
                  {e.submitterEmail ? ` · ${e.submitterEmail}` : ""}
                </p>
                {e.token && (
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`/api/events/moderate/${e.token}?action=approve`}
                      className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1 text-[11.5px] font-bold text-white"
                    >
                      ✅ Jóváhagyás
                    </a>
                    <a
                      href={`/api/events/moderate/${e.token}?action=reject`}
                      className="inline-flex items-center gap-1 rounded-pill bg-accent px-3 py-1 text-[11.5px] font-bold text-white"
                    >
                      ❌ Elutasítás
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending bulletins */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Jóváhagyásra váró hirdetések ({pendingBulletins.length})
        </h2>
        {pendingBulletins.length === 0 ? (
          <Empty label="Nincs várakozó hirdetés." />
        ) : (
          <div className="space-y-2">
            {pendingBulletins.map((b) => (
              <div key={b.id} className="rounded-card border border-line bg-surface p-3 shadow-card">
                <p className="text-[13.5px] font-bold text-ink">{b.title}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {b.kind?.label}
                  {b.email ? ` · ${b.email}` : ""}
                  {b.cantonCode ? ` · ${b.cantonCode}` : ""}
                  {b.price ? ` · CHF ${b.price}` : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={`/api/admin/bulletins/${b.id}/approve`}
                    className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1 text-[11.5px] font-bold text-white"
                  >
                    ✅ Jóváhagyás
                  </a>
                  <a
                    href={`/api/admin/bulletins/${b.id}/reject`}
                    className="inline-flex items-center gap-1 rounded-pill bg-accent px-3 py-1 text-[11.5px] font-bold text-white"
                  >
                    ❌ Elutasítás (Törlés)
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Businesses + verify toggle + delete */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Vállalkozások — Verified + törlés ({businesses.length})
        </h2>
        {businesses.length === 0 ? (
          <Empty label="Nincs vállalkozás a Szaknévsorban." />
        ) : (
          <div className="space-y-1.5">
            {businesses.map((b) => (
              <div key={b.id} className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 shadow-card">
                <div className="min-w-0 flex-1">
                  <Link href={`/szaknevsor/${b.id}`} className="block truncate text-[13px] font-bold text-ink hover:text-primary">
                    {b.name}
                  </Link>
                  <p className="truncate text-[11px] text-ink-muted">
                    {b.categoryLabel ?? "—"}
                    {b.source ? ` · ${b.source}` : ""}
                    {b.rating > 0 ? ` · ⭐ ${b.rating} (${b.reviews})` : ""}
                  </p>
                </div>
                <AdminVerifyToggle businessId={b.id} initial={b.verified} />
                <AdminCopyManageButton type="businesses" manageToken={b.manageToken} />
                <AdminDeleteButton
                  type="businesses"
                  id={b.id}
                  small
                  confirmText={`Biztos törlöd a(z) "${b.name}" vállalkozást? A vélemények is törlődnek.`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hirdetések — bárki törölheti adminként */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Hirdetések — törlés ({bulletins.length})
        </h2>
        {bulletins.length === 0 ? (
          <Empty label="Nincs hirdetés." />
        ) : (
          <ContentList items={bulletins} type="bulletins" />
        )}
      </section>

      {/* Események — törlés (a status független) */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Események — törlés ({events.length})
        </h2>
        {events.length === 0 ? (
          <Empty label="Nincs esemény." />
        ) : (
          <ContentList items={events} type="events" />
        )}
      </section>


      {/* Egyéb admin linkek */}
      <section className="space-y-2 border-t border-line pt-4">
        <h2 className="text-[14px] font-extrabold text-ink">Egyéb admin</h2>
        <Link href="/admin/feeds" className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink">
          <Icon name="calendar" size={13} strokeWidth={2.4} /> Esemény-feedek kezelése (iCal/RSS)
        </Link>
      </section>
    </div>
  );
}

function ContentList({
  items,
  type,
}: {
  items: { id: string; title: string; meta: string | null; createdAt: string | null; manageToken: string | null }[];
  type: "bulletins" | "events";
}) {
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 shadow-card">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{it.title}</p>
            <p className="truncate text-[11px] text-ink-muted">
              {it.meta ?? ""}
              {it.createdAt ? ` · ${fmtAgo(it.createdAt)}` : ""}
            </p>
          </div>
          <AdminCopyManageButton type={type} manageToken={it.manageToken} />
          <AdminDeleteButton
            type={type}
            id={it.id}
            small
            confirmText={`Biztos törlöd: "${it.title}"?`}
          />
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-card border bg-surface p-3 shadow-card ${accent ? "border-accent/40" : "border-line"}`}>
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className={`mt-0.5 text-[22px] font-extrabold tracking-tight ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      {sub && <p className="text-[10px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-6 text-center text-[12.5px] text-ink-muted">
      {label}
    </div>
  );
}

function fmtAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")).getTime();
  if (Number.isNaN(diffMs)) return iso;
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${min}p`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}n`;
}
