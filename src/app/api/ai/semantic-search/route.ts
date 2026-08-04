import { NextResponse } from "next/server";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { semanticBusinessIds, getVectorize } from "@/lib/vector-search";
// ⚠️ Közvetlenül a modulból, NEM a `repo` barrel-ből: az a teljes adatréteget
// behúzná ebbe az edge-bundle-be.
import { getBusinessesForList } from "@/lib/repo-business";
import { rangsorolSzemantikus, MAX_TALALAT } from "@/lib/semantic-rank";
import { isValidCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/semantic-search — jelentés alapú cégkeresés.
 *
 * A `parse-search` TARTALÉKA. Az AI-mód szűrőket állít (kategória/régió/nyelv);
 * ha a kérést egyik meglévő szakmára sem lehet ráhúzni („valaki, aki segít a
 * német adóbevallásomban"), a felhasználó eddig NULLA találatot kapott. Itt a
 * kérésből embedding készül, és a vektor-index adja a hasonló cégeket.
 *
 * ⚠️ NEM OLVAS D1-et a rangsorhoz: a céglista a meglévő, megosztott
 * gyorsítótárból jön (`getBusinessesForList`). A 2026-08-04-i kiesést épp ez a
 * lekérdezés okozta — új út SEM nyithat rá friss olvasásokat.
 *
 * ⚠️ IP-korlát (20/óra) a drága hívás ELŐTT foglalódik le. A kvótát a
 * `logAiRateLimit` írja, MIELŐTT az embedding elindulna — különben párhuzamos
 * kérések mind átcsúsznának a számláló-ellenőrzésen.
 *
 * Body: { query: string, country?: string }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string; country?: string };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    // ⚠️ isValidCountry, NEM kézi lista: kézi ágakon a GB/ES némán a svájci
    // ágra esett, és angliai keresésre svájci találatok jöttek.
    const country = isValidCountry(body.country) ? body.country : DEFAULT_COUNTRY;
    if (query.length < 3 || query.length > 200) {
      return NextResponse.json({ error: "Adj meg egy keresési szöveget." }, { status: 400 });
    }

    // Index nélkül nincs mit keresni — ilyenkor NEM égetünk kvótát.
    if (!getVectorize()) {
      return NextResponse.json({ hits: [], reason: "no-index" });
    }

    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("semantic-search", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Túl sok keresés. Próbáld újra egy óra múlva. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }
    await logAiRateLimit("semantic-search", ipHash);

    // ⚠️ topK bőven a megjelenítendő darabszám FÖLÖTT: az index minden országot
    // egyben tárol, és az ország-szűrés UTÁN kell maradnia elég találatnak.
    // 6 találathoz 6 kérése kevés lenne — egy holland keresésnél a lista simán
    // elfogyhatna csupa német tételre.
    const nyers = await semanticBusinessIds(query, 40);
    if (!nyers || nyers.length === 0) {
      return NextResponse.json({ hits: [], reason: "no-match" });
    }

    const lista = await getBusinessesForList();
    const hits = rangsorolSzemantikus(nyers, lista, country, MAX_TALALAT);

    return NextResponse.json(
      { hits, reason: hits.length > 0 ? "ok" : "no-match" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/ai/semantic-search", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
