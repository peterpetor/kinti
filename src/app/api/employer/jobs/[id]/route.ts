import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteJob, updateJob, getEmployerByOwner } from "@/lib/repo";
import { isValidCantonCode } from "@/lib/cantons";
import { isValidJobCategory } from "@/lib/job-categories";
import { moderateText } from "@/lib/text-moderation";
import { hasBlackWorkSignal } from "@/lib/job-screening";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// PATCH /api/employer/jobs/:id — a munkáltató saját hirdetésének szerkesztése.
// Szerkesztés után a hirdetés újra admin-jóváhagyásra vár (moderation_status=0).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    return NextResponse.json({ error: "Nincs munkáltatói fiókod." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const cantonCode = isValidCantonCode(body.cantonCode) ? body.cantonCode : null;
  const category = isValidJobCategory(body.category) ? body.category : null;
  const employmentType = typeof body.employmentType === "string" ? body.employmentType.trim() : "full-time";
  const salaryMin = typeof body.salaryMin === "number" ? body.salaryMin : null;
  const salaryMax = typeof body.salaryMax === "number" ? body.salaryMax : null;
  const currency = typeof body.currency === "string" ? body.currency.trim() : "CHF";
  const requirements = typeof body.requirements === "string" ? body.requirements.trim() : null;
  const legalAttested = body.legalAttested === true;

  if (title.length < 3) {
    return NextResponse.json({ error: "Az állás címe túl rövid." }, { status: 400 });
  }
  if (description.length < 20) {
    return NextResponse.json({ error: "Kérjük, írj egy kicsit részletesebb leírást." }, { status: 400 });
  }
  if (!location) {
    return NextResponse.json({ error: "A munkavégzés helye kötelező." }, { status: 400 });
  }
  if (!cantonCode) {
    return NextResponse.json({ error: "Válassz kantont." }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "Válassz szakmát." }, { status: 400 });
  }
  if (!legalAttested) {
    return NextResponse.json(
      { error: "A mentéshez el kell fogadnod a legális (bejelentett, AHV) foglalkoztatásra vonatkozó nyilatkozatot." },
      { status: 400 },
    );
  }

  const jobText = `${title}\n${description}\n${requirements ?? ""}`;
  if (hasBlackWorkSignal(jobText)) {
    return NextResponse.json(
      { error: "A hirdetés be nem jelentett (fekete) munkára utaló megfogalmazást tartalmaz. A kinti.app kizárólag legális, bejelentett foglalkoztatást engedélyez." },
      { status: 400 },
    );
  }
  const mod = await moderateText(jobText);
  if (mod.action === "block") {
    return NextResponse.json(
      { error: mod.reason || "A hirdetés nem felel meg a közösségi irányelveinknek." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateJob(params.id, employer.id, {
      title, description, location, cantonCode, category, legalAttested,
      employmentType, salaryMin, salaryMax, currency, requirements,
    });
    if (!updated) {
      return NextResponse.json({ error: "A hirdetés nem található vagy nem a tiéd." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[employer/jobs/:id PATCH]", err);
    return NextResponse.json({ error: "Belső hiba történt a mentés során." }, { status: 500 });
  }
}

// DELETE /api/employer/jobs/:id — a munkáltató saját hirdetésének törlése.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    return NextResponse.json({ error: "Nincs munkáltatói fiókod." }, { status: 403 });
  }

  try {
    // A deleteJob employer_id-re is szűr, így csak a SAJÁT hirdetés törölhető.
    const deleted = await deleteJob(params.id, employer.id);
    if (!deleted) {
      return NextResponse.json({ error: "A hirdetés nem található vagy nem a tiéd." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[employer/jobs/:id DELETE]", err);
    return NextResponse.json({ error: "Belső hiba történt a törlés során." }, { status: 500 });
  }
}
