import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { EventDetailActions } from "@/components/views/event-detail-actions";
import { getEventById } from "@/lib/repo";
import { mediaUrl } from "@/lib/media";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const HU_MONTHS_FULL = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];
const HU_WEEKDAYS = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];

function fmtFullDate(iso: string | null): { full: string; weekday: string } | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  // weekday-hoz egy nappal kompenzálás nem kell — UTC dátum lokális napja korrekt
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  return {
    full: `${y}. ${HU_MONTHS_FULL[mo - 1]} ${d}.`,
    weekday: HU_WEEKDAYS[wd],
  };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const e = await getEventById(params.id);
  if (!e) return { title: "Esemény" };
  const date = e.eventDate ?? "";
  const venue = e.venue ?? "";
  const url = `https://kinti.app/kozosseg/esemeny/${e.id}`;
  const title = e.title;
  const description = e.description?.slice(0, 160) ?? `${title} · ${date}${venue ? ` · ${venue}` : ""}`;
  const image = mediaUrl(e.imageKey ?? null) ?? "https://kinti.app/icons/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "kinti",
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const e = await getEventById(params.id);
  if (!e) notFound();

  // Csak az élesben elérhető eseményeket mutatjuk
  if (e.status && e.status !== "approved") notFound();

  const dateInfo = fmtFullDate(e.eventDate);
  const heroUrl = mediaUrl(e.imageKey ?? null);
  const shareUrl = `https://kinti.app/kozosseg/esemeny/${e.id}`;

  // JSON-LD — Schema.org Event (Google rich snippets)
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
  if (e.eventDate) {
    jsonLd.startDate = e.startTime
      ? `${e.eventDate}T${e.startTime.replace(".", ":")}:00`
      : e.eventDate;
  }
  if (e.description) jsonLd.description = e.description;
  if (heroUrl) jsonLd.image = heroUrl;
  if (e.venue) {
    jsonLd.location = {
      "@type": "Place",
      name: e.venue,
      address: { "@type": "PostalAddress", addressCountry: "CH" },
    };
  }
  // RSVP count → InteractionStatistic
  if (e.going > 0) {
    jsonLd.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/RsvpAction",
      userInteractionCount: e.going,
    };
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1rem)]">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/kozosseg"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-muted hover:text-ink"
      >
        <Icon name="arrowLeft" size={14} strokeWidth={2.4} /> Vissza a Piacra
      </Link>

      <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt={e.title}
            className="h-[200px] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="p-5">
          {e.tag && (
            <span
              className="inline-block rounded-md bg-surface-alt px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted"
              style={e.color ? { color: e.color, backgroundColor: `${e.color}22` } : undefined}
            >
              {e.tag}
            </span>
          )}
          <h1 className="mt-2 text-[24px] font-extrabold leading-tight tracking-tight text-ink text-balance">
            {e.title}
          </h1>

          {/* Dátum + idő + helyszín */}
          <dl className="mt-4 space-y-2.5 text-[13.5px]">
            {dateInfo && (
              <div className="flex items-start gap-2">
                <Icon name="calendar" size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <dt className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">Mikor</dt>
                  <dd className="font-semibold text-ink">
                    {dateInfo.full} <span className="text-ink-muted">({dateInfo.weekday})</span>
                    {e.startTime && (
                      <span className="ml-1.5 text-ink-muted">· {e.startTime}</span>
                    )}
                  </dd>
                </div>
              </div>
            )}
            {e.venue && (
              <div className="flex items-start gap-2">
                <Icon name="pin" size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <dt className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">Hol</dt>
                  <dd className="font-semibold text-ink">{e.venue}</dd>
                </div>
              </div>
            )}
          </dl>

          {e.description && (
            <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
              {e.description}
            </p>
          )}
        </div>
      </article>

      <EventDetailActions
        eventId={e.id}
        initialGoing={e.going}
        calendarEvent={{
          title: e.title,
          date: e.eventDate ?? "",
          startTime: e.startTime,
          venue: e.venue,
          description: e.description ?? null,
        }}
        shareTitle={e.title}
        shareUrl={shareUrl}
      />

      <p className="px-1 text-center text-[11px] leading-snug text-ink-faint">
        A kinti platform a megjelent eseményekért és a részvétel közben történtekért felelősséget nem vállal.
      </p>
    </div>
  );
}
