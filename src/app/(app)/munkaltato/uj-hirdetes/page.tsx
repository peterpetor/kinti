import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner } from "@/lib/repo";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { JobPostForm } from "@/components/views/job-post-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Új álláshirdetés feladása — Munkáltató" };

export default async function NewJobPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/belepes?redirect_url=/munkaltato/uj-hirdetes");
  }

  const employer = await getEmployerByOwner(userId);

  if (!employer) {
    redirect("/munkaltato/regisztracio");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <Link
          href="/munkaltato"
          className="ml-auto order-last grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Új álláshirdetés</h1>
      </header>

      {/* Hogyan működik — hogy a munkáltató előre tudja a hirdetés életútját. */}
      <section className="rounded-card border border-primary/20 bg-primary-soft p-4 shadow-card animate-fade-up">
        <h2 className="mb-2.5 text-[13.5px] font-extrabold tracking-tight text-ink">
          📋 Hogyan működik a hirdetésed?
        </h2>
        <ol className="space-y-2">
          <li className="flex gap-2.5 text-[12.5px] leading-snug text-ink-muted">
            <span className="shrink-0 text-[14px]">🛡️</span>
            <span><strong className="text-ink">Ellenőrzés.</strong> Beküldés után röviden átnézzük (a feketemunkát kiszűrjük) — általában 24 órán belül jóváhagyjuk.</span>
          </li>
          <li className="flex gap-2.5 text-[12.5px] leading-snug text-ink-muted">
            <span className="shrink-0 text-[14px]">📅</span>
            <span><strong className="text-ink">30 napig aktív.</strong> A jóváhagyott hirdetés 30 napig látszik az álláskeresőknek. Utána automatikusan lejár — nem marad fent elavultan.</span>
          </li>
          <li className="flex gap-2.5 text-[12.5px] leading-snug text-ink-muted">
            <span className="shrink-0 text-[14px]">🔄</span>
            <span><strong className="text-ink">Ingyenes megújítás.</strong> Lejárat után a Munkáltató irányítópultodon <strong className="text-ink">egyetlen kattintással</strong> újra 30 napra fent van — nem kell újra begépelned.</span>
          </li>
          <li className="flex gap-2.5 text-[12.5px] leading-snug text-ink-muted">
            <span className="shrink-0 text-[14px]">🚀</span>
            <span><strong className="text-ink">Kiemelés (opcionális).</strong> 49 €-ért 30 napra piros keretet és a lista elejét kapod — a kiemelés a teljes hirdetés lejáratát is felfrissíti.</span>
          </li>
        </ol>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up">
        {employer.moderationStatus !== 1 && (
          <div className="mb-5 rounded-[12px] bg-accent/10 px-4 py-3 text-[12.5px] font-semibold text-accent">
            A munkáltatói fiókod még nincs jóváhagyva. Bár feladhatsz hirdetést, az nem fog megjelenni a keresőben, amíg a fiókod függőben van.
          </div>
        )}
        <JobPostForm />
      </section>
    </div>
  );
}
