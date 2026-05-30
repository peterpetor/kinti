import { NextResponse } from "next/server";
import {
  getBusinessById,
  getReviewsByBusiness,
  setBusinessAiReviewSummary,
} from "@/lib/repo";
import { runAiChat, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/bulletin";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/ai/review-summary/[businessId]
 *
 * 3-4 mondatos magyar összegzés a véleményekből. Cache-strategy:
 *   • a businesses táblán cache-elve (ai_review_summary, ..._at, ..._count)
 *   • re-generál: ha 30 napnál régebbi VAGY a vélemény-szám jelentősen
 *     nőtt (delta ≥ 3) a legutóbbi generáláshoz képest.
 *   • <3 vélemény: nem generálunk (túl kevés, fals impression).
 */
export async function GET(
  req: Request,
  { params }: { params: { businessId: string } },
) {
  try {
    const b = await getBusinessById(params.businessId);
    if (!b) return NextResponse.json({ error: "Nincs ilyen vállalkozás." }, { status: 404 });

    const reviews = await getReviewsByBusiness(b.id);
    if (reviews.length < 3) {
      return NextResponse.json({ summary: null, reason: "few_reviews" });
    }

    // Cache check
    const cached = b.aiReviewSummary;
    const cachedAtIso = b.aiReviewSummaryAt;
    const cachedCount = b.aiReviewSummaryCount ?? 0;
    if (cached && cachedAtIso) {
      const ageMs = Date.now() - new Date(cachedAtIso).getTime();
      const within30Days = ageMs < 30 * 24 * 60 * 60 * 1000;
      const reviewsStable = reviews.length - cachedCount < 3;
      if (within30Days && reviewsStable) {
        return NextResponse.json({
          summary: cached,
          cached: true,
          generatedAt: cachedAtIso,
          reviewCount: cachedCount,
        });
      }
    }

    // Rate-limit (30/IP/óra) — cache-miss esetén lép életbe
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("review-summary", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { summary: null, reason: "rate_limited" },
        { status: 429 },
      );
    }

    // AI prompt
    const reviewBlob = reviews
      .slice(0, 25) // limit context
      .map((r) => `[${r.rating}★] ${r.body?.slice(0, 240) ?? ""}`)
      .join("\n");

    const system =
      "Te a kinti.app vállalkozó-katalógus magyar nyelvű AI-asszisztense vagy. " +
      "A feladatod az: kapsz vélemény-listát egy svájci vállalkozóról (★ csillagok 1-5, " +
      "vélemény-szöveg). Adj egy 3-4 mondatos, OBJEKTÍV összegzést magyarul. " +
      "Az első mondat ÁLTALÁNOS kép (pl. 'A vélemények többsége pozitív...'); " +
      "a következő 2 mondat KONKRÉT visszatérő pozitívumokat és negatívumokat sorol fel. " +
      "TILOS: kitalálni dolgokat, neveket említeni, ítéletet hozni az ár megfelelő voltáról, " +
      "bárkire személyesen utalni. Ha a vélemények ellentmondásosak, jelezd. " +
      "Csak magyar nyelven válaszolj, hivatalos hangnemben, max 4 mondat.";

    const userPrompt = `Vélemények (1-5 ★ + szöveg):\n${reviewBlob}\n\n3-4 mondatos magyar összegzést kérek.`;

    const ai = await runAiChat({
      system,
      user: userPrompt,
      maxTokens: 220,
      temperature: 0.3,
    });
    if (!ai.ok || !ai.text) {
      return NextResponse.json(
        { summary: null, reason: "ai_unavailable" },
        { status: 200 },
      );
    }
    await logAiRateLimit("review-summary", ipHash);

    const summary = ai.text.slice(0, 800); // védő-limit
    await setBusinessAiReviewSummary({
      businessId: b.id,
      summary,
      reviewCount: reviews.length,
    });

    return NextResponse.json({
      summary,
      cached: false,
      generatedAt: new Date().toISOString(),
      reviewCount: reviews.length,
    });
  } catch (err) {
    safeLogError("api/ai/review-summary", err);
    return NextResponse.json({ summary: null, reason: "error" }, { status: 200 });
  }
}
