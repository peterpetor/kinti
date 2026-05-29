import { NextResponse } from "next/server";
import { getEventByToken, updateEventStatus, deleteEvent } from "@/lib/repo";
import { sendEventAdminModerationEmail } from "@/lib/email";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/events/confirm/[token]
 *
 * A beküldő a saját email-jéből kattint ide. Ez igazolja, hogy valódi
 * email-cím volt megadva. Az esemény státusza 'pending_confirm' → 'pending_admin'.
 * Ezután az admin kap egy jóváhagyó/elutasító emailt.
 */
export async function GET(
  req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  const event = await getEventByToken(token);

  if (!event || event.status !== "pending_confirm") {
    return new Response(
      buildPage(
        "Érvénytelen vagy lejárt link",
        "Ez a megerősítő link már nem érvényes, vagy az eseményt már korábban feldolgoztuk.",
        false,
      ),
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  // Friss moderátor-token generálása (approve + reject URL-ekhez)
  const approveToken = crypto.randomUUID().replace(/-/g, "");
  const rejectToken  = crypto.randomUUID().replace(/-/g, "");

  // Státusz 'pending_admin', token-t az approve-token-re cseréljük
  // (a reject-token-t a moderáció route-on kezeljük: külön paraméterrel)
  await updateEventStatus(event.id, "pending_admin", approveToken);

  const env = getCloudflareEnv();
  const baseUrl = env.PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  // Admin email cím: ADMIN_EVENT_EMAIL → ADMIN_EMAILS első tagja → fallback
  const adminEmail =
    env.ADMIN_EVENT_EMAIL ||
    env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    "info@kinti.app";

  try {
    await sendEventAdminModerationEmail({
      adminEmail,
      eventId: event.id,
      title: event.title,
      eventDate: event.eventDate ?? "",
      startTime: event.startTime ?? "",
      venue: event.venue ?? "",
      description: event.description ?? null,
      tag: event.tag ?? null,
      submitterEmail: event.email ?? "(ismeretlen)",
      approveUrl: `${baseUrl}/api/events/moderate/${approveToken}?action=approve`,
      rejectUrl:  `${baseUrl}/api/events/moderate/${approveToken}?action=reject`,
    });
  } catch {
    // Admin-email küldési hiba NEM blokkolja a felhasználó visszajelzését,
    // csak logolja (a D1-ben már pending_admin státuszban van az esemény)
    // Az event.id NEM PII (slug-jellegű), de a központi helperen megy
    safeLogError(`[events/confirm] admin email failed for ${event.id}`, undefined);
  }

  return new Response(
    buildPage(
      "Email megerősítve! ✅",
      "Köszönjük! Az eseményedet egy moderátor hamarosan ellenőrzi, és ha minden rendben van, néhány órán belül megjelenik a kinti.app naptárban.",
      true,
    ),
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function buildPage(title: string, message: string, success: boolean): string {
  const iconColor = success ? "#1d4434" : "#c8392e";
  const icon = success ? "✅" : "❌";
  return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title} — kinti.app</title>
  <style>
    body { margin: 0; background: #f4ede0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100dvh; padding: 24px; box-sizing: border-box; }
    .card { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(14,31,23,.08); max-width: 420px; width: 100%; padding: 36px 32px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { margin: 0 0 12px; font-size: 22px; font-weight: 800; color: ${iconColor}; letter-spacing: -.02em; }
    p { margin: 0 0 24px; font-size: 14.5px; line-height: 1.6; color: #5c6d63; }
    a { display: inline-block; padding: 12px 24px; background: #1d4434; color: #fff; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 700; }
    .logo { font-size: 16px; font-weight: 800; color: #0e1f17; margin-bottom: 28px; letter-spacing: -.02em; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .logo-dot { width: 20px; height: 20px; background: #1d4434; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><div class="logo-dot"></div>kinti</div>
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Vissza a főoldalra</a>
  </div>
</body>
</html>`;
}
