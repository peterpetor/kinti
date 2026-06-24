/**
 * arbeitnow.ts — INGYENES, KULCS NÉLKÜLI állás-forrás (Arbeitnow job-board API).
 *
 * Jogtiszta nyilvános API (nem scrape). Fallback, ha nincs Adzuna-kulcs.
 * Korlát: a publikus végpont a legfrissebb tábla-feedet adja (nincs szerveroldali
 * kulcsszó-keresés), ezért a feedet KLIENS-oldalon szűrjük kulcsszóra + országra.
 * Erősen DE/EU + remote fókusz; AT-ra gyérebb — a teljes AT/DE/NL lefedés az
 * Adzuna (kulccsal). Lásd [[recruitment-placement]].
 */
import type { AdzunaJob } from "./adzuna";

interface ArbeitnowJob {
  title?: string;
  company_name?: string;
  url?: string;
  location?: string;
  remote?: boolean;
  tags?: string[];
  created_at?: number;
}

/** Ország → város/ország-kulcsszavak a feed-szűréshez. */
const COUNTRY_HINTS: Record<string, string[]> = {
  AT: ["austria", "österreich", "osterreich", "wien", "vienna", "graz", "linz", "salzburg", "innsbruck"],
  DE: ["germany", "deutschland", "berlin", "münchen", "munich", "hamburg", "köln", "cologne", "frankfurt", "stuttgart"],
  NL: ["netherlands", "nederland", "amsterdam", "rotterdam", "utrecht", "den haag", "the hague", "eindhoven"],
};

export async function searchArbeitnowJobs(country: string, keyword: string, limit = 20, region?: string): Promise<AdzunaJob[]> {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  const hints = COUNTRY_HINTS[country.toUpperCase()] ?? [];
  const reg = (region ?? "").trim().toLowerCase();
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { accept: "application/json", "user-agent": "kinti.app" },
      cf: { cacheTtl: 600, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: ArbeitnowJob[] };
    return (data.data ?? [])
      .filter((j) => {
        const hay = `${j.title ?? ""} ${(j.tags ?? []).join(" ")} ${j.location ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
        const loc = (j.location ?? "").toLowerCase();
        // Tartomány-szűrő (best-effort): ha megadtak régiót, a location tartalmazza.
        if (reg && !loc.includes(reg)) return false;
        // Ország-egyezés: remote, vagy a location tartalmaz egy ország-kulcsszót.
        return j.remote === true || hints.length === 0 || hints.some((h) => loc.includes(h));
      })
      .slice(0, limit)
      .map((j) => ({
        title: String(j.title ?? "").replace(/<[^>]*>/g, "").trim(),
        company: j.company_name ?? null,
        location: j.location ?? (j.remote ? "Remote" : null),
        salaryMin: null,
        salaryMax: null,
        url: String(j.url ?? ""),
        created: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
      }))
      .filter((j) => j.title && /^https?:\/\//.test(j.url));
  } catch {
    return [];
  }
}
