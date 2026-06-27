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
};

interface JoobleJob {
  title?: string;
  location?: string;
  company?: string;
  link?: string;
  updated?: string;
}

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

  try {
    const res = await fetch(`https://jooble.org/api/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ keywords: q, location }),
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
