import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { claimBusiness, getBusinessById, getBusinessByOwner } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// POST /api/owner/claim  { businessId }
// A middleware védi (/api/owner(.*)), de a userId-t itt is ellenőrizzük.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { businessId?: string };
  if (!body.businessId) {
    return NextResponse.json({ error: "missing_business_id" }, { status: 400 });
  }

  // Egy felhasználóhoz egy vállalkozás (MVP): ha már van, azt adjuk vissza.
  const existing = await getBusinessByOwner(userId);
  if (existing) {
    return NextResponse.json({ business: existing, claimed: false });
  }

  const ok = await claimBusiness(body.businessId, userId);
  if (!ok) {
    return NextResponse.json({ error: "already_claimed" }, { status: 409 });
  }

  const business = await getBusinessById(body.businessId);
  return NextResponse.json({ business, claimed: true });
}
