import { NextResponse } from "next/server";
import { getCloudflareEnv, getMediaBucket } from "@/lib/cloudflare";
import { moderateImage } from "@/lib/moderation";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/bulletin/analyze-image
 *
 * Elolvassa az imént feltöltött R2 képet, és a Llama Vision modell segítségével
 * javasol hozzá Címet, Kategóriát és Leírást JSON formátumban.
 * Egyúttal biztonsági (NSFW) szűrést is végez.
 */
export async function POST(req: Request) {
  try {
    let body: { imageKey?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
    }

    const imageKey = typeof body.imageKey === "string" ? body.imageKey : "";
    if (!imageKey.startsWith("bulletin-images/") || imageKey.includes("..")) {
      return NextResponse.json({ error: "Érvénytelen kulcs." }, { status: 400 });
    }

    const env = getCloudflareEnv();
    if (!env.AI) {
      return NextResponse.json({ error: "Az AI modul nem elérhető." }, { status: 503 });
    }

    const obj = await getMediaBucket().get(imageKey);
    if (!obj) {
      return NextResponse.json({ error: "A kép nem tölthető be." }, { status: 404 });
    }

    const arrayBuffer = await obj.arrayBuffer();
    
    // 1. lépés: Biztonsági moderáció a gyors, kis uform modellel
    const moderation = await moderateImage(arrayBuffer);
    if (moderation.action === "block") {
      await getMediaBucket().delete(imageKey).catch(() => {});
      return NextResponse.json({ error: moderation.reason || "A kép nem megengedett tartalmat hordoz.", unsafe: true }, { status: 400 });
    }

    // 2. lépés: Llama Vision modell használata az auto-kitöltéshez
    const uint8Array = new Uint8Array(arrayBuffer);
    const imageArray = Array.from(uint8Array);

    const prompt = `Analyze this image for a marketplace advertisement.
Identify the main object being sold or offered.
Return ONLY a raw JSON object (no markdown, no quotes) with these fields:
- "title": A short, catchy, professional title in Hungarian.
- "categoryId": Try to match one of these broad categories based on the image: "Ingatlan", "Jármű", "Bútor", "Elektronika", "Szolgáltatás", "Egyéb".
- "description": A short, 1-2 sentence description in Hungarian that highlights the visible condition and features.
Example: {"title": "IKEA kanapé szép állapotban", "categoryId": "Bútor", "description": "Szürke, kétszemélyes szövetkanapé, megkímélt állapotban eladó."}`;

    try {
      const response = (await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageArray }
            ]
          }
        ]
      })) as { response?: string };

      let resultText = response?.response || "";
      
      // Cleanup backticks if the model returns markdown code block
      if (resultText.startsWith("\`\`\`json")) {
        resultText = resultText.replace(/\`\`\`json/, "").replace(/\`\`\`/, "");
      } else if (resultText.startsWith("\`\`\`")) {
        resultText = resultText.replace(/\`\`\`/, "").replace(/\`\`\`/, "");
      }
      
      const parsed = JSON.parse(resultText.trim());
      
      return NextResponse.json({ analysis: parsed });
    } catch (aiError) {
      console.warn("AI Auto-fill failed (maybe missing Meta license or timeout):", aiError);
      // Fail open: return empty analysis so the user can just fill it manually
      return NextResponse.json({ analysis: null });
    }
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json({ error: "Hiba történt az elemzés során." }, { status: 500 });
  }
}
