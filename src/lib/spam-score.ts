/**
 * spam-score.ts — beküldés-spam pontozás (reklám / scam / link-farm / gibberish).
 *
 * Kétlépcsős, hogy olcsó és robusztus legyen:
 *   1) gyors, determinisztikus HEURISZTIKA (link / kulcsszó / CAPS / ismétlés) —
 *      AI binding nélkül is véd, és unit-tesztelhető;
 *   2) bizonytalan KÖZÉP-SÁVban Workers AI másodvélemény, ami finomítja a pontot.
 *
 * Külön tengely a trágárságtól ([[profanity]]) és a toxicitástól (text-moderation):
 * itt a REKLÁM/ÁTVERÉS a kérdés, nem a hangnem.
 *
 * Az AI-hívás LUSTA import (`./ai`), így a modul top-level NEM húz be cloudflare-t
 * → a tiszta heurisztika a böngésző/Node tesztkörnyezetben is importálható.
 */

export interface SpamAssessment {
  /** 0–100 (minél magasabb, annál spam-gyanúsabb). */
  score: number;
  verdict: "clean" | "review" | "spam";
  /** Emberi olvasható jelek (admin-triázs + log). */
  signals: string[];
  /** Hívtuk-e a Workers AI-t (közép-sáv). */
  aiUsed: boolean;
}

/** E fölött a beküldést a kapuban elutasítjuk (link-farm / több erős jel). */
export const SPAM_BLOCK_THRESHOLD = 70;
/** E fölött gyanús → mindenképp moderációs sorba + jelölés. */
export const SPAM_REVIEW_THRESHOLD = 40;
/** E alatt egyértelműen tiszta → nem hívunk AI-t (költség/latencia). */
const AI_LOWER_BAND = 25;

const SPAM_KEYWORDS: { re: RegExp; w: number; tag: string }[] = [
  { re: /\b(casino|kaszin[oó]|bet(ting)?|fogad[aá]s|nyer[oő]g[eé]p|jackpot)\b/i, w: 30, tag: "szerencsejáték" },
  { re: /\b(viagra|cialis|potencia)\b/i, w: 40, tag: "gyógyszer-spam" },
  { re: /\b(bitcoin|crypto|kript[oó]|forex|trading|befektet[eé]s\s*garant)\b/i, w: 28, tag: "befektetés-scam" },
  { re: /\b(gyors\s*hitel|k[oö]lcs[oö]n\s*azonnal|loan|payday)\b/i, w: 28, tag: "hitel-spam" },
  { re: /\b(seo|backlink|followers|k[oö]vet[oő]k|likes?\s*olcs[oó])\b/i, w: 25, tag: "seo/követő" },
  { re: /\b(work\s*from\s*home|dolgozz\s*otthonr[oó]l|earn\s*\$?\d+|keress?\s*(napi|havi)\s*\d)\b/i, w: 30, tag: "pénzkereset" },
  { re: /\b(ingyen|free)\s+(p[eé]nz|money|nyerem[eé]ny|bonus|b[oó]nusz)\b/i, w: 25, tag: "ingyen-csali" },
  { re: /\b(whats?app|telegram|viber)\b[^.\n]{0,20}(\+?\d|@)/i, w: 25, tag: "kontakt-terelés" },
];

const LINK_RE =
  /\b(?:https?:\/\/|www\.)\S+|\b\S+\.(?:com|net|org|info|biz|ru|xyz|top|online|shop|link)\b|\b(?:t\.me|wa\.me|bit\.ly|tinyurl)\S*/gi;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
/** Spam-gyakori, olcsó/eldobható TLD-k — extra súly a link mellé. */
const SUSPICIOUS_TLD_RE = /\.(?:top|xyz|online|shop|link|ru|click|live|loan|work)\b/i;

/** Tiszta, AI nélküli heurisztika — 0–100 + a kiváltó jelek. */
export function heuristicSpamScore(textInput: string | null | undefined): { score: number; signals: string[] } {
  const text = (textInput ?? "").trim();
  if (!text) return { score: 0, signals: [] };
  const signals: string[] = [];
  let score = 0;

  const links = text.match(LINK_RE) ?? [];
  if (links.length > 0) {
    score += Math.min(60, links.length * 24);
    signals.push(`link×${links.length}`);
    if (SUSPICIOUS_TLD_RE.test(text)) {
      score += 18;
      signals.push("gyanús-domain");
    }
  }

  const phones = text.match(PHONE_RE) ?? [];
  if (phones.length > 0) {
    score += 18;
    signals.push("telefonszám");
  }

  for (const k of SPAM_KEYWORDS) {
    if (k.re.test(text)) {
      score += k.w;
      signals.push(k.tag);
    }
  }

  // Csupa-nagybetű (csak elég hosszú szövegnél, hogy a rövid mozaikszavak ne hamis-pozitívozzanak).
  const letters = text.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, "");
  if (letters.length >= 20) {
    const caps = (letters.match(/[A-ZÁÉÍÓÖŐÚÜŰ]/g) ?? []).length;
    if (caps / letters.length > 0.6) {
      score += 15;
      signals.push("csupa-nagybetű");
    }
  }

  if (/(.)\1{4,}/.test(text) || /[!?]{4,}/.test(text)) {
    score += 10;
    signals.push("ismétlés");
  }

  const emojis = (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  if (emojis >= 8) {
    score += 10;
    signals.push("emoji-áradat");
  }

  return { score: Math.min(100, score), signals: Array.from(new Set(signals)) };
}

/**
 * Spam-értékelés: heurisztika + (közép-sávban) Workers AI másodvélemény.
 * Fail-safe: ha az AI nem elérhető/hibázik, a heurisztikus pont marad érvényben.
 */
export async function assessSpam(text: string | null | undefined): Promise<SpamAssessment> {
  const h = heuristicSpamScore(text);

  // Egyértelmű spam → nincs AI-költség.
  if (h.score >= SPAM_BLOCK_THRESHOLD) {
    return { score: h.score, verdict: "spam", signals: h.signals, aiUsed: false };
  }
  // Egyértelműen tiszta → nincs AI.
  if (h.score < AI_LOWER_BAND) {
    return { score: h.score, verdict: "clean", signals: h.signals, aiUsed: false };
  }

  // Bizonytalan közép-sáv → AI másodvélemény (lusta import a tesztelhetőségért).
  let finalScore = h.score;
  let aiUsed = false;
  try {
    const { runAiChat, extractJsonObject } = await import("./ai");
    const ai = await runAiChat({
      system:
        "Spam-osztályozó vagy egy magyar közösségi appban (vélemények, vállalkozás-ajánlások). Kizárólag JSON-t adsz vissza.",
      user:
        `Pontozd 0–100 között, mennyire SPAM/reklám/scam ez a beküldés (NEM a trágárság vagy a hangnem számít, csak a reklám / link-farm / átverés / álhír). ` +
        `Add vissza pontosan ennyit: {"score": <egész 0-100>}\n\nSzöveg:\n"""${(text ?? "").slice(0, 1500)}"""`,
      maxTokens: 24,
      temperature: 0,
    });
    if (ai.ok) {
      const parsed = extractJsonObject<{ score?: unknown }>(ai.text);
      const s = parsed && typeof parsed.score === "number" ? parsed.score : null;
      if (s != null && Number.isFinite(s)) {
        const aiScore = Math.max(0, Math.min(100, s));
        finalScore = Math.round((h.score + aiScore) / 2);
        aiUsed = true;
      }
    }
  } catch {
    /* AI nem elérhető → marad a heurisztikus pont */
  }

  const verdict =
    finalScore >= SPAM_BLOCK_THRESHOLD ? "spam" : finalScore >= SPAM_REVIEW_THRESHOLD ? "review" : "clean";
  return { score: finalScore, verdict, signals: h.signals, aiUsed };
}
