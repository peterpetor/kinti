import { NextResponse } from "next/server";
import { deleteDigestSubscriberByUnsubToken } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/digest/unsubscribe/[token] — egy-kattintásos leiratkozás (a minden
 * digest-emailben szereplő linkből). A felhasználó kattintása ÖNMAGÁBAN
 * tekinthető a hozzájárulás-visszavonásnak (GDPR), ezért azonnal törlünk és
 * redirect-elünk a visszajelző oldalra.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  const ok = await deleteDigestSubscriberByUnsubToken(params.token);
  return NextResponse.redirect(
    `${baseUrl}/hirlevel-megerositve?status=${ok ? "unsubscribed" : "expired"}`,
    302,
  );
}
