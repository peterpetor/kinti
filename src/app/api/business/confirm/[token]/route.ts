import { NextResponse } from "next/server";
import {
  getBusinessSubmissionByConfirmToken,
  createBusinessFromSubmission,
  deleteBusinessSubmission,
  getBusinessById,
} from "@/lib/repo";
import { slugifyBusinessName, approxCoordsForRegion } from "@/lib/business";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { notifyAdminContentPending } from "@/lib/admin-notify";

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

  const coords = approxCoordsForRegion(sub.country, sub.cantonCode);

  // A piszkozat manage_token-jét továbbvisszük a publikus rekordra. Ha valamiért
  // hiányozna (régi piszkozat), generálunk egy újat — így a confirm email URL-je
  // is működik.
  const manageToken = sub.manageToken ?? crypto.randomUUID().replace(/-/g, "");

  await createBusinessFromSubmission({
    id,
    name: sub.name,
    categoryId: sub.categoryId,
    categoryLabel: sub.categoryLabel,
    address: sub.address,
    country: sub.country,
    cantonCode: sub.cantonCode || null,
    phone: sub.phone,
    blurb: sub.blurb,
    licenseNumber: sub.licenseNumber,
    contactEmail: sub.email,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    ownerUserId: sub.ownerUserId, // belépett beküldő esetén → auto-kapcsolás
    manageToken,
  });
  await deleteBusinessSubmission(sub.id);

  // Új tartalom-moderációs réteg: minden új vállalkozás admin-jóváhagyásra vár.
  notifyAdminContentPending({
    contentType: "vállalkozás",
    title: sub.name,
    preview: sub.blurb ?? sub.address ?? "",
    submitterEmail: sub.email,
  }).catch(() => {});

  return NextResponse.redirect(
    `${baseUrl}/vallalkozas-megerositve?status=published&id=${encodeURIComponent(id)}&manage=${encodeURIComponent(manageToken)}`,
    302,
  );
}
