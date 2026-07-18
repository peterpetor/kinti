import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/subscriptions";
import { createPortalSession } from "@/lib/paddle";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

/**
 * GET /api/payments/portal — a bejelentkezett user előfizetés-kezelő linkje.
 *
 * Paddle-előfizetésnél rövid életű customer-portal session URL-t ad vissza
 * (lemondás mély-linkkel, ha van előfizetés-azonosító) — ez adja az appon
 * belüli „Előfizetésem kezelése / Lemondás" gombot (német § 312k
 * Kündigungsbutton-megfelelés is). Google Play-es előfizetésnél (a
 * subscription id `play:` prefixű) a kliens a Play Előfizetések oldalára
 * irányít — azt a Play kezeli, nem a Paddle.
 */
export async function GET() {
  try {
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

    const url = await createPortalSession(sub.lsCustomerId, sub.lsSubscriptionId);
    return NextResponse.json({ provider: "paddle", url });
  } catch (error) {
    safeLogError("[payments/portal]", error);
    return NextResponse.json(
      { error: "Az előfizetés-kezelő megnyitása nem sikerült. Próbáld újra később." },
      { status: 500 },
    );
  }
}
