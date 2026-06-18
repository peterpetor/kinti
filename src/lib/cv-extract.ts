/**
 * CV PDF → nyers szöveg kinyerés az edge-en (Cloudflare Workers/Pages).
 *
 * Az `unpdf` egy serverless-re szabott pdf.js build — nincs DOM/worker függősége,
 * így a workerd runtime-on (next-on-pages edge) is fut. A feltöltött CV az R2-ben
 * `cv/<userId>/<uuid>.pdf` kulcson van; innen olvassuk és szöveggé alakítjuk.
 *
 * A lusta `await import("unpdf")` szándékos: így a modul nem kerül be a hideg-
 * start kritikus útjába, és a unit-tesztek sem próbálják betölteni.
 */

export interface CvExtractResult {
  ok: boolean;
  text: string;
  /** Diagnosztikai ok, ha ok=false (pl. "no-cv", "empty", "scanned"). */
  reason?: "no-cv" | "not-found" | "empty" | "error";
}

/** Max. karakter, amit az LLM-nek átadunk (kb. 2-3 oldalnyi CV bőven elfér). */
const MAX_CHARS = 8000;

// PDF-ből gyakran jönnek speciális szóköz-/láthatatlan karakterek. Kódpont-
// alapon kezeljük (tiszta ASCII forrás, nincs törékeny regex-literál).
const SPACE_CODEPOINTS = new Set<number>([
  0x00a0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
  0x2007, 0x2008, 0x2009, 0x200a, 0x202f, 0x205f, 0x3000,
]);
const ZERO_WIDTH_CODEPOINTS = new Set<number>([
  0x00ad, 0x200b, 0x200c, 0x200d, 0x2060, 0xfeff,
]);

/** Normalizálja a PDF-ből kinyert szöveget (szóközök, láthatatlanok, sortörés). */
function normalizePdfText(raw: string): string {
  let out = "";
  for (const ch of raw) {
    const cp = ch.codePointAt(0)!;
    if (ZERO_WIDTH_CODEPOINTS.has(cp)) continue;
    out += SPACE_CODEPOINTS.has(cp) ? " " : ch;
  }
  return out
    .replace(/[ \t]{2,}/g, " ") // szóköz-futamok összevonása (a sima szóköz marad!)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Kinyeri a megadott R2-kulcson lévő PDF szövegét.
 * @param bucket az R2 binding (getMediaBucket())
 * @param cvKey  a CV kulcsa (cv/<userId>/<uuid>.pdf), vagy null ha nincs CV
 */
export async function extractCvText(
  bucket: R2Bucket,
  cvKey: string | null | undefined,
): Promise<CvExtractResult> {
  if (!cvKey) return { ok: false, text: "", reason: "no-cv" };

  try {
    const obj = await bucket.get(cvKey);
    if (!obj) return { ok: false, text: "", reason: "not-found" };

    const buf = new Uint8Array(await obj.arrayBuffer());
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });

    const clean = normalizePdfText(Array.isArray(text) ? text.join("\n") : text);

    // Szkennelt / kép-alapú PDF-ből alig jön szöveg → jelezzük a hívónak.
    if (clean.length < 80) return { ok: false, text: clean, reason: "empty" };

    return { ok: true, text: clean.slice(0, MAX_CHARS) };
  } catch {
    return { ok: false, text: "", reason: "error" };
  }
}
