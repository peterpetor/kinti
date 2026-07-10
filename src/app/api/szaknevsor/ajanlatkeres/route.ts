import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";
import { hashIp, hashEmail } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { cantonFromAddress, matchCantonByName } from "@/lib/cantons";
import { REGIONS, getRegions } from "@/lib/regions";
import { isValidCountry } from "@/lib/countries";
import {
  sendLeadRequestEmail,
  sendLeadLockedEmail,
  sendLeadConfirmEmail,
} from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Max ennyi (legjobban illeszkedő) cégnek küldünk egy árajánlat-kérést. 15 → 3:
// drasztikus email-spórolás (a Resend 100/nap free-tier fő fogyasztója ez volt),
// és a „kérj 3 árajánlatot" amúgy is bevett, jobb minőségű minta a 15-szöri spam helyett.
const MAX_BUSINESSES = 3;
// Lead-fogadás = Szaknévsor PRO (featured) perk: ha van featured cég a kategóriában,
// ŐK kapják a leadet. Nem-featured cég csak FALLBACK-ként, hogy a kérő mindig kapjon
// legalább ennyi árajánlatot (különben holt a funkció, és nincs mit eladni).
const LEAD_MIN_RECIPIENTS = 2;
const MIN_MESSAGE_LENGTH = 20;
// A top-3 emailes címzetten FELÜL ennyi további kategóriabeli cég kapja meg a leadet
// DB-be mentve (email NÉLKÜL — a reggeli digest értesíti őket, 1 email/nap/cég).
// Nem-PRO extra címzettnek MINDIG zárolt (kontakt rejtve → Szaknévsor PRO-upsell),
// és a zárolt lead nem fogyasztja a havi 5 ingyenes keretet (countBusinessLeadsThisMonth).
const EXTRA_LOCKED_MAX = 7;

interface BusinessContactRow {
  id: string;
  name: string;
  contact_email: string | null;
  address: string | null;
  category_id: string;
  category_label: string | null;
  featured: number;
  canton_code: string | null;
  country_code: string | null;
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
 *   cantonCode?: string,   // régió-kód (ország-tudatos: kanton/Bundesland/provincia) vagy "all"
 *   country?: string,      // CH/AT/DE/NL — a fan-out erre az országra célzódik
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
    // Ország a fan-out célzásához (a kérő app-országa). Régi kliens nem küldi →
    // null = nincs ország-szűrés (a korábbi viselkedés), de a régió-kód akkor is
    // mind a 4 ország kódkészlete ellen validálódik (ne 400-azzon az AT Bundesland).
    const rawCountry = typeof body.country === "string" ? body.country.trim() : null;
    const country = isValidCountry(rawCountry) ? rawCountry : null;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    // DIREKT mód: a cégprofil „Árajánlat" gombja EGY konkrét cégnek küld —
    // ilyenkor nincs kategória/kanton fan-out, a kategória a cégből jön.
    const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";

    // Validáció
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Kérjük add meg a neved (min. 2 karakter)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
    }
    if (!businessId && !categoryId) {
      return NextResponse.json({ error: "Válassz kategóriát." }, { status: 400 });
    }
    if (message.length < MIN_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Írj részletesebb üzenetet (min. ${MIN_MESSAGE_LENGTH} karakter).` },
        { status: 400 },
      );
    }

    // Régió-validáció — ORSZÁG-TUDATOS (a régi, csak-svájci CANTONS-lista 400-at
    // dobott minden AT/DE/NL régió-választásra — binary-country-fallthrough eset).
    const validRegionCodes = new Set([
      "all",
      ...(country
        ? getRegions(country).map((r) => r.code)
        : Object.values(REGIONS).flatMap((rs) => rs.map((r) => r.code))),
    ]);
    if (!validRegionCodes.has(cantonCode)) {
      return NextResponse.json({ error: "Érvénytelen régió-kód." }, { status: 400 });
    }

    // ── Dedup: ugyanaz az email + kategória 24 órán belül? ──────────────────
    // Megakadályozza, hogy ugyanaz a személy ugyanabba a kategóriába 1 napon
    // belül többször is leadet küldjön (pl. véletlen dupla submit, vagy szándékos).
    const emailHash = await hashEmail(email); // email-célú hash (NEM hashIp — az IPv6-ot normalizálna)
    // Direkt módban cégenként dedupolunk (ugyanannak a cégnek 24h-n belül egyszer).
    const dedupKey = businessId ? `lead-biz-${businessId}-${emailHash}` : `lead-cat-${categoryId}-${emailHash}`;
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

    let targets: BusinessContactRow[];
    // Csoportos mód: a top címzetteken FELÜLI kategóriabeli cégek (email nélkül,
    // digest-értesítéssel; nem-PRO-nak zárolt). Direkt módban üres marad.
    let extras: BusinessContactRow[] = [];

    if (businessId) {
      // ── DIREKT mód: a profil-oldalról EGY konkrét cégnek ────────────────────
      const row = await getDB()
        .prepare(
          `SELECT id, name, contact_email, address, category_id, category_label,
                  COALESCE(featured, 0) AS featured, canton_code, country_code
           FROM businesses
           WHERE id = ?
             AND COALESCE(hidden, 0) = 0
             AND moderation_status = 1
             AND contact_email IS NOT NULL
             AND length(trim(contact_email)) > 0
             AND COALESCE(lead_opt_out, 0) = 0
           LIMIT 1`,
        )
        .bind(businessId)
        .first<BusinessContactRow>();
      if (!row) {
        return NextResponse.json(
          { error: "Ez a vállalkozás jelenleg nem fogad ajánlatkérést a Kintin." },
          { status: 404 },
        );
      }
      targets = [row];
    } else {
    // Vállalkozások lekérése kategória + email szűrővel
    // lead_opt_out = 0 → csak azok kapják, akik nem iratkoztak le
    // Ország-szűrő: a kérő országának cégei (nélküle egy berlini kérés a DE „BE"
    // régió-kóddal a berni „BE" kantonba is routolhatott — cross-country lead-bug).
    const { results: allBusinesses } = await getDB()
      .prepare(
        `SELECT id, name, contact_email, address, category_id, category_label,
                COALESCE(featured, 0) AS featured, canton_code, country_code
         FROM businesses
         WHERE category_id = ?
           AND (? IS NULL OR COALESCE(country_code, 'CH') = ?)
           AND COALESCE(hidden, 0) = 0
           AND moderation_status = 1
           AND contact_email IS NOT NULL
           AND length(trim(contact_email)) > 0
           AND COALESCE(lead_opt_out, 0) = 0
         ORDER BY featured DESC, rating DESC
         LIMIT 200`,
      )
      .bind(categoryId, country, country)
      .all<BusinessContactRow>();

    // Régió-szűrés: elsősorban a TÁROLT canton_code (minden országra helyes);
    // a cím-alapú PLZ/név-feloldás CSAK svájci cégre fut fallbackként — a
    // svájci PLZ-táblán egy osztrák/holland cím álpozitív kantont adna.
    let filtered = allBusinesses;
    if (cantonCode !== "all") {
      filtered = allBusinesses.filter((b) => {
        if (b.canton_code) return b.canton_code === cantonCode;
        if ((b.country_code ?? "CH") !== "CH") return false;
        const canton = cantonFromAddress(b.address) || matchCantonByName(b.address ?? "");
        return canton?.code === cantonCode;
      });
      // Ha a kanton szűrővel nem találtunk senkit, adjuk az összes kategóriabeli vállalkozást vissza
      if (filtered.length === 0) {
        filtered = allBusinesses;
      }
    }

    // LEAD-FOGADÁS = Szaknévsor PRO (featured) perk.
    //  • Van featured cég → ŐK kapják a leadet (legfeljebb MAX_BUSINESSES). Ha túl
    //    kevés ahhoz, hogy a kérő pár árajánlatot kapjon, nem-featured-del töltjük fel
    //    LEAD_MIN_RECIPIENTS-ig (UX-biztosíték).
    //  • Nincs featured cég (korai szakasz) → a top cégek kapják, a funkció így is él.
    // (A `filtered` már `featured DESC, rating DESC` szerint rendezett.)
    const featuredBiz = filtered.filter((b) => Number(b.featured) === 1);
    const otherBiz = filtered.filter((b) => Number(b.featured) !== 1);

    if (featuredBiz.length === 0) {
      targets = otherBiz.slice(0, MAX_BUSINESSES);
    } else {
      targets = featuredBiz.slice(0, MAX_BUSINESSES);
      if (targets.length < LEAD_MIN_RECIPIENTS) {
        targets = [...targets, ...otherBiz.slice(0, LEAD_MIN_RECIPIENTS - targets.length)];
      }
    }

    // EXTRA címzettek: a maradék (legjobb) kategóriabeli cégek is megkapják a leadet,
    // de csak DB-be mentve — azonnali email NINCS (Resend-kvóta), a reggeli digest
    // értesíti őket. Így minden helyi releváns cég versenyezhet a leadért.
    const targetIds = new Set(targets.map((t) => t.id));
    extras = filtered.filter((b) => !targetIds.has(b.id)).slice(0, EXTRA_LOCKED_MAX);
    } // fan-out mód vége

    if (targets.length === 0) {
      return NextResponse.json(
        {
          error:
            "Sajnos nem találtunk aktív vállalkozót ebben a kategóriában. Próbálj más kategóriát vagy böngészd a Szaknévsort!",
        },
        { status: 404 },
      );
    }

    const effectiveCategoryLabel =
      categoryLabel || targets[0]?.category_label || targets[0]?.category_id || categoryId;

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

    // FREEMIUM-kapu: ha a cég NEM PRO (featured=0) és ebben a hónapban már elérte az
    // 5 ingyenes ajánlatkérést → a lead ZÁROLT (a kontaktot se az email, se a digest
    // nem küldi; PRO oldja fel). A featured cég mindig teljes leadet kap.
    const { countBusinessLeadsThisMonth, FREE_LEADS_PER_MONTH } = await import("@/lib/repo");
    const lockedByBiz = new Map<string, boolean>();
    const lastFreeByBiz = new Map<string, boolean>();
    await Promise.all(
      targets.map(async (b) => {
        if (Number(b.featured) === 1) { lockedByBiz.set(b.id, false); return; }
        const monthCount = await countBusinessLeadsThisMonth(b.id);
        lockedByBiz.set(b.id, monthCount >= FREE_LEADS_PER_MONTH);
        // Ez a havi UTOLSÓ ingyenes lead (létrehozás előtt 4 volt → ez az 5.).
        lastFreeByBiz.set(b.id, monthCount === FREE_LEADS_PER_MONTH - 1);
      }),
    );
    // Extra címzett: PRO (featured) teljes leadet kap a digestben; nem-PRO MINDIG
    // zároltat (kontakt rejtve → PRO-upsell) — és a zárolt nem fogyasztja a havi keretet.
    for (const b of extras) lockedByBiz.set(b.id, Number(b.featured) !== 1);

    // Email küldés — csak a first-ping célpontoknak, best-effort. Zárolt cégnek a
    // kontakt-mentes „oldd fel PRO-val" értesítő megy.
    const emailResults = await Promise.allSettled(
      firstPingTargets.map((biz) =>
        lockedByBiz.get(biz.id)
          ? sendLeadLockedEmail({
              categoryLabel: effectiveCategoryLabel,
              business: { name: biz.name, contactEmail: biz.contact_email! },
            })
          : sendLeadRequestEmail({
              senderName: name,
              senderEmail: email,
              senderPhone: phone,
              categoryLabel: effectiveCategoryLabel,
              message,
              business: { name: biz.name, contactEmail: biz.contact_email! },
              lastFree: lastFreeByBiz.get(biz.id) ?? false,
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
          locked: lockedByBiz.get(biz.id) ?? false,
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
          locked: lockedByBiz.get(biz.id) ?? false,
        }),
      ]),
      ...extras.flatMap((biz) => [
        incrementBusinessAnalytic(biz.id, "lead", null),
        createBusinessLead({
          businessId: biz.id,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          categoryLabel: effectiveCategoryLabel,
          message,
          firstPingSent: false,
          locked: lockedByBiz.get(biz.id) ?? true,
        }),
      ]),
    ]);

    // Visszaigazolás a kérező felhasználónak
    try {
      await sendLeadConfirmEmail({
        to: email,
        senderName: name,
        categoryLabel: effectiveCategoryLabel,
        // Teljes elérés: azonnali címzettek + a digestben értesülő extra cégek.
        businessCount: targets.length + extras.length,
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
      { ok: true, sent: sentCount, total: targets.length, extra: extras.length },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/szaknevsor/ajanlatkeres", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}
