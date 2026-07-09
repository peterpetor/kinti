import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { getGuide, getGuides, guideCountry, GUIDES, GUIDES_DISCLAIMER, relatedCategoriesForGuide } from "@/lib/guides";
import { GuideProCta } from "./GuideProCta";

// Tisztán statikus tartalom (lib/guides.ts) + generateStaticParams → SSG:
// minden cikk build-time prerenderelt, NEM fogyaszt edge-route-ot
// (deploy-plafon). dynamicParams=false: ismeretlen slug → 404 build-listából.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Tudásbázis" };
  const path = `/tudasbazis/${guide.slug}`;
  const title = `${guide.title} — Kinti Tudásbázis`;
  return {
    title,
    description: guide.summary,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: guide.summary,
      url: path,
      type: "article",
      siteName: "Kinti",
    },
    twitter: { card: "summary", title, description: guide.summary },
  };
}

/** Fejezet-cím → horgony-id (a tartalomjegyzékhez). */
function sectionId(heading: string, i: number): string {
  const slug = heading
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `${slug}-${i}` : `szakasz-${i}`;
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const country = guideCountry(guide.slug);
  // Kapcsolódó cikkek CSAK a cikk országából (nem keveredik AT/DE/NL a CH-val).
  const related = getGuides(country).filter((g) => g.slug !== guide.slug).slice(0, 3);
  const relatedPros = relatedCategoriesForGuide(guide.slug);
  const toc = guide.sections.map((s, i) => ({ id: sectionId(s.heading, i), heading: s.heading }));

  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary-soft text-primary">
              <Icon name={guide.icon} size={16} strokeWidth={2.4} />
            </span>
            <h1 className="text-[21px] font-extrabold leading-tight tracking-tight text-ink text-balance">
              {guide.title}
            </h1>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">{guide.summary}</p>
        </div>
        <Link
          href="/tudasbazis"
          aria-label="Vissza a Tudásbázishoz"
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
        </Link>
      </header>

      {/* Tartalomjegyzék (a fejezet-címekből, horgony-linkekkel) */}
      {toc.length > 1 && (
        <details className="group rounded-card border border-line bg-surface shadow-card" open>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[12.5px] font-bold text-ink">
            <Icon name="list" size={15} strokeWidth={2.4} className="text-primary" />
            Tartalomjegyzék
            <Icon name="chevD" size={14} strokeWidth={2.4} className="ml-auto text-ink-muted transition-transform group-open:rotate-180" />
          </summary>
          <ul className="space-y-1 px-4 pb-3">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="block rounded-lg px-2 py-1 text-[12.5px] text-ink-muted transition hover:bg-surface-alt hover:text-primary">
                  {t.heading}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Szekciók */}
      <article className="space-y-4">
        {guide.sections.map((s, i) => (
          <section key={i} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <h2 id={sectionId(s.heading, i)} className="mb-2 scroll-mt-24 text-[15px] font-extrabold tracking-[-0.01em] text-ink">
              {s.heading}
            </h2>
            {s.body?.map((p, j) => (
              <p key={j} className="mb-2 text-[13.5px] leading-relaxed text-ink-muted last:mb-0">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-1 space-y-1.5">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-muted">
                    <Icon name="check" size={14} strokeWidth={2.6} className="mt-0.5 shrink-0 text-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      {/* Hivatalos források */}
      <section className="rounded-card border border-line bg-surface-alt p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          <Icon name="globe" size={13} strokeWidth={2.4} className="text-primary" />
          Hivatalos források
        </h2>
        <ul className="space-y-2">
          {guide.sources.map((src) => (
            <li key={src.url}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1.5 text-[12.5px] font-semibold leading-snug text-primary underline underline-offset-2"
              >
                <Icon name="arrowRight" size={13} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                <span>{src.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-1 text-[11px] leading-relaxed text-ink-faint">{GUIDES_DISCLAIMER}</p>

      {/* Kapcsolódó szakemberek a Szaknévsorban (belső link → konverzió).
          Ország-tudatos: kattintáskor a cikk országára állítja a keresőt. */}
      <GuideProCta country={country} categories={relatedPros} />

      {/* Kapcsolódó útmutatók */}
      {related.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            További útmutatók
          </h2>
          <div className="grid gap-2">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/tudasbazis/${g.slug}`}
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 shadow-card transition active:scale-[0.99]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary">
                  <Icon name={g.icon} size={15} strokeWidth={2.3} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">
                  {g.title}
                </span>
                <Icon name="chevR" size={14} className="shrink-0 text-ink-muted" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
