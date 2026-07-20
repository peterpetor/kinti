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
    <div className="space-y-5 px-5 pb-4 min-h-[calc(100dvh-70px)] flex flex-col">
      <AllasokHeader />

      <main className="flex-1 pb-20 space-y-6">
        <section className="animate-fade-up space-y-3">
          <p className="text-[14px] leading-relaxed text-ink-muted">
            Magyar-barát munkalehetőségek külföldön. Böngéssz az ellenőrzött állások között, vagy
            készülj fel az interjúra!
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/allasok/profil"
              className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-primary/10 px-3 py-2.5 text-center text-[12.5px] font-bold leading-tight text-primary transition-all active:scale-[0.98]"
            >
              <Icon name="upload" size={15} strokeWidth={2.4} className="shrink-0" /> Töltsd fel a CV-det
            </Link>
            <Link
              href="/munkaltato/uj-hirdetes"
              className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-2.5 text-center text-[12.5px] font-bold leading-tight text-ink transition-all active:scale-[0.98]"
            >
              <Icon name="plus" size={15} strokeWidth={2.4} className="shrink-0" /> Álláshirdetés feladása
            </Link>
          </div>
        </section>

        {/* PRO álláskeresési eszközök — a két kész AI-eszköz eddig csak a
            menüből volt elérhető; ez a fő PRO-konverziós horgony (user-kérés). */}
        <section className="rounded-card border border-primary/25 bg-gradient-to-br from-primary/5 to-surface p-4 shadow-card">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Icon name="sparkles" size={13} strokeWidth={2.4} /> PRO álláskeresési eszközök
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/allasok/interju-szimulator"
              className="group flex flex-col rounded-xl border border-line bg-surface p-3 transition active:scale-[0.98] hover:border-primary/40 hover:shadow-card"
            >
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary/10 text-[17px] leading-none">🎤</span>
              <span className="mt-2 block text-[13px] font-extrabold leading-tight tracking-[-0.01em] text-ink">AI interjú-szimulátor</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">
                Próbainterjú a helyi kérdésekkel — visszajelzéssel
              </span>
              <span className="mt-auto inline-flex items-center gap-0.5 pt-2 text-[10.5px] font-bold text-primary">
                Kipróbálom <Icon name="chevR" size={11} strokeWidth={2.8} className="transition-transform group-active:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/allasok/cv-audit"
              className="group flex flex-col rounded-xl border border-line bg-surface p-3 transition active:scale-[0.98] hover:border-primary/40 hover:shadow-card"
            >
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary/10 text-[17px] leading-none">🔍</span>
              <span className="mt-2 block text-[13px] font-extrabold leading-tight tracking-[-0.01em] text-ink">AI CV-asszisztens</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">
                Átnézi az önéletrajzod, mielőtt elküldöd
              </span>
              <span className="mt-auto inline-flex items-center gap-0.5 pt-2 text-[10.5px] font-bold text-primary">
                Kipróbálom <Icon name="chevR" size={11} strokeWidth={2.8} className="transition-transform group-active:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* Állás-riasztás modul */}
        <div className="animate-fade-up animate-delay-100">
          <JobAlertRadar />
        </div>

        {/* B2B jelölt-tölcsér: ingyenes aktív közvetítés (layer3 opt-in a profilban) */}
        <Link
          href="/allasok/profil"
          className="flex items-center gap-3 rounded-card border-2 border-primary/25 bg-gradient-to-br from-primary/5 to-surface px-4 py-3.5 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-xl">🤝</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">Ingyenes állásközvetítés</span>
            <span className="block text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-ink">
              Mi keressük az állást — neked
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Töltsd ki a profilod, pipáld be a közvetítést — a többi a mi dolgunk. AT/DE/NL, a díjat a munkáltató fizeti.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-primary" />
        </Link>

        {/* Kereső + EGYESÍTETT lista: kiemelt Kinti-hirdetések elöl, majd a többi Kinti
            állás, végül az API-ból aggregált élő (kifelé linkelő) hirdetések — egy helyen. */}
        <JobsBrowser jobs={jobs} proMatch={proMatch} />

        {/* Hol keress még? — ország-tudatos hivatalos álláskereső-források (jogtiszta, link-out) */}
        <JobSourcesSection />

        {/* Állás→lakhatás híd: az új munka gyakran költözéssel jár — a börze
            a természetes következő lépés (és a börze kínálat-építése is). */}
        <Link
          href="/piacter"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-star/15 text-xl">🔑</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-ink">
              Új munka, új város? Nézd az albérlet-börzét
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Kiadó szobák és albérletek magyaroktól magyaroknak — vagy add fel, mit keresel.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
        </Link>

        <p className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[11px] leading-relaxed text-ink-muted">
          <strong className="text-ink">Jogi tájékoztató:</strong> a Kinti „Állások" modul egy{" "}
          <strong>állás-lista / közvetítő platform</strong> — <strong>nem vagyunk a munkáltató</strong>,
          és nem hozunk létre munkaviszonyt vagy más foglalkoztatási jogviszonyt a felek között.
          A jelentkezésed közvetlenül a hirdetőhöz jut; a külső forrásból aggregált hirdetések
          harmadik felek oldalaira mutatnak, amelyek tartalmáért nem felelünk. Kizárólag{" "}
          <strong>bejelentett, legális foglalkoztatás</strong> hirdethető. Részletek:{" "}
          <Link href="/aszf" className="underline font-semibold">ÁSZF 10.</Link>
        </p>
      </main>
    </div>
      </PullToRefresh>
    </div>
  );
}
