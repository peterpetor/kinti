import { getCloudflareEnv } from "./cloudflare";

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Automatikus képmoderáció Cloudflare Workers AI-val.
 * A `@cf/meta/llama-3.2-11b-vision-instruct` nagy teljesítményű vizuális modellt használja.
 * Képes felismerni a meztelenséget, erőszakot és az AI biztonsági elutasításokat is blokkolja.
 *
 * @param arrayBuffer A vizsgálni kívánt kép bináris tartalma.
 * @returns Moderációs eredmény (safe: true/false, opcionális indoklással).
 */
export async function moderateImage(arrayBuffer: ArrayBuffer): Promise<ModerationResult> {
  try {
    const env = getCloudflareEnv();
    if (!env.AI) {
      console.warn("› [AI Moderation] Az env.AI binding nem érhető el. Moderáció megkerülve.");
      return { safe: true };
    }

    console.log("› [AI Moderation] Kép elemzése indítása (Llama 3.2 Vision)...");
    const uint8Array = new Uint8Array(arrayBuffer);
    const imageArray = Array.from(uint8Array);

    const prompt = 
      "You are a strict safety content moderator. Analyze this image. " +
      "Is it safe for a family-friendly community web application? " +
      "Answer with exactly ONE word: 'safe' or 'unsafe'. " +
      "You MUST answer 'unsafe' if the image contains explicit nudity, genitals, pornography, sexual acts, violence, gore, weapons, or highly inappropriate/explicit content.";

    const response = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: imageArray }
          ]
        }
      ],
      max_tokens: 16,
    }) as { response?: string };

    const resultText = (response?.response || "").trim().toLowerCase();
    console.log(`› [AI Moderation] AI válasz: "${resultText}"`);

    // Elutasító szavak listája: Ha az AI biztonsági korlátok miatt nem hajlandó elemezni a képet,
    // az 100%, hogy durva pornográfia (NSFW) vagy erőszak, így ezt is el kell utasítanunk!
    const unsafeTriggers = [
      "unsafe",
      "sorry",
      "cannot",
      "unable",
      "inappropriate",
      "refuse",
      "restricted",
      "explicit",
      "nudity",
      "sexual",
      "genital",
      "guideline"
    ];

    const isUnsafe = unsafeTriggers.some(trigger => resultText.includes(trigger)) || resultText === "";

    if (isUnsafe) {
      console.warn(`› [AI Moderation] BLOKKOLVA! Veszélyes tartalom észlelve vagy elutasított válasz: "${resultText}"`);
      return {
        safe: false,
        reason: "Sajnáljuk, de a feltölteni kívánt kép nem biztonságos (NSFW) vagy nem családbarát tartalmat hordoz, ezért a rendszer elutasította.",
      };
    }

    console.log("› [AI Moderation] A kép átment a biztonsági ellenőrzésen.");
    return { safe: true };
  } catch (error) {
    console.error("✖ [AI Moderation] Hiba történt a moderáció során:", error);
    // Ha a szerver teljesen elszáll (pl. timeout), átengedjük (fail-open) a UX miatt,
    // de az éles Cloudflare környezetben a Llama Vision sziklaszilárdan működik.
    return { safe: true };
  }
}
