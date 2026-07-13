import Link from "next/link";
import type { Metadata } from "next";
import { KintiLogo, ScreenHeader } from "@/components/ui";
import { getPublishedStories } from "@/lib/repo";
import { getCountry } from "@/lib/countries";
import { mediaUrl } from "@/lib/media";
import { parseDbDate } from "@/lib/dates";
import { StorySubmitForm } from "@/components/views/story-submit-form";
import { PullToRefresh } from "@/components/pull-to-refresh";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Élettörténetek — magyarok külföldön | kinti.app",
  description:
    "Valódi kiköltözési történetek magyaroktól: hogyan találtak munkát, lakást, közösséget Svájcban, Ausztriában, Németországban és Hollandiában. Írd meg a sajátod!",
  alternates: { canonical: "/tortenetek" },
  openGraph: {
    title: "Élettörténetek — magyarok külföldön",
    description: "Valódi kiköltözési történetek magyaroktól — és tér a tiédnek is.",
    url: "/tortenetek",
    type: "website",
  },
};

/**
 * /tortenetek — „Élettörténetek" UGC-blog listaoldala.
 * Minden publikált (admin-jóváhagyott) sztori egy organikus SEO-céloldal;
 * a lista maga is indexelt belépési pont. A beküldés Turnstile-védett,
 * szerkesztői ellenőrzéssel.
 */
export default async function StoriesPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const stories = await getPublishedStories(null, 100);

  return (
    <PullToRefresh>
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <ScreenHeader className="min-w-0 flex-1" eyebrow="Kinti · Közösség" title="Élettörténetek" />
      </header>

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Valódi történetek magyaroktól, akik megcsinálták kint — munka, lakás, hivatalok,
        mélypontok és sikerek. Olvasd, meríts belőle — és írd meg a sajátodat is.
      </p>

      <StorySubmitForm turnstileSiteKey={turnstileSiteKey} />

      {stories.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt px-6 py-10 text-center text-[13px] text-ink-muted">
          Hamarosan itt jelennek meg az első történetek — legyél te az első, aki megírja a sajátját!
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((s) => {
            const country = getCountry(s.country);
            const date = parseDbDate(s.publishedAt ?? "")?.toLocaleDateString("hu-HU");
            return (
              <article key={s.id}>
                <Link
                  href={`/tortenetek/${s.slug}`}
                  className="block overflow-hidden rounded-card border border-line bg-surface shadow-card transition active:scale-[0.99]"
                >
                  {s.imageKey && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(s.imageKey) ?? undefined}
                      alt=""
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-ink-muted">
                      {country && <span>{country.flag} {country.name}</span>}
                      {s.city && <span>📍 {s.city}</span>}
                      {date && <span className="ml-auto font-semibold text-ink-faint">{date}</span>}
                    </div>
                    <h2 className="text-[16px] font-extrabold leading-snug tracking-[-0.01em] text-ink">{s.title}</h2>
                    {s.summary && <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-muted">{s.summary}</p>}
                    <p className="mt-1.5 text-[12px] font-semibold text-primary">{s.authorName} története →</p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
