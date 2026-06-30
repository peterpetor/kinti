import { NextResponse } from "next/server";

export const runtime = "edge";
/** Revalidate 1 óránként — az EUB-bázisú napi árfolyam ennél gyakrabban nem változik. */
export const revalidate = 3600;

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface ExchangeResult {
  base: "CHF";
  date: string;
  rates: {
    HUF: number;
    EUR: number;
  };
  /** Plus pár fontos kereszt-árfolyam tájékoztatóul. */
  inverse: {
    /** 100 HUF = X CHF (5 tizedesig). */
    hufToChf: number;
    /** 1 EUR = X CHF. */
    eurToChf: number;
  };
  fetchedAt: string;
}

/**
 * GET /api/exchange-rate  — CHF árfolyamok (HUF, EUR + reverse).
 *
 * Forrás: https://api.frankfurter.app — ingyenes, kulcs nélküli,
 * Európai Központi Bank (ECB) napi középárfolyam. Hétvégén / ünnepnap a legutóbbi
 * banki napot ad vissza, ez OK ehhez a use-case-hez (tájékoztatás, nem trading).
 *
 * Cache: edge revalidate 1h. Ha a fetch elhasal, 503-mal válaszolunk a kliensnek.
 */
/** GET ?history=N — az utolsó N nap napi CHF→HUF/EUR idősora (a trend-jelzéshez). */
async function getHistory(days: number): Promise<Response> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const s = start.toISOString().slice(0, 10);
  const e = end.toISOString().slice(0, 10);
  try {
    const res = await fetch(`https://api.frankfurter.app/${s}..${e}?from=CHF&to=HUF,EUR`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Az árfolyam-szolgáltatás nem érhető el." },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    const data = (await res.json()) as { rates?: Record<string, { HUF?: number; EUR?: number }> };
    const series = Object.entries(data.rates ?? {})
      .map(([date, r]) => ({ date, huf: r.HUF ?? 0, eur: r.EUR ?? 0 }))
      .filter((x) => x.huf > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    return NextResponse.json(
      { base: "CHF", days, series },
      { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Az árfolyam-szolgáltatás nem érhető el." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}

export async function GET(request: Request) {
  const days = Math.min(90, Math.max(0, parseInt(new URL(request.url).searchParams.get("history") ?? "0", 10) || 0));
  if (days > 0) return getHistory(days);
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=CHF&to=HUF,EUR", {
      // Cloudflare edge cache — kibír 1 órát.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Az árfolyam-szolgáltatás nem érhető el." },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }

    const data = (await res.json()) as FrankfurterResponse;
    const huf = data.rates.HUF;
    const eur = data.rates.EUR;

    const result: ExchangeResult = {
      base: "CHF",
      date: data.date,
      rates: { HUF: huf, EUR: eur },
      inverse: {
        hufToChf: huf > 0 ? Math.round((100 / huf) * 100000) / 100000 : 0,
        eurToChf: eur > 0 ? Math.round((1 / eur) * 10000) / 10000 : 0,
      },
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        // Browser + edge cache 1h, stale-while-revalidate még 1h
        "cache-control": "public, max-age=3600, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Az árfolyam-szolgáltatás nem érhető el." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
