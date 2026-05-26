import { NextResponse } from "next/server";
import { renewBulletinPost } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/bulletin/renew/<token>
 *
 * Meghosszabbítja a hirdetést újabb 30 nappal a manage-token alapján.
 * Nincs Clerk-auth — a token MAGA a bizonyíték (UUID, 122 bit entrópia).
 *
 * Eredmény:
 *   200 { ok: true, newExpiresAt: "..." }  — sikeres hosszabbítás
 *   404 { error: "..." }                   — token nem található / már lejárt
 */
export async function POST(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const ok = await renewBulletinPost(params.token);

  if (!ok) {
    return NextResponse.json(
      { error: "A hirdetés nem található, már nagyon régen lejárt, vagy a token érvénytelen." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
