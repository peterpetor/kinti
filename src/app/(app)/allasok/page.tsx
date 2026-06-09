import Link from "next/link";
import { getJobs } from "@/lib/repo";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";
import { JobAlertRadar } from "@/components/views/job-alert-radar";
import { JobsBrowser } from "@/components/views/jobs-browser";

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
          <div className="mb-6">
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
              Kinti Állások 🇨🇭
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Magyar-barát svájci munkalehetőségek. Böngéssz az ellenőrzött állások között, vagy
              készülj fel az interjúra!
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <Link 
              href="/allasok/profil" 
              className="inline-flex items-center gap-2 rounded-pill bg-primary/10 px-4 py-2 text-[13.5px] font-bold text-primary transition-all active:scale-[0.98]"
            >
              <Icon name="upload" size={16} strokeWidth={2.4} /> CV feltöltése munkáltatóknak
            </Link>
          </div>
        </section>

        {/* Állás-riasztás modul */}
        <div className="animate-fade-up animate-delay-100">
          <JobAlertRadar />
        </div>

        {/* Kereső (szöveg + kanton + szakma) + találatok */}
        <JobsBrowser jobs={jobs} />
      </main>
    </div>
  );
}
