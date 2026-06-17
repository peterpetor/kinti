import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getEmployerByOwner } from "@/lib/repo";
import { Icon } from "@/components/ui";
import { BulkJobForm } from "@/components/views/bulk-job-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Tömeges hirdetésfeladás — Munkáltató" };

export default async function BulkJobPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/belepes?redirect_url=/munkaltato/tomeges-feladas");
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
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Tömeges feladás</h1>
          <p className="text-[12.5px] text-ink-muted">Akár 10 hirdetés egyszerre</p>
        </div>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up">
        {employer.moderationStatus !== 1 && (
          <div className="mb-5 rounded-[12px] bg-accent/10 px-4 py-3 text-[12.5px] font-semibold text-accent">
            A fiókod még nincs jóváhagyva — a hirdetések a jóváhagyás után jelennek meg.
          </div>
        )}
        <BulkJobForm />
      </section>
    </div>
  );
}
