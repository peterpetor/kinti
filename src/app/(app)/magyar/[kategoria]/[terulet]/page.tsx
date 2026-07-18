import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BusinessCard, Icon, ScreenHeader } from "@/components/ui";
import { getBusinessesForList, getCategories } from "@/lib/repo";
import { areaFromSlug, businessInArea, areasForBusiness, COUNTRY_NAMES } from "@/lib/seo-areas";
import { safeJsonLdStringify } from "@/lib/json-ld";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /magyar/[kategoria]/[terulet] — SEO landing oldal:
 *   pl. /magyar/fodrasz/zurich, /magyar/pszichologus/becs, /magyar/ugyved/nemetorszag.
 *
 * Cél: a Google-keresésre ("magyar fodrász Zürich", "magyar pszichológus Bécs")
 * találatként megjelenni. 2026-07-03-tól ORSZÁG-TUDATOS (lib/seo-areas.ts):
 * a svájci kanton-URL-ek változatlanok, plusz AT/DE/NL területek és
 * ország-szintű oldalak. Üres kombó: noindex (thin content ellen), de él a
 * „add hozzá a vállalkozásod" CTA-val.
 */

interface Params {
  kategoria: string;
  terulet: string;
}

async function resolve(params: Params) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === params.kategoria);
  const area = areaFromSlug(params.terulet);
  return { category, area, categories };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, area } = await resolve(params);
  if (!category || !area) return { title: "Magyar szakember — Kinti" };

  const title = `Magyar ${category.label} ${area.locative}`;
  const description = `Magyar nyelven beszélő ${category.label.toLowerCase()} ${area.locative} (${COUNTRY_NAMES[area.country]}). A Kintik által ajánlott, ellenőrzött szakemberek egy helyen.`;

  // Üres kombó → noindex (thin content ellen); a linkek követhetők maradnak.
  // A karcsú, cache-elt lista-vetületet használjuk (getBusinessesForList) —
  // ugyanaz az adatforrás, mint a lenti oldal-render, hogy ne fusson kétszer
  // teljes SELECT * a businesses táblán minden metaadat-generáláskor (37+ SEO
  // régió-oldal, gyakran botok/AI-crawlerek látogatják — 2026-07-19 audit).
  const all = (await getBusinessesForList()).filter((b) => b.categoryId === category.id);
  const hasContent = all.some((b) => businessInArea(b, area));

  const url = `https://kinti.app/magyar/${params.kategoria}/${params.terulet}`;
  const image = "https://kinti.app/icons/og-default.png";

  return {
    title,
    description,
    alternates: { canonical: `/magyar/${params.kategoria}/${params.terulet}` },
    robots: hasContent ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "Kinti",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function MagyarLanding({ params }: { params: Params }) {
  const { category, area, categories } = await resolve(params);
  if (!category || !area) notFound();

  // EGY (cache-elt, karcsú) lekérdezésből dolgozik minden szekció (lista +
  // kapcsolódó linkek) — ld. a generateMetadata melletti jegyzetet.
  const everything = await getBusinessesForList();
  const byCategory = everything.filter((b) => b.categoryId === category.id);
  const businesses = byCategory.filter((b) => businessInArea(b, area));

  // Kapcsolódó területek ugyanebben a kategóriában — CSAK ahol van találat
  // (nincs „thin content" link üres oldalakra).
  const otherAreaSlugs = new Map<string, string>(); // slug → name
  for (const b of byCategory) {
    for (const a of areasForBusiness(b)) {
      if (a.slug !== area.slug) otherAreaSlugs.set(a.slug, a.name);
    }
  }
  const otherAreas = [...otherAreaSlugs.entries()].slice(0, 10);

  // Más szakmák EZEN a területen — csak ahol tényleg van találat.
  const inArea = everything.filter((b) => businessInArea(b, area));
  const otherCatIds = new Set(inArea.map((b) => b.categoryId));
  const otherCategories = categories
    .filter((c) => otherCatIds.has(c.id) && c.id !== category.id && c.id !== "all")
    .slice(0, 10);

  // Strukturált adat: a találatok ItemList-je + breadcrumb (rich result jelöltek).
  const base = "https://kinti.app";
  const pageUrl = `${base}/magyar/${params.kategoria}/${params.terulet}`;
  const itemListJsonLd = businesses.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Magyar ${category.label} — ${area.name}`,
        numberOfItems: businesses.length,
        itemListElement: businesses.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${base}/szaknevsor/${b.id}`,
          name: b.name,
        })),
      }
    : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Szaknévsor", item: `${base}/szaknevsor` },
      { "@type": "ListItem", position: 2, name: category.label, item: pageUrl },
      { "@type": "ListItem", position: 3, name: area.name, item: pageUrl },
    ],
  };

  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(itemListJsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-muted" aria-label="Útvonal">
        <Link href="/szaknevsor" className="hover:text-primary">Szaknévsor</Link>
        <Icon name="chevR" size={11} className="text-ink-faint" />
        <span className="text-ink">{category.label}</span>
        <Icon name="chevR" size={11} className="text-ink-faint" />
        <span className="text-ink">{area.name}</span>
      </nav>

      <ScreenHeader
        eyebrow={`Szaknévsor · ${area.name} (${COUNTRY_NAMES[area.country]})`}
        title={
          <>
            Magyar {category.label}
            <br />
            {area.locative}
          </>
        }
      />

      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        Magyar nyelven beszélő {category.label.toLowerCase()} {area.locative}. A Kintik
        által ajánlott szakemberek — anyanyelven, helyben.
      </p>

      {/* Találatok */}
      {businesses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-10 text-center">
          <Icon name="search" size={26} className="text-ink-faint" />
          <p className="text-[13.5px] font-semibold text-ink">
            Még nincs magyar {category.label.toLowerCase()} {area.locative}
          </p>
          <p className="text-[12.5px] text-ink-muted">
            Te vagy az első? Add hozzá ingyen — vagy ajánld be, akit ismersz.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link
              href="/szaknevsor/uj"
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white"
            >
              Vállalkozásod hozzáadása <Icon name="arrowRight" size={13} strokeWidth={2.4} />
            </Link>
            <Link
              href="/szaknevsor/ajanlas"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink"
            >
              <Icon name="plus" size={13} strokeWidth={2.6} /> Ismerek egyet — beajánlom
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
            {businesses.length} találat
          </p>
          <div className="grid gap-2.5">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} href={`/szaknevsor/${b.id}`} />
            ))}
          </div>
        </>
      )}

      {/* CTA: add hozzá */}
      <Link
        href="/szaknevsor/uj"
        className="flex items-center gap-3 rounded-card border border-primary/25 bg-primary-soft p-3.5 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
          <Icon name="plus" size={18} strokeWidth={2.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold tracking-[-0.01em] text-ink">
            Itt a vállalkozásod? Add hozzá ingyen
          </span>
          <span className="block text-[11.5px] text-ink-muted">
            Jóváhagyás után megjelenik a listában
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.4} className="text-primary" />
      </Link>

      {/* Kapcsolódó területek ugyanebben a kategóriában (csak ahol van találat) */}
      {otherAreas.length > 0 && (
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Magyar {category.label.toLowerCase()} máshol
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {otherAreas.map(([slug, name]) => (
            <Link
              key={slug}
              href={`/magyar/${category.id}/${slug}`}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-surface-alt transition"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Más szakmák ezen a területen (csak ahol van találat) */}
      {otherCategories.length > 0 && (
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Más szakmák {area.locative}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {otherCategories.map((c) => (
            <Link
              key={c.id}
              href={`/magyar/${c.id}/${area.slug}`}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-surface-alt transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
