import { NextResponse } from "next/server";
import { syncSubscriptionStreak } from "@/lib/repo-misc";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/push/streak — a kliens szinkronizálja a (localStorage-beli) napi
 * sorozatát a SAJÁT push-feliratkozására, hogy a streak-mentő cron tudjon neki
 * szólni, mielőtt ma megszakad. Endpoint-scope (nincs account/identitás).
 *
 * Body: { endpoint, streak, day }  (day = YYYY-MM-DD, az utolsó aktív nap)
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { endpoint?: string; streak?: number; day?: string };
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  const streak = Number(body.streak);
  const day = typeof body.day === "string" ? body.day.trim() : "";

  if (!/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
  }
  if (!Number.isFinite(streak) || streak < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json({ error: "Érvénytelen adat." }, { status: 400 });
  }

  await syncSubscriptionStreak(endpoint, streak, day);
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
