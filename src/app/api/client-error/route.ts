import { NextResponse } from "next/server";
import { redactPii } from "@/lib/safe-log";
import { forwardError } from "@/lib/monitoring";
import { hashIp } from "@/lib/security";
import { countRecentSpamLog, logSpamSubmit } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** IP-cap óránként, hogy egy hibahurok ne árassza el a monitoring-webhookot. */
const CLIENT_ERROR_PER_HOUR = 20;

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

  // IP-cap: egy végtelen hibahurok ne floodolja a webhookot. A kliens mindig
  // {ok:true}-t kap, csak a továbbítást hagyjuk ki a limit felett.
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
  if ((await countRecentSpamLog("client-error", ipHash, 60)) < CLIENT_ERROR_PER_HOUR) {
    forwardError({ source: "client", prefix: "[client-error]", name, message, digest, url });
    await logSpamSubmit("client-error", ipHash);
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
