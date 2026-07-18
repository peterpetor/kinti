import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/subscriptions";
import { getBusinessByOwner, getBusinessByManageToken } from "@/lib/repo";
import { getDB } from "@/lib/cloudflare";
import { createPortalSession } from "@/lib/paddle";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

interface BizSubRow {
  provider_sub_id: string | null;
  provider_customer_id: string | null;
}

/**
 * GET /api/payments/portal — előfizetés-kezelő (lemondás/számlák) link.
 *
 * Két hatókör:
 *   • (alap) Kinti PRO — a bejelentkezett user subscriptions-sora alapján;
 *   • ?scope=business — Szaknévsor PRO. A céget VAGY a bejelentkezett
 *     tulajdonos (Clerk), VAGY a ?manageToken=<token> azonosítja — a token
 *     maga a tulajdonjog-bizonyíték (ugyanaz az elv, mint a token-os
 *     vásárlásnál a checkout route-ban).
 *
 * Paddle-előfizetésnél rövid életű customer-portal session URL-t ad
 * (lemondás mély-linkkel — német § 312k Kündigungsbutton-megfelelés);
 * Google Play-esnél (provider_sub_id `play:` prefixű) provider:"play"-t,
 * amire a kliens a Play Előfizetések oldalára visz.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope");
    const manageToken = url.searchParams.get("manageToken");

    // --- Szaknévsor PRO (céges) hatókör ---
    if (scope === "business") {
      let businessId: string | null = null;
      if (manageToken) {
        const business = await getBusinessByManageToken(manageToken);
        if (!business) {
          return NextResponse.json({ error: "Érvénytelen vagy lejárt kezelő-link." }, { status: 403 });
        }
        businessId = business.id;
      } else {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
        }
        const business = await getBusinessByOwner(userId);
        if (!business) {
          return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
        }
        businessId = business.id;
      }

      let row: BizSubRow | null = null;
      try {
        row = await getDB()
          .prepare("SELECT provider_sub_id, provider_customer_id FROM business_subscriptions WHERE business_id = ? LIMIT 1")
          .bind(businessId)
          .first<BizSubRow>();
      } catch {
        row = null; // tábla-hiány (migráció előtt) → fallback üzenet lent
      }

      if (row?.provider_sub_id?.startsWith("play:")) {
        return NextResponse.json({ provider: "play" });
      }
      if (!row?.provider_customer_id) {
        // Korábbi előfizetőknél a metaadat a következő megújulási webhookkal
        // érkezik (≤1 hónap) — addig a support-út marad.
        return NextResponse.json(
          { error: "Az előfizetés-kezelő itt még nem érhető el ehhez a céghez — írj az info@kinti.app címre, és intézzük." },
          { status: 404 },
        );
      }
      const portalUrl = await createPortalSession(row.provider_customer_id, row.provider_sub_id);
      return NextResponse.json({ provider: "paddle", url: portalUrl });
    }

    // --- Kinti PRO (személyes) hatókör — változatlan viselkedés ---
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }

    const sub = await getSubscription(userId);
    if (!sub) {
      return NextResponse.json({ error: "Nincs előfizetésed." }, { status: 404 });
    }

    if (sub.lsSubscriptionId?.startsWith("play:")) {
      return NextResponse.json({ provider: "play" });
    }
    if (!sub.lsCustomerId) {
      return NextResponse.json(
        { error: "Az előfizetésedhez nem található ügyfél-azonosító — írj az info@kinti.app címre." },
        { status: 404 },
      );
    }

    const portalUrl = await createPortalSession(sub.lsCustomerId, sub.lsSubscriptionId);
    return NextResponse.json({ provider: "paddle", url: portalUrl });
  } catch (error) {
    safeLogError("[payments/portal]", error);
    return NextResponse.json(
      { error: "Az előfizetés-kezelő megnyitása nem sikerült. Próbáld újra később." },
      { status: 500 },
    );
  }
}
