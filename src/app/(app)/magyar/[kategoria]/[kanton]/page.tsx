import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BusinessCard, Icon, ScreenHeader } from "@/components/ui";
import { getBusinesses, getCategories } from "@/lib/repo";
import { CANTONS, cantonFromSlug, cantonFromAddress, cantonToSlug } from "@/lib/cantons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /magyar/[kategoria]/[kanton] — SEO landing oldal:
 *   pl. /magyar/fodrasz/zurich, /magyar/orvos/bern.
 *
 * Cél: a Google-keresésre ("magyar fodrász Zürich") találatként megjelenni.
 * Statikusan generált / cache-elhető lista a meglévő businesses adatból,
 * proper title/description + canonical metaadattal.
 */

interface Params {
  kategoria: string;
  kanton: string;
}

async function resolve(params: Params) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === params.kategoria);
  const canton = cantonFromSlug(params.kanton);
  return { category, canton };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, canton } = await resolve(params);
  if (!category || !canton) return { title: "Magyar szakember — kinti" };

  const title = `Magyar ${category.label} — ${canton.name} kanton`;
  const description = `Magyar nyelven beszélő ${category.label.toLowerCase()} ${canton.name} kantonban (Svájc). A kintik által ajánlott, ellenőrzött szakemberek egy helyen.`;

  return {
    title,
    description,
    alternates: { canonical: `/magyar/${params.kategoria}/${params.kanton}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function MagyarLanding({ params }: { params: Params }) {
  const { category, canton } = await resolve(params);
  if (!category || !canton) notFound();

  // A kanton-szűrés a cím PLZ-ből történik (mint a Szaknévsorban).
  const all = await getBusinesses({ category: category.id });
  const businesses = all.filter((b) => cantonFromAddress(b.address ?? null)?.code === canton.code);

  // Kapcsolódó: ugyanez a kategória másik kantonokban + ez a kanton másik kategóriákban.
  const otherCantons = CANTONS.filter((c) => c.code !== canton.code).slice(0, 6);
  const categories = await getCategories();
  const otherCategories = categories.filter((c) => c.id !== category.id && c.id !== "all").slice(0, 6);

  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ScreenHeader
        eyebrow={`Szaknévsor · ${canton.name} (${canton.code})`}
        title={
          <>
            Magyar {category.label}
            <br />
            {canton.name} kantonban
          </>
        }
      />

      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        Magyar nyelven beszélő {category.label.toLowerCase()} {canton.name} kantonban. A kintik
        által ajánlott szakemberek — anyanyelven, helyben.
      </p>

      {/* Találatok */}
      {businesses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-10 text-center">
          <Icon name="search" size={26} className="text-ink-faint" />
          <p className="text-[13.5px] font-semibold text-ink">
            Még nincs magyar {category.label.toLowerCase()} {canton.name} kantonban
          </p>
          <p className="text-[12.5px] text-ink-muted">
            Te vagy az első? Add hozzá ingyen, 1 perc alatt.
          </p>
          <Link
            href="/szaknevsor/uj"
            className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white"
          >
            Vállalkozásod hozzáadása <Icon name="arrowRight" size={13} strokeWidth={2.4} />
          </Link>
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
            Email-megerősítés után azonnal megjelenik
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.4} className="text-primary" />
      </Link>

      {/* Kapcsolódó kantonok ugyanebben a kategóriában */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Magyar {category.label.toLowerCase()} más kantonokban
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {otherCantons.map((c) => (
            <Link
              key={c.code}
              href={`/magyar/${category.id}/${cantonToSlug(c.name)}`}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-surface-alt transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Más szakmák ebben a kantonban */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Más szakmák {canton.name} kantonban
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {otherCategories.map((c) => (
            <Link
              key={c.id}
              href={`/magyar/${c.id}/${cantonToSlug(canton.name)}`}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-surface-alt transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
