import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, setBusinessLeadStatus, type LeadStatus } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const VALID: LeadStatus[] = ["new", "contacted", "archived"];

/**
 * PATCH /api/owner/leads/:id — a vállalkozó a SAJÁT lead-jének státuszát állítja
 * (new / contacted / archived). Body: { status }.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  const business = await getBusinessByOwner(userId);
  if (!business) {
    return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { status?: unknown };
  const status = VALID.includes(body.status as LeadStatus) ? (body.status as LeadStatus) : null;
  if (!status) {
    return NextResponse.json({ error: "Érvénytelen státusz." }, { status: 400 });
  }

  // A setBusinessLeadStatus a business_id-re is szűr → csak a saját lead módosul.
  const ok = await setBusinessLeadStatus(params.id, business.id, status);
  if (!ok) {
    return NextResponse.json({ error: "A megkeresés nem található vagy nem a tiéd." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
