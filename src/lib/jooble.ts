/**
 * jooble.ts — VALÓDI állás-listák a Jooble aggregátor-API-jából.
 *
 * Jogtiszta (hivatalos API, nem scrape). Ingyenes kulcs: jooble.org/api/about.
 * Jó AT/DE/NL lefedés, kulcsszó + helyszín kereséssel. Env: `JOOBLE_API_KEY`.
 * A forrás-láncban az Adzuna után, az Arbeitnow (no-key) előtt.
 */
import { getCloudflareEnv } from "./cloudflare";
import type { AdzunaJob } from "./adzuna";

const COUNTRY_LOCATION: Record<string, string> = {
  AT: "Österreich",
  DE: "Deutschland",
  NL: "Nederland",
  CH: "Schweiz",
  // Jooble-nál a helyi nyelvű ország-név a jó szűrő; GB/ES nélkül üres
  // location ment ki → a keresés nem szűkült országra.
  GB: "United Kingdom",
  ES: "España",
};

/**
 * ⚠️ ORSZÁG-SPECIFIKUS VÉGPONT — ÉLESBEN MÉRT HIBA MIATT.
 *
 * A kód eddig a GLOBÁLIS `jooble.org/api/<kulcs>` végpontot hívta, és a
 * helyszínt szövegként adta át. A holland keresés így a `location: "Nederland"`
 * paraméterrel ment ki — a globális (amerikai) index pedig megtalálta
 * **Nederland, Texas** városát. Eredmény: a holland Jooble-lista 100%-a
 * délkelet-texasi állás lett (Beaumont, Port Arthur, Port Neches, Groves…),
 * 149 hirdetés — hollandiai magyaroknak kínálva.
 *
 * A Jooble ország-aldomainjei saját indexet szolgálnak ki, ezért a keresés
 * eleve nem tud kilépni az országból. Ha a kulcs egy aldomainen nem érvényes,
 * a hívás nem-OK választ ad, és a forrás egyszerűen üresen tér vissza (az
 * Adzuna adja a sorok több mint 90%-át) — ez rosszabb esetben kevesebb
 * hirdetés, de SOSEM rossz országbeli hirdetés.
 */
const COUNTRY_HOST: Record<string, string> = {
  AT: "at.jooble.org",
  DE: "de.jooble.org",
  NL: "nl.jooble.org",
  CH: "ch.jooble.org",
  GB: "uk.jooble.org",
  ES: "es.jooble.org",
};

interface JoobleJob {
  title?: string;
  location?: string;
  company?: string;
  link?: string;
  updated?: string;
}

/**
 * ⚠️ IDŐKORLÁT A KÜLSŐ HÍVÁSON — VALÓS KIESÉSBŐL (2026-08-05).
 * A „Kinti Job Sync (NL)" cron 30 mp-es timeoutra futott, miközben a szokásos
 * futásideje 7–8 mp. Ok: a szinkron 25 szektort kérdez le KÉT szolgáltatótól
 * (50 külső hívás, 6-os batch-ekben), és EGYIK fetch-en sem volt időkorlát —
 * egyetlen lassan válaszoló forrás elhúzta az egész futást. A timeout azt is
 * jelentette, hogy AZNAP EGYETLEN állás sem frissült (az upsert a ciklus után,
 * egyszer fut).
 */
const KULSO_TIMEOUT_MS = 8000;

export interface JoobleSearch {
  jobs: AdzunaJob[];
  configured: boolean;
}

export async function searchJoobleJobs(country: string, keyword: string, limit = 20, region?: string): Promise<JoobleSearch> {
  const env = getCloudflareEnv() as unknown as { JOOBLE_API_KEY?: string };
  const key = env.JOOBLE_API_KEY;
  if (!key) return { jobs: [], configured: false };

  const q = keyword.trim();
  if (!q) return { jobs: [], configured: true };
  // Tartomány-szűrő: ha van region, azt használjuk helyszínként (pl. "Wien"),
  // különben az egész országot.
  const location = (region ?? "").trim() || COUNTRY_LOCATION[country.toUpperCase()] || "";

  const host = COUNTRY_HOST[country.toUpperCase()] ?? "jooble.org";

  try {
    const res = await fetch(`https://${host}/api/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ keywords: q, location }),
      signal: AbortSignal.timeout(KULSO_TIMEOUT_MS),
    });
    if (!res.ok) return { jobs: [], configured: true };
    const data = (await res.json()) as { jobs?: JoobleJob[] };
    const jobs: AdzunaJob[] = (data.jobs ?? [])
      .slice(0, limit)
      .map((j) => ({
        title: String(j.title ?? "").replace(/<[^>]*>/g, "").trim(),
        company: j.company || null,
        location: j.location || null,
        salaryMin: null,
        salaryMax: null,
        url: String(j.link ?? ""),
        created: j.updated ?? null,
      }))
      .filter((j) => j.title && /^https?:\/\//.test(j.url));
    return { jobs, configured: true };
  } catch {
    return { jobs: [], configured: true };
  }
}
