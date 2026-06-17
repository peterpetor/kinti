import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getApplicationsByEmail, type CandidateApplication } from "@/lib/repo";
import { Icon } from "@/components/ui";
import type { Metadata } from "next";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Jelentkezéseim — kinti.app" };

/** Pályázat-státusz → magyar címke + szín. */
const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Beküldve", cls: "bg-primary/10 text-primary" },
  reviewed: { label: "Megtekintve", cls: "bg-accent/10 text-accent" },
  rejected: { label: "Elutasítva", cls: "bg-ink/10 text-ink-muted" },
  hired: { label: "Felvéve 🎉", cls: "bg-success/15 text-success" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("hu-HU");
}

export default async function MyApplicationsPage() {
  const user = await currentUser();
  if (!user) redirect("/belepes?redirect_url=/allasok/jelentkezeseim");

  // A pályázatok email alapján kötődnek a jelölthöz (a beküldés account nélkül is
  // mehet). A user összes Clerk email-címére lekérünk, és id szerint dedupe-olunk.
  const emails = (user.emailAddresses ?? []).map((e) => e.emailAddress).filter(Boolean);
  const seen = new Set<string>();
  const apps: CandidateApplication[] = [];
  for (const email of emails) {
    for (const a of await getApplicationsByEmail(email)) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        apps.push(a);
      }
    }
  }
  apps.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <Link
          href="/allasok"
          aria-label="Vissza"
          className="ml-auto order-last grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Jelentkezéseim</h1>
          <p className="text-[12.5px] text-ink-muted">{apps.length} jelentkezés</p>
        </div>
      </header>

      {apps.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-12 text-center">
          <Icon name="send" size={26} className="mx-auto text-ink-faint" />
          <p className="mt-2 text-[14px] font-semibold text-ink">Még nincs jelentkezésed</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            A beküldött pályázataidat itt követheted nyomon.
          </p>
          <Link
            href="/allasok"
            className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95"
          >
            Állások böngészése
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const st = STATUS[a.status] ?? STATUS.new;
            return (
              <Link
                key={a.id}
                href={`/allasok/${a.jobId}`}
                className="block rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[15px] font-extrabold leading-tight text-ink">{a.jobTitle}</h2>
                  <span className={`shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  {a.companyName || "Ismeretlen cég"}
                  {a.location ? ` · ${a.location}` : ""}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-ink-faint">
                  Beküldve: {fmtDate(a.submittedAt)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
