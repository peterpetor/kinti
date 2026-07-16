import { NextResponse } from "next/server";
import {
  getReviewSummaryById,
  setReviewHidden,
  recomputeBusinessRating,
  getBusinessById,
  setBusinessHidden,
  createContentReport,
  countRecentReports,
  getB2bProjectBasic,
  setB2bProjectStatus,
  getStoryAdminById,
  setStoryPublicVisibility,
  getServiceRequestBasic,
  setServiceRequestVisibility,
  getHousingListingBasic,
  setHousingListingVisibility,
} from "@/lib/repo";
import { hashIp } from "@/lib/security";
import { sendContentReportEmail } from "@/lib/email";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getSosAlertById, hideSosAlert } from "@/lib/sos-repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/report — vállalkozás, vélemény, SOS, B2B projekt, élettörténet vagy
 * Keresek-hirdetés bejelentése (Notice & Takedown, DSA Art. 16).
 * Body: { contentType: "business" | "review" | "sos" | "b2b" | "story" | "request", contentId, reason }
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

  const contentType =
    body.contentType === "business" || body.contentType === "review" || body.contentType === "sos" ||
    body.contentType === "b2b" || body.contentType === "story" || body.contentType === "request" ||
    body.contentType === "housing"
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

  if (contentType === "business") {
    const biz = await getBusinessById(contentId);
    if (biz) {
      found = true;
      contentLabel = "Vállalkozás / Szakember";
      contentExcerpt = biz.name;
      await setBusinessHidden(contentId, true);
    }
  } else if (contentType === "review") {
    const review = await getReviewSummaryById(contentId);
    if (review) {
      found = true;
      contentLabel = "Vélemény";
      contentExcerpt = `${review.reviewerName}: ${review.body.slice(0, 160)}`;
      await setReviewHidden(contentId, true);
      await recomputeBusinessRating(review.businessId);
    }
  } else if (contentType === "sos") {
    const sos = await getSosAlertById(contentId);
    if (sos) {
      found = true;
      contentLabel = "S.O.S. Riasztás";
      contentExcerpt = `Tel: ${sos.contactPhone} - ${sos.description.slice(0, 160)}`;
      await hideSosAlert(contentId);
    }
  } else if (contentType === "b2b") {
    const project = await getB2bProjectBasic(contentId);
    if (project) {
      found = true;
      contentLabel = "B2B projekt";
      contentExcerpt = project.title.slice(0, 160);
      // Azonnali rejtés a feedből ('closed'); admin „keep" visszanyitja.
      await setB2bProjectStatus(contentId, "closed");
    }
  } else if (contentType === "story") {
    const story = await getStoryAdminById(contentId);
    if (story) {
      found = true;
      contentLabel = "Élettörténet";
      contentExcerpt = story.title.slice(0, 160);
      // Azonnali rejtés (vissza a moderációs sorba); admin „keep" visszaállítja.
      await setStoryPublicVisibility(contentId, false);
    }
  } else if (contentType === "request") {
    const request = await getServiceRequestBasic(contentId);
    if (request) {
      found = true;
      contentLabel = "Keresek-hirdetés";
      contentExcerpt = request.title.slice(0, 160);
      // Azonnali rejtés a tábláról; a routed_at claim marad (keep nem routol újra).
      await setServiceRequestVisibility(contentId, false);
    }
  } else if (contentType === "housing") {
    const listing = await getHousingListingBasic(contentId);
    if (listing) {
      found = true;
      contentLabel = "Albérlet-hirdetés";
      contentExcerpt = `${listing.city}: ${listing.description.slice(0, 160)}`;
      // Azonnali levétel a börzéről; admin „keep" visszaállítja.
      await setHousingListingVisibility(contentId, false);
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
    // contentType/contentId nem PII (típus + slug), de a központi helperen
    safeLogError(`[report] admin email failed (${contentType}/${contentId})`, undefined);
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
