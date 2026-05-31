import { NextResponse, type NextRequest } from "next/server";
import { incrementBusinessAnalytic, getBusinessById, type BusinessAnalyticsKind } from "@/lib/repo";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

/**
 * POST /api/businesses/[id]/track
 *
 * Best-effort tracking-end-point a Szaknévsor analitikához:
 *   • profil-megnyitás (kind=view) — a profil-oldal page-load-on hívja
 *   • telefon-kattintás (kind=phone) — a `tel:` link onClick-jén hívja
 *
 * Dedupe IP-hash-szel óránként; a `repo.incrementBusinessAnalytic` csendesen
 * elnyeli a fail-eket, hogy a látogató sose lássa.
 *
 * Body: { kind: "view" | "phone" }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = (await req.json().catch(() => ({}))) as { kind?: string };
    const kind = body?.kind;
    if (kind !== "view" && kind !== "phone") {
      return NextResponse.json({ ok: false, error: "invalid_kind" }, { status: 400 });
    }

    // Validáljuk hogy a businessId valós — máskülönben spamelhetne random ID-vel
    // és DB-szemetet generálhatna a daily-aggregate táblába.
    const business = await getBusinessById(params.id);
    if (!business) {
      // 200 OK szándékos — a kliens UX-ot ne befolyásolja a fail
      return NextResponse.json({ ok: true });
    }

    const ip = req.headers.get("cf-connecting-ip");
    const ipHash = await hashIp(ip);

    await incrementBusinessAnalytic(
      params.id,
      kind as BusinessAnalyticsKind,
      ipHash,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("api/businesses/track", err);
    // A 200 OK szándékos: a kliens sose tudja meg, hogy mi failelt — a tracking
    // soha nem szakíthatja meg a user-flowt.
    return NextResponse.json({ ok: true });
  }
}
