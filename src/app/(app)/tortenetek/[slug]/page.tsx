import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon, ScreenHeader } from "@/components/ui";
import { getPublishedStories, getStoryBySlug } from "@/lib/repo";
import { getAdminUserId } from "@/lib/admin";
import { getCountry } from "@/lib/countries";
import { mediaUrl } from "@/lib/media";
import { parseDbDate } from "@/lib/dates";
import { renderStoryMarkdown, storyExcerpt } from "@/lib/story-md";
import { safeJsonLdStringify } from "@/lib/json-ld";
import { GuideShareButton } from "@/components/views/guide-share-button";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /tortenetek/[slug] — egy élettörténet oldala (organikus SEO-céloldal).
 *
 * A [slug] a kanonikus URL; id-vel is felold, de azt CSAK admin láthatja
 * (moderációs előnézet — a duplikált-tartalom URL-t nem engedjük publikusan).
 * Nem-publikált történet szintén csak adminnak látszik, „előnézet" sávval.
 */

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug);
  if (!story || story.moderationStatus !== 1 || story.slug !== params.slug) {
    // Előnézet / ismeretlen: ne indexelődjön és ne szivárogjon cím.
    return { title: "Élettörténet — kinti.app", robots: { index: false, follow: false } };
  }
  const description = story.summary ?? storyExcerpt(story.bodyMd);
  return {
    title: `${story.title} — Expat Élettörténetek | kinti.app`,
    description,
    alternates: { canonical: `/tortenetek/${story.slug}` },
    openGraph: {
      title: story.title,
      description,
      url: `/tortenetek/${story.slug}`,
      type: "article",
      ...(story.imageKey ? { images: [{ url: `https://kinti.app${mediaUrl(story.imageKey)}` }] } : {}),
    },
  };
}

export default async function StoryPage({ params }: { params: Params }) {
  const story = await getStoryBySlug(params.slug);
  if (!story) notFound();

  // Admin-előnézet: nem-publikált VAGY id-vel elért történet.
  const isPreviewAccess = story.moderationStatus !== 1 || story.slug !== params.slug;
  if (isPreviewAccess) {
    const adminId = await getAdminUserId();
    if (!adminId) notFound();
  }

  const country = getCountry(story.country);
  const published = parseDbDate(story.publishedAt ?? "");
  const html = renderStoryMarkdown(story.bodyMd);
  const base = "https://kinti.app";
  const pageUrl = `${base}/tortenetek/${story.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.summary ?? storyExcerpt(story.bodyMd),
    author: { "@type": "Person", name: story.authorName },
    datePublished: published ? published.toISOString() : undefined,
    mainEntityOfPage: pageUrl,
    ...(story.imageKey ? { image: `${base}${mediaUrl(story.imageKey)}` } : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Élettörténetek", item: `${base}/tortenetek` },
      { "@type": "ListItem", position: 2, name: story.title, item: pageUrl },
    ],
  };

  // Kapcsolódó: a 3 legfrissebb MÁSIK történet (belső linkháló).
  const others = (await getPublishedStories(null, 4)).filter((s) => s.id !== story.id).slice(0, 3);

  return (
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      {!isPreviewAccess && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(articleJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbJsonLd) }} />
        </>
      )}

      {isPreviewAccess && (
        <div className="rounded-card border border-star/40 bg-star/10 px-4 py-2.5 text-[12.5px] font-bold text-ink">
          🔍 Moderációs előnézet — a történet {story.moderationStatus === 1 ? "publikált (id-vel elérve)" : "MÉG NEM publikált"}.
        </div>
      )}

      <nav className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-muted" aria-label="Útvonal">
        <Link href="/tortenetek" className="hover:text-primary">Élettörténetek</Link>
        <Icon name="chevR" size={11} className="text-ink-faint" />
        <span className="truncate text-ink">{story.title}</span>
      </nav>

      <div className="flex items-start justify-between gap-3">
        <ScreenHeader
          eyebrow={`${country ? `${country.flag} ${country.name}` : ""}${story.city ? ` · ${story.city}` : ""}`}
          title={story.title}
        />
        <GuideShareButton title={story.title} />
      </div>

      <p className="text-[12px] font-semibold text-ink-muted">
        {story.authorName}
        {published ? ` · ${published.toLocaleDateString("hu-HU")}` : ""}
      </p>

      {story.imageKey && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(story.imageKey) ?? undefined} alt="" className="w-full rounded-card object-cover shadow-card" />
      )}

      {/* A HTML a story-md zárt, escape-elt renderéből jön (XSS-biztos). */}
      <div
        className="kinti-story-body space-y-3 text-[14.5px] leading-relaxed text-ink [&_h2]:mt-5 [&_h2]:text-[18px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.01em] [&_h3]:mt-4 [&_h3]:text-[15.5px] [&_h3]:font-extrabold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <p className="rounded-card border border-line bg-surface-alt px-4 py-3 text-[11.5px] leading-snug text-ink-muted">
        A történet a szerző személyes tapasztalata és véleménye — nem jogi, pénzügyi vagy egészségügyi tanácsadás.
      </p>

      {/* Írd meg a tiédet — a UGC-hurok motorja */}
      <Link
        href="/tortenetek"
        className="flex items-center gap-3 rounded-card border border-primary/25 bg-primary-soft p-3.5 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white">✍️</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold tracking-[-0.01em] text-ink">Neked is van sztorid?</span>
          <span className="block text-[11.5px] text-ink-muted">Írd meg — másoknak most jelenthet sokat, amin te már túl vagy.</span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.4} className="text-primary" />
      </Link>

      {others.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">További történetek</h2>
          <div className="space-y-2">
            {others.map((s) => (
              <Link key={s.id} href={`/tortenetek/${s.slug}`}
                className="block rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]">
                <span className="block text-[13.5px] font-extrabold text-ink">{s.title}</span>
                <span className="block text-[11.5px] text-ink-muted">{s.authorName}{s.city ? ` · ${s.city}` : ""}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
