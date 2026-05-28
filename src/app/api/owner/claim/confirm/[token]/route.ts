import { NextResponse } from "next/server";
import {
  claimBusiness,
  consumeBusinessClaimRequest,
  getBusinessClaimRequestByToken,
} from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/owner/claim/confirm/<token> — a vállalkozás-igénylő emailből nyíló link.
 *
 * Publikus végpont (NEM Clerk-védett, mert a tulajdonos email-kliensében nem
 * biztos hogy be van lépve). A token egyszer használható + 24h TTL.
 * Sikerre: a business.owner_user_id = igénylő Clerk user_id, és redirect
 * a /profil-ra.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  const reqRow = await getBusinessClaimRequestByToken(params.token);
  if (!reqRow) {
    return NextResponse.redirect(`${baseUrl}/vallalkozas-igenyles?status=expired`, 302);
  }

  const ok = await claimBusiness(reqRow.businessId, reqRow.userId);
  await consumeBusinessClaimRequest(reqRow.id);

  if (!ok) {
    // Időközben más igényelte (vagy maga a user másik flow-ban) → már gazdás.
    return NextResponse.redirect(
      `${baseUrl}/vallalkozas-igenyles?status=already_claimed&id=${encodeURIComponent(reqRow.businessId)}`,
      302,
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/vallalkozas-igenyles?status=success&id=${encodeURIComponent(reqRow.businessId)}`,
    302,
  );
}
