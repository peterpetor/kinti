import { NextResponse } from "next/server";
import {
  deleteReviewDraft,
  getReviewDraftByConfirmToken,
  hasReviewByEmail,
  publishReview,
  recomputeBusinessRating,
} from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getBusinessById } from "@/lib/repo";
import { notifyAdminContentPending } from "@/lib/admin-notify";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/reviews/confirm/<token>  — a megerősítő emailből nyíló link.
 *
 * Idempotens: a piszkozat törlődik, a `reviews` táblába egy új sor kerül,
 * majd a businesses.rating + reviews újraszámolódik. A confirm-redirect a
 * vállalkozás oldalára visz vissza, hogy a felhasználó lássa a publikálva
 * megjelent véleményt.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(_req.url).origin;

  const draft = await getReviewDraftByConfirmToken(params.token);
  if (!draft) {
    return NextResponse.redirect(`${baseUrl}/velemeny-megerositve?status=expired`, 302);
  }

  // Versenyhelyzet ellenőrzés: két piszkozat egyszerre erősíthető meg.
  if (await hasReviewByEmail(draft.businessId, draft.email)) {
    await deleteReviewDraft(draft.id);
    return NextResponse.redirect(
      `${baseUrl}/velemeny-megerositve?status=duplicate`,
      302,
    );
  }

  const reviewId = crypto.randomUUID();
  await publishReview({
    id: reviewId,
    businessId: draft.businessId,
    email: draft.email,
    rating: draft.rating,
    body: draft.body,
    reviewerName: draft.reviewerName,
    manageToken: draft.manageToken,
    termsVersion: draft.termsVersion,
    acceptedTermsAt: draft.acceptedTermsAt,
    ageConfirmed: draft.ageConfirmed ? 1 : 0,
    ipHash: draft.ipHash,
  });
  await deleteReviewDraft(draft.id);
  await recomputeBusinessRating(draft.businessId);

  // Új tartalom-moderációs réteg: minden vélemény admin-jóváhagyásra vár.
  try {
    const biz = await getBusinessById(draft.businessId);
    await notifyAdminContentPending({
      contentType: "vélemény",
      title: `${draft.rating}★ — ${biz?.name ?? "ismeretlen vállalkozás"}`,
      preview: draft.body,
      submitterEmail: draft.email,
    });
  } catch {
    /* best-effort */
  }

  return NextResponse.redirect(
    `${baseUrl}/velemeny-megerositve?status=published&business=${encodeURIComponent(draft.businessId)}&manage=${draft.manageToken}`,
    302,
  );
}
