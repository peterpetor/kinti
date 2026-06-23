import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getJobs, getWorkerProfileByUser } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";
import { Icon } from "@/components/ui";
import { AllasokHeader } from "./AllasokHeader";
import { JobAlertRadar } from "@/components/views/job-alert-radar";
import { JobsBrowser } from "@/components/views/jobs-browser";
import { JobSourcesSection } from "@/components/views/job-sources-section";
import { PullToRefresh } from "@/components/pull-to-refresh";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Állások — Kint élő magyaroknak" };

export default async function JobsPage() {
  const [jobs, { userId }] = await Promise.all([getJobs(), auth()]);

  // PRO match-score kontextus: csak előfizetőnek + kitöltött profilnál aktív.
  const pro = userId ? await isPro(userId) : false;
  const profile = userId ? await getWorkerProfileByUser(userId) : null;
  const proMatch = {
    isPro: pro,
    profile: profile
      ? { category: profile.category, cantonCode: profile.cantonCode, expectedSalaryMin: profile.expectedSalaryMin }
      : null,
  };

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+2rem)]">
      <PullToRefresh>
    <div className="space-y-5 px-5 pb-4 min-h-[calc(100dvh-70px)] flex flex-col pt-2">
      <AllasokHeader />

      <main className="flex-1 pb-20 space-y-6">
        <section className="animate-fade-up space-y-3">
          <p className="text-[14px] leading-relaxed text-ink-muted">
            Magyar-barát munkalehetőségek külföldön. Böngéssz az ellenőrzött állások között, vagy
            készülj fel az interjúra!
          </p>
          <Link
            href="/allasok/profil"
            className="inline-flex items-center gap-2 rounded-pill bg-primary/10 px-4 py-2 text-[13.5px] font-bold text-primary transition-all active:scale-[0.98]"
          >
            <Icon name="upload" size={16} strokeWidth={2.4} /> Töltsd fel a CV-det
          </Link>
        </section>

        {/* Állás-riasztás modul */}
        <div className="animate-fade-up animate-delay-100">
          <JobAlertRadar />
        </div>

        {/* Kereső (szöveg + kanton + szakma) + találatok */}
        <JobsBrowser jobs={jobs} proMatch={proMatch} />

        {/* Hol keress még? — ország-tudatos hivatalos álláskereső-források (jogtiszta, link-out) */}
        <JobSourcesSection />
      </main>
    </div>
      </PullToRefresh>
    </div>
  );
}
