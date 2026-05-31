import { NextResponse } from "next/server";
import { triggerExchangeRateRadars } from "@/lib/radars";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Belső/teszt végpont a Radarok (Push) triggerezéséhez.
 * Éles környezetben ezt egy Cron-Job hívná meg óránként (az árfolyam ellenőrzésére).
 */
export async function GET(req: Request) {
  const env = getCloudflareEnv();
  // Ha nincs beállítva CRON_SECRET, akkor csak lokális dev környezetben engedjük,
  // egyébként elutasítjuk, nehogy véletlenül nyitva maradjon.
  const authHeader = req.headers.get("authorization") ?? "";
  if (env.CRON_SECRET) {
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Missing CRON_SECRET configuration" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (type === "exchange_rate") {
    // Lekérdezzük a valós árfolyamot (cache nélkül!)
    let huf: number;
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=CHF&to=HUF", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("API hiba");
      const data = await res.json() as any;
      huf = data.rates.HUF;
    } catch {
      return NextResponse.json({ error: "Frankfurter API hiba" }, { status: 502 });
    }

    try {
      await triggerExchangeRateRadars(huf);
      return NextResponse.json({ ok: true, triggered: "exchange_rate", huf });
    } catch {
      return NextResponse.json({ error: "Hiba a radarok triggerezésekor" }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: "Használat: ?type=exchange_rate" }, { status: 400 });
}
