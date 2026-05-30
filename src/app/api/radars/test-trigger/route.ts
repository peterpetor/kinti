import { NextResponse } from "next/server";
import { triggerAlberletRadars, triggerExchangeRateRadars } from "@/lib/radars";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Belső/teszt végpont a Radarok (Push) triggerezéséhez.
 * Éles környezetben ezt egy Cron-Job hívná meg óránként (az árfolyam ellenőrzésére),
 * illetve az albérlet hirdetés feladásakor a /submit route.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  
  if (type === "alberlet") {
    // Szimulálunk egy zürichi albérlet feltöltést
    await triggerAlberletRadars("ZH");
    return NextResponse.json({ ok: true, triggered: "alberlet", canton: "ZH" });
  }
  
  if (type === "exchange_rate") {
    // Lekérdezzük a valós árfolyamot
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=CHF&to=HUF");
      const data = await res.json() as any;
      const huf = data.rates.HUF;
      await triggerExchangeRateRadars(huf);
      return NextResponse.json({ ok: true, triggered: "exchange_rate", huf });
    } catch {
      return NextResponse.json({ error: "Frankfurter API hiba" }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: "Használat: ?type=alberlet vagy ?type=exchange_rate" }, { status: 400 });
}
