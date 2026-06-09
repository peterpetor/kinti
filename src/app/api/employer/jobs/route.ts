import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createJob, getEmployerByOwner } from "@/lib/repo";
import { isValidCantonCode } from "@/lib/cantons";
import { isValidJobCategory } from "@/lib/job-categories";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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

  const id = crypto.randomUUID();
  
  // Lejárat: 30 nap múlva
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    await createJob({
      id,
      employerId: employer.id,
      title,
      description,
      location,
      cantonCode,
      category,
      employmentType,
      salaryMin,
      salaryMax,
      currency,
      requirements,
      status: "active", // Vagy "draft", ha később akarnánk publikálni
      moderationStatus: 0, // 0 = pending, mert minden új hirdetést adminnak kell jóváhagynia
      expiresAt: expiresAt.toISOString(),
    });
    
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[employer/jobs] create error:", err);
    return NextResponse.json({ error: "Belső hiba történt a mentés során." }, { status: 500 });
  }
}
