import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner, getJobs, getApplicationCounts, getBusinessByOwner } from "@/lib/repo";
import Link from "next/link";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";
import { JobCardActions } from "@/components/views/job-card-actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Munkáltatói Irányítópult" };

export default async function EmployerDashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    // Ha nincs bejelentkezve, Clerk login oldalra irányítjuk (vagy sign-in urlre)
    // De ideális esetben ez már middleware-rel is védve lenne, de biztos ami biztos:
    redirect("/belepes?redirect_url=/munkaltato");
  }

  const employer = await getEmployerByOwner(userId);

  if (!employer) {
    // Ha be van jelentkezve, de nincs munkáltatói profilja, regisztrációs oldalra küldjük
    redirect("/munkaltato/regisztracio");
  }

  const jobs = await getJobs({ employerId: employer.id, includeAllStatuses: true });
  const applicationCounts = await getApplicationCounts(employer.id);
  // Egy cég, két kapcsoló: van-e már Szaknévsor-listázása is? Ha nincs, felkínáljuk
  // (ügyfélszerzés) — a "van két profilom, minek?" keveredés feloldása.
  const business = await getBusinessByOwner(userId);

  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">Munkáltató</span>
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <main className="flex-1 space-y-6">
        <div className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
                {employer.companyName}
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">
                {employer.contactEmail} · Csomag: <span className="font-bold text-ink">{employer.subscriptionTier.toUpperCase()}</span>
              </p>
            </div>
            <Link
              href="/munkaltato/profil"
              className="grid h-10 w-10 place-items-center rounded-xl bg-surface-alt text-ink hover:bg-line transition-colors"
            >
              <Icon name="more" size={18} />
            </Link>
          </div>
          
          <div className="mt-5 pt-5 border-t border-line/60">
            {employer.moderationStatus === 0 && (
              <div className="rounded-[12px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent mb-4">
                A munkáltatói fiókod ellenőrzés alatt áll. Ez általában pár percen belül megtörténik — addig is feladhatsz hirdetést, az a jóváhagyás után jelenik meg.
              </div>
            )}
            {employer.moderationStatus === 2 && (
              <div className="rounded-[12px] bg-accent/20 px-3 py-2.5 text-[12.5px] font-semibold text-accent mb-4">
                A fiókodat az adminisztrátor elutasította. Kérlek vedd fel velünk a kapcsolatot.
              </div>
            )}

            {employer.moderationStatus === 1 && jobs.length === 0 ? (
              // A "beragadt munkáltató" pillanat: a fiók aktív, de nincs hirdetés.
              // Egyértelműsítjük, hogy a profil önmagában NEM hirdetés.
              <div className="rounded-[12px] bg-primary/5 border border-primary/15 px-3.5 py-3 text-[13px] leading-relaxed text-ink mb-4">
                <span className="font-extrabold text-primary">A fiókod aktív. ✅</span>{" "}
                De a profilod önmagában <span className="font-bold">még nem jelenik meg</span> a
                jelölteknek — ahhoz fel kell adnod egy álláshirdetést. Ez 1 perc, alább kezdheted.
              </div>
            ) : (
              <p className="text-[14px] text-ink-muted">
                Itt jelennek meg a feladott álláshirdetéseid és a beérkező jelentkezések.
              </p>
            )}

            <div className="mt-4 space-y-2">
              <Link href="/munkaltato/uj-hirdetes" className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[14px] font-bold text-white shadow-card-hover transition-all active:scale-[0.98]">
                <Icon name="plus" size={16} strokeWidth={2.4} /> Új álláshirdetés feladása
              </Link>
              <div className="flex gap-2">
                <Link href="/munkaltato/jeloltek" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-pill border border-line bg-surface-alt text-[13px] font-bold text-ink transition-all active:scale-[0.98]">
                  <Icon name="users" size={15} strokeWidth={2.4} /> Jelöltek
                </Link>
                <Link href="/munkaltato/tomeges-feladas" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-pill border border-line bg-surface-alt text-[13px] font-bold text-ink transition-all active:scale-[0.98]">
                  <Icon name="list" size={15} strokeWidth={2.4} /> Tömeges feladás
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Egy cég, két kapcsoló: ha nincs Szaknévsor-listázás, felkínáljuk (ügyfélszerzés).
            A munkáltatói profil az álláshirdetéshez van — ez a másik "kapcsoló". */}
        {!business && (
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card active:scale-[0.99] transition"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-primary/10 text-primary">
              <Icon name="search" size={16} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold text-ink">Megjelennél a Szaknévsorban is?</span>
              <span className="block text-[12px] leading-snug text-ink-muted">
                Hogy ügyfelek is megtaláljanak (nem csak munkaerő). Ugyanez a cég — pár adat, 1 perc.
              </span>
            </div>
            <Icon name="chevR" size={16} className="text-ink-faint shrink-0" />
          </Link>
        )}

        {/* Existing Jobs Section */}
        <div className="space-y-3">
          <h2 className="text-[16px] font-extrabold tracking-tight text-ink px-1">
            Álláshirdetéseim
          </h2>
          
          {(() => {
            if (jobs.length === 0) {
              return (
                <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-8 text-center text-[13px] text-ink-muted">
                  Még nem adtál fel álláshirdetést.
                </div>
              );
            }
            return jobs.map((job) => (
              <div key={job.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[15px] font-extrabold text-ink">{job.title}</h3>
                    <p className="text-[12.5px] text-ink-muted mt-0.5">{job.location} · {job.employmentType}</p>
                  </div>
                  {job.moderationStatus === 1 ? (
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-success">
                      Aktív
                    </span>
                  ) : job.moderationStatus === 2 ? (
                     <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent">
                      Elutasítva
                    </span>
                  ) : (
                    <span className="rounded-full bg-line-strong/30 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                      Függőben
                    </span>
                  )}
                </div>
                <JobCardActions jobId={job.id} applicantCount={applicationCounts[job.id] ?? 0} featured={job.status === "featured"} />
              </div>
            ));
          })()}
        </div>
      </main>
    </div>
  );
}
