import Link from "next/link";
import type { Metadata } from "next";
import { Icon, ScreenHeader } from "@/components/ui";
import { getBusinessesForList, getCategories } from "@/lib/repo";
import { areasForBusiness, COUNTRY_NAMES, type SeoArea } from "@/lib/seo-areas";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /magyar — a kategória×terület SEO-céloldalak INDEX-HUB-ja.
 *
 * SEO-szerep: eddig a /magyar/[kategoria]/[terulet] oldalakra csak a sitemap
 * és a cég-aloldalak mutattak (árva-közeli oldalak) — ez a hub adja a tiszta
 * bejárási fát: főoldal → /magyar → minden céloldal (2 kattintás). Csak a
 * NEM-üres kombókat linkeli (a sitemap-pel azonos szabály — nincs thin-content
 * link), így minden link valós tartalomra mutat.
 */

export const metadata: Metadata = {
  title: "Magyar szakemberek külföldön — régiónként és szakmánként",
  description:
    "Magyarul beszélő szakemberek és vállalkozások Svájcban, Ausztriában, Németországban és Hollandiában — böngéssz régió és szakma szerint a Kinti szaknévsorában.",
  alternates: { canonical: "/magyar" },
};

const COUNTRY_ORDER = ["CH", "AT", "DE", "NL"] as const;

export default async function MagyarHub() {
  // Karcsú, cache-elt vetület (getBusinessesForList) — csak categoryId +
  // terület-illesztő mezők kellenek, ld. a /magyar/[kategoria]/[terulet]
  // melletti jegyzetet (2026-07-19 audit, uncached SELECT * kiváltása).
  const [businesses, categories] = await Promise.all([getBusinessesForList(), getCategories()]);
  const catLabel = new Map(categories.map((c) => [c.id, c.label] as const));

  // terület → (kategória → darabszám); csak létező kategóriájú cégekből.
  const areaMeta = new Map<string, SeoArea>();
  const combos = new Map<string, Map<string, number>>();
  for (const b of businesses) {
    if (!catLabel.has(b.categoryId)) continue;
    for (const area of areasForBusiness(b)) {
      areaMeta.set(area.slug, area);
      const perCat = combos.get(area.slug) ?? new Map<string, number>();
      perCat.set(b.categoryId, (perCat.get(b.categoryId) ?? 0) + 1);
      combos.set(area.slug, perCat);
    }
  }

  // Országonként, terület-lista cég-darabszám szerint csökkenőben.
  const byCountry = COUNTRY_ORDER.map((country) => {
    const areas = [...combos.entries()]
      .filter(([slug]) => areaMeta.get(slug)?.country === country)
      .map(([slug, perCat]) => ({
        area: areaMeta.get(slug)!,
        cats: [...perCat.entries()].sort((a, b) => b[1] - a[1]),
        total: [...perCat.values()].reduce((n, v) => n + v, 0),
      }))
      // Az ország-szintű összesítő oldal (code=null) kerüljön előre.
      .sort((a, b) => (a.area.code === null ? -1 : b.area.code === null ? 1 : b.total - a.total));
    return { country, areas };
  }).filter((c) => c.areas.length > 0);

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        eyebrow="Szaknévsor"
        title="Magyar szakemberek régiónként"
        back={
          <Link
            href="/szaknevsor"
            aria-label="Vissza a Szaknévsorhoz"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </Link>
        }
      />

      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        Magyarul beszélő szakemberek és vállalkozások négy országban — válassz
        régiót és szakmát, vagy böngéssz a teljes{" "}
        <Link href="/szaknevsor" className="font-bold text-primary underline">Szaknévsorban</Link>.
      </p>

      {byCountry.map(({ country, areas }) => (
        <section key={country} className="space-y-4">
          <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
            {COUNTRY_NAMES[country] ?? country}
          </h2>
          {areas.map(({ area, cats }) => (
            <div key={area.slug} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <h3 className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
                {area.name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cats.map(([catId, n]) => (
                  <Link
                    key={catId}
                    href={`/magyar/${catId}/${area.slug}`}
                    className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-2.5 py-1 text-[12px] font-bold text-ink transition hover:border-primary/40 hover:text-primary"
                  >
                    {catLabel.get(catId)}
                    <span className="text-[10.5px] font-semibold text-ink-faint">{n}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <p className="text-[11.5px] leading-snug text-ink-faint">
        Nem találod a szakmád a régiódban?{" "}
        <Link href="/szaknevsor/uj" className="font-bold text-primary underline">
          Add hozzá a vállalkozásod ingyen
        </Link>{" "}
        — vagy írd ki a{" "}
        <Link href="/keresek" className="font-bold text-primary underline">Keresek-táblára</Link>,
        mire van szükséged.
      </p>
    </div>
  );
}
