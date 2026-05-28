import { NextResponse } from "next/server";
import { confirmDigestSubscriber } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/digest/confirm/[token] — a beküldő emailjéből nyíló link.
 * confirmed=0 → confirmed=1 a feliratkozó-soron. Redirect a megerősítő oldalra.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  const ok = await confirmDigestSubscriber(params.token);
  return NextResponse.redirect(
    `${baseUrl}/hirlevel-megerositve?status=${ok ? "confirmed" : "expired"}`,
    302,
  );
}
