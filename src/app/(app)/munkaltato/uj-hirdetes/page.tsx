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
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Új álláshirdetés</h1>
      </header>

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
