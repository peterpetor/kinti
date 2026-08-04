import { NextResponse } from "next/server";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { semanticBusinessIdsDiag, getVectorize } from "@/lib/vector-search";
// ⚠️ Közvetlenül a modulból, NEM a `repo` barrel-ből: az a teljes adatréteget
// behúzná ebbe az edge-bundle-be.
import { getBusinessesForList } from "@/lib/repo-business";
import { rangsorolSzemantikus, MAX_TALALAT, MIN_PONT } from "@/lib/semantic-rank";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { timingSafeEqualStr } from "@/lib/security";
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
/**
 * Nyers pontszám-diagnosztika — CSAK `Bearer <CRON_SECRET>` mellett.
 *
 * ⚠️ MIÉRT KELL: a pont-küszöb (`MIN_PONT`) csak MÉRÉSSEL állítható jól. Enélkül
 * a küszöb tippelés, és egy rosszul eltalált érték NÉMÁN nullázza a funkciót —
 * pontosan úgy néz ki kívülről, mintha nem is lenne találat. Az első éles
 * mérésnél tényleg ez történt: minden kérdés „nincs találat" volt.
 *
 * A nyers pontszám nem publikus (a rangsor belső működését mutatná meg egy
 * scrapernek), ezért ugyanaz a gépi belépő védi, mint a cron-végpontokat.
 */
async function gepiHozzafer(req: Request): Promise<boolean> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string };
  const auth = req.headers.get("authorization") ?? "";
  if (!env.CRON_SECRET) return false;
  return timingSafeEqualStr(auth, `Bearer ${env.CRON_SECRET}`);
}

async function diagnosztika(
  req: Request,
  nyers: { id: string; score: number }[],
  lista: { id: string; country: string; name: string }[],
  orszag: string,
): Promise<Record<string, unknown>> {
  if (!(await gepiHozzafer(req))) return {};

  const szerint = new Map(lista.map((b) => [b.id, b]));
  return {
    debug: {
      nyersDb: nyers.length,
      kuszob: MIN_PONT,
      minta: nyers.slice(0, 12).map((t) => {
        const b = szerint.get(t.id);
        return {
          id: t.id,
          pont: Number(t.score.toFixed(4)),
          nev: b?.name ?? "(nincs a listában)",
          orszag: b?.country ?? "?",
          kertOrszag: orszag,
        };
      }),
    },
  };
}

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
    const valasz = await semanticBusinessIdsDiag(query, 40);
    const nyers = valasz.hits;
    // ⚠️ A KÉT ÜRES ESET NEM UGYANAZ, és külön névvel kell látszaniuk:
    //   • `no-vector` = az embedding vagy a Vectorize-lekérdezés HIBÁZOTT,
    //   • `no-match`  = megvolt a keresés, csak nem maradt elég jó találat.
    // Amíg mindkettőre ugyanaz a válasz ment, egy néma AI-hiba pontosan úgy
    // nézett ki, mint egy jogos „nincs találat" — vagyis sosem derülne ki.
    if (!nyers) {
      return NextResponse.json({
        hits: [],
        reason: "no-vector",
        ...(await gepiHozzafer(req) ? { debug: { hiba: valasz.hiba, uzenet: valasz.uzenet } } : {}),
      });
    }
    if (nyers.length === 0) return NextResponse.json({ hits: [], reason: "no-match" });

    const lista = await getBusinessesForList();
    const hits = rangsorolSzemantikus(nyers, lista, country, MAX_TALALAT);

    return NextResponse.json(
      { hits, reason: hits.length > 0 ? "ok" : "no-match", ...(await diagnosztika(req, nyers, lista, country)) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/ai/semantic-search", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
