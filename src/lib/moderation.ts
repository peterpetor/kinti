import { getCloudflareEnv } from "./cloudflare";

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Automatikus képmoderáció Cloudflare Workers AI-val.
 * A `@cf/unum/uform-gen2-qwen-500m` multimodális (vision-language) modellt használja.
 *
 * @param arrayBuffer A vizsgálni kívánt kép bináris tartalma.
 * @returns Moderációs eredmény (safe: true/false, opcionális indoklással).
 */
export async function moderateImage(arrayBuffer: ArrayBuffer): Promise<ModerationResult> {
  try {
    const env = getCloudflareEnv();
    if (!env.AI) {
      console.warn("› [AI Moderation] Az env.AI binding nem érhető el. Moderáció kihagyva.");
      return { safe: true };
    }

    console.log("› [AI Moderation] Kép elemzése indítása...");
    const uint8Array = new Uint8Array(arrayBuffer);
    const imageArray = Array.from(uint8Array);

    const prompt =
      "Analyze this image. Is it safe for a family-friendly community web application? " +
      "Answer with exactly ONE word: 'safe' or 'unsafe'. " +
      "Mark as 'unsafe' if the image contains explicit nudity, pornography, violence, gore, weapons, hate symbols, or offensive/inappropriate content.";

    const response = await env.AI.run("@cf/unum/uform-gen2-qwen-500m", {
      image: imageArray,
      prompt: prompt,
      max_tokens: 16,
    });

    const resultText = (response?.description || "").trim().toLowerCase();
    console.log(`› [AI Moderation] AI válasz: "${resultText}"`);

    // Ha a válaszban szerepel az "unsafe" szó, elutasítjuk a képet.
    if (resultText.includes("unsafe")) {
      return {
        safe: false,
        reason: "Sajnáljuk, de a feltölteni kívánt kép nem megengedett vagy nem biztonságos (NSFW) tartalmat hordozhat.",
      };
    }

    return { safe: true };
  } catch (error) {
    console.error("✖ [AI Moderation] Hiba történt a moderáció során:", error);
    // Biztonsági okokból, ha a moderációs modell elhasal (pl. rate-limit vagy átmeneti hiba),
    // átengedjük a képet (fail-open), hogy ne akasszuk meg a felhasználói élményt, de logoljuk a hibát.
    return { safe: true };
  }
}
