import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/dev/test-email?to=info@kinti.app
 *
 * Gyors sanity-check, hogy a Resend SDK + a `.dev.vars` (RESEND_API_KEY + EMAIL_FROM)
 * helyesen van beállítva. Csak `next dev` / fejlesztői környezetben működik —
 * éles deploynál a NODE_ENV-check 403-at ad.
 *
 * Megjegyzés: `onboarding@resend.dev` küldővel CSAK a Resend-fiókod
 * regisztrált emailedre tud küldeni. Verifikált sajat domainnel (pl. kinti.app)
 * bárhova mehet — ez azonban Resend dashboardban DNS-konfig + 24h várakozás.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Csak fejlesztői módban." }, { status: 403 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "info@kinti.app";

  try {
    const { id } = await sendTestEmail(to);
    return NextResponse.json({ ok: true, to, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ismeretlen hiba.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
