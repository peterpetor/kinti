import { NextResponse } from "next/server";
import {
  countTrustedBulletinPosts,
  deleteBulletinDraft,
  getBulletinDraftByConfirmToken,
  publishBulletinPost,
} from "@/lib/repo";
import { POST_TTL_MS, REQUIRE_ADMIN_APPROVAL } from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { triggerAlberletRadars } from "@/lib/radars";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/bulletin/confirm/<token>  — a megerősítő emailből nyíló link.
 *
 * Idempotens, de a token egyszer használható: a kattintás után a piszkozat
 * törlődik, és helyette egy bulletin_posts rekord születik. Ha újra kattint,
 * 404-et kap (vagy ha a publikált poszt manage_token egyezne — átirányítjuk
 * a megerősítő-oldalra).
 *
 * Trust-logika: ha az emailnek már van >=1 korábbi publikus posztja,
 * azonnal megy a publikus listára (is_pending=0). Új email + a global
 * REQUIRE_ADMIN_APPROVAL=true esetén pending sorba kerül.
 *
 * Cél: end-user-friendly redirect a /hirdetes-megerositve oldalra a publikált
 * poszt manage_token-jével paraméterben (hogy a felhasználó kezelni is tudja).
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(_req.url).origin;

  const draft = await getBulletinDraftByConfirmToken(params.token);
  if (!draft) {
    // Lejárt vagy hibás token: redirect a "lejárt" UI-ra.
    return NextResponse.redirect(`${baseUrl}/hirdetes-megerositve?status=expired`, 302);
  }

  // trust-szint: már volt sikeres posztja → auto-publish
  const trusted = await countTrustedBulletinPosts(draft.email);
  const isPending = trusted === 0 && REQUIRE_ADMIN_APPROVAL ? 1 : 0;

  const postId = crypto.randomUUID();
  const postExpiresAt = new Date(Date.now() + POST_TTL_MS).toISOString();

  await publishBulletinPost({
    id: postId,
    kindId: draft.kindId,
    title: draft.title,
    meta: draft.meta,
    body: draft.body,
    poster: draft.poster,
    email: draft.email,
    phone: draft.phone ?? "",
    whatsapp: draft.whatsapp ?? "",
    manageToken: draft.manageToken,
    expiresAt: postExpiresAt,
    isPending,
    termsVersion: draft.termsVersion,
    acceptedTermsAt: draft.acceptedTermsAt,
    ageConfirmed: draft.ageConfirmed ? 1 : 0,
    ipHash: draft.ipHash,
    imageKey: draft.imageKey,
    cantonCode: draft.cantonCode,
    price: draft.price,
  });
  await deleteBulletinDraft(draft.id);

  if (!isPending && draft.kindId === 'alberlet' && draft.cantonCode) {
    // Csak akkor küldünk értesítést, ha nem kerül moderációs sorba
    triggerAlberletRadars(draft.cantonCode).catch(() => {});
  }

  const status = isPending ? "pending" : "published";
  return NextResponse.redirect(
    `${baseUrl}/hirdetes-megerositve?status=${status}&manage=${draft.manageToken}`,
    302,
  );
}
