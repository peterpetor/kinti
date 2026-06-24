import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { removePlacementOptIn } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/recruiter/optout — egy self-service jelölt eltávolítása az aktív
 * közvetítésből (layer3_opt_in = 0), admin GDPR-kérésre. Body: { workerId }.
 */
export async function POST(req: Request) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { workerId?: string };
  if (!body.workerId) return NextResponse.json({ error: "Hiányzó workerId." }, { status: 400 });
  const ok = await removePlacementOptIn(body.workerId);
  return NextResponse.json({ ok });
}
