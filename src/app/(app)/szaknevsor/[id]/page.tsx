import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, ListGroup, ListRow, SectionHeader } from "@/components/ui";
import { getBusinessById, getReviewsByBusiness } from "@/lib/repo";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";
import { ReviewForm } from "@/components/views/review-form";
import { ProfileHeaderActions } from "@/components/views/profile-action-buttons";
import { ReportButton } from "@/components/report-button";
import { parseWorkingHours, calculateBusinessHoursStatus } from "@/lib/hours";
import { DynamicDistance } from "@/components/views/dynamic-distance";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const HU_MONTHS = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];

/** "2 órája" / "tegnap" / "2025. okt. 14." formátum a vélemény dátumához. */
function fmtRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "az imént" : `${mins} perce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} órája`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "tegnap";
  if (days < 7) return `${days} napja`;
  if (days < 30) return `${Math.floor(days / 7)} hete`;
  if (days < 365) return `${Math.floor(days / 30)} hónapja`;
  return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()].slice(0, 4)}. ${d.getDate()}.`;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const b = await getBusinessById(params.id);
  return { title: b?.name ?? "Vállalkozás" };
}

const actionBtn =
  "flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[14px] text-sm font-bold tracking-[-0.01em] transition active:scale-[0.98]";

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const b = await getBusinessById(params.id);
  if (!b) notFound();

  const reviews = await getReviewsByBusiness(b.id);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const mapsHref = b.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`
    : undefined;
  const heroUrl = mediaUrl(b.logoKey);

  const wh = parseWorkingHours(b.workingHours ?? null);
  const status = calculateBusinessHoursStatus(wh);

  let socials: Record<string, string> | null = null;
  try {
    socials = b.socialLinks ? JSON.parse(b.socialLinks) : null;
  } catch {}
  const hasSocials = socials && (socials.facebook || socials.instagram || socials.linkedin || socials.booking);

  // JSON-LD strukturált adat — Schema.org LocalBusiness (Google rich snippets)
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://kinti.app/szaknevsor/${b.id}`,
    name: b.name,
    url: `https://kinti.app/szaknevsor/${b.id}`,
  };
  if (b.blurb) jsonLd.description = b.blurb;
  if (b.phone) jsonLd.telephone = b.phone;
  if (heroUrl) jsonLd.image = heroUrl;
  if (b.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressCountry: "CH",
    };
  }
  if (b.lat != null && b.lng != null) {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng };
  }
  if (b.rating > 0 && b.reviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: b.rating,
      reviewCount: b.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (b.categoryLabel) jsonLd.knowsAbout = b.categoryLabel;
  jsonLd.knowsLanguage = ["hu", ...(b.languages ?? []).map((l) => l.toLowerCase())];

  return (
    <div>
      {/* SEO: Google rich snippets a vállalkozóhoz */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* hero fotó + lebegő vezérlők — R2-kép, ha van; különben gradiens placeholder */}
      <div
        className="relative h-[280px]"
        style={!heroUrl && b.photo ? { background: b.photo } : undefined}
      >
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt={`${b.name} borítóképe`}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        )}
        <div className="absolute inset-x-0 top-0 flex gap-2 bg-gradient-to-b from-black/30 to-transparent px-3.5 pb-3.5 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <Link
            href="/szaknevsor"
            aria-label="Vissza"
            className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/90 text-ink backdrop-blur-md"
          >
            <Icon name="arrowLeft" size={18} strokeWidth={2.2} />
          </Link>
          <span className="flex-1" />
          <ProfileHeaderActions businessId={b.id} businessName={b.name} />
        </div>
      </div>

      {/* tartalom-lap */}
      <div className="relative z-[2] -mt-6 rounded-t-sheet bg-bg px-[18px] pt-5">
        <p className="mb-1 text-[12.5px] font-bold uppercase tracking-wide text-primary">
          {b.categoryLabel}
        </p>
        <h1 className="text-[26px] font-extrabold leading-[1.08] tracking-tight text-ink text-balance">
          {b.name}
        </h1>
        {b.verified && (
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
            <Icon name="check" size={11} strokeWidth={2.6} />
            Hitelesített magyar nyelvű vállalkozó
          </p>
        )}

        {/* meta sor */}
        <div className="mt-3 flex items-center gap-4">
          <div>
            <div className="flex items-center gap-1">
              <Icon name="star" size={14} filled className="text-star" />
              <span className="text-[15px] font-bold text-ink">{b.rating.toFixed(1)}</span>
            </div>
            <div className="text-[11px] font-medium text-ink-muted">{b.reviews} vélemény</div>
          </div>
          <span className="h-8 w-px self-stretch bg-line" />
          <div>
            <DynamicDistance lat={b.lat} lng={b.lng} address={b.address} />
          </div>
          <span className="h-8 w-px self-stretch bg-line" />
          <div>
            <div className={cn("text-[15px] font-bold flex items-center gap-1.5", status.isOpen ? "text-success" : "text-accent")}>
              <span className={cn("h-2 w-2 rounded-full", status.isOpen ? "bg-success animate-pulse" : "bg-accent")} />
              {status.statusText}
            </div>
            <div className="text-[11px] font-medium text-ink-muted capitalize">
              {status.detailText}
            </div>
          </div>
        </div>

        {/* akciók */}
        <div className="mt-4 flex gap-2">
          {b.phone ? (
            <a href={`tel:${b.phone.replace(/\s/g, "")}`} className={cn(actionBtn, "bg-primary text-white shadow-card-hover")}>
              <Icon name="phone" size={16} strokeWidth={2.2} /> Hívás
            </a>
          ) : (
            <span className={cn(actionBtn, "bg-primary/40 text-white")}>
              <Icon name="phone" size={16} strokeWidth={2.2} /> Hívás
            </span>
          )}
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className={cn(actionBtn, "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))]")}
          >
            <Icon name="nav" size={16} strokeWidth={2.2} /> Útvonal
          </a>
        </div>

        {/* A korábbi Clerk-alapú "Igényeld a vállalkozást" gombot lecseréltük:
            a vállalkozás-szerkesztés a confirmáló emailben kapott kezelő-linkkel
            megy. Ha valaki elveszítette, írhat az info@kinti.app-ra. */}

        {/* Közösségi és foglalási linkek */}
        {hasSocials && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-surface px-3 py-2 border border-line shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
              Közösség & Foglalás:
            </span>
            <div className="flex gap-2 ml-auto">
              {socials?.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="grid h-8 w-8 place-items-center rounded-xl bg-surface-alt text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors border border-line/40 active:scale-95"
                >
                  <Icon name="facebook" size={15} />
                </a>
              )}
              {socials?.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-8 w-8 place-items-center rounded-xl bg-surface-alt text-[#E4405F] hover:bg-[#E4405F]/10 transition-colors border border-line/40 active:scale-95"
                >
                  <Icon name="instagram" size={15} />
                </a>
              )}
              {socials?.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="grid h-8 w-8 place-items-center rounded-xl bg-surface-alt text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors border border-line/40 active:scale-95"
                >
                  <Icon name="linkedin" size={15} />
                </a>
              )}
              {socials?.booking && (
                <a
                  href={socials.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Időpontfoglalás"
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-primary text-white text-[11px] font-extrabold hover:bg-primary/95 transition-all shadow-sm active:scale-95"
                >
                  <Icon name="calendar" size={12} /> Időpont
                </a>
              )}
            </div>
          </div>
        )}

        {/* erről a helyről */}
        <section className="mt-6">
          <SectionHeader>Erről a helyről</SectionHeader>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink text-pretty">{b.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip icon="clock">{b.workingHours ? `${status.statusText} · ${status.detailText}` : (b.openText || `${status.statusText} · ${status.detailText}`)}</Chip>
            <Chip icon="globe">{b.languages.length ? b.languages.join(" · ") : "Magyar"}</Chip>
            {b.yearsHere != null && <Chip>{b.yearsHere} éve kint</Chip>}
          </div>
        </section>

        {/* vélemények */}
        <section className="mt-6">
          <SectionHeader>
            {reviews.length > 0
              ? `Kintiek véleménye (${reviews.length})`
              : "Kintiek véleménye"}
          </SectionHeader>

          {/* Vélemény-írás CTA + form (account nélküli, email-megerősítéses) */}
          <div className="mt-2.5">
            <ReviewForm
              businessId={b.id}
              businessName={b.name}
              turnstileSiteKey={turnstileSiteKey}
            />
          </div>

          <div className="mt-2.5 space-y-2.5">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface-alt px-4 py-6 text-center text-[13px] text-ink-muted">
                Még nincs vélemény. Légy te az első!
              </div>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-line bg-surface p-3.5">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                      {r.reviewerName.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-ink">{r.reviewerName}</div>
                      <div className="text-[11px] font-medium text-ink-muted">
                        {fmtRelative(r.publishedAt)}
                      </div>
                    </div>
                    <div className="flex gap-px text-star">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Icon key={i} name="star" size={12} filled />
                      ))}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink text-pretty">
                    „{r.body}"
                  </p>
                  {r.ownerResponse && (
                    <div className="mt-2.5 rounded-[12px] border-l-2 border-primary bg-primary-soft/40 px-3 py-2">
                      <p className="text-[10.5px] font-bold uppercase tracking-wide text-primary">
                        A vállalkozó válasza{r.ownerRespondedAt ? ` · ${fmtRelative(r.ownerRespondedAt)}` : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
                        {r.ownerResponse}
                      </p>
                    </div>
                  )}
                  <div className="mt-2.5 flex justify-end border-t border-line/30 pt-2">
                    <ReportButton contentType="review" contentId={r.id} variant="link" />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* cím */}
        <section className="mt-6">
          <SectionHeader>Cím</SectionHeader>
          <div className="mt-2.5">
            <ListGroup>
              <ListRow
                leading={<Icon name="pin" size={18} strokeWidth={2.2} className="text-accent" />}
                title={b.address?.trim() ? b.address : "Nincs megadva"}
                isLast
              />
            </ListGroup>
          </div>
        </section>
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon?: Parameters<typeof Icon>[0]["name"]; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink">
      {icon && <Icon name={icon} size={12} strokeWidth={2.2} className="text-primary" />}
      {children}
    </span>
  );
}
