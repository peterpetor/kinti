import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import {
  setModerationStatus,
  addToBlocklist,
  getReviewSummaryById,
  recomputeBusinessRating,
  getBusinessById,
  type ModerationTable,
} from "@/lib/repo";
import { hashEmail } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";
import { logAdminAction } from "@/lib/audit";
import { notifyCanton } from "@/lib/push-notify";
import { cantonFromAddress, nearestCantonCode, CANTONS } from "@/lib/cantons";
import { regionName } from "@/lib/regions";
import { getCloudflareCtx } from "@/lib/cloudflare";
import { upsertBusinessVector } from "@/lib/vector-search";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const VALID_TABLES: ModerationTable[] = [
  "reviews",
  "businesses",
  "service_requests",
  "stories",
];

const TABLE_LABELS: Record<ModerationTable, string> = {
  reviews: "vélemény",
  businesses: "vállalkozás",
  service_requests: "keresés",
  stories: "élettörténet",
};

/**
 * POST /api/admin/moderation/decide
 *
 * Body:
 *   {
 *     table: 'reviews'|'businesses'|'events',
 *     id: string,
 *     decision: 'approved'|'rejected',
 *     banIpHash?: string,   // ha jelen van + decision='rejected' → tiltólistára
 *     banEmail?: string,    // ha jelen van + decision='rejected' → tiltólistára
 *   }
 *
 * Ban-flow: csak `rejected` döntésnél van értelme. Az IP-hash már hashelt
 * (a queue-listán ott van); az email plaintext, mi hash-eljük itt.
 */
export async function POST(req: Request) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      table?: string;
      id?: string;
      decision?: string;
      banIpHash?: string;
      banEmail?: string;
    };
    const table = body.table as ModerationTable;
    const id = body.id;
    const decision = body.decision;

    if (!table || !VALID_TABLES.includes(table)) {
      return NextResponse.json({ error: "invalid_table" }, { status: 400 });
    }
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "invalid_id" }, { status: 400 });
    }
    let statusValue: 1 | 2;
    if (decision === "approved") statusValue = 1;
    else if (decision === "rejected") statusValue = 2;
    else {
      return NextResponse.json({ error: "invalid_decision" }, { status: 400 });
    }

    const ok = await setModerationStatus(table, id, statusValue, adminId);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await logAdminAction({
      adminUserId: adminId,
      actionType: statusValue === 1 ? "approve" : "reject",
      targetType: table,
      targetId: id,
    });

    // Vélemény-döntés után újraszámoljuk a vállalkozás ratingjét, mert az
    // immár csak a jóváhagyott véleményekből áll (approve → beleszámít,
    // reject → kiesik). Enélkül a publikus rating sosem frissülne jóváhagyáskor.
    if (table === "reviews") {
      // includeUnpublished: elutasításkor (status=2) is meg kell találnunk a
      // véleményt, hogy a businessId-ből újraszámoljuk a ratinget.
      const summary = await getReviewSummaryById(id, { includeUnpublished: true });
      if (summary?.businessId) await recomputeBusinessRating(summary.businessId);
    }

    // Új vállalkozás jóváhagyásakor: kanton-célzott push az adott kanton (+ az
    // „egész Svájc") feliratkozóinak. Csak ha a kanton feloldható a címből
    // (különben mindenkit spammelnénk). Háttérben fut, a választ nem várja.
    if (table === "businesses" && statusValue === 1) {
      const biz = await getBusinessById(id);
      // Szemantikus index frissítése (no-op, ha a Vectorize nincs beüzemelve).
      if (biz) getCloudflareCtx()?.waitUntil(upsertBusinessVector(biz));
      // Régió-célzás: a TÁROLT régiókód (biz.canton) az igazság — minden
      // országra helyes (a push-feliratkozás kanton-mezője a canton-pref óta
      // szintén országfüggő kódot hordoz). A cím-PLZ / legközelebbi-kanton
      // feloldás CSAK svájci cégre futhat: a svájci PLZ-táblával egy bécsi
      // „1160" cím Vaud-ra illeszkedett → svájci feliratkozók kaptak volna
      // pushot osztrák cégről. (Ismert korlát: a ritka régiókód-ütközés,
      // pl. CH BE ↔ DE BE — a tárolt kóddal így is jobb, mint a feloldás.)
      const bizCountry = biz?.country ?? "CH";
      let cantonCode: string | null = biz?.canton ?? null;
      let cantonName: string | null = cantonCode ? regionName(bizCountry, cantonCode) : null;
      if (!cantonCode && bizCountry === "CH") {
        const fromAddr = cantonFromAddress(biz?.address ?? null);
        if (fromAddr) {
          cantonCode = fromAddr.code;
          cantonName = fromAddr.name;
        } else if (biz?.lat != null && biz?.lng != null) {
          const near = nearestCantonCode(biz.lat, biz.lng);
          cantonCode = near.code;
          cantonName = CANTONS.find((c) => c.code === near.code)?.name ?? near.code;
        }
      }
      if (biz && cantonCode) {
        const regionWord =
          bizCountry === "CH" ? "a kantonodban" : bizCountry === "NL" ? "a provinciádban" : "a tartományodban";
        getCloudflareCtx()?.waitUntil(
          notifyCanton(cantonCode, {
            title: `Új magyar vállalkozás ${regionWord} 🎉`,
            body: `${biz.name}${biz.categoryLabel ? " — " + biz.categoryLabel : ""}${cantonName ? " · " + cantonName : ""}`,
            url: `/szaknevsor/${biz.id}`,
          }, "business"),
        );
      }
    }

    // Élettörténet: jóváhagyáskor publikálás-dátum + (ha adott emailt) értesítő;
    // elutasításkor a borítókép R2-takarítása (orphan-fájl ellen). Best-effort.
    if (table === "stories") {
      try {
        const { markStoryPublished, getStoryAdminById } = await import("@/lib/repo");
        const story = await getStoryAdminById(id);
        if (statusValue === 1) {
          await markStoryPublished(id);
          if (story?.contactEmail) {
            const { sendStoryPublishedEmail } = await import("@/lib/email");
            const ctx = getCloudflareCtx();
            const send = sendStoryPublishedEmail({
              to: story.contactEmail,
              title: story.title,
              url: `https://kinti.app/tortenetek/${story.slug}`,
            }).catch((e) => safeLogError("moderation/story-published-email", e));
            if (ctx) ctx.waitUntil(send); else await send;
          }
        } else if (statusValue === 2 && story?.imageKey) {
          const { getMediaBucket } = await import("@/lib/cloudflare");
          await getMediaBucket().delete(story.imageKey).catch(() => { /* silent */ });
        }
      } catch (e) {
        safeLogError("moderation/story-decide", e);
      }
    }

    // „Keresek" jóváhagyása → fordított lead-routing a kategóriabeli cégeknek
    // (PRO teljes kontakttal, nem-PRO zárolt teaserrel). Háttérben, best-effort;
    // a routed_at claim idempotenssé teszi (újra-jóváhagyás nem küld duplán).
    if (table === "service_requests" && statusValue === 1) {
      const { routeServiceRequest } = await import("@/lib/keresek-routing");
      const ctx = getCloudflareCtx();
      if (ctx) ctx.waitUntil(routeServiceRequest(id));
      else await routeServiceRequest(id);
    }

    // Ban-flow csak rejected esetén
    let bannedIp = false;
    let bannedEmail = false;
    if (statusValue === 2) {
      const reason = `Auto-ban (${TABLE_LABELS[table]}-elutasítás)`;

      if (
        typeof body.banIpHash === "string" &&
        /^[a-f0-9]{64}$/i.test(body.banIpHash)
      ) {
        const entry = await addToBlocklist({
          kind: "ip_hash",
          value: body.banIpHash.toLowerCase(),
          reason,
          adminUserId: adminId,
        });
        bannedIp = !!entry;
        if (bannedIp) {
          await logAdminAction({
            adminUserId: adminId, actionType: "block", targetType: "ip",
            ipHash: body.banIpHash.toLowerCase(), reason,
          });
        }
      }

      if (typeof body.banEmail === "string" && body.banEmail.trim().length > 0) {
        const emailHash = await hashEmail(body.banEmail);
        if (emailHash) {
          const entry = await addToBlocklist({
            kind: "email_hash",
            value: emailHash,
            reason,
            adminUserId: adminId,
          });
          bannedEmail = !!entry;
        }
      }
    }

    return NextResponse.json({ ok: true, bannedIp, bannedEmail });
  } catch (err) {
    safeLogError("api/admin/moderation/decide", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
