import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createJob, getEmployerByOwner } from "@/lib/repo";
import { isValidCantonCode } from "@/lib/cantons";
import { isValidJobCategory } from "@/lib/job-categories";
import { moderateText } from "@/lib/text-moderation";
import { hasBlackWorkSignal } from "@/lib/job-screening";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_BULK = 10;

interface RawJob {
  title?: unknown; description?: unknown; location?: unknown; cantonCode?: unknown;
  category?: unknown; employmentType?: unknown; salaryMin?: unknown; salaryMax?: unknown;
  currency?: unknown; requirements?: unknown;
}

/**
 * POST /api/employer/jobs/bulk — több álláshirdetés egyszerre (3/5/10 csomag).
 * Body: { legalAttested: boolean, jobs: RawJob[] }.
 * Hirdetésenként validál + feketemunka-szűr; a hibás soroknál visszajelez,
 * a jókat létrehozza (mindegyik admin-jóváhagyásra vár, mint a sima feladás).
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employer = await getEmployerByOwner(userId);
  if (!employer) return NextResponse.json({ error: "Nincs munkáltatói fiókod." }, { status: 403 });

  let body: { legalAttested?: unknown; jobs?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.legalAttested !== true) {
    return NextResponse.json(
      { error: "El kell fogadnod a legális (bejelentett, AHV) foglalkoztatásra vonatkozó nyilatkozatot." },
      { status: 400 },
    );
  }

  const rawJobs = Array.isArray(body.jobs) ? (body.jobs as RawJob[]) : [];
  if (rawJobs.length === 0) {
    return NextResponse.json({ error: "Adj meg legalább egy hirdetést." }, { status: 400 });
  }
  if (rawJobs.length > MAX_BULK) {
    return NextResponse.json({ error: `Egyszerre legfeljebb ${MAX_BULK} hirdetés.` }, { status: 400 });
  }

  const errors: { index: number; error: string }[] = [];
  let created = 0;

  for (let i = 0; i < rawJobs.length; i++) {
    const r = rawJobs[i];
    const title = typeof r.title === "string" ? r.title.trim() : "";
    const description = typeof r.description === "string" ? r.description.trim() : "";
    const location = typeof r.location === "string" ? r.location.trim() : "";
    const cantonCode = isValidCantonCode(r.cantonCode) ? r.cantonCode : null;
    const category = isValidJobCategory(r.category) ? r.category : null;
    const employmentType = typeof r.employmentType === "string" ? r.employmentType.trim() : "full-time";
    const salaryMin = typeof r.salaryMin === "number" ? r.salaryMin : null;
    const salaryMax = typeof r.salaryMax === "number" ? r.salaryMax : null;
    const currency = typeof r.currency === "string" ? r.currency.trim() : "CHF";
    const requirements = typeof r.requirements === "string" && r.requirements.trim() ? r.requirements.trim() : null;

    if (title.length < 3) { errors.push({ index: i, error: "Túl rövid cím." }); continue; }
    if (description.length < 20) { errors.push({ index: i, error: "Túl rövid leírás (min. 20)." }); continue; }
    if (!location) { errors.push({ index: i, error: "Hiányzó hely." }); continue; }
    if (!cantonCode) { errors.push({ index: i, error: "Válassz kantont." }); continue; }
    if (!category) { errors.push({ index: i, error: "Válassz szakmát." }); continue; }

    const jobText = `${title}\n${description}\n${requirements ?? ""}`;
    if (hasBlackWorkSignal(jobText)) {
      errors.push({ index: i, error: "Feketemunkára utaló megfogalmazás." });
      continue;
    }
    const mod = await moderateText(jobText);
    if (mod.action === "block") {
      errors.push({ index: i, error: mod.reason || "Nem felel meg az irányelveknek." });
      continue;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      await createJob({
        id: crypto.randomUUID(),
        employerId: employer.id,
        title, description, location, cantonCode, category,
        legalAttested: true,
        employmentType, salaryMin, salaryMax, currency, requirements,
        status: "active",
        moderationStatus: 0,
        expiresAt: expiresAt.toISOString(),
      });
      created++;
    } catch {
      errors.push({ index: i, error: "Mentési hiba." });
    }
  }

  return NextResponse.json({ ok: true, created, errors });
}
