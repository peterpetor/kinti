import { getCloudflareEnv, getDB } from "./cloudflare";

/**
 * Központi Cloudflare Workers AI hívó wrapper. Egységes timeout, error-kezelés,
 * és modell-választás. A 4 új AI feature (vélemény-összefoglaló, kategória-
 * javasló, leírás-tisztító, természetes nyelvű kereső, szó-szótár) mind ezt
 * hívja.
 *
 * Modell:
 *   • `@cf/meta/llama-3.1-8b-instruct-fast` — gyors, sokoldalú szöveges feladatokhoz.
 *
 * A binding (`env.AI`) a wrangler.toml `[ai]` blokkjából jön.
 */

export interface AiTextResult {
  text: string;
  ok: boolean;
}

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

export async function runAiChat(params: {
  system: string;
  user: string;
  maxTokens?: number;
  /** Néhány tipp-feladatnál hasznos a determinizmus → 0.0 */
  temperature?: number;
  model?: string;
}): Promise<AiTextResult> {
  const env = getCloudflareEnv();
  if (!env.AI) {
    return { ok: false, text: "" };
  }
  try {
    const response = (await env.AI.run(params.model ?? DEFAULT_MODEL, {
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      max_tokens: params.maxTokens ?? 256,
      ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    })) as { response?: string };

    const text = (response?.response ?? "").trim();
    if (!text) return { ok: false, text: "" };
    return { ok: true, text };
  } catch (err) {
    console.error("[ai] runAiChat hiba:", err);
    return { ok: false, text: "" };
  }
}

export async function runAiMultiTurnChat(params: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}): Promise<AiTextResult> {
  const env = getCloudflareEnv();
  if (!env.AI) {
    return { ok: false, text: "" };
  }
  try {
    const response = (await env.AI.run(params.model ?? DEFAULT_MODEL, {
      messages: [
        { role: "system", content: params.system },
        ...params.messages,
      ],
      max_tokens: params.maxTokens ?? 350,
      ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    })) as { response?: string };

    const text = (response?.response ?? "").trim();
    if (!text) return { ok: false, text: "" };
    return { ok: true, text };
  } catch (err) {
    console.error("[ai] runAiMultiTurnChat hiba:", err);
    return { ok: false, text: "" };
  }
}

// ============================================================================
//  Rate-limit (közös, sliding-window, IP-hash alapú)
// ============================================================================

export interface AiRateLimitConfig {
  /** Az ablak hossza órákban (pl. 1 = utolsó 1 óra). */
  windowHours: number;
  /** Max hívás az ablakban erről az IP-ről erre az endpoint-ra. */
  maxPerWindow: number;
}

/** Per-endpoint default-ok. Adott IP-ről X hívás Y órán belül. */
export const AI_LIMITS: Record<string, AiRateLimitConfig> = {
  "parse-search": { windowHours: 1, maxPerWindow: 20 },
  "business-helper": { windowHours: 1, maxPerWindow: 10 },
  "german-term": { windowHours: 1, maxPerWindow: 50 },
  "review-summary": { windowHours: 1, maxPerWindow: 30 },
  "media-upload": { windowHours: 1, maxPerWindow: 30 }, // Image upload rate limit
  "radar-subscribe": { windowHours: 1, maxPerWindow: 10 }, // Radar DoS védelem
  "interview-sim": { windowHours: 1, maxPerWindow: 50 }, // Interview simulator
  "business-suggest": { windowHours: 1, maxPerWindow: 10 }, // Közösségi vállalkozás-ajánlás spam-védelem
  "lead-request": { windowHours: 1, maxPerWindow: 8 }, // Árajánlatkérés (lead) spam-védelem
  "job-apply": { windowHours: 1, maxPerWindow: 10 }, // Álláspályázat spam / employer-email-flood védelem
};

/**
 * Megnézi hogy az adott IP a megadott endpoint-ra az utolsó windowHours
 * órán belül átlépte-e a maxPerWindow limitet.
 *
 * @returns true, ha még szabad hívni; false, ha a limit elért.
 *
 * Ha az `ipHash` null (pl. localhost dev), ÁTengedünk — fejlesztéskor ne
 * korlátozzon. Production-on a cf-connecting-ip mindig van.
 */
export async function checkAiRateLimit(
  endpoint: string,
  ipHash: string | null,
): Promise<{ allowed: boolean; current: number; max: number }> {
  const cfg = AI_LIMITS[endpoint];
  if (!cfg) {
    // Ismeretlen endpoint — engedélyezzük, de figyelmeztetünk a log-ban
    console.warn(`[ai-rl] ismeretlen endpoint: ${endpoint}`);
    return { allowed: true, current: 0, max: 9999 };
  }
  if (!ipHash) return { allowed: true, current: 0, max: cfg.maxPerWindow };

  try {
    const row = await getDB()
      .prepare(
        `SELECT COUNT(*) AS n FROM ai_rate_limit_log
         WHERE ip_hash = ? AND endpoint = ?
           AND created_at >= datetime('now', '-' || ? || ' hours')`,
      )
      .bind(ipHash, endpoint, cfg.windowHours)
      .first<{ n: number }>();
    const current = row?.n ?? 0;
    return {
      allowed: current < cfg.maxPerWindow,
      current,
      max: cfg.maxPerWindow,
    };
  } catch (err) {
    // Ha a tábla még nem létezik (migration nem futott), nem blokkolunk.
    console.error("[ai-rl] check failed:", err);
    return { allowed: true, current: 0, max: cfg.maxPerWindow };
  }
}

/** Egy hívást naplóz a rate-limit táblába (sikeres AI-call után). */
export async function logAiRateLimit(
  endpoint: string,
  ipHash: string | null,
): Promise<void> {
  if (!ipHash) return;
  try {
    await getDB()
      .prepare(
        `INSERT INTO ai_rate_limit_log (id, endpoint, ip_hash) VALUES (?, ?, ?)`,
      )
      .bind(crypto.randomUUID(), endpoint, ipHash)
      .run();
  } catch (err) {
    console.error("[ai-rl] log failed:", err);
  }
}

/**
 * Robusztus JSON-parsing — a Llama néha markdown-kódblokkba csomagolja,
 * vagy magyarázat-szöveg van a JSON előtt/után. Kiszedjük az első valid
 * JSON objektumot.
 */
export function extractJsonObject<T>(raw: string): T | null {
  if (!raw) return null;
  // Próbáljuk meg közvetlenül
  try {
    return JSON.parse(raw) as T;
  } catch {
    /* go on */
  }
  // Keressünk { ... } első blokkot
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
