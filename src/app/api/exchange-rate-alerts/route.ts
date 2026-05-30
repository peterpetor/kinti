import { NextResponse } from "next/server";
import {
  listExchangeRateAlertsByEndpoint,
  saveExchangeRateAlert,
  savePushSubscription,
  type ExchangeRateDirection,
} from "@/lib/repo";
import { CANTON_COORDS } from "@/lib/cantons";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/exchange-rate-alerts — új CHF/HUF riasztó beállítása.
 *
 * Body:
 *   {
 *     subscription: { endpoint, keys: { p256dh, auth } },
 *     thresholdHuf: number (pl. 410.5),
 *     direction: "above" | "below"
 *   }
 *
 * A push subscription-t mi is mentjük (idempotens — ha már létezik, az a
 * `savePushSubscription`-ben on-conflict-ignore-szal kezelt). Aztán az alert.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const sub = body.subscription as
      | { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
      | undefined;
    const endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : "";
    const p256dh = typeof sub?.keys?.p256dh === "string" ? sub.keys.p256dh : "";
    const auth = typeof sub?.keys?.auth === "string" ? sub.keys.auth : "";

    const thresholdRaw = body.thresholdHuf;
    const directionRaw = body.direction;
    const cantonRaw = typeof body.cantonCode === "string" ? body.cantonCode : "";

    const thresholdHuf =
      typeof thresholdRaw === "number" && Number.isFinite(thresholdRaw)
        ? thresholdRaw
        : Number(thresholdRaw);
    if (!Number.isFinite(thresholdHuf) || thresholdHuf <= 0 || thresholdHuf > 10000) {
      return NextResponse.json(
        { error: "Érvénytelen küszöb (1-10000 HUF között)." },
        { status: 400 },
      );
    }

    if (directionRaw !== "above" && directionRaw !== "below") {
      return NextResponse.json(
        { error: "Érvénytelen irány (above|below)." },
        { status: 400 },
      );
    }

    if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) {
      return NextResponse.json(
        { error: "Hiányos feliratkozás." },
        { status: 400 },
      );
    }

    // Push subscription mentése (idempotens INSERT OR IGNORE-ral)
    const cantonCode =
      cantonRaw && cantonRaw !== "all" && CANTON_COORDS[cantonRaw] ? cantonRaw : null;
    await savePushSubscription({
      id: crypto.randomUUID(),
      endpoint,
      p256dh,
      auth,
      cantonCode,
    });

    const alertId = crypto.randomUUID();
    await saveExchangeRateAlert({
      id: alertId,
      pushEndpoint: endpoint,
      thresholdHuf,
      direction: directionRaw as ExchangeRateDirection,
    });

    return NextResponse.json(
      { ok: true, id: alertId },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/exchange-rate-alerts/POST", err);
    return NextResponse.json(
      { error: "Belső hiba a riasztó mentésekor." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/exchange-rate-alerts?endpoint=...
 *
 * Visszaadja az endpoint-hoz tartozó aktív riasztásokat. Az endpoint a
 * push-subscription URL-je; a kliens csak a saját adatait kéri le.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") ?? "";
    if (!/^https:\/\//.test(endpoint)) {
      return NextResponse.json({ alerts: [] }, { status: 200 });
    }
    const alerts = await listExchangeRateAlertsByEndpoint(endpoint);
    return NextResponse.json(
      { alerts },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/exchange-rate-alerts/GET", err);
    return NextResponse.json({ alerts: [] }, { status: 200 });
  }
}
