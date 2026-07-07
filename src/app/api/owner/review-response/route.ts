import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner } from "@/lib/repo";
import { applyOwnerResponse } from "@/lib/review-response";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/review-response
 *
 * Clerk-belépett tulajdonos válasza a saját cége véleményére (a /profil
 * dashboardról). A middleware az /api/owner(.*) route-ot auth.protect()-tel védi;
 * a válasz csak a bejelentkezett userhez tartozó céghez adható.
 *
 * Bemenet: { reviewId: string, response: string }  (üres response → törlés)
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getBusinessByOwner(userId);
  if (!business) {
    return NextResponse.json({ error: "Nincs vállalkozásod." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = await applyOwnerResponse(business.id, body.reviewId, body.response);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
