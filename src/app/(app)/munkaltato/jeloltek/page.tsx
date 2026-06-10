import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getEmployerByOwner, getSearchableWorkers } from "@/lib/repo";
import { Icon } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Jelöltek — Munkáltató" };

export default async function CandidatesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/belepes?redirect_url=/munkaltato/jeloltek");
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    redirect("/munkaltato/regisztracio");
  }

  const approved = employer.moderationStatus === 1;
  const candidates = approved ? await getSearchableWorkers() : [];

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <Link
          href="/munkaltato"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[18px] font-extrabold tracking-tight text-ink">Jelöltek</h1>
          <p className="text-[12.5px] text-ink-muted">
            Kereshető munkavállalói profilok
          </p>
        </div>
      </header>

      {!approved ? (
        <div className="rounded-card border border-accent/20 bg-accent/10 px-4 py-4 text-[13px] font-semibold text-accent">
          A jelöltek böngészéséhez a munkáltatói fiókodnak jóváhagyottnak kell lennie. Amint a fiókod aktív, itt megjelennek a kereshető jelöltek.
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[13px] text-ink-muted">
          Jelenleg nincs kereshető jelölt. Nézz vissza később!
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <article key={c.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[15px] font-extrabold text-ink">{c.fullName}</h2>
                {c.expectedSalaryMin != null && (
                  <span className="shrink-0 rounded-[8px] bg-success/10 px-2.5 py-1 text-[12px] font-bold text-success">
                    ~{c.expectedSalaryMin} CHF+
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1.5">
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-[13px] font-semibold text-primary hover:underline">
                  <Icon name="send" size={14} strokeWidth={2.2} /> {c.email}
                </a>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-[13px] font-semibold text-primary hover:underline">
                    <Icon name="phone" size={14} strokeWidth={2.2} /> {c.phone}
                  </a>
                )}
              </div>

              {c.cvKey && (
                <a
                  href={`/api/employer/candidate-cv/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-3.5 py-2 text-[12.5px] font-bold text-primary transition active:scale-[0.98]"
                >
                  <Icon name="document" size={14} strokeWidth={2.2} /> CV letöltése (PDF)
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
