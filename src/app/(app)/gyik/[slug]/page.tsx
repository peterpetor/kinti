import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon, ScreenHeader } from "@/components/ui";
import { FAQ_PAGES, getFaqPage } from "@/lib/faq-pages";
import { safeJsonLdStringify } from "@/lib/json-ld";

/**
 * /gyik/[slug] — AEO (Answer Engine Optimization) GYIK-oldalak.
 *
 * SSG: force-static + generateStaticParams + dynamicParams=false → nulla
 * edge-route (deploy-plafon!). A sablon a lib/faq-pages AEO-elveit valósítja
 * meg: kérdés-címek H2-ben, featured-snippet válasz-nyitányok, TL;DR,
 * összehasonlító táblázat, FAQPage + BreadcrumbList JSON-LD, Kinti-CTA-k.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return FAQ_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getFaqPage(params.slug);
  if (!page) return { title: "Gyakori kérdések — Kinti" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/gyik/${page.slug}` },
    openGraph: { title: page.title, description: page.description, type: "article" },
  };
}

export default function FaqPageView({ params }: { params: { slug: string } }) {
  const page = getFaqPage(params.slug);
  if (!page) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.join(" ") },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Kinti", item: "https://kinti.app" },
      { "@type": "ListItem", position: 2, name: "Gyakori kérdések", item: "https://kinti.app/gyik" },
      { "@type": "ListItem", position: 3, name: page.title, item: `https://kinti.app/gyik/${page.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbJsonLd) }}
      />

      <ScreenHeader
        eyebrow="Gyakori kérdések"
        title={page.title}
        back={
          <Link
            href="/gyik"
            aria-label="Vissza a gyakori kérdésekhez"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </Link>
        }
      />

      {/* TL;DR — a válaszgépek és a sietős olvasók kivonata. */}
      <section className="rounded-card border border-primary/25 bg-primary-soft/40 p-4">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-primary">Röviden</h2>
        <ul className="mt-2 space-y-1.5">
          {page.tldr.map((t) => (
            <li key={t} className="flex gap-1.5 text-[13px] leading-relaxed text-ink">
              <span className="shrink-0 text-primary" aria-hidden>•</span> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Kérdés-válasz szekciók — H2 = természetes kérdő mondat. */}
      {page.faqs.map((f) => (
        <section key={f.q} className="space-y-2">
          <h2 className="text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-ink">
            {f.q}
          </h2>
          {f.a.map((p) => (
            <p key={p.slice(0, 40)} className="text-[13.5px] leading-relaxed text-ink-muted">
              {p}
            </p>
          ))}
          {f.links && f.links.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {f.links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="inline-flex items-center gap-1 rounded-pill border border-primary/40 bg-primary/10 px-2.5 py-1 text-[12px] font-bold text-primary transition active:scale-[0.98]"
                >
                  {l.label}
                  <Icon name="chevR" size={11} strokeWidth={2.6} />
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Összehasonlító táblázat — a válaszgépek kedvence. */}
      {page.table && (
        <section className="space-y-2">
          <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-ink">{page.table.caption}</h2>
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
            <table className="w-full min-w-[420px] border-collapse text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-surface-alt/60">
                  {page.table.columns.map((c) => (
                    <th key={c} className="px-3 py-2 font-extrabold text-ink">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.table.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-line/60 last:border-0 align-top">
                    {row.map((cell, i) => (
                      <td key={i} className={i === 0 ? "px-3 py-2 font-bold text-ink" : "px-3 py-2 leading-snug text-ink-muted"}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CTA-k a Kinti funkcióira. */}
      <section className="space-y-2">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">Ezekkel segít a Kinti</h2>
        {page.ctas.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">{c.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">{c.title}</span>
              <span className="block text-[11.5px] leading-snug text-ink-muted">{c.subtitle}</span>
            </span>
            <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          </Link>
        ))}
      </section>

      <p className="text-[11px] leading-relaxed text-ink-faint">
        Tájékoztató jellegű összefoglaló hivatalos forrásokból ({page.updatedAt}) — nem jogi
        tanácsadás. A szabályok időben és régiónként változhatnak; a rád vonatkozó pontos
        előírásokért mindig az illetékes hivatal oldalát nézd.
      </p>
    </div>
  );
}
