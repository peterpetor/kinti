import { NextResponse } from "next/server";
import { syncDeadlineReminders, deleteDeadlineReminders } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/deadlines/sync — a Határidő-asszisztens push-emlékeztetőjének
 * szinkronja. A határidők az ANONIM push-endpointhoz kötődnek (nincs user-
 * azonosító). Body: { subscription, deadlines:[{title,date}], enabled }.
 *  - enabled=false → az endpoint emlékeztetőinek törlése (kikapcsolás).
 *  - egyébként → a határidők szinkronja (upsert, a változatlanok megőrződnek).
 */
interface Body {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  deadlines?: { title?: string; date?: string }[];
  enabled?: boolean;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const sub = body.subscription;
  const endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : null;
  if (!endpoint) {
    return NextResponse.json({ error: "Hiányzó push-feliratkozás." }, { status: 400 });
  }
  const p256dh = sub?.keys?.p256dh ?? null;
  const auth = sub?.keys?.auth ?? null;

  // Rate-limit (anti-spam) — IP/óra.
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
  const rl = await checkAiRateLimit("deadline-sync", ipHash);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Túl sok kérés — próbáld kicsit később." }, { status: 429 });
  }

  try {
    if (body.enabled === false) {
      await deleteDeadlineReminders(endpoint);
      await logAiRateLimit("deadline-sync", ipHash);
      return NextResponse.json({ ok: true, enabled: false });
    }
    const deadlines = (Array.isArray(body.deadlines) ? body.deadlines : [])
      .slice(0, 50)
      .map((d) => ({ title: String(d?.title ?? "").trim(), date: String(d?.date ?? "") }))
      .filter((d) => d.title && /^\d{4}-\d{2}-\d{2}$/.test(d.date));
    await syncDeadlineReminders(endpoint, p256dh, auth, deadlines);
    await logAiRateLimit("deadline-sync", ipHash);
    return NextResponse.json({ ok: true, count: deadlines.length });
  } catch (e) {
    safeLogError("deadlines/sync", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
