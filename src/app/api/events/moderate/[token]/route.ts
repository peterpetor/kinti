import { NextResponse } from "next/server";
import {
  getEventByToken,
  updateEventStatus,
  deleteEvent,
} from "@/lib/repo";
import { notifyCanton } from "@/lib/push-notify";
import { cantonFromAddress } from "@/lib/cantons";
import type { KintiEvent } from "@/lib/types";

/**
 * Automatikus, titkosított-payloados push az új (most jóváhagyott) eseményről.
 * A kanton elsősorban a strukturált `cantonCode`-ból jön (iCal-sync tölti);
 * ha nincs, a helyszínből (PLZ → kanton); ha az sincs, mindenkinek megy.
 * A jóváhagyást SOHA nem töri meg, ha a push hibázik (try/catch a hívónál).
 */
async function notifyNewEvent(event: KintiEvent): Promise<void> {
  const cantonCode = event.cantonCode ?? cantonFromAddress(event.venue)?.code ?? null;
  await notifyCanton(cantonCode, {
    title: "Új esemény a kantonodban 📅",
    body: event.title,
    url: "/kozosseg",
  }, "event");
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/events/moderate/[token]?action=approve|reject
 *
 * Az ADMIN kattint ide az email-jéből (1 kattintásos moderáció).
 * - action=approve → status='approved', token=null (megjelenik az oldalon)
 * - action=reject  → az esemény törlődik az adatbázisból
 */
function htmlResponse(body: string): Response {
  return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
}

/**
 * GET — CSAK megerősítő oldalt mutat, SEMMILYEN állapotváltozás nem történik.
 *
 * Miért: az email-kliensek és vírusirtók (Gmail/Outlook/céges scanner) a
 * háttérben előtöltik (prefetch) a linkeket. Ha a GET végezné a jóváhagyást /
 * törlést, egy szkenner a moderátor megnyitása ELŐTT lefuttatná — a `reject`
 * ág pedig véglegesen törölné az eseményt. Ezért a tényleges művelet POST-ra
 * (gombnyomásra) történik; a prefetcherek nem POST-olnak és nem submitelnek űrlapot.
 */
export async function GET(
  req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const action = new URL(req.url).searchParams.get("action");

  if (action !== "approve" && action !== "reject") {
    return htmlResponse(buildPage("Érvénytelen kérés", "Hiányzó vagy érvénytelen action paraméter.", false));
  }

  const event = await getEventByToken(token);
  if (!event || event.status !== "pending_admin") {
    return htmlResponse(buildPage(
      "Érvénytelen vagy lejárt link",
      "Ez a moderációs link már nem érvényes, vagy az eseményt már korábban feldolgoztuk.",
      false,
    ));
  }

  return htmlResponse(buildConfirmPage(event, action, token));
}

/**
 * POST — a tényleges moderációs művelet (a megerősítő oldal gombja indítja).
 */
export async function POST(
  req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const action = new URL(req.url).searchParams.get("action");

  if (action !== "approve" && action !== "reject") {
    return htmlResponse(buildPage("Érvénytelen kérés", "Hiányzó vagy érvénytelen action paraméter.", false));
  }

  const event = await getEventByToken(token);
  if (!event || event.status !== "pending_admin") {
    return htmlResponse(buildPage(
      "Érvénytelen vagy lejárt link",
      "Ez a moderációs link már nem érvényes, vagy az eseményt már korábban feldolgoztuk.",
      false,
    ));
  }

  if (action === "approve") {
    await updateEventStatus(event.id, "approved", null);
    // Automatikus push-értesítés a friss eseményről (a feliratkozóknak).
    try {
      await notifyNewEvent(event);
    } catch {
      /* a push hibája ne akadályozza a jóváhagyást */
    }
    return htmlResponse(buildPage(
      "Esemény jóváhagyva! ✅",
      `„${escapeHtml(event.title)}" mostantól látható a kinti.app eseménynaptárban. Köszönjük a moderációt!`,
      true,
    ));
  }

  // action === "reject"
  await deleteEvent(event.id);
  return htmlResponse(buildPage(
    "Esemény elutasítva ❌",
    `„${escapeHtml(event.title)}" véglegesen törölve. A beküldő nem kap értesítést erről.`,
    false,
  ));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c as never] || c
  );
}

/** Megerősítő oldal (GET) — a tényleges műveletet a gomb POST-olja. */
function buildConfirmPage(event: KintiEvent, action: "approve" | "reject", token: string): string {
  const isApprove = action === "approve";
  const accent = isApprove ? "#1d4434" : "#c8392e";
  const heading = isApprove ? "Esemény jóváhagyása" : "Esemény elutasítása";
  const btnLabel = isApprove ? "✅ Jóváhagyom" : "❌ Elutasítom (végleges törlés)";
  const note = isApprove
    ? "Jóváhagyás után az esemény azonnal megjelenik a kinti.app eseménynaptárban."
    : "Elutasítás után az esemény VÉGLEGESEN törlődik — ez nem vonható vissza.";
  const formAction = `/api/events/moderate/${encodeURIComponent(token)}?action=${action}`;
  const dateLine = [event.eventDate, event.startTime].filter(Boolean).join(" · ");

  return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${heading} — kinti Admin</title>
  <style>
    body { margin: 0; background: #f4ede0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100dvh; padding: 24px; box-sizing: border-box; }
    .card { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(14,31,23,.08); max-width: 420px; width: 100%; padding: 36px 32px; text-align: center; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #f4ede0; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #5c6d63; margin-bottom: 16px; }
    h1 { margin: 0 0 16px; font-size: 21px; font-weight: 800; color: ${accent}; letter-spacing: -.02em; }
    .event { background: #f7f3ea; border-radius: 14px; padding: 16px; margin-bottom: 16px; text-align: left; }
    .ev-title { margin: 0 0 4px; font-size: 15px; font-weight: 800; color: #0e1f17; }
    .ev-meta { margin: 2px 0 0; font-size: 13px; color: #5c6d63; }
    .note { margin: 0 0 22px; font-size: 13px; line-height: 1.55; color: #5c6d63; }
    .btn { display: inline-block; width: 100%; padding: 14px 24px; background: ${accent}; color: #fff; border: 0; border-radius: 999px; font-size: 15px; font-weight: 800; cursor: pointer; }
    .logo { font-size: 16px; font-weight: 800; color: #0e1f17; margin-bottom: 24px; letter-spacing: -.02em; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .logo-dot { width: 20px; height: 20px; background: #1d4434; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><div class="logo-dot"></div>kinti Admin</div>
    <div class="badge">Esemény moderáció</div>
    <h1>${heading}</h1>
    <div class="event">
      <p class="ev-title">${escapeHtml(event.title)}</p>
      ${dateLine ? `<p class="ev-meta">${escapeHtml(dateLine)}</p>` : ""}
      ${event.venue ? `<p class="ev-meta">${escapeHtml(event.venue)}</p>` : ""}
    </div>
    <p class="note">${note}</p>
    <form method="POST" action="${formAction}">
      <button type="submit" class="btn">${btnLabel}</button>
    </form>
  </div>
</body>
</html>`;
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
