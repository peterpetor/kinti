import { NextResponse } from "next/server";
import {
  deleteReviewByManageToken,
  recomputeBusinessRating,
  updateReviewNameByManageToken,
} from "@/lib/repo";
import { REVIEW_LIMITS } from "@/lib/reviews";
import { containsProfanity } from "@/lib/profanity";

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

/**
 * PATCH /api/reviews/manage/<token> — a megjelenő név átírása.
 * Body: { reviewerName } (üres = vissza az auto-generált álnévre).
 * Ugyanaz a szabályrendszer, mint beküldéskor: max 40 kar., trágárság-szűrő.
 */
export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }
  const name = typeof body.reviewerName === "string" ? body.reviewerName.trim() : "";
  if (name) {
    if (name.length > REVIEW_LIMITS.reviewerNameMax) {
      return NextResponse.json({ error: `Túl hosszú név (max. ${REVIEW_LIMITS.reviewerNameMax} karakter).` }, { status: 400 });
    }
    if (name.length < REVIEW_LIMITS.reviewerNameMin) {
      return NextResponse.json({ error: "Túl rövid név — vagy hagyd üresen az álnévhez." }, { status: 400 });
    }
    if (containsProfanity(name).hit) {
      return NextResponse.json({ error: "Ez a név nem megfelelő — kérjük, válassz másikat." }, { status: 400 });
    }
  }
  const ok = await updateReviewNameByManageToken(params.token, name);
  if (!ok) {
    return NextResponse.json({ error: "Ismeretlen vagy lejárt token." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, reviewerName: name }, { headers: { "cache-control": "no-store" } });
}
