import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { listBlocklist } from "@/lib/repo";
import { BlocklistForm } from "@/components/admin/blocklist-form";
import { BlocklistRemoveButton } from "@/components/admin/blocklist-remove-button";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tiltólista — Kinti Admin",
  robots: { index: false, follow: false },
};

export default async function BlocklistPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const entries = await listBlocklist();
  const active = entries.filter((e) => e.active);
  const inactive = entries.filter((e) => !e.active);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link
          href="/admin"
          className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
        >
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          Tiltólista (ban-rendszer)
        </h1>
        <p className="text-[12.5px] text-ink-muted">
          IP-cím (SHA-256 hash, IPv6 /64 prefix) vagy email-cím (SHA-256 hash)
          alapú ban. A tiltott felhasználó 403-as választ kap minden submit-
          végponton (hirdetés, vélemény, vállalkozás, esemény, spontán találkozó,
          Hofladen, akció).
        </p>
      </header>

      <BlocklistForm />

      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Aktív tiltások ({active.length})
        </h2>
        {active.length === 0 ? (
          <Empty label="Nincs aktív tiltás. 🎉" />
        ) : (
          <div className="space-y-1.5">
            {active.map((e) => (
              <article
                key={e.id}
                className="rounded-card border border-accent/30 bg-accent/5 p-3 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                      <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-accent">
                        {e.kind === "ip_hash" ? "IP-hash" : "Email-hash"}
                      </span>
                      <span className="text-ink-faint">{fmtAgo(e.createdAt)}</span>
                    </p>
                    <p className="mt-1 truncate font-mono text-[11px] text-ink-muted">
                      {e.value.slice(0, 16)}…
                    </p>
                    {e.reason && (
                      <p className="mt-0.5 text-[12.5px] italic text-ink">
                        „{e.reason}"
                      </p>
                    )}
                  </div>
                  <BlocklistRemoveButton id={e.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {inactive.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[14px] font-extrabold text-ink-muted">
            Feloldott tiltások (audit-trail, {inactive.length})
          </h2>
          <div className="space-y-1">
            {inactive.slice(0, 20).map((e) => (
              <div
                key={e.id}
                className="rounded-[10px] border border-line bg-surface-alt/60 px-3 py-1.5 text-[11.5px] text-ink-muted"
              >
                <span className="font-mono">{e.value.slice(0, 12)}…</span>
                {e.reason && <> · „{e.reason}"</>}
                <span className="text-ink-faint"> · {fmtAgo(e.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-8 text-center text-[12.5px] text-ink-muted">
      {label}
    </div>
  );
}

function fmtAgo(iso: string): string {
  const t = new Date(
    iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"),
  ).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} perce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} órája`;
  return `${Math.floor(h / 24)} napja`;
}
