import { NextResponse } from "next/server";
import {
  getReviewSummaryById,
  setReviewHidden,
  recomputeBusinessRating,
  getBusinessById,
  setBusinessHidden,
  createContentReport,
  countRecentReports,
  countRecentReportsGlobal,
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
import { verifyTurnstile } from "@/lib/turnstile";
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

/**
 * ⚠️ AZ AZONNALI REJTÉS KÜSZÖBE — a második védelmi réteg a Turnstile mögött.
 *
 * A Turnstile a scripteket állítja meg, de egy elszánt ember (vagy valódi
 * böngészőt automatizáló bot) kézzel is végigkattinthatna sok tartalmat.
 * Ezért: az első pár bejelentés egy bejelentőtől VÁLTOZATLANUL azonnal rejt —
 * a jóhiszemű használat érintetlen. A küszöb FÖLÖTT a bejelentést továbbra is
 * ELFOGADJUK és rögzítjük (a fogadás jogszabályi kötelezettség), az adminnak
 * is szólunk, de a tartalom NEM tűnik el magától: emberi döntésre vár.
 *
 * ⚠️ Ez NEM a DSA-megfelelés gyengítése: a rendelet a bejelentés FOGADÁSÁT és
 * gondos elbírálását írja elő, nem az automatikus levételt — sőt a 23. cikk
 * kifejezetten megengedi a visszaélésszerű bejelentőkkel szembeni fellépést.
 *
 * A küszöb szándékosan bőkezű: az app teljes eddigi élete alatt ÖSSZESEN 3
 * bejelentés érkezett, tehát bármilyen sorozat eleve rendellenes.
 */
const AUTO_HIDE_LIMIT_PER_HOUR = 3;

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

  const ip = req.headers.get("cf-connecting-ip") ?? null;

  // ⚠️⚠️ BOT-VÉDELEM — EZ HIÁNYZOTT, ÉS EZ VOLT A LEGNAGYOBB LYUK.
  //
  // A bejelentés AZONNAL elrejti a tartalmat. Turnstile nélkül egy script
  // végigmehetett a 2353 vállalkozás azonosítóján, és csak az órás IP-korlát
  // állt az útjában — forgatott címekről az egész szaknévsor eltüntethető lett
  // volna. A vélemény-végpont ugyanezt a védelmet régóta használja; itt nem volt.
  //
  // ⚠️ SZÁNDÉKOSAN FAIL-CLOSED (hiányzó kulcsnál is elutasít): a Turnstile
  // megkerülhetősége itt súlyosabb, mint a rövid kiesés — ÉS a bejelentésnek
  // VAN kulcs nélküli útja is, az info@kinti.app cím, amit a felület minden
  // „Jelentem" gomb mellett kiír. A DSA-kötelezettség tehát akkor is teljesül,
  // ha a robot-ellenőrzés épp nem elérhető.
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      {
        error:
          "A robot-ellenőrzés sikertelen. Próbáld újra — ha nem megy, írj az info@kinti.app címre, azt is feldolgozzuk.",
        codes: captcha.errorCodes,
      },
      { status: 400 },
    );
  }

  // IP-alapú rate-limit (a Turnstile MELLÉ — az önmagában nem elég egy elszánt
  // támadó ellen, aki valódi böngészőt automatizál)
  const ipHash = await hashIp(ip);
  const fromThisIp = await countRecentReports(ipHash);
  if (fromThisIp >= REPORTS_PER_HOUR) {
    return NextResponse.json(
      { error: "Túl sok jelentés rövid idő alatt. Próbáld később." },
      { status: 429 },
    );
  }

  // ⚠️ VISSZAÉLÉS-JELZÉS AZ ADMINNAK (nem blokkol!).
  //
  // A bejelentés AZONNAL elrejti a tartalmat, és ez szándékos (DSA Art. 16
  // notice-and-action). Csakhogy így egyetlen IP óránként 8 vállalkozást tud
  // levenni, több címről pedig ennél jóval többet — miközben az operátorhoz
  // 50 KÜLÖNÁLLÓ e-mail érkezne, összefüggés nélkül, és a kampány órákig
  // észrevétlen maradhatna.
  //
  // A per-IP korlát egyetlen támadót fékez, de a megosztott/VPN-nel forgatott
  // címeket nem látja — ezért a GLOBÁLIS órás darabszámot is nézzük.
  // ⚠️ Ez SEM blokkol: a bejelentés fogadása kötelezettség, nem korlátozható
  // el egy küszöbbel. Csak feltűnőbbé tesszük a levelet.
  const globalLastHour = await countRecentReportsGlobal();
  const warnings: string[] = [];
  if (fromThisIp >= 2) warnings.push(`ebből a bejelentőből ez a ${fromThisIp + 1}. bejelentés egy órán belül`);
  if (globalLastHour >= 10) warnings.push(`az elmúlt órában összesen ${globalLastHour + 1} bejelentés érkezett`);
  const abuseWarning = warnings.length ? warnings.join("; ") : null;

  // A küszöb fölött a bejelentés ÉRVÉNYES, de nem rejt automatikusan.
  const autoHide = fromThisIp < AUTO_HIDE_LIMIT_PER_HOUR;

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
      if (autoHide) await setBusinessHidden(contentId, true);
    }
  } else if (contentType === "review") {
    const review = await getReviewSummaryById(contentId);
    if (review) {
      found = true;
      contentLabel = "Vélemény";
      contentExcerpt = `${review.reviewerName}: ${review.body.slice(0, 160)}`;
      if (autoHide) {
        await setReviewHidden(contentId, true);
        await recomputeBusinessRating(review.businessId);
      }
    }
  } else if (contentType === "sos") {
    const sos = await getSosAlertById(contentId);
    if (sos) {
      found = true;
      contentLabel = "S.O.S. Riasztás";
      contentExcerpt = `Tel: ${sos.contactPhone} - ${sos.description.slice(0, 160)}`;
      if (autoHide) await hideSosAlert(contentId);
    }
  } else if (contentType === "b2b") {
    const project = await getB2bProjectBasic(contentId);
    if (project) {
      found = true;
      contentLabel = "B2B projekt";
      contentExcerpt = project.title.slice(0, 160);
      // Azonnali rejtés a feedből ('closed'); admin „keep" visszanyitja.
      if (autoHide) await setB2bProjectStatus(contentId, "closed");
    }
  } else if (contentType === "story") {
    const story = await getStoryAdminById(contentId);
    if (story) {
      found = true;
      contentLabel = "Élettörténet";
      contentExcerpt = story.title.slice(0, 160);
      // Azonnali rejtés (vissza a moderációs sorba); admin „keep" visszaállítja.
      if (autoHide) await setStoryPublicVisibility(contentId, false);
    }
  } else if (contentType === "request") {
    const request = await getServiceRequestBasic(contentId);
    if (request) {
      found = true;
      contentLabel = "Keresek-hirdetés";
      contentExcerpt = request.title.slice(0, 160);
      // Azonnali rejtés a tábláról; a routed_at claim marad (keep nem routol újra).
      if (autoHide) await setServiceRequestVisibility(contentId, false);
    }
  } else if (contentType === "housing") {
    const listing = await getHousingListingBasic(contentId);
    if (listing) {
      found = true;
      contentLabel = "Albérlet-hirdetés";
      contentExcerpt = `${listing.city}: ${listing.description.slice(0, 160)}`;
      // Azonnali levétel a börzéről; admin „keep" visszaállítja.
      if (autoHide) await setHousingListingVisibility(contentId, false);
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
      abuseWarning,
      hidden: autoHide,
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
