import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { cantonFromAddress, matchCantonByName, CANTONS } from "@/lib/cantons";
import {
  sendLeadRequestEmail,
  sendLeadConfirmEmail,
} from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_BUSINESSES = 15; // Egyszerre max ennyi cégnek küldünk
const MIN_MESSAGE_LENGTH = 20;

interface BusinessContactRow {
  id: string;
  name: string;
  contact_email: string | null;
  address: string | null;
  category_id: string;
  category_label: string | null;
}

/**
 * POST /api/szaknevsor/ajanlatkeres
 *
 * Body: {
 *   name: string,
 *   email: string,
 *   phone?: string,
 *   categoryId: string,
 *   categoryLabel: string,
 *   cantonCode?: string,   // 2-betűs kód vagy "all"
 *   message: string,
 *   _hp?: string,          // honeypot — botok kitöltik, emberek nem
 * }
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ?? null;
    const ipHash = await hashIp(ip);

    // ── Rate limit #1: max 3 árajánlat-kérés / IP / óra ────────────────────
    const rateLimitHour = await checkAiRateLimit("lead-request", ipHash);
    if (!rateLimitHour.allowed) {
      return NextResponse.json(
        { error: "Túl sok árajánlat-kérés. Próbáld újra 1 óra múlva." },
        { status: 429 },
      );
    }

    // ── Rate limit #2: max 5 árajánlat-kérés / IP / nap ─────────────────────
    const rateLimitDay = await checkAiRateLimit("lead-request-day", ipHash);
    if (!rateLimitDay.allowed) {
      return NextResponse.json(
        { error: "Napi limit elérve. Próbáld újra holnap." },
        { status: 429 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // ── Honeypot ellenőrzés — bot-szűrő CAPTCHA nélkül ──────────────────────
    // A _hp mező rejtett az UI-ban; ember soha nem tölti ki.
    const honeypot = typeof body._hp === "string" ? body._hp : "";
    if (honeypot.length > 0) {
      // Csendesen elfogadjuk (ne tudja a bot hogy felfedeztük), de nem küldünk
      return NextResponse.json(
        { ok: true, sent: 0, total: 0 },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
    const categoryLabel = typeof body.categoryLabel === "string" ? body.categoryLabel.trim() : "";
    const cantonCode = typeof body.cantonCode === "string" ? body.cantonCode.trim() : "all";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Validáció
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Kérjük add meg a neved (min. 2 karakter)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Válassz kategóriát." }, { status: 400 });
    }
    if (message.length < MIN_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Írj részletesebb üzenetet (min. ${MIN_MESSAGE_LENGTH} karakter).` },
        { status: 400 },
      );
    }

    // Kanton validáció
    const validCantonCodes = new Set(["all", ...CANTONS.map((c) => c.code)]);
    if (!validCantonCodes.has(cantonCode)) {
      return NextResponse.json({ error: "Érvénytelen kanton-kód." }, { status: 400 });
    }

    // ── Dedup: ugyanaz az email + kategória 24 órán belül? ──────────────────
    // Megakadályozza, hogy ugyanaz a személy ugyanabba a kategóriába 1 napon
    // belül többször is leadet küldjön (pl. véletlen dupla submit, vagy szándékos).
    const emailHash = await hashIp(email); // sha-256 az emailre is
    const dedupKey = `lead-cat-${categoryId}-${emailHash}`;
    const dedupRow = await getDB()
      .prepare(
        `SELECT COUNT(*) AS n FROM ai_rate_limit_log
         WHERE ip_hash = ? AND endpoint = 'lead-dedup'
           AND created_at >= datetime('now', '-24 hours')`,
      )
      .bind(dedupKey)
      .first<{ n: number }>();
    if ((dedupRow?.n ?? 0) > 0) {
      return NextResponse.json(
        { error: "Ebbe a kategóriába az elmúlt 24 órán belül már küldtél árajánlat-kérést. Kérjük várj egy napot." },
        { status: 429 },
      );
    }

    // Vállalkozások lekérése kategória + email szűrővel
    // lead_opt_out = 0 → csak azok kapják, akik nem iratkoztak le
    const { results: allBusinesses } = await getDB()
      .prepare(
        `SELECT id, name, contact_email, address, category_id, category_label
         FROM businesses
         WHERE category_id = ?
           AND COALESCE(hidden, 0) = 0
           AND moderation_status = 1
           AND contact_email IS NOT NULL
           AND length(trim(contact_email)) > 0
           AND COALESCE(lead_opt_out, 0) = 0
         ORDER BY featured DESC, rating DESC
         LIMIT 200`,
      )
      .bind(categoryId)
      .all<BusinessContactRow>();

    // Kanton szűrés JS-ben (nincs canton_code oszlop a táblában)
    let filtered = allBusinesses;
    if (cantonCode !== "all") {
      filtered = allBusinesses.filter((b) => {
        const canton = cantonFromAddress(b.address) || matchCantonByName(b.address ?? "");
        return canton?.code === cantonCode;
      });
      // Ha a kanton szűrővel nem találtunk senkit, adjuk az összes kategóriabeli vállalkozást vissza
      if (filtered.length === 0) {
        filtered = allBusinesses;
      }
    }

    // Legfeljebb MAX_BUSINESSES cégnek küldünk
    const targets = filtered.slice(0, MAX_BUSINESSES);

    if (targets.length === 0) {
      return NextResponse.json(
        {
          error:
            "Sajnos nem találtunk aktív vállalkozót ebben a kategóriában. Próbálj más kategóriát vagy böngészd a Szaknévsort!",
        },
        { status: 404 },
      );
    }

    const effectiveCategoryLabel = categoryLabel || targets[0]?.category_label || categoryId;

    // ── First-ping logika: minden vállalkozónak csak 1 azonnali email/nap ───
    // Ha az adott vállalkozónak aznap már ment azonnali email (first_ping_sent=1),
    // csak DB-be mentjük — a cron küldi ki másnap reggel a digestben.
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Azok a vállalkozók akiknek MA már ment first-ping
    const { results: alreadyPingedRows } = await getDB()
      .prepare(
        `SELECT DISTINCT business_id FROM business_leads
         WHERE business_id IN (${targets.map(() => "?").join(",")})
           AND first_ping_sent = 1
           AND created_at >= ?`,
      )
      .bind(...targets.map((b) => b.id), `${today} 00:00:00`)
      .all<{ business_id: string }>();

    const alreadyPingedSet = new Set(alreadyPingedRows.map((r) => r.business_id));

    // Csak az első-pingeseknek küldjük az azonnali emailt
    const firstPingTargets = targets.filter((b) => !alreadyPingedSet.has(b.id));
    const digestOnlyTargets = targets.filter((b) => alreadyPingedSet.has(b.id));

    // Email küldés — csak a first-ping célpontoknak, best-effort
    const emailResults = await Promise.allSettled(
      firstPingTargets.map((biz) =>
        sendLeadRequestEmail({
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          categoryLabel: effectiveCategoryLabel,
          message,
          business: {
            name: biz.name,
            contactEmail: biz.contact_email!,
          },
        }),
      ),
    );

    const sentCount = emailResults.filter((r) => r.status === "fulfilled").length;

    // Lead mentése DB-be minden célpontnál (best-effort)
    const { incrementBusinessAnalytic, createBusinessLead } = await import("@/lib/repo");
    await Promise.allSettled([
      ...firstPingTargets.flatMap((biz) => [
        incrementBusinessAnalytic(biz.id, "lead", null),
        createBusinessLead({
          businessId: biz.id,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          categoryLabel: effectiveCategoryLabel,
          message,
          firstPingSent: true,
        }),
      ]),
      ...digestOnlyTargets.flatMap((biz) => [
        incrementBusinessAnalytic(biz.id, "lead", null),
        createBusinessLead({
          businessId: biz.id,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          categoryLabel: effectiveCategoryLabel,
          message,
          firstPingSent: false,
        }),
      ]),
    ]);

    // Visszaigazolás a kérező felhasználónak
    try {
      await sendLeadConfirmEmail({
        to: email,
        senderName: name,
        categoryLabel: effectiveCategoryLabel,
        businessCount: targets.length,
      });
    } catch (confirmErr) {
      safeLogError("lead-request/confirm-email", confirmErr);
      // Nem fatális — a kérés ment
    }

    // Rate limit naplózása mindkét ablakhoz + dedup kulcs
    await logAiRateLimit("lead-request", ipHash);
    await logAiRateLimit("lead-request-day", ipHash);
    // Dedup: az email+kategória kombinációt is naplózzuk
    try {
      await getDB()
        .prepare(`INSERT INTO ai_rate_limit_log (id, endpoint, ip_hash) VALUES (?, 'lead-dedup', ?)`)
        .bind(crypto.randomUUID(), dedupKey)
        .run();
    } catch (e) {
      safeLogError("lead-request/dedup-log", e);
    }

    return NextResponse.json(
      { ok: true, sent: sentCount, total: targets.length },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/szaknevsor/ajanlatkeres", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}
