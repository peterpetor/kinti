import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { setBusinessVerified } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/businesses/[id]/verify — admin-only. Body: { verified: boolean }
 * Bekapcsolja/lekapcsolja a "Verified Hungarian-speaking" jelvényt.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Csak admin." }, { status: 403 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }
  const verified = body.verified === true;
  const ok = await setBusinessVerified(params.id, verified);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers: { "cache-control": "no-store" } });
}
