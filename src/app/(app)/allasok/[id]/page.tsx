import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getJobById, getEmployerById, getWorkerProfileByUser } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";
import { jobMatchScore, hasMatchableProfile } from "@/lib/job-match";
import { computeSalary } from "@/lib/salary-calc";
import { getSalaryStats } from "@/lib/benchmark";
import { matchCantonByName, cantonFromAddress, cantonName as cantonNameByCode } from "@/lib/cantons";
import { jobPostingJsonLd, safeJsonLdStringify } from "@/lib/json-ld";
import { Icon } from "@/components/ui";
import { Metadata } from "next";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJobById(params.id);
  if (!job || job.moderationStatus !== 1) return { title: "Nem található állás" };
  const employer = await getEmployerById(job.employerId);
  const company = employer?.companyName || "Svájci munka";
  const loc = job.location || (cantonFromAddress(job.location) || matchCantonByName(job.location))?.name || "";
  const title = `${job.title} — ${company}`;
  const description = `${job.title} · ${company}${loc ? ` · ${loc}` : ""} — magyar munkalehetőség Svájcban (Kinti).`;
  const image = "https://kinti.app/icons/og-default.png";
  const url = `https://kinti.app/allasok/${job.id}`;
  return {
    title: `${title} | Kinti`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "kinti",
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: job.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  
  // Ha nem létezik, vagy még nincs jóváhagyva (és nem a sajátját nézi, de ide most csak publikus nézetként tekintünk)
  if (!job || job.moderationStatus !== 1) {
    notFound();
  }

  const employer = await getEmployerById(job.employerId);

  // === PRO: match-score + nettó-becslés ===
  const { userId } = await auth();
  const pro = userId ? await isPro(userId) : false;
  const workerProfile = userId ? await getWorkerProfileByUser(userId) : null;
  const matchProfile = workerProfile
    ? { category: workerProfile.category, cantonCode: workerProfile.cantonCode, expectedSalaryMin: workerProfile.expectedSalaryMin }
    : null;
  const match = pro && hasMatchableProfile(matchProfile) ? jobMatchScore(matchProfile, job) : null;

  // Nettó-becslés: a bér középértékére, a profil kantonjában (vagy az állás kantonjában).
  let netEstimate: { gross: number; net: number; cantonCode: string } | null = null;
  if (pro && job.salaryMin && job.salaryMax) {
    const estCanton = workerProfile?.cantonCode ?? job.cantonCode ?? "ZH";
    const gross = Math.round((job.salaryMin + job.salaryMax) / 2);
    const r = computeSalary({ gross, period: "month", canton: estCanton, age: "25-34", civil: "A", kids: 0, churchTax: false, months: 12 });
    netEstimate = { gross, net: Math.round(r.netMonthly), cantonCode: estCanton };
  }

  // 1. Iránytű Benchmark Widget Számolás
  let cantonMedian: number | null = null;
  let diffPercent: number | null = null;
  let cantonName: string | null = null;

  if (job.salaryMin && job.salaryMax) {
    const jobMedian = (job.salaryMin + job.salaryMax) / 2;
    // Megpróbáljuk a kantont PLZ, majd egyszerű név alapján meghatározni
    const canton = cantonFromAddress(job.location) || matchCantonByName(job.location);
    if (canton) {
      cantonName = canton.name;
      const stats = await getSalaryStats(canton.code, "12m");
      let totalEntries = 0;
      let weightedMedianSum = 0;
      for (const s of stats) {
        totalEntries += s.entry_count;
        weightedMedianSum += (s.median_salary * s.entry_count);
      }
      if (totalEntries > 0) {
        cantonMedian = Math.round(weightedMedianSum / totalEntries);
        diffPercent = Math.round(((jobMedian - cantonMedian) / cantonMedian) * 100);
      }
    }
  }

  // Google for Jobs strukturált adat — a kanton elsősorban a strukturált mezőből.
  const cantonRegion =
    cantonNameByCode(job.cantonCode) ??
    (cantonFromAddress(job.location) || matchCantonByName(job.location))?.name ??
    null;
  const jobJsonLd = jobPostingJsonLd({ job, employer, cantonRegion });

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-24 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* SEO: Google for Jobs rich result */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jobJsonLd) }}
      />
      <header className="flex items-center gap-3">
        <Link
          href="/allasok"
          className="ml-auto order-last grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <span className="text-[13px] font-bold text-ink-muted uppercase tracking-wide">Vissza</span>
      </header>

      <section className="animate-fade-up">
        {employer?.logoKey ? (
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-[14px] bg-surface-alt shadow-sm border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={employer.logoKey} alt={employer.companyName} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-[14px] bg-surface-alt text-ink-muted shadow-sm border border-line text-[24px] font-bold uppercase">
            {employer?.companyName.charAt(0) || "C"}
          </div>
        )}
        
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink leading-tight text-balance">
          {job.title}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-[15px] font-bold text-ink-muted">
          {employer?.companyName || "Ismeretlen cég"}
          {employer?.verified && (
            <span
              title="A kinti.app ellenőrizte, hogy bejegyzett svájci cég (UID alapján)."
              className="inline-flex items-center gap-0.5 rounded-pill bg-success/15 px-2 py-0.5 text-[11.5px] font-bold text-success"
            >
              <Icon name="check" size={10} strokeWidth={3} /> Hiteles cég
            </span>
          )}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-line px-3 py-1.5 text-[12px] font-bold text-ink-muted">
            <Icon name="pin" size={14} /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-line px-3 py-1.5 text-[12px] font-bold text-ink-muted">
            <Icon name="clock" size={14} /> 
            {job.employmentType === 'full-time' ? 'Teljes munkaidő' : job.employmentType === 'part-time' ? 'Részmunkaidő' : job.employmentType}
          </span>
          {job.salaryMin && job.salaryMax && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[12px] font-bold text-success">
              <Icon name="star" size={14} /> 
              {job.salaryMin.toLocaleString('de-CH')} - {job.salaryMax.toLocaleString('de-CH')} {job.currency}
            </span>
          )}
        </div>
      </section>

      {cantonMedian && diffPercent !== null && (
        <section className="animate-fade-up animate-delay-100">
          <div className="rounded-card border border-primary/20 bg-primary/5 p-4 shadow-sm flex items-start gap-3">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon name="trending" size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-primary">
                Kinti Iránytű Benchmark
              </h3>
              <p className="mt-1 text-[13.5px] leading-snug text-ink-muted text-balance">
                A(z) <strong>{cantonName} kantonbeli</strong> becsült átlagfizetés jelenleg <strong>{cantonMedian.toLocaleString('de-CH')} CHF</strong>. 
                Ez az állásajánlat <strong>{Math.abs(diffPercent)}%-kal </strong> 
                <strong className={diffPercent >= 0 ? "text-success" : "text-accent"}>
                  {diffPercent >= 0 ? "magasabb" : "alacsonyabb"}
                </strong> a kantonális átlagnál.
              </p>
              <Link href="/iranytu" className="inline-flex items-center gap-1 mt-2 text-[12.5px] font-bold text-primary hover:underline">
                Részletes bérstatisztikák <Icon name="arrowRight" size={12} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* PRO: match-score + nettó-becslés (vagy upsell) */}
      {pro ? (
        (match || netEstimate) && (
          <section className="animate-fade-up animate-delay-100 rounded-card border-2 border-success/20 bg-success/5 p-4 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-success/15 text-[15px]">⚡</span>
              <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-success">PRO — neked szabva</h3>
            </div>
            {match && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-bold text-ink">Illeszkedés a profilodhoz</span>
                  <span className="text-[18px] font-black text-success">{match.score}%</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-pill bg-surface-alt">
                  <div className="h-full rounded-pill bg-success" style={{ width: `${match.score}%` }} />
                </div>
                {match.reasons.length > 0 && (
                  <p className="mt-1.5 text-[12px] text-ink-muted">{match.reasons.join(" · ")}</p>
                )}
              </div>
            )}
            {netEstimate && (
              <div className="border-t border-success/15 pt-3">
                <p className="text-[13.5px] leading-snug text-ink">
                  Becsült <strong>nettó</strong> ({cantonNameByCode(netEstimate.cantonCode) ?? netEstimate.cantonCode}, egyedülálló):{" "}
                  <strong className="text-success">~{netEstimate.net.toLocaleString("de-CH")} CHF/hó</strong>
                  <span className="text-ink-muted"> (bruttó {netEstimate.gross.toLocaleString("de-CH")} CHF-ből)</span>
                </p>
                <Link href="/berkalkulator" className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
                  Pontosítsd a bérkalkulátorban <Icon name="arrowRight" size={11} strokeWidth={3} />
                </Link>
              </div>
            )}
          </section>
        )
      ) : (
        <Link
          href="/pro"
          className="animate-fade-up animate-delay-100 flex items-center gap-3 rounded-card border border-[#ff9600]/25 bg-[#ff9600]/5 p-4 shadow-card transition active:scale-[0.99]"
        >
          <span className="text-xl">🔒</span>
          <span className="min-w-0 flex-1 text-[13px] leading-snug text-ink">
            <strong className="text-[#cc7700]">PRO:</strong> lásd, hány %-ban illik ez az állás a profilodhoz, és a becsült <strong>nettó bért</strong> a régiódban.
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-[#cc7700]" />
        </Link>
      )}

      <section className="animate-fade-up animate-delay-100 space-y-6">
        <div>
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-ink-muted mb-2">Feladatok és leírás</h2>
          <div className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap text-pretty">
            {job.description}
          </div>
        </div>

        {job.requirements && (
          <div>
            <h2 className="text-[14px] font-bold uppercase tracking-wide text-ink-muted mb-2">Elvárások</h2>
            <div className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap text-pretty">
              {job.requirements}
            </div>
          </div>
        )}

        {employer?.description && (
          <div className="rounded-card bg-surface-alt border border-line p-4">
            <h2 className="text-[14px] font-bold uppercase tracking-wide text-ink-muted mb-2">A cégről</h2>
            <div className="text-[14px] leading-relaxed text-ink-muted whitespace-pre-wrap text-pretty">
              {employer.description}
            </div>
            {employer.website && (
              <a 
                href={employer.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-[13px] font-bold text-primary hover:underline"
              >
                Weboldal megtekintése <Icon name="arrowRight" size={12} strokeWidth={3} />
              </a>
            )}
          </div>
        )}
      </section>

      {/* Rögzített CTA sáv alul */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80px] items-center justify-center border-t border-line/60 bg-surface/80 px-5 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-md">
          <Link
            href={`/allasok/${job.id}/jelentkezes`}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[16px] font-extrabold text-white shadow-card-hover transition-all active:scale-[0.98]"
          >
            Jelentkezem az állásra
          </Link>
        </div>
      </div>
    </div>
  );
}
