import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PRODUCT_ENTITLEMENT, type ProductType } from "@/lib/payments-config";
import { getBusinessByOwner, getEmployerByOwner, getJobById } from "@/lib/repo";
import { getDB } from "@/lib/cloudflare";
import { activateEntitlement } from "@/lib/entitlements";
import {
  isPlayConfigured,
  getSubscriptionState,
  getProductState,
  acknowledgePurchase,
} from "@/lib/google-play";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

/**
 * POST /api/payments/play/verify — Google Play vásárlás ellenőrzése + aktiválás.
 *
 * Az Android-appból (TWA) a Play Billing purchaseTokenjével hívják. A token
 * hitelességét a Google Play Developer API-nál ellenőrizzük (a kliensnek
 * hinni tilos), majd:
 *   1. a vásárlást NYUGTÁZZUK (acknowledge — különben a Play 3 nap után
 *      automatikusan visszatéríti),
 *   2. a jogosultságot aktiváljuk (közös lib, a Paddle-lel azonos viselkedés),
 *   3. a token→cél leképezést eltároljuk (play_purchases) — az RTDN webhook
 *      (megújulás/lemondás) ebből tudja, mit frissítsen.
 *
 * A businessId/jobId a bejelentkezett user TÉNYLEGES tulajdonjogából jön
 * (a kliens által küldött customData-t eldobjuk) — mint a Paddle checkoutnál.
 */
export async function POST(req: Request) {
  try {
    if (!isPlayConfigured()) {
      return NextResponse.json(
        { ok: false, error: "A Google Play fizetés még nincs bekapcsolva ezen a szerveren." },
        { status: 503 },
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Bejelentkezés szükséges a vásárláshoz." }, { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ ok: false, error: "Érvénytelen kérés." }, { status: 400 }); }
    const { product, purchaseToken, customData } = body as {
      product?: ProductType;
      purchaseToken?: string;
      customData?: Record<string, string>;
    };

    const entitlement = product ? PRODUCT_ENTITLEMENT[product] : undefined;
    if (!product || !entitlement || !purchaseToken || typeof purchaseToken !== "string") {
      return NextResponse.json({ ok: false, error: "Hiányzó vagy ismeretlen termék/vásárlás-azonosító." }, { status: 400 });
    }

    const db = getDB();

    // Replay-őr: ha ezt a tokent már feldolgoztuk, idempotens siker (a
    // restore-flow újraküldheti) — előfizetésnél a lejáratot azért frissítjük.
    const existing = await db
      .prepare("SELECT entitlement, ref_id, user_id FROM play_purchases WHERE purchase_token = ? LIMIT 1")
      .bind(purchaseToken)
      .first<{ entitlement: string; ref_id: string | null; user_id: string | null }>();

    // Tulajdonjog-validáció a CÉL-entitásra (a kliens customData-ja csak hint).
    const target: { userId: string; businessId?: string; jobId?: string } = { userId };
    if (entitlement === "business_pro") {
      const business = await getBusinessByOwner(userId);
      if (!business && !existing?.ref_id) {
        return NextResponse.json({ ok: false, error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
      }
      target.businessId = business?.id ?? existing?.ref_id ?? undefined;
    } else if (entitlement === "job_featured") {
      const jobId = typeof customData?.jobId === "string" ? customData.jobId : existing?.ref_id ?? "";
      const [employer, job] = await Promise.all([
        getEmployerByOwner(userId),
        jobId ? getJobById(jobId) : Promise.resolve(null),
      ]);
      if (!employer || !job || job.employerId !== employer.id) {
        return NextResponse.json({ ok: false, error: "Ez a hirdetés nem a tiéd." }, { status: 403 });
      }
      target.jobId = jobId;
    }

    // A vásárlás hitelesítése a Google-nál + aktiválás.
    if (entitlement === "user_pro" || entitlement === "business_pro") {
      const sub = await getSubscriptionState(purchaseToken);
      if (!sub.active) {
        return NextResponse.json({ ok: false, error: "Az előfizetés nem aktív a Google Play-nél." }, { status: 402 });
      }
      if (!sub.acknowledged) await acknowledgePurchase("subscription", product, purchaseToken);
      await activateEntitlement(entitlement, target, {
        status: "active",
        subscriptionId: `play:${purchaseToken.slice(0, 24)}`,
        customerId: null,
        currentPeriodEnd: sub.expiryTime,
      });
      await recordPurchase(purchaseToken, product, entitlement, target, userId, "active", sub.expiryTime);
    } else {
      // job_featured — egyszeri termék. Replay-nél NEM aktiválunk újra (a 30
      // napos kiemelés ismételt meghosszabbítása ellen), csak siker a válasz.
      if (existing) return NextResponse.json({ ok: true, duplicate: true });
      const prod = await getProductState(product, purchaseToken);
      if (!prod.purchased) {
        return NextResponse.json({ ok: false, error: "A vásárlás nem található a Google Play-nél." }, { status: 402 });
      }
      if (!prod.acknowledged) await acknowledgePurchase("product", product, purchaseToken);
      await activateEntitlement(entitlement, target, {});
      await recordPurchase(purchaseToken, product, entitlement, target, userId, "active", null);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    safeLogError("[payments/play/verify]", error);
    return NextResponse.json(
      { ok: false, error: "A vásárlás ellenőrzése nem sikerült. Próbáld újra." },
      { status: 500 },
    );
  }
}

async function recordPurchase(
  token: string,
  productId: string,
  entitlement: string,
  target: { businessId?: string; jobId?: string },
  userId: string,
  status: string,
  expiryTime: string | null,
) {
  await getDB()
    .prepare(
      `INSERT INTO play_purchases (purchase_token, product_id, entitlement, ref_id, user_id, status, expiry_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(purchase_token) DO UPDATE SET
         status = excluded.status,
         expiry_time = excluded.expiry_time,
         updated_at = datetime('now')`,
    )
    .bind(token, productId, entitlement, target.businessId ?? target.jobId ?? null, userId, status, expiryTime)
    .run();
}
