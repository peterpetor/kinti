import { recordUsage } from "@/lib/repo";
import { getCloudflareCtx } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/track — privacy-first használat-számláló beacon.
 *
 * Bemenet: `{ event: "page:szaknevsor" | "action:lead-submit" | ... }`.
 * CSAK az allowlist-formátumú eseményt fogadja el (page:/action: + rövid slug) —
 * így nem lehet tetszőleges sorokat a táblába írni. Nem tárol PII-t (sem IP-t),
 * csak az aggregált napi darabszámot növeli. Mindig 204-et ad (a beacon ne zajongjon).
 */
const EVENT_RE = /^(page|action):[a-z0-9_-]{1,40}$/;

export async function POST(req: Request) {
  let event = "";
  try {
    const body = (await req.json()) as { event?: unknown };
    if (typeof body.event === "string") event = body.event;
  } catch {
    /* érvénytelen JSON → eldobjuk */
  }

  if (EVENT_RE.test(event)) {
    // Nem-blokkoló: a számlálás sose lassítsa a klienst.
    getCloudflareCtx()?.waitUntil(recordUsage(event));
  }

  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}
