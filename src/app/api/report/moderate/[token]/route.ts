import {
  getContentReportByToken,
  updateContentReportStatus,
  setBulletinHidden,
  setReviewHidden,
  deleteBulletinPostById,
  deleteReviewById,
  recomputeBusinessRating,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/report/moderate/[token]?action=keep|remove
 *
 * Az admin az emailjéből kattint ide (1 kattintásos döntés a bejelentett
 * tartalomról):
 *   - keep   → a rejtés feloldása (a tartalom újra látható), report = 'kept'
 *   - remove → a tartalom végleges törlése, report = 'removed'
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const action = new URL(req.url).searchParams.get("action");
  if (action !== "keep" && action !== "remove") {
    return html("Érvénytelen kérés", "Hiányzó vagy érvénytelen action paraméter.", false);
  }

  const report = await getContentReportByToken(params.token);
  if (!report || report.status !== "open") {
    return html(
      "Érvénytelen vagy feldolgozott link",
      "Ez a moderációs link már nem érvényes, vagy a bejelentést korábban már elbíráltuk.",
      false,
    );
  }

  if (action === "keep") {
    if (report.contentType === "bulletin") {
      await setBulletinHidden(report.contentId, false);
    } else {
      const businessId = await setReviewHidden(report.contentId, false);
      if (businessId) await recomputeBusinessRating(businessId);
    }
    await updateContentReportStatus(params.token, "kept");
    return html(
      "Visszaállítva ✅",
      "A tartalom rejtését feloldottuk — újra látható a kinti.app-on.",
      true,
    );
  }

  // action === "remove"
  if (report.contentType === "bulletin") {
    await deleteBulletinPostById(report.contentId);
  } else {
    const businessId = await deleteReviewById(report.contentId);
    if (businessId) await recomputeBusinessRating(businessId);
  }
  await updateContentReportStatus(params.token, "removed");
  return html("Véglegesen törölve 🗑", "A bejelentett tartalmat véglegesen töröltük.", true);
}

function html(title: string, message: string, success: boolean): Response {
  const iconColor = success ? "#1d4434" : "#c8392e";
  const icon = success ? "✅" : "⚠️";
  const page = `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title} — kinti Admin</title>
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
    <div class="logo"><div class="logo-dot"></div>kinti Admin</div>
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Vissza a főoldalra</a>
  </div>
</body>
</html>`;
  return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } });
}
