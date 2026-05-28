import { NextResponse } from "next/server";
import {
  getBusinessSubmissionByConfirmToken,
  createBusinessFromSubmission,
  deleteBusinessSubmission,
  getBusinessById,
} from "@/lib/repo";
import { slugifyBusinessName, approxCoordsForCanton } from "@/lib/business";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/business/confirm/<token> — a megerősítő emailből nyíló link.
 *
 * A token egyszer használható: kattintás után a piszkozatból AZONNAL publikus
 * businesses-rekord lesz (nincs kézi jóváhagyás), és a piszkozat törlődik.
 * Lejárt/hibás token → redirect a "lejárt" UI-ra.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(_req.url).origin;

  const sub = await getBusinessSubmissionByConfirmToken(params.token);
  if (!sub) {
    return NextResponse.redirect(`${baseUrl}/vallalkozas-megerositve?status=expired`, 302);
  }

  // Egyedi slug: névből + rövid random utótag (PRIMARY KEY ütközés ellen).
  let id = `${slugifyBusinessName(sub.name)}-${crypto.randomUUID().slice(0, 6)}`;
  // Rendkívül valószínűtlen ütközés esetén még egy próba.
  if (await getBusinessById(id)) {
    id = `${slugifyBusinessName(sub.name)}-${crypto.randomUUID().slice(0, 8)}`;
  }

  const coords = approxCoordsForCanton(sub.cantonCode);

  await createBusinessFromSubmission({
    id,
    name: sub.name,
    categoryId: sub.categoryId,
    categoryLabel: sub.categoryLabel,
    address: sub.address,
    phone: sub.phone,
    blurb: sub.blurb,
    contactEmail: sub.email,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    ownerUserId: sub.ownerUserId, // belépett beküldő esetén → auto-kapcsolás
  });
  await deleteBusinessSubmission(sub.id);

  return NextResponse.redirect(
    `${baseUrl}/vallalkozas-megerositve?status=published&id=${encodeURIComponent(id)}`,
    302,
  );
}
