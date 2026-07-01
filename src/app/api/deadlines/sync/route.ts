import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { syncDeadlineReminders, deleteDeadlineReminders } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/deadlines/sync — a Határidő-asszisztens emlékeztetőjének szinkronja.
 * A határidők a push-endpointhoz kötődnek. Body:
 * { subscription, deadlines:[{title,date}], enabled, emailReminders }.
 *  - enabled=false → az endpoint emlékeztetőinek törlése (kikapcsolás).
 *  - emailReminders=true → a BEJELENTKEZETT (Clerk) user email-címét is eltároljuk
 *    a sorokon (opt-in emailes emlékeztető). A címet SZERVER-oldalon vesszük az
 *    auth-ból (nem a kliens küldi) → nem hamisítható idegen címre. Enélkül csak-push
 *    (anonim). Lásd az Adatvédelmi Tájékoztatót a tárolás részleteiről.
 */
interface Body {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  deadlines?: { title?: string; date?: string }[];
  enabled?: boolean;
  emailReminders?: boolean;
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

    // Emailes emlékeztető (opt-in): a címet a BEJELENTKEZETT userből vesszük (nem a
    // kliensből → nem küldhető idegen címre). Ha nincs bejelentkezve vagy nem kérte,
    // az email null marad → csak-push (anonim). Best-effort: az auth hibája ne
    // buktassa a push-szinkront.
    let email: string | null = null;
    if (body.emailReminders === true) {
      try {
        const user = await currentUser();
        email = user?.emailAddresses?.[0]?.emailAddress ?? null;
      } catch (e) { safeLogError("deadlines/sync:currentUser", e); }
    }

    await syncDeadlineReminders(endpoint, p256dh, auth, deadlines, email);
    await logAiRateLimit("deadline-sync", ipHash);
    return NextResponse.json({ ok: true, count: deadlines.length });
  } catch (e) {
    safeLogError("deadlines/sync", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
