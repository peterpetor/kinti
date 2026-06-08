import Link from "next/link";
import { getJobs } from "@/lib/repo";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Állások — Svájci magyaroknak" };

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">Állások</span>
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <main className="flex-1 pb-20 space-y-6">
        <section className="text-center animate-fade-up">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center mb-3">
            <Icon name="search" size={32} strokeWidth={2} />
          </div>
          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-ink">
            Svájci magyar állások
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-muted text-pretty">
            Keresgélj a svájci magyar munkáltatók hirdetései között. Csak megbízható, ellenőrzött cégek.
          </p>
        </section>

        {/* Filter / Search placeholder */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
             <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
             <input 
               type="text" 
               placeholder="Keresés..." 
               className="h-12 w-full rounded-pill border border-line bg-surface-alt pl-9 pr-4 text-[14px] focus:border-primary/50 focus:outline-none"
             />
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-surface-alt border border-line text-ink">
            <Icon name="filter" size={18} />
          </button>
        </div>

        <section className="space-y-4">
          {jobs.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[13px] text-ink-muted">
              Jelenleg nincs aktív álláshirdetés. Nézz vissza később!
            </div>
          ) : (
            jobs.map((job) => (
              <Link 
                href={`/allasok/${job.id}`} 
                key={job.id}
                className="block rounded-card border border-line bg-surface p-4 shadow-card hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">{job.title}</h3>
                    <p className="text-[13px] text-ink-muted mt-0.5 font-medium">{job.location}</p>
                  </div>
                  <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                    {job.employmentType === 'full-time' ? '100%' : job.employmentType === 'part-time' ? 'Részmunkaidő' : job.employmentType}
                  </span>
                </div>
                
                {job.salaryMin && job.salaryMax && (
                  <div className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-success bg-success/10 w-max px-2.5 py-1 rounded-[8px]">
                    <Icon name="star" size={14} />
                    {job.salaryMin} - {job.salaryMax} {job.currency}
                  </div>
                )}
                
                <p className="mt-3 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                  {job.description}
                </p>
                
                <div className="mt-4 border-t border-line/60 pt-3 flex items-center justify-between text-[11px] font-bold text-ink-faint uppercase tracking-wide">
                  <span>Dátum: {new Date(job.createdAt).toLocaleDateString('hu-HU')}</span>
                  <span className="text-primary flex items-center gap-1">
                    Részletek <Icon name="chevR" size={12} strokeWidth={3} />
                  </span>
                </div>
              </Link>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
