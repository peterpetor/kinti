import { NextResponse } from "next/server";
import { cantonPoint } from "@/lib/cantons";
import type { WeatherNow } from "@/lib/weather";

export const runtime = "edge";

/**
 * GET /api/weather?canton=ZH
 *
 * A kiválasztott kanton székhelyének aktuális időjárása az Open-Meteo
 * ingyenes API-jából, a MeteoSwiss ICON CH2 modellel (kulcs nélkül).
 *
 * Edge-cache: kantononként 15 percig cache-eljük (s-maxage), így nem
 * terheljük feleslegesen a külső API-t, és villámgyors a válasz.
 */

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const point = cantonPoint(searchParams.get("canton"));

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}` +
    `&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=Europe%2FZurich&forecast_days=1&models=meteoswiss_icon_ch2`;

  try {
    const upstream = await fetch(url, {
      // A Cloudflare edge a választ 15 percig cache-eli (kantononként).
      cf: { cacheTtl: 900, cacheEverything: true },
    } as RequestInit);

    if (!upstream.ok) {
      return NextResponse.json({ error: "weather upstream" }, { status: 502 });
    }

    const data = (await upstream.json()) as OpenMeteoResponse;
    const cur = data.current;
    if (!cur || typeof cur.temperature_2m !== "number") {
      return NextResponse.json({ error: "no data" }, { status: 502 });
    }

    const body: WeatherNow = {
      city: point.city,
      cantonCode: point.code,
      tempC: Math.round(cur.temperature_2m),
      feelsC:
        typeof cur.apparent_temperature === "number"
          ? Math.round(cur.apparent_temperature)
          : null,
      code: typeof cur.weather_code === "number" ? cur.weather_code : 0,
      humidity:
        typeof cur.relative_humidity_2m === "number" ? cur.relative_humidity_2m : null,
      windKmh:
        typeof cur.wind_speed_10m === "number" ? Math.round(cur.wind_speed_10m) : null,
      maxC:
        typeof data.daily?.temperature_2m_max?.[0] === "number"
          ? Math.round(data.daily.temperature_2m_max[0])
          : null,
      minC:
        typeof data.daily?.temperature_2m_min?.[0] === "number"
          ? Math.round(data.daily.temperature_2m_min[0])
          : null,
    };

    return NextResponse.json(body, {
      headers: {
        // Böngésző + CDN cache: 15 perc friss, +30 perc stale-while-revalidate.
        "cache-control": "public, max-age=300, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json({ error: "weather fetch failed" }, { status: 502 });
  }
}
