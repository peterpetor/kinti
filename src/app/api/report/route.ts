import { NextResponse } from "next/server";
import {
  getBulletinPostById,
  getReviewSummaryById,
  setBulletinHidden,
  setReviewHidden,
  recomputeBusinessRating,
  createContentReport,
  countRecentReports,
} from "@/lib/repo";
import { hashIp } from "@/lib/bulletin";
import { sendContentReportEmail } from "@/lib/email";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/report — egy hirdetés vagy vélemény bejelentése (Notice & Takedown).
 * Body: { contentType: "bulletin" | "review", contentId, reason }
 *
 * Hatás: a tartalmat AZONNAL elrejtjük a publikum elől (hidden=1), és értesítjük
 * az admint (visszaállítás / végleges törlés linkekkel). Abuse ellen IP-alapú
 * rate-limit + kötelező indok.
 */
const REPORTS_PER_HOUR = 8;

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const contentType = body.contentType === "bulletin" || body.contentType === "review"
    ? body.contentType
    : null;
  const contentId = typeof body.contentId === "string" ? body.contentId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!contentType || !contentId) {
    return NextResponse.json({ error: "Hiányzó adat." }, { status: 400 });
  }
  if (reason.length < 3) {
    return NextResponse.json({ error: "Kérlek, írd le röviden, miért jelented." }, { status: 400 });
  }
  if (reason.length > 1000) {
    return NextResponse.json({ error: "Az indok túl hosszú." }, { status: 400 });
  }

  // IP-alapú rate-limit (abuse / tömeges jelentgetés ellen)
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = await hashIp(ip);
  if ((await countRecentReports(ipHash)) >= REPORTS_PER_HOUR) {
    return NextResponse.json(
      { error: "Túl sok jelentés rövid idő alatt. Próbáld később." },
      { status: 429 },
    );
  }

  // A tartalom kivonata + létezés-ellenőrzés
  let contentLabel = "";
  let contentExcerpt = "";
  let found = false;

  if (contentType === "bulletin") {
    const post = await getBulletinPostById(contentId);
    if (post) {
      found = true;
      contentLabel = "Hirdetés";
      contentExcerpt = post.title;
      await setBulletinHidden(contentId, true);
    }
  } else {
    const review = await getReviewSummaryById(contentId);
    if (review) {
      found = true;
      contentLabel = "Vélemény";
      contentExcerpt = `${review.reviewerName}: ${review.body.slice(0, 160)}`;
      await setReviewHidden(contentId, true);
      await recomputeBusinessRating(review.businessId);
    }
  }

  // Enumeráció ellen: akkor is 200-at adunk, ha nem találtuk; csak ha van, hidünk+emailezünk.
  if (!found) {
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  }

  const moderateToken = crypto.randomUUID().replace(/-/g, "");
  await createContentReport({
    id: crypto.randomUUID(),
    contentType,
    contentId,
    reason,
    reporterIpHash: ipHash,
    moderateToken,
  });

  const env = getCloudflareEnv();
  const baseUrl = env.PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  const adminEmail =
    env.ADMIN_EVENT_EMAIL || env.ADMIN_EMAILS?.split(",")[0]?.trim() || "info@kinti.app";

  try {
    await sendContentReportEmail({
      adminEmail,
      contentLabel,
      contentExcerpt,
      reason,
      keepUrl: `${baseUrl}/api/report/moderate/${moderateToken}?action=keep`,
      removeUrl: `${baseUrl}/api/report/moderate/${moderateToken}?action=remove`,
    });
  } catch {
    // Az admin-email hibája nem blokkolja a választ — a tartalom már rejtve van.
    console.error("Jelentés admin-email hiba:", contentType, contentId);
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
