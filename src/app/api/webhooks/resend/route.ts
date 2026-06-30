import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { verifyResendSignature } from "@/lib/resend-webhook";
import { suppressEmail, deleteRadarsByEmail } from "@/lib/repo-misc";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/resend — Resend (email) webhook.
 *
 * A `email.bounced` (visszapattanó cím) és `email.complained` (spam-panasz)
 * eseményekre a címet a suppression-listára teszi → a küldő (getResend
 * interceptor) NEM küld rá többé (sender reputation védelem). Spam-panasznál a
 * cím radarjait is TÖRLI (a leiratkozás-szándék teljes tiszteletben tartása).
 *
 * INAKTÍV, amíg a `RESEND_WEBHOOK_SECRET` env nincs beállítva — a webhookot a
 * Resend dashboardon kell bekötni (Webhooks → a végpont URL-je → a `whsec_…`
 * signing secret bemásolása a CF env-be).
 */
interface ResendEvent {
  type?: string;
  data?: { to?: string[] | string; email_id?: string };
}

export async function POST(req: Request) {
  const env = getCloudflareEnv() as unknown as { RESEND_WEBHOOK_SECRET?: string };
  const secret = env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "webhook-disabled" }, { status: 503 });
  }

  const raw = await req.text();
  const valid = await verifyResendSignature(
    secret,
    {
      id: req.headers.get("svix-id"),
      timestamp: req.headers.get("svix-timestamp"),
      signature: req.headers.get("svix-signature"),
    },
    raw,
  );
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let event: ResendEvent;
  try {
    event = JSON.parse(raw) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "";
  const to = event.data?.to;
  const addresses = (Array.isArray(to) ? to : to ? [to] : []).filter(
    (a): a is string => typeof a === "string" && a.includes("@"),
  );

  try {
    if (type === "email.bounced" || type === "email.complained") {
      const reason = type === "email.complained" ? "complaint" : "bounce";
      for (const addr of addresses) {
        await suppressEmail(addr, reason);
        // Spam-panasznál a teljes leiratkozást tiszteljük: a cím radarjait töröljük.
        if (type === "email.complained") await deleteRadarsByEmail(addr);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[webhooks/resend] processing", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
