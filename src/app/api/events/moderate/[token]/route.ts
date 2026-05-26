import { NextResponse } from "next/server";
import { getEventByToken, updateEventStatus, deleteEvent } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/events/moderate/[token]?action=approve|reject
 *
 * Az ADMIN kattint ide az email-jéből (1 kattintásos moderáció).
 * - action=approve → status='approved', token=null (megjelenik az oldalon)
 * - action=reject  → az esemény törlődik az adatbázisból
 */
export async function GET(
  req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action !== "approve" && action !== "reject") {
    return new Response(
      buildPage("Érvénytelen kérés", "Hiányzó vagy érvénytelen action paraméter.", false),
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const event = await getEventByToken(token);

  if (!event || event.status !== "pending_admin") {
    return new Response(
      buildPage(
        "Érvénytelen vagy lejárt link",
        "Ez a moderációs link már nem érvényes, vagy az eseményt már korábban feldolgoztuk.",
        false,
      ),
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  if (action === "approve") {
    await updateEventStatus(event.id, "approved", null);
    return new Response(
      buildPage(
        "Esemény jóváhagyva! ✅",
        `„${event.title}" mostantól látható a kinti.app eseménynaptárban. Köszönjük a moderációt!`,
        true,
      ),
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  // action === "reject"
  await deleteEvent(event.id);
  return new Response(
    buildPage(
      "Esemény elutasítva ❌",
      `„${event.title}" véglegesen törölve. A beküldő nem kap értesítést erről.`,
      false,
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
  <title>${title} — kinti Admin</title>
  <style>
    body { margin: 0; background: #f4ede0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100dvh; padding: 24px; box-sizing: border-box; }
    .card { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(14,31,23,.08); max-width: 420px; width: 100%; padding: 36px 32px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #f4ede0; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #5c6d63; margin-bottom: 16px; }
    h1 { margin: 0 0 12px; font-size: 22px; font-weight: 800; color: ${iconColor}; letter-spacing: -.02em; }
    p { margin: 0 0 24px; font-size: 14.5px; line-height: 1.6; color: #5c6d63; }
    a { display: inline-block; padding: 12px 24px; background: #1d4434; color: #fff; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 700; }
    .logo { font-size: 16px; font-weight: 800; color: #0e1f17; margin-bottom: 28px; letter-spacing: -.02em; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .logo-dot { width: 20px; height: 20px; background: #1d4434; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><div class="logo-dot"></div>kinti Admin</div>
    <div class="badge">Esemény moderáció</div>
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Vissza a főoldalra</a>
  </div>
</body>
</html>`;
}
