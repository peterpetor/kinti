/**
 * CV PDF → nyers szöveg kinyerés az edge-en — a Cloudflare NATÍV
 * `env.AI.toMarkdown()` dokumentum-konverterével.
 *
 * Miért ez és nem az `unpdf`/pdf.js: a pdf.js a workerd runtime-on megbízhatatlan
 * (runtime-hiba), a kliensbe csomagolva pedig megtörte a next-on-pages buildet.
 * A `toMarkdown` viszont csak egy binding-hívás (semmit nem kell bundle-ölni),
 * az R2-ből olvasott PDF-et a Cloudflare oldalán alakítja szöveggé/markdownná.
 */
import { getCloudflareEnv } from "./cloudflare";

export interface CvExtractResult {
  ok: boolean;
  text: string;
  /** Diagnosztikai ok, ha ok=false. */
  reason?: "no-cv" | "not-found" | "empty" | "error";
}

/** Max. karakter, amit az LLM-nek átadunk (kb. 2-3 oldalnyi CV bőven elfér). */
const MAX_CHARS = 8000;

/**
 * Kinyeri a megadott R2-kulcson lévő PDF szövegét a Cloudflare AI.toMarkdown-nal.
 * @param bucket az R2 binding (getMediaBucket())
 * @param cvKey  a CV kulcsa (cv/<userId>/<uuid>.pdf), vagy null ha nincs CV
 */
export async function extractCvText(
  bucket: R2Bucket,
  cvKey: string | null | undefined,
): Promise<CvExtractResult> {
  if (!cvKey) return { ok: false, text: "", reason: "no-cv" };

  // 1) PDF letöltése R2-ből
  let bytes: ArrayBuffer;
  try {
    const obj = await bucket.get(cvKey);
    if (!obj) {
      console.error(`[cv-extract] R2 miss: ${cvKey}`);
      return { ok: false, text: "", reason: "not-found" };
    }
    bytes = await obj.arrayBuffer();
  } catch (err) {
    console.error("[cv-extract] R2 get hiba:", err);
    return { ok: false, text: "", reason: "not-found" };
  }

  // 2) PDF → markdown/szöveg a Cloudflare AI-konverterrel
  try {
    const env = getCloudflareEnv() as { AI?: { toMarkdown?: (docs: unknown[]) => Promise<unknown> } };
    if (!env.AI?.toMarkdown) {
      console.error("[cv-extract] env.AI.toMarkdown nem elérhető");
      return { ok: false, text: "", reason: "error" };
    }

    const out = (await env.AI.toMarkdown([
      { name: "cv.pdf", blob: new Blob([bytes], { type: "application/pdf" }) },
    ])) as Array<{ data?: string }> | { data?: string } | null;

    const raw = Array.isArray(out) ? (out[0]?.data ?? "") : (out?.data ?? "");
    const clean = raw
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (clean.length < 80) return { ok: false, text: clean, reason: "empty" };
    return { ok: true, text: clean.slice(0, MAX_CHARS) };
  } catch (err) {
    console.error("[cv-extract] toMarkdown hiba:", err);
    return { ok: false, text: "", reason: "error" };
  }
}
