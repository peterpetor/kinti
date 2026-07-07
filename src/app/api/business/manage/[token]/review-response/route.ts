import { NextResponse } from "next/server";
import { getBusinessByManageToken } from "@/lib/repo";
import { applyOwnerResponse } from "@/lib/review-response";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/manage/[token]/review-response
 *
 * Email-only tulajdonosi válasz egy véleményre. Auth nincs — a manage_token MAGA
 * a bizonyíték (a vállalkozás confirmáló e-mailjében kapta). A válasz a token-hez
 * tartozó cég véleményeire adható; idegen véleményt az applyOwnerResponse a
 * businessId-re szűréssel utasít el.
 *
 * Bemenet: { reviewId: string, response: string }  (üres response → törlés)
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
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
