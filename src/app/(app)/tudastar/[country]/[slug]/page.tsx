import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import {
  GUIDES,
  getGuide,
  guidesForCountry,
  countryMeta,
  categoryMeta,
  tocFromHtml,
  TUDASTAR_DISCLAIMER,
} from "@/lib/tudastar";
import { TudastarCta } from "./TudastarCta";

// Tisztán statikus tartalom (lib/tudastar.ts) → SSG: minden cikk build-időben
// prerenderelt statikus HTML, NEM fogyaszt edge-route-ot (deploy-plafon). Az
// ismeretlen ország/slug 404 a build-listából (dynamicParams=false).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ country: g.country, slug: g.slug }));
}

export function generateMetadata({ params }: { params: { country: string; slug: string } }): Metadata {
  const guide = getGuide(params.country, params.slug);
  if (!guide) return { title: "Tudástár — Kinti" };
  const path = `/tudastar/${guide.country}/${guide.slug}`;
  const title = `${guide.title} — Kinti Tudástár`;
  return {
    title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: guide.description,
      url: path,
      type: "article",
      siteName: "Kinti",
    },
    twitter: { card: "summary", title, description: guide.description },
  };
}

export default function GuidePage({ params }: { params: { country: string; slug: string } }) {
  const guide = getGuide(params.country, params.slug);
  if (!guide) notFound();

  const country = countryMeta(guide.country);
  const cat = categoryMeta(guide.category);
  const { html, toc } = tocFromHtml(guide.contentHtml);
  const related = guidesForCountry(guide.country).filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      {/* Morzsamenü */}
      <nav aria-label="Morzsamenü" className="flex flex-wrap items-center gap-1 text-[11.5px] text-ink-muted">
        <Link href="/" className="hover:text-primary">Főoldal</Link>
        <Icon name="chevR" size={11} strokeWidth={2.4} className="text-ink-faint" />
        <Link href="/tudastar" className="hover:text-primary">Tudástár</Link>
        <Icon name="chevR" size={11} strokeWidth={2.4} className="text-ink-faint" />
        <Link href={`/tudastar?country=${guide.country}`} className="hover:text-primary">
          {country?.flag} {country?.label}
        </Link>
        <Icon name="chevR" size={11} strokeWidth={2.4} className="text-ink-faint" />
        <span className="truncate font-semibold text-ink" aria-current="page">{guide.title}</span>
      </nav>

      {/* Cím + meta */}
      <header className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-pill bg-primary-soft px-2.5 py-1 text-[11.5px] font-bold text-primary">
            {country?.flag} {country?.label}
          </span>
          {cat && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2.5 py-1 text-[11.5px] font-bold text-ink-muted">
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <h1 className="text-[23px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          {guide.title}
        </h1>
        <p className="text-[13.5px] leading-snug text-ink-muted">{guide.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} strokeWidth={2.2} /> {guide.readTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="check" size={13} strokeWidth={2.2} /> Utoljára frissítve: {guide.lastUpdated}
          </span>
        </div>
      </header>

      {/* Tartalomjegyzék — mobil-first layout: a cikk fölött, összecsukható */}
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
                  {t.text}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* A cikk tartalma (megbízható, saját HTML → prose-kinti tipográfia) */}
      <article
        className="prose-kinti"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Hivatalos forrás(ok) + jogi diszkleimer */}
      <section className="rounded-card border border-line bg-surface-alt/50 px-4 py-3.5 text-[11.5px] leading-relaxed text-ink-muted">
        {guide.officialSources && guide.officialSources.length > 0 && (
          <p className="mb-1.5">
            <strong className="text-ink">Hivatalos forrás:</strong>{" "}
            {guide.officialSources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && " · "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        )}
        <p>{TUDASTAR_DISCLAIMER}</p>
      </section>

      {/* Konverziós CTA — a Szaknévsor szakemberkeresőjére, ország + kategória szerint */}
      <TudastarCta guide={guide} />

      {/* Kapcsolódó cikkek ugyanabból az országból */}
      {related.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            További {country?.label}-útmutatók
          </h2>
          <div className="grid gap-2">
            {related.map((g) => {
              const gc = categoryMeta(g.category);
              return (
                <Link
                  key={g.slug}
                  href={`/tudastar/${g.country}/${g.slug}`}
                  className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-surface-alt text-[15px]">
                    {gc?.emoji ?? "📄"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-ink">{g.title}</span>
                    <span className="block text-[11.5px] text-ink-faint">{g.readTime}</span>
                  </span>
                  <Icon name="chevR" size={15} strokeWidth={2.4} className="shrink-0 text-ink-muted" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
