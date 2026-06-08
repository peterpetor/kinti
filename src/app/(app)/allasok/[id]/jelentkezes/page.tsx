import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobById, getEmployerById } from "@/lib/repo";
import { Icon } from "@/components/ui";
import { ApplicationForm } from "@/components/views/application-form";
import { Metadata } from "next";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJobById(params.id);
  if (!job) return { title: "Nem található állás" };
  return { title: `Jelentkezés: ${job.title} | Kinti` };
}

export default async function ApplyPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  
  if (!job || job.moderationStatus !== 1) {
    notFound();
  }

  const employer = await getEmployerById(job.employerId);

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <Link
          href={`/allasok/${job.id}`}
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Jelentkezés</h1>
      </header>

      {/* Hirdetés összefoglaló */}
      <div className="rounded-card border border-line bg-surface-alt p-4 animate-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted mb-1">Állás</p>
        <p className="text-[16px] font-extrabold text-ink">{job.title}</p>
        <p className="text-[13px] text-ink-muted font-medium mt-0.5">
          {employer?.companyName || "Ismeretlen cég"} · {job.location}
        </p>
      </div>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up animate-delay-100">
        <ApplicationForm jobId={job.id} jobTitle={job.title} />
      </section>
    </div>
  );
}
