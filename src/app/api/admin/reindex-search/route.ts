import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { timingSafeEqualStr } from "@/lib/security";
import { getVectorize, indexPendingBusinessVectors } from "@/lib/vector-search";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reindex-search — a szemantikus kereső-index feltöltése.
 *
 * ⚠️ JAVÍTVA: a korábbi változat a TELJES (~2400 elemű) listát próbálta egyetlen
 * kérésben feldolgozni — ~95 egymás utáni AI-embedding + Vectorize-upsert kör —,
 * ami CPU-/alkérés-limitbe ütközik, ezért a job MINDIG félbeszakadt, és az index
 * sosem készült el (a 2369 élő cégből ~1268 volt benne).
 *
 * Most FOLYTATHATÓ: futásonként csak a hátralévő (soha nem indexelt VAGY azóta
 * szerkesztett) sorokból dolgoz fel egy korlátozott szeletet, és a válaszban
 * megmondja, mennyi maradt. Addig hívható újra, amíg a `remaining` 0 nem lesz;
 * emellett a napi cron (send-lead-digests) magától is fogyasztja a hátralékot.
 *
 * Query: `limit` (alap 200, max 500).
 */
export async function POST(req: Request) {
  // Auth: admin session VAGY `Bearer <CRON_SECRET>` — ugyanaz a minta, mint a
  // /api/cron/* végpontoknál. A gépi út azért kell, hogy a hátralék
  // karbantartható legyen böngésző-munkamenet nélkül is (nagy backfill,
  // ütemezett feltöltés) — a végpont csak a SAJÁT adatunkat indexeli, nem ad ki
  // semmit.
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && (await timingSafeEqualStr(auth, `Bearer ${env.CRON_SECRET}`));
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return NextResponse.json({ error: "Csak adminisztrátor." }, { status: 403 });
  }

  if (!getVectorize()) {
    return NextResponse.json(
      { error: "A Vectorize index nincs beüzemelve (wrangler.toml [[vectorize]])." },
      { status: 409 },
    );
  }

  const raw = Number(new URL(req.url).searchParams.get("limit") ?? 200);
  const limit = Number.isFinite(raw) ? Math.max(1, Math.min(raw, 500)) : 200;

  try {
    const { indexed, remaining } = await indexPendingBusinessVectors(limit);
    return NextResponse.json(
      {
        ok: true,
        indexed,
        remaining,
        done: remaining === 0,
        // Az adminnak: hányszor kell még megnyomni (a napi cron is dolgozik közben).
        hint:
          remaining === 0
            ? "Az index naprakész."
            : `Még ~${Math.ceil(remaining / limit)} futás (vagy várd meg a napi cront).`,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/admin/reindex-search", err);
    return NextResponse.json({ error: "Indexelési hiba." }, { status: 500 });
  }
}
