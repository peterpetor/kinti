import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getEmployerByOwner, getJobById, getJobApplications } from "@/lib/repo";
import { Icon } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Jelentkezők — Munkáltató" };

export default async function JobApplicantsPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/belepes?redirect_url=/munkaltato/allas/${params.id}/jelentkezok`);
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    redirect("/munkaltato/regisztracio");
  }

  const job = await getJobById(params.id);
  // Csak a SAJÁT hirdetés jelentkezői láthatók.
  if (!job || job.employerId !== employer.id) {
    notFound();
  }

  const applications = await getJobApplications(employer.id, job.id);

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
          <h1 className="truncate text-[18px] font-extrabold tracking-tight text-ink">{job.title}</h1>
          <p className="text-[12.5px] text-ink-muted">
            {applications.length} jelentkező
          </p>
        </div>
      </header>

      {applications.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[13px] text-ink-muted">
          Még nincs jelentkező erre az állásra. A beérkező jelentkezésekről emailt is kapsz.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <article key={app.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[15px] font-extrabold text-ink">{app.fullName}</h2>
                <span className="shrink-0 text-[11px] font-semibold text-ink-faint">
                  {new Date(app.submittedAt).toLocaleDateString("hu-HU")}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <a href={`mailto:${app.email}`} className="flex items-center gap-2 text-[13px] font-semibold text-primary hover:underline">
                  <Icon name="send" size={14} strokeWidth={2.2} /> {app.email}
                </a>
                {app.phone && (
                  <a href={`tel:${app.phone}`} className="flex items-center gap-2 text-[13px] font-semibold text-primary hover:underline">
                    <Icon name="phone" size={14} strokeWidth={2.2} /> {app.phone}
                  </a>
                )}
              </div>

              {app.message && (
                <p className="mt-3 rounded-[10px] bg-surface-alt px-3 py-2 text-[13px] leading-relaxed text-ink-muted whitespace-pre-wrap">
                  {app.message}
                </p>
              )}

              {app.cvKey && (
                <a
                  href={`/api/employer/application-cv/${app.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-primary/30 bg-primary-soft px-3 py-1.5 text-[12.5px] font-bold text-primary active:scale-95"
                >
                  <Icon name="document" size={14} strokeWidth={2.2} /> Önéletrajz (CV) letöltése
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
