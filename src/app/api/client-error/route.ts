import { NextResponse } from "next/server";
import { redactPii } from "@/lib/safe-log";
import { forwardError } from "@/lib/monitoring";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/client-error — kliens-oldali crash-jelentés fogadása.
 *
 * Az error boundary-k küldik ([[report-client-error]]). Itt redaktáljuk (PII
 * sosem hagyja el a rendszert) és továbbítjuk a monitoringra (ERROR_WEBHOOK_URL).
 * A válasz mindig {ok:true}, hogy a kliens-jelentés sose okozzon zajt/hibát.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown; message?: unknown; digest?: unknown; url?: unknown;
  };

  const name = typeof body.name === "string" ? body.name.slice(0, 80) : undefined;
  const digest = typeof body.digest === "string" ? body.digest.slice(0, 64) : undefined;
  const message = typeof body.message === "string" ? redactPii(body.message).slice(0, 300) : undefined;

  // Az URL-t query nélkül tartjuk meg (a query PII-t hordozhat).
  let url: string | undefined;
  if (typeof body.url === "string") {
    try {
      const u = new URL(body.url);
      url = u.origin + u.pathname;
    } catch {
      /* érvénytelen URL → kihagyjuk */
    }
  }

  forwardError({ source: "client", prefix: "[client-error]", name, message, digest, url });

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
