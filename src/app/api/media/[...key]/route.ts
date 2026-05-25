import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
// A kulcs alapján statikusan kiszolgálható lenne, de a binding kérés-hatókörű,
// ezért dinamikus marad. A cache-elést HTTP-fejlécekkel intézzük (lásd lent).
export const dynamic = "force-dynamic";

/**
 * GET /api/media/<key...>  — publikus, NEM Clerk-védett.
 *
 * Az R2 binding-on át adja vissza a tartalmat, így a buckethez nem kell
 * publikus hozzáférés. Támogatja:
 *  - If-None-Match (ETag) → 304 Not Modified
 *  - Range header → R2 részleges letöltés
 *  - hosszú cache-elés (immutable; a kulcs UUID-t tartalmaz, így új feltöltésnél új URL)
 *
 * 404, ha a kulcs nem létezik. 304, ha az ETag egyezik a kérés
 * If-None-Match fejlécével.
 */
export async function GET(req: Request, { params }: { params: { key: string[] } }) {
  const key = params.key.map(decodeURIComponent).join("/");
  if (!key || key.includes("..")) {
    return new Response("Bad Request", { status: 400 });
  }

  const range = req.headers.get("range") ?? undefined;
  const ifNoneMatch = req.headers.get("if-none-match") ?? undefined;

  const bucket = getMediaBucket();
  const obj = await bucket.get(key, {
    range: range ? rangeHeaderToR2(range) : undefined,
    onlyIf: ifNoneMatch ? { etagDoesNotMatch: ifNoneMatch } : undefined,
  });

  if (!obj) {
    return new Response("Not Found", { status: 404 });
  }

  // onlyIf nem-match esetén bizonyos kombinációk R2Object*-ként térnek vissza
  // body nélkül — ilyenkor 304-et küldünk.
  if (!("body" in obj) || obj.body == null) {
    return new Response(null, { status: 304, headers: { etag: obj.httpEtag } });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  // Ha range volt és a R2 részlegest adott, 206-ot illik küldeni.
  const status = obj.range ? 206 : 200;

  return new Response(obj.body, { status, headers });
}

/** Egyszerű `bytes=START-END` → R2 range-objektum. */
function rangeHeaderToR2(header: string): R2Range | undefined {
  const m = /^bytes=(\d+)-(\d*)$/.exec(header.trim());
  if (!m) return undefined;
  const offset = Number(m[1]);
  const end = m[2] ? Number(m[2]) : undefined;
  return end != null ? { offset, length: end - offset + 1 } : { offset };
}
