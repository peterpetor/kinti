import { AwsClient } from "aws4fetch";
import { getCloudflareEnv } from "./cloudflare";

/**
 * Cloudflare R2 — presigned PUT URL generálás SigV4-gyel.
 *
 * Miért aws4fetch? Edge runtime-on nem fut az AWS SDK (Node-függő). Az aws4fetch
 * tiszta Web Crypto-t használ, így Workersben/Pagesben működik.
 *
 * Az R2 S3-kompatibilis végponton címezhető a tárolónk:
 *   https://<accountId>.r2.cloudflarestorage.com/<bucket>/<key>
 * A presigned URL-be a `X-Amz-Expires` query paramot tesszük (másodperc),
 * az aws4fetch a többi `X-Amz-*` aláírást elvégzi a `signQuery: true` mellett.
 *
 * Biztonság: a hozzáférési kulcsok TITKOK — sose küldjük le a kliensre. Csak a
 * kész presigned URL-t adjuk vissza, ami ablakidő után érvénytelen.
 */

export interface PresignOptions {
  /** Az érvényesség másodpercben (max 7 nap, default 5 perc = ~elég feltöltéshez). */
  expiresSeconds?: number;
  /** Opcionális: az aláírt `Content-Type` (a kliensnek pontosan ezt kell küldenie). */
  contentType?: string;
}

export interface PresignResult {
  uploadUrl: string;
  bucket: string;
  key: string;
  expiresAt: number; // ms epoch
}

/** Egy R2 objektumhoz feltöltési (PUT) presigned URL — egyetlen használatra. */
export async function presignR2Put(key: string, opts: PresignOptions = {}): Promise<PresignResult> {
  const env = getCloudflareEnv();
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET || "kinti-media";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Hiányzó R2 hitelesítő adatok (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).",
    );
  }

  const expires = Math.min(Math.max(opts.expiresSeconds ?? 300, 30), 60 * 60 * 24 * 7);
  const url = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodeR2Key(key)}`,
  );
  url.searchParams.set("X-Amz-Expires", String(expires));

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: "auto",
    service: "s3",
  });

  const headers: Record<string, string> = {};
  if (opts.contentType) headers["content-type"] = opts.contentType;

  const signed = await client.sign(url.toString(), {
    method: "PUT",
    headers,
    aws: { signQuery: true },
  });

  return {
    uploadUrl: signed.url,
    bucket,
    key,
    expiresAt: Date.now() + expires * 1000,
  };
}

/**
 * Engedélyezett feltöltési MIME-típusok → fájlkiterjesztés. Az ismeretlen típust
 * elutasítjuk a végponton, hogy ne lehessen tetszőleges fájlt feltölteni.
 */
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extForContentType(contentType: string | null | undefined): string | null {
  if (!contentType) return null;
  return ALLOWED_IMAGE_TYPES[contentType.toLowerCase()] ?? null;
}

/** Path-szegmens kódolás, de a `/` elválasztókat megtartjuk a kulcson belül. */
function encodeR2Key(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}
