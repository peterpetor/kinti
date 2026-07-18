import type { MetadataRoute } from "next";
import { getBusinessesForList, getCategories, getJobs, getPublishedStories } from "@/lib/repo";
import { parseDbDate } from "@/lib/dates";
import { areasForBusiness } from "@/lib/seo-areas";
import { GUIDES, GUIDES_UPDATED_AT } from "@/lib/guides";
import { FAQ_PAGES } from "@/lib/faq-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE = "https://kinti.app";

/**
 * Dinamikus sitemap.xml — a fő oldalakat, az összes vállalkozást, a tudásbázis
 * cikkeket és a kanton×kategória landing oldalakat (csak azokat, ahol van
 * tartalom) felsorolja a Google-nek.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [];

  // 1) Stabil fő oldalak
  const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/szaknevsor", priority: 0.9, changeFrequency: "daily" },
    // A kategória×terület landing-fa index-hubja (belső-link architektúra).
    { path: "/magyar", priority: 0.8, changeFrequency: "weekly" },
    { path: "/allasok", priority: 0.8, changeFrequency: "daily" },
    // Albérlet-börze + Keresek-tábla + utalás-kalauz (publikus tartalom-oldalak).
    { path: "/piacter", priority: 0.7, changeFrequency: "daily" },
    { path: "/keresek", priority: 0.6, changeFrequency: "daily" },
    { path: "/utalas", priority: 0.6, changeFrequency: "monthly" },
    { path: "/munkaltato/kozvetites", priority: 0.8, changeFrequency: "monthly" },
    { path: "/tudasbazis", priority: 0.8, changeFrequency: "weekly" },
    // Kereshető eszköz-oldalak (long-tail SEO): kalkulátorok + CV-készítő.
    { path: "/berkalkulator", priority: 0.8, changeFrequency: "weekly" },
    { path: "/berkalkulator/nemetorszag", priority: 0.75, changeFrequency: "weekly" },
    { path: "/berkalkulator/ausztria", priority: 0.75, changeFrequency: "weekly" },
    { path: "/berkalkulator/svajc", priority: 0.75, changeFrequency: "weekly" },
    { path: "/berkalkulator/hollandia", priority: 0.75, changeFrequency: "weekly" },
    { path: "/nemet-oneletrajz", priority: 0.7, changeFrequency: "monthly" },
    { path: "/iranytu", priority: 0.6, changeFrequency: "weekly" },
    { path: "/hirlevel", priority: 0.6, changeFrequency: "monthly" },
    { path: "/szaknevsor/uj", priority: 0.6, changeFrequency: "monthly" },
    { path: "/ai-atlathatosag", priority: 0.4, changeFrequency: "monthly" },
    { path: "/impresszum", priority: 0.3, changeFrequency: "yearly" },
    { path: "/adatvedelem", priority: 0.3, changeFrequency: "monthly" },
    { path: "/aszf", priority: 0.3, changeFrequency: "yearly" },
  ];
  for (const p of staticPages) {
    items.push({ url: `${BASE}${p.path}`, lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority });
  }

  // 1/b) AEO GYIK-oldalak (FAQPage-sémával — a válaszgépek fő beszálló-pontjai).
  items.push({ url: `${BASE}/gyik`, lastModified: now, changeFrequency: "weekly", priority: 0.75 });
  for (const p of FAQ_PAGES) {
    items.push({
      url: `${BASE}/gyik/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  // 2) Tudásbázis cikkek (mind a 4 ország: CH/AT/DE/NL, slug-előtaggal).
  // lastModified = a bank VALÓDI frissítés-dátuma (a korábbi `now` minden
  // crawlnál „most változott"-at hazudott → a Google elengedi a lastmodot).
  for (const g of GUIDES) {
    items.push({
      url: `${BASE}/tudasbazis/${g.slug}`,
      lastModified: GUIDES_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // 3) Vállalkozások + kanton×kategória landing oldalak
  try {
    // Karcsú, cache-elt vetület — csak id/categoryId/terület-illesztő mező kell
    // (2026-07-19 audit: a sitemap minden crawler-hívásnál teljes, uncached
    // SELECT *-ot futtatott a businesses táblán).
    const [businesses, categories] = await Promise.all([
      getBusinessesForList(),
      getCategories(),
    ]);

    // Egyenkénti vállalkozói oldalak
    for (const b of businesses) {
      items.push({
        url: `${BASE}/szaknevsor/${b.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    // SEO landing oldalak: kategória×terület kombók MIND A 4 ORSZÁGRA
    // (lib/seo-areas.ts: CH-kantonok + AT/DE/NL területek + ország-oldalak) —
    // csak ahol van legalább 1 vállalkozás (különben "thin content" lenne).
    const combos = new Set<string>();
    for (const b of businesses) {
      if (!categories.some((c) => c.id === b.categoryId)) continue;
      for (const area of areasForBusiness(b)) {
        combos.add(`${b.categoryId}|${area.slug}`);
      }
    }
    for (const combo of combos) {
      const [catId, areaSlug] = combo.split("|");
      items.push({
        url: `${BASE}/magyar/${catId}/${areaSlug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    /* ha a DB nem elérhető, a statikus oldalak akkor is jönnek */
  }

  // 4) Élettörténetek (UGC-blog): a lista-oldal + minden publikált sztori.
  try {
    const stories = await getPublishedStories(null, 500);
    items.push({ url: `${BASE}/tortenetek`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    for (const s of stories) {
      items.push({
        url: `${BASE}/tortenetek/${s.slug}`,
        lastModified: parseDbDate(s.publishedAt ?? "") ?? now,
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
  } catch {
    /* ha a DB nem elérhető, kihagyjuk */
  }

  // 5) Álláshirdetések (job board)
  try {
    const jobs = await getJobs({ status: "active" });
    for (const job of jobs) {
      items.push({
        url: `${BASE}/allasok/${job.id}`,
        lastModified: parseDbDate(job.updatedAt) ?? now,
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }
  } catch {
    /* ha a DB nem elérhető, kihagyjuk */
  }

  return items;
}
