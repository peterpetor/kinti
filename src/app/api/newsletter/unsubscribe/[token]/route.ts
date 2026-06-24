import { NextResponse } from "next/server";
import { deleteNewsletterSubscription } from "@/lib/repo-newsletter";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Hírlevél-leiratkozás.
 *
 * A TÉNYLEGES törlés CSAK POST-ra történik — így az email-kliensek /
 * link-prefetcherek / biztonsági szkennerek (Outlook SafeLinks, Gmail,
 * vírusirtók), amelyek a leveleket GET-tel automatikusan „megnyitják", NEM
 * iratkoztatnak le senkit véletlenül (csendes lista-churn ellen). A GET csak a
 * megerősítő oldalra irányít, ahol egy gomb POST-tal véglegesít.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  return NextResponse.redirect(
    new URL(`/leiratkozas/${encodeURIComponent(params.token)}`, req.url),
  );
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const success = await deleteNewsletterSubscription(params.token);
    return NextResponse.json({ ok: success }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("[newsletter/unsubscribe]", err);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
