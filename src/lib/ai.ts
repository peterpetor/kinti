import { getCloudflareEnv } from "./cloudflare";

/**
 * Központi Cloudflare Workers AI hívó wrapper. Egységes timeout, error-kezelés,
 * és modell-választás. A 4 új AI feature (vélemény-összefoglaló, kategória-
 * javasló, leírás-tisztító, természetes nyelvű kereső, szó-szótár) mind ezt
 * hívja.
 *
 * Modell:
 *   • `@cf/meta/llama-3-8b-instruct` — gyors, sokoldalú szöveges feladatokhoz.
 *
 * A binding (`env.AI`) a wrangler.toml `[ai]` blokkjából jön.
 */

export interface AiTextResult {
  text: string;
  ok: boolean;
}

const DEFAULT_MODEL = "@cf/meta/llama-3-8b-instruct";

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
