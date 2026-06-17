import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getEmployerByOwner, getJobById } from "@/lib/repo";
import { Icon } from "@/components/ui";
import { JobPostForm } from "@/components/views/job-post-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Álláshirdetés szerkesztése — Munkáltató" };

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/belepes?redirect_url=/munkaltato/allas/${params.id}/szerkesztes`);
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    redirect("/munkaltato/regisztracio");
  }

  const job = await getJobById(params.id);
  // Csak a SAJÁT hirdetés szerkeszthető.
  if (!job || job.employerId !== employer.id) {
    notFound();
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
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Hirdetés szerkesztése</h1>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up">
        <JobPostForm
          jobId={job.id}
          initial={{
            title: job.title,
            location: job.location,
            cantonCode: job.cantonCode ?? "",
            category: job.category ?? "",
            employmentType: job.employmentType,
            salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
            salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
            currency: job.currency,
            description: job.description,
            requirements: job.requirements ?? "",
            legalAttested: job.legalAttested,
          }}
        />
      </section>
    </div>
  );
}
