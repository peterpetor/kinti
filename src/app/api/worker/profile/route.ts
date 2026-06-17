import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { upsertWorkerProfile } from "@/lib/repo";
import { isValidCantonCode } from "@/lib/cantons";
import { isValidJobCategory } from "@/lib/job-categories";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * PUT /api/worker/profile — védett (Clerk). A bejelentkezett felhasználó
 * munkavállalói profiljának létrehozása/frissítése (1 user = 1 profil).
 */
export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
  const cantonCode = isValidCantonCode(body.cantonCode) ? body.cantonCode : null;
  const category = isValidJobCategory(body.category) ? body.category : null;
  const searchable = body.searchable === true;
  const layer3OptIn = body.layer3OptIn === true;
  const expectedSalaryMin =
    typeof body.expectedSalaryMin === "number" && body.expectedSalaryMin > 0
      ? Math.round(body.expectedSalaryMin)
      : null;

  if (fullName.length < 2) {
    return NextResponse.json({ error: "A név túl rövid." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 400 });
  }

  // cv_key: csak a SAJÁT prefixű kulcs fogadható el (cv/<userId>/...). Új CV
  // nélkül null → az upsert megtartja a meglévőt.
  let cvKey: string | null = null;
  if (typeof body.cvKey === "string" && body.cvKey) {
    if (!body.cvKey.startsWith(`cv/${userId}/`)) {
      return NextResponse.json({ error: "Érvénytelen CV-hivatkozás." }, { status: 400 });
    }
    cvKey = body.cvKey;
  }

  try {
    await upsertWorkerProfile({
      userId, fullName, email, phone, cvKey, cantonCode, category, searchable, layer3OptIn, expectedSalaryMin,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[worker/profile PUT]", err);
    return NextResponse.json({ error: "Belső hiba a mentés során." }, { status: 500 });
  }
}
