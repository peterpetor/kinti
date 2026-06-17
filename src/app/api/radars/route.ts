import { NextResponse } from "next/server";
import { savePushSubscription, saveRadar, listRadarsByEndpoint } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ?? null;
    const ipHash = await hashIp(ip);
    const rateLimit = await checkAiRateLimit("radar-subscribe", ipHash);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Túl sok radar beállítás. Próbáld újra később." },
        { status: 429 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const sub = body.subscription as
      | { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
      | undefined;
    const endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : "";
    const p256dh = typeof sub?.keys?.p256dh === "string" ? sub.keys.p256dh : "";
    const auth = typeof sub?.keys?.auth === "string" ? sub.keys.auth : "";

    const radarType = typeof body.radarType === "string" ? body.radarType : "";
    const parameters = typeof body.parameters === "object" && body.parameters !== null ? JSON.stringify(body.parameters) : "{}";

    if (!['exchange_rate', 'job_alert'].includes(radarType)) {
      return NextResponse.json({ error: "Érvénytelen radar típus." }, { status: 400 });
    }

    if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) {
      return NextResponse.json({ error: "Hiányos feliratkozás." }, { status: 400 });
    }

    await savePushSubscription({
      id: crypto.randomUUID(),
      endpoint,
      p256dh,
      auth,
      cantonCode: null, // Radars handle canton specifically inside parameters JSON
      // preserveCanton: a meglévő kanton-célzott push-feliratkozást nem töröljük
      // (a radar null kantont küld, de nem akarjuk felülírni a korábbi választást).
      preserveCanton: true,
    });

    const radarId = crypto.randomUUID();
    await saveRadar({
      id: radarId,
      pushEndpoint: endpoint,
      radarType,
      parameters,
    });

    await logAiRateLimit("radar-subscribe", ipHash);

    return NextResponse.json({ ok: true, id: radarId }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/radars/POST", err);
    return NextResponse.json({ error: "Belső hiba a radar mentésekor." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") ?? "";
    if (!/^https:\/\//.test(endpoint)) {
      return NextResponse.json({ radars: [] }, { status: 200 });
    }
    const radars = await listRadarsByEndpoint(endpoint);
    return NextResponse.json({ radars }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/radars/GET", err);
    return NextResponse.json({ radars: [] }, { status: 200 });
  }
}
