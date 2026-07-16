import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner, getJobs, getApplicationCounts, getBusinessByOwner } from "@/lib/repo";
import Link from "next/link";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";
import { JobCardActions } from "@/components/views/job-card-actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Munkáltatóknak — álláshirdetés vagy közvetítés",
  description:
    "Magyar munkaerőt keresel? Add fel a hirdetésed önkiszolgálón, vagy bízd a Kintire a közvetítést — előszűrt jelöltek, sikerdíjas modell (AT/DE/NL).",
};

/**
 * /munkaltato — a munkáltatói belépő EGY helyen (2026-07-16 összevonás,
 * user-döntés): akinek még nincs munkáltatói fiókja (vagy nincs belépve), az
 * egy NYILVÁNOS választó-oldalt lát két nagy úttal — (1) önkiszolgáló
 * álláshirdetés-feladás, (2) sikerdíjas közvetítés (a korábbi /kozvetites,
 * most /munkaltato/kozvetites). A meglévő munkáltató továbbra is azonnal a
 * megszokott irányítópultját kapja.
 */
export default async function EmployerDashboardPage() {
  const { userId } = await auth();
  const employer = userId ? await getEmployerByOwner(userId) : null;

  if (!employer) {
    return <EmployerLanding signedIn={!!userId} />;
  }

  const jobs = await getJobs({ employerId: employer.id, includeAllStatuses: true });
  const applicationCounts = await getApplicationCounts(employer.id);
  // Egy cég, két kapcsoló: van-e már Szaknévsor-listázása is? Ha nincs, felkínáljuk
  // (ügyfélszerzés) — a "van két profilom, minek?" keveredés feloldása.
  // (employer != null ⇒ userId != null — a fenti ág garantálja.)
  const business = await getBusinessByOwner(userId as string);

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
              {/* A "Csomag: FREE" felirat félrevezető volt (a munkáltatónál nincs
                  előfizetés — az álláshirdetés kiemelése hirdetésenként történik,
                  a Szaknévsor PRO pedig külön termék), ezért teljesen levéve. */}
              <p className="mt-1 text-[13px] text-ink-muted">
                {employer.contactEmail}
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

        {/* B2B: nem akarsz hirdetni és szűrögetni? Bízd ránk — sikerdíjas közvetítés. */}
        <Link
          href="/munkaltato/kozvetites"
          className="flex items-center gap-3 rounded-card border border-primary/25 bg-primary-soft px-4 py-3.5 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-lg">🤝</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-extrabold tracking-[-0.01em] text-ink">
              Nincs időd szűrögetni? Bízd ránk
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Előszűrt magyar jelölteket közvetítünk (AT/DE/NL) — csak sikeres felvételnél fizetsz.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-primary" />
        </Link>

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
          {jobs.length > 0 && (
            <p className="px-1 -mt-1 text-[12px] leading-snug text-ink-muted">
              A hirdetés 30 napig aktív, utána lejár. A <strong className="text-ink">lejárt</strong> hirdetést
              egyetlen kattintással, ingyen megújíthatod itt — nem kell újra begépelned.
            </p>
          )}

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
                  {job.status === "expired" ? (
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent">
                      Lejárt
                    </span>
                  ) : job.moderationStatus === 1 ? (
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
                <JobCardActions
                  jobId={job.id}
                  applicantCount={applicationCounts[job.id] ?? 0}
                  featured={job.status === "featured"}
                  expired={job.status === "expired"}
                />
              </div>
            ));
          })()}
        </div>
      </main>
    </div>
  );
}

/**
 * Nyilvános munkáltatói belépő — két nagy út: önkiszolgáló hirdetés-feladás
 * VAGY sikerdíjas közvetítés. Bejelentkezés csak az önkiszolgáló úthoz kell
 * (a gomb odáig viszi); a közvetítés-ajánlatkérés fiók nélkül is megy.
 */
function EmployerLanding({ signedIn }: { signedIn: boolean }) {
  const selfServiceHref = signedIn
    ? "/munkaltato/regisztracio"
    : "/belepes?redirect_url=/munkaltato/regisztracio";

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Munkáltatóknak
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="space-y-2">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          Magyar munkaerőt keresel?
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Két út közül választhatsz — hirdess magad, vagy bízd ránk a keresést.
        </p>
      </section>

      {/* 1. nagy út: önkiszolgáló hirdetés-feladás */}
      <Link
        href={selfServiceHref}
        className="block rounded-card border-2 border-primary/30 bg-surface p-5 shadow-card transition hover:border-primary/50 active:scale-[0.99]"
      >
        <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-primary text-white text-2xl">📝</span>
        <span className="mt-3 block text-[17px] font-extrabold tracking-tight text-ink">
          Feladok egy hirdetést
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-ink-muted">
          Önkiszolgáló: te írod a hirdetést, hozzád jönnek a jelentkezések. Az alap-hirdetés
          ingyenes, 30 napig aktív.
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-primary">
          Kezdés (kb. 2 perc) <Icon name="arrowRight" size={14} strokeWidth={2.6} />
        </span>
      </Link>

      {/* 2. nagy út: sikerdíjas közvetítés */}
      <Link
        href="/munkaltato/kozvetites"
        className="block rounded-card border-2 border-pro/30 bg-pro/5 p-5 shadow-card transition hover:border-pro/50 active:scale-[0.99]"
      >
        <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-pro/15 text-2xl">🤝</span>
        <span className="mt-3 block text-[17px] font-extrabold tracking-tight text-ink">
          Rábízom a Kintire a közvetítést
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-ink-muted">
          Előszűrt, motivált magyar jelölteket közvetítünk (AT/DE/NL). Nincs hirdetési díj —
          csak sikeres felvételnél fizetsz.
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-pro">
          Ajánlatot kérek <Icon name="arrowRight" size={14} strokeWidth={2.6} />
        </span>
      </Link>

      {signedIn && (
        <p className="px-1 text-[12px] leading-relaxed text-ink-muted">
          Volt már munkáltatói fiókod? Ha a hirdetés-feladást választod, a meglévő céged
          adataival folytathatod.
        </p>
      )}
    </div>
  );
}
