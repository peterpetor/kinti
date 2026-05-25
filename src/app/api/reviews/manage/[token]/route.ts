import { NextResponse } from "next/server";
import {
  deleteReviewByManageToken,
  recomputeBusinessRating,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/reviews/manage/<token> — a véleményíró saját véleményének
 * törlése. A token MAGA a bizonyíték (122 bit entrópia, gyakorlatban
 * brute-force-hatatlan).
 *
 * Sikeres törlés után a businesses.rating + reviews automatikusan
 * újraszámolódik.
 */
export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const businessId = await deleteReviewByManageToken(params.token);
  if (!businessId) {
    return NextResponse.json({ error: "Ismeretlen vagy lejárt token." }, { status: 404 });
  }
  await recomputeBusinessRating(businessId);
  return NextResponse.json({ ok: true });
}
