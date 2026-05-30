import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { GUIDES } from "@/lib/guides";
import { containsProfanity } from "@/lib/profanity";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: { prompt?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
    }

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Kérlek tegyél fel egy kérdést." }, { status: 400 });
    }

    // Profanity / rasszista tartalom szűrése a bemeneten
    if (containsProfanity(prompt).hit) {
      return NextResponse.json(
        { error: "A kérdésed nem megfelelő szavakat tartalmaz. Kérlek fogalmazd meg másképp." },
        { status: 400 },
      );
    }

    const env = getCloudflareEnv();
    if (!env.AI) {
      return NextResponse.json({ error: "Az AI modul jelenleg nem elérhető." }, { status: 503 });
    }

    // Build the knowledge base context from existing guides
    const knowledgeBase = GUIDES.map((g) => {
      const sections = g.sections.map((s) => 
        `- ${s.heading}: ${s.body ? s.body.join(" ") : ""} ${s.bullets ? s.bullets.join(", ") : ""}`
      ).join("\n");
      return `Téma: ${g.title}\nÖsszefoglaló: ${g.summary}\nRészletek:\n${sections}`;
    }).join("\n\n");

    const systemPrompt = `Te a "Kinti Asszisztens" vagy, egy segítőkész, kedves és precíz AI szakértő a Svájcban élő magyarok számára. Válaszolj magyarul, röviden és érthetően.
Kizárólag az alábbi tudásbázis alapján válaszolj. Ha a tudásbázisban nincs benne a válasz, mondd meg őszintén, hogy nem tudod, de javasold, hogy a kérdező keressen rá a hivatalos svájci oldalakon (pl. ch.ch). Ne találj ki új információt!

FONTOS SZABÁLY: SOHA ne használj rasszista, diszkriminatív, gyűlöletkeltő, trágár vagy sértő nyelvezetet. Ha a felhasználó ilyen tartalmú kérdést tesz fel, utasítsd el udvariasan és kérd meg, hogy fogalmazza át a kérdését. Ne válaszolj etnikum-, vallás-, nem- vagy szexuális orientáció-alapú megalapozatlan állításokra.

=== TUDÁSBÁZIS ===
${knowledgeBase}

Téma: Vám és Import (Svájcba lépéskor)
Részletek:
- Hús: napi 1 kg / fő ingyenes (bármilyen hús, baromfi, kolbász).
- Alkohol (17 év felett): max 5 liter 18% alatti (pl. bor, sör) ÉS max 1 liter 18% feletti (pl. pálinka, vodka) ingyenes.
- Készpénz: 10 000 CHF (vagy azzal egyenértékű deviza) felett kötelező bejelenteni a határon.
- Értékhatár (ÁFA): Ha a Svájcba behozott áruk összértéke (személyenként) nem haladja meg a 300 CHF-et, akkor áfamentes. Ha túllépi, akkor az EGÉSZ összegre ki kell fizetni a svájci áfát (jelenleg normál 8.1%, élelmiszerre 2.6%). Fontos: az áfamentesség nem mentesít a mennyiségi korlátok (pl. 1kg hús) túllépése esetén fizetendő vám alól!

Téma: Büntetések és Bírságok (Bussen) a svájci utakon
Részletek:
- Autópálya matrica (Vignette): Ha nincs vagy érvénytelen, 200 CHF a bírság (+ meg kell venni a matricát, ami 40 CHF).
- Gyorshajtás lakott területen (50 km/h limit): 1-5 km/h túllépés: 40 CHF, 6-10 km/h: 120 CHF, 11-15 km/h: 250 CHF. 16 km/h felett rendőrségi feljelentés.
- Gyorshajtás autópályán (120 km/h limit): 1-5 km/h: 20 CHF, 6-10 km/h: 60 CHF, 11-15 km/h: 120 CHF, 16-20 km/h: 180 CHF, 21-25 km/h: 260 CHF. Felette feljelentés.
`;

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 512,
    });

    if (!response || !response.response) {
      console.error("✖ [AI Ask] Üres AI válasz:", JSON.stringify(response));
      return NextResponse.json(
        { error: "Az AI jelenleg nem elérhető, kérlek próbáld újra pár perc múlva." },
        { status: 503 }
      );
    }

    const answer = response.response;

    return NextResponse.json(
      { answer },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (error) {
    console.error("✖ [AI Ask] Hiba:", error);
    return NextResponse.json(
      { error: "Szerverhiba történt a kérés feldolgozása közben." },
      { status: 500 }
    );
  }
}
