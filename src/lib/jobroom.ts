/**
 * jobroom.ts — VALÓDI svájci állások a hivatalos állami álláskeresőből (Job-Room,
 * SECO / arbeit.swiss). Teljesen jogtiszta: NYILVÁNOS állami API, nincs kulcs, nincs
 * scrape — egy állami szerv a saját nyílt adatát ~soha nem perli. A találatok KIFELÉ
 * linkelnek (externalUrl, pl. jobs.ch). Ez fedi CH-t (az Adzuna nem, a Jooble-kulcs
 * nem ad CH-t). Lásd [[jobs-aggregation-strategy]].
 *
 * Végpont (a job-room.ch frontend publikus keresője): POST .../jobAdvertisements/_search
 * — üres body `{}` a legfrissebbeket adja, page/size lapozással.
 */
import type { ExternalJobInput } from "./repo-external-jobs";

const SEARCH_URL = "https://www.job-room.ch/jobadservice/api/jobAdvertisements/_search";

/**
 * Cím-alapú best-effort besorolás a mi job-categories kategóriáinkba (CH német/svájci
 * címek). Az első egyezés nyer → a sorrend számít (specifikus szakmák elöl, a tág
 * gyűjtő-minták hátul). Találat nélkül null (a UI akkor nem tesz kategória-pillt).
 */
const CLASSIFY: [RegExp, string][] = [
  [/pfleg|krankensch|krankenpfleg|altenpfleg|spitex|gesundheit|\barzt\b|mediz|betreuung|fage\b|fabe\b|sozialpäd|therapeut/i, "egeszsegugy"],
  [/coiffe|friseur|kosmetik|nageldesign|barbier|beauty/i, "szepsegipar"],
  [/koch|köch|gastro|restaurant|kellner|servicemit|küche|\bhotel|barkeep|buffet|bäcker|confis|metzger|pâtiss|chef de/i, "vendeglatas"],
  [/lager|fahrer|chauffeur|logistik|stapler|kurier|\btransport|disponent|spediteur|kommission/i, "logisztika"],
  [/reinig|putz|hauswart|hausmeist|gebäuderein|unterhaltsrein|raumpfleg/i, "takaritas"],
  [/landwirt|gärtner|gartenbau|garten|ernte|florist|gemüse|winzer|landschaft|baumpfleg|forst/i, "mezogazdasag"],
  [/verkauf|verkäuf|detailhandel|kassier|\bsales\b|filialleit|kundenberat|verkaufsber/i, "kereskedelem"],
  [/informatik|software|entwickl|developer|applikation|system engineer|\bdata\b|\bict\b|programmier|\bit[\s-]/i, "it"],
  [/büro|administ|sekretär|sachbearbeit|buchhalt|kaufmann|kauffrau|empfang|\bhr\b|personalwes|treuhand|assistent/i, "iroda"],
  [/maurer|maler|elektrik|installat|sanitär|spengler|gipser|schreiner|zimmer|dachdeck|polier|gebäudetech|haustechn|hochbau|tiefbau|bauleit|bauarbeit|\bhlk|metallbau|schlosser|monteur|gerüst|bodenleg|plattenleg/i, "epitoipar"],
  [/produktion|montage|schweiss|schweiß|mechanik|maschin|fabrik|industrie|\bcnc\b|operator|polymechan|metallarbeit|anlagenführ/i, "ipar-gyartas"],
];

function classify(title: string): string | null {
  for (const [re, cat] of CLASSIFY) if (re.test(title)) return cat;
  return null;
}

interface JobRoomItem {
  jobAdvertisement?: {
    status?: string;
    publication?: { startDate?: string };
    jobContent?: {
      externalUrl?: string;
      company?: { name?: string };
      location?: { city?: string; cantonCode?: string; countryIsoCode?: string };
      jobDescriptions?: { title?: string }[];
    };
  };
}

/**
 * A legfrissebb publikus CH-állások a Job-Room-ból, ExternalJobInput formára hozva.
 * Csak az externalUrl-lel rendelkezőket vesszük (garantált link-out), CH országgal.
 */
export async function fetchJobRoomJobs(pages = 3, size = 50): Promise<ExternalJobInput[]> {
  const out: ExternalJobInput[] = [];
  const seen = new Set<string>();

  for (let p = 0; p < pages; p++) {
    let arr: JobRoomItem[];
    try {
      const res = await fetch(`${SEARCH_URL}?page=${p}&size=${size}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", "user-agent": "kinti.app" },
        body: "{}",
        cf: { cacheTtl: 900, cacheEverything: true },
      } as RequestInit);
      if (!res.ok) break;
      arr = (await res.json()) as JobRoomItem[];
    } catch {
      break;
    }
    if (!Array.isArray(arr) || arr.length === 0) break;

    for (const item of arr) {
      const j = item.jobAdvertisement;
      const jc = j?.jobContent;
      if (!jc) continue;
      if (j?.status && j.status !== "PUBLISHED_PUBLIC") continue;
      const loc = jc.location ?? {};
      if (loc.countryIsoCode && loc.countryIsoCode !== "CH") continue; // csak CH
      const url = String(jc.externalUrl ?? "");
      if (!/^https?:\/\//.test(url) || seen.has(url)) continue;
      const title = String((jc.jobDescriptions ?? [])[0]?.title ?? "").replace(/<[^>]*>/g, "").trim();
      if (!title) continue;
      seen.add(url);
      const city = loc.city ?? null;
      out.push({
        source: "job-room",
        sourceUrl: url,
        title,
        company: jc.company?.name ?? null,
        location: city ? (loc.cantonCode ? `${city} (${loc.cantonCode})` : city) : (loc.cantonCode ?? null),
        country: "CH",
        category: classify(title),
        salaryMin: null,
        salaryMax: null,
        currency: null,
        postedAt: j?.publication?.startDate ?? null,
      });
    }
    if (arr.length < size) break;
  }
  return out;
}
