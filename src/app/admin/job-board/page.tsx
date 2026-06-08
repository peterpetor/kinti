import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { getDB } from "@/lib/cloudflare";
import { JobBoardDecideButtons } from "@/components/admin/job-board-decide-buttons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Állásportál moderáció — Kinti Admin",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Függőben",
  approved: "Jóváhagyott",
  rejected: "Elutasított",
};

const STATUS_VALUES: Record<string, 0 | 1 | 2> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

type SearchParams = { status?: string; tab?: string };

interface EmployerRow {
  id: string;
  company_name: string;
  contact_email: string;
  website: string | null;
  description: string | null;
  subscription_tier: string;
  moderation_status: number;
  moderation_decision_at: string | null;
  moderation_decided_by: string | null;
  created_at: string;
}

interface JobRow {
  id: string;
  employer_id: string;
  title: string;
  location: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  description: string;
  moderation_status: number;
  moderation_decision_at: string | null;
  created_at: string;
}

export default async function JobBoardAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const statusParam =
    searchParams.status && STATUS_VALUES[searchParams.status] !== undefined
      ? searchParams.status
      : "pending";
  const statusValue = STATUS_VALUES[statusParam];
  const tab = searchParams.tab === "jobs" ? "jobs" : "employers";

  const db = getDB();

  const [employers, jobs, pendingEmployers, pendingJobs] = await Promise.all([
    db
      .prepare(
        `SELECT id, company_name, contact_email, website, description, subscription_tier,
                moderation_status, moderation_decision_at, moderation_decided_by, created_at
         FROM employers WHERE moderation_status = ? ORDER BY created_at DESC LIMIT 100`
      )
      .bind(statusValue)
      .all<EmployerRow>()
      .then((r) => r.results),
    db
      .prepare(
        `SELECT id, employer_id, title, location, employment_type, salary_min, salary_max,
                currency, description, moderation_status, moderation_decision_at, created_at
         FROM jobs WHERE moderation_status = ? ORDER BY created_at DESC LIMIT 100`
      )
      .bind(statusValue)
      .all<JobRow>()
      .then((r) => r.results),
    db
      .prepare("SELECT COUNT(*) AS n FROM employers WHERE moderation_status = 0")
      .first<{ n: number }>()
      .then((r) => r?.n ?? 0),
    db
      .prepare("SELECT COUNT(*) AS n FROM jobs WHERE moderation_status = 0")
      .first<{ n: number }>()
      .then((r) => r?.n ?? 0),
  ]);

  const items = tab === "employers" ? employers : jobs;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link
          href="/admin"
          className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
        >
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          Állásportál moderáció
        </h1>
        <p className="text-[12.5px] text-ink-muted">
          Munkáltatói fiókok és álláshirdetések jóváhagyása / elutasítása.
        </p>
      </header>

      {/* Status tab */}
      <div className="flex gap-1 rounded-pill border border-line bg-surface p-1">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/job-board?status=${s}&tab=${tab}`}
            className={`flex-1 rounded-pill px-3 py-1.5 text-center text-[12px] font-bold transition ${
              statusParam === s
                ? "bg-primary text-white shadow-card"
                : "text-ink-muted hover:bg-surface-alt"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Type tab */}
      <div className="flex gap-2">
        {(["employers", "jobs"] as const).map((t) => {
          const count = t === "employers" ? pendingEmployers : pendingJobs;
          return (
            <Link
              key={t}
              href={`/admin/job-board?status=${statusParam}&tab=${t}`}
              className={`inline-flex items-center gap-1.5 rounded-pill border px-4 py-1.5 text-[11.5px] font-bold transition ${
                tab === t
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-surface text-ink-muted hover:bg-surface-alt"
              }`}
            >
              {t === "employers" ? "Munkáltatók" : "Álláshirdetések"}
              {count > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Items */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          {STATUS_LABELS[statusParam]} {tab === "employers" ? "munkáltatók" : "hirdetések"} · {items.length} db
        </p>

        {items.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[12.5px] text-ink-muted">
            Nincs ilyen tétel.
          </div>
        ) : (
          <div className="space-y-2">
            {tab === "employers"
              ? (employers as EmployerRow[]).map((emp) => (
                  <article
                    key={emp.id}
                    className="rounded-card border border-line bg-surface p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-extrabold text-ink">
                          {emp.company_name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          📧 {emp.contact_email}
                          {emp.website && (
                            <>
                              {" · "}
                              <a
                                href={emp.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {emp.website}
                              </a>
                            </>
                          )}
                        </p>
                        {emp.description && (
                          <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink-muted">
                            {emp.description}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-ink-faint">
                          Csomag: <strong className="text-ink">{emp.subscription_tier.toUpperCase()}</strong>
                          {" · "}Regisztrálva: {fmtAgo(emp.created_at)}
                        </p>
                      </div>
                      <JobBoardDecideButtons
                        table="employers"
                        id={emp.id}
                        current={emp.moderation_status}
                      />
                    </div>
                  </article>
                ))
              : (jobs as JobRow[]).map((job) => (
                  <article
                    key={job.id}
                    className="rounded-card border border-line bg-surface p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-extrabold text-ink">
                          {job.title}
                        </p>
                        <p className="mt-0.5 text-[12px] font-medium text-ink-muted">
                          {job.location} · {job.employment_type}
                          {job.salary_min && job.salary_max
                            ? ` · ${job.salary_min}–${job.salary_max} ${job.currency}`
                            : ""}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink-muted">
                          {job.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-[10px] text-ink-faint">
                            Feladva: {fmtAgo(job.created_at)}
                          </p>
                          <Link
                            href={`/allasok/${job.id}`}
                            target="_blank"
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            ↗ Előnézet
                          </Link>
                        </div>
                      </div>
                      <JobBoardDecideButtons
                        table="jobs"
                        id={job.id}
                        current={job.moderation_status}
                      />
                    </div>
                  </article>
                ))}
          </div>
        )}
      </section>
    </div>
  );
}

function fmtAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(
    iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")
  ).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} perce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} órája`;
  return `${Math.floor(h / 24)} napja`;
}
