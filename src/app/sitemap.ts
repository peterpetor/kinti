import type { MetadataRoute } from "next";
import { getBusinesses, getCategories, getJobs } from "@/lib/repo";
import { CANTONS, cantonFromAddress, cantonToSlug } from "@/lib/cantons";
import { GUIDES } from "@/lib/guides";

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
    { path: "/kozosseg", priority: 0.9, changeFrequency: "daily" },
    { path: "/allasok", priority: 0.8, changeFrequency: "daily" },
    { path: "/tudasbazis", priority: 0.8, changeFrequency: "weekly" },
    { path: "/hirlevel", priority: 0.6, changeFrequency: "monthly" },
    { path: "/szaknevsor/uj", priority: 0.6, changeFrequency: "monthly" },
    { path: "/impresszum", priority: 0.3, changeFrequency: "yearly" },
    { path: "/adatvedelem", priority: 0.3, changeFrequency: "monthly" },
    { path: "/aszf", priority: 0.3, changeFrequency: "yearly" },
  ];
  for (const p of staticPages) {
    items.push({ url: `${BASE}${p.path}`, lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority });
  }

  // 2) Tudásbázis cikkek
  for (const g of GUIDES) {
    items.push({
      url: `${BASE}/tudasbazis/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // 3) Vállalkozások + kanton×kategória landing oldalak
  try {
    const [businesses, categories] = await Promise.all([
      getBusinesses(),
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

    // SEO landing oldalak: csak azokat a kanton×kategória kombókat, ahol van
    // legalább 1 vállalkozás (különben "thin content" lenne).
    const combos = new Set<string>();
    for (const b of businesses) {
      const canton = cantonFromAddress(b.address ?? null);
      if (!canton) continue;
      combos.add(`${b.categoryId}|${canton.code}`);
    }
    for (const combo of combos) {
      const [catId, cantonCode] = combo.split("|");
      const cat = categories.find((c) => c.id === catId);
      const canton = CANTONS.find((c) => c.code === cantonCode);
      if (!cat || !canton) continue;
      items.push({
        url: `${BASE}/magyar/${catId}/${cantonToSlug(canton.name)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    /* ha a DB nem elérhető, a statikus oldalak akkor is jönnek */
  }

  // 4) Álláshirdetések (job board)
  try {
    const jobs = await getJobs({ status: "active" });
    for (const job of jobs) {
      items.push({
        url: `${BASE}/allasok/${job.id}`,
        lastModified: job.updatedAt ? new Date(job.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }
  } catch {
    /* ha a DB nem elérhető, kihagyjuk */
  }

  return items;
}
