import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { getGuide, GUIDES, GUIDES_DISCLAIMER, relatedCategoriesForGuide } from "@/lib/guides";

export const runtime = "edge";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Tudásbázis" };
  return {
    title: `${guide.title} — Tudásbázis`,
    description: guide.summary,
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const relatedPros = relatedCategoriesForGuide(guide.slug);

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

      {/* Szekciók */}
      <article className="space-y-4">
        {guide.sections.map((s, i) => (
          <section key={i} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <h2 className="mb-2 text-[15px] font-extrabold tracking-[-0.01em] text-ink">
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

      {/* Kapcsolódó szakemberek a Szaknévsorban (belső link → konverzió) */}
      {relatedPros.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Kapcsolódó szakemberek
          </h2>
          <div className="grid gap-2">
            {relatedPros.map((c) => (
              <Link
                key={c.id}
                href={`/szaknevsor?cat=${encodeURIComponent(c.id)}`}
                className="flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary-soft/40 p-3 shadow-card transition active:scale-[0.99]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
                  <Icon name="list" size={15} strokeWidth={2.3} />
                </span>
                <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">
                  {c.label} a Szaknévsorban
                </span>
                <Icon name="chevR" size={14} className="shrink-0 text-ink-muted" />
              </Link>
            ))}
          </div>
        </section>
      )}

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
