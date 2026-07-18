import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessCard, Icon, ListGroup, ListRow, SectionHeader } from "@/components/ui";
import { getBusinessById, getReviewsByBusiness, getSimilarBusinesses, getPracticeColleagues, recordBusinessSearchTerm, toPublicBusiness, businessToListItem } from "@/lib/repo";
import { parseDbDate, dbDateOnly } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/cn";
import { ReviewForm } from "@/components/views/review-form";
import { areasForBusiness } from "@/lib/seo-areas";
import { ProfileHeaderActions } from "@/components/views/profile-action-buttons";
import { ReportButton } from "@/components/report-button";
import { BusinessClaimCard } from "@/components/views/business-claim-card";
import { parseWorkingHoursStrict, calculateBusinessHoursStatus, formatWeeklyHours, swissWeekdayKey } from "@/lib/hours";
import { handleFromId } from "@/lib/handle";
import { DynamicDistance } from "@/components/views/dynamic-distance";
import { BusinessGallery } from "@/components/views/business-gallery";
import { ErrorBoundary } from "@/components/error-boundary";
import { TrackBusinessView, PhoneReveal } from "@/components/business-analytics-tracker";
import { BusinessLeadCta } from "@/components/views/business-lead-cta";
import { RecentBusinessRecorder } from "@/components/views/recent-businesses";
import { safeJsonLdStringify } from "@/lib/json-ld";
import { hasStreetAddress, hasContactInfo } from "@/lib/address";
import { extractContactFromBlurb } from "@/lib/contact-links";
import { getCountry, countryLocative } from "@/lib/countries";
import { registryForCategory } from "@/lib/business-registry";
import { guidesForCategory } from "@/lib/guides";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const HU_MONTHS = [
  "jan", "feb", "márc", "ápr", "máj", "jún",
  "júl", "aug", "szept", "okt", "nov", "dec",
];

/** "2 órája" / "tegnap" / "2025. okt. 14." formátum a vélemény dátumához. */
function fmtRelative(iso: string): string {
  // parseDbDate: a szóközös SQLite-dátumot UTC-ként értelmezi (különben a relatív
  // idő elcsúszna a szerver zónájával).
  const d = parseDbDate(iso);
  if (!d) return "";
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
  return `${d.getUTCFullYear()}. ${HU_MONTHS[d.getUTCMonth()]}. ${d.getUTCDate()}.`;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const b = await getBusinessById(params.id);
  // Csak JÓVÁHAGYOTT profilhoz generálunk meta-adatot — különben a Google
  // meta-adatot látna egy 404-es oldalhoz (a fő komponens notFound()-ol).
  if (!b || (b.moderationStatus ?? 0) !== 1) return { title: "Vállalkozás" };

  const title = `${b.name}${b.categoryLabel ? ` — ${b.categoryLabel}` : ""}`;
  const ratingText = b.reviews > 0 ? ` ⭐ ${b.rating.toFixed(1)} (${b.reviews} vélemény)` : "";
  const metaBlurb = extractContactFromBlurb(b.blurb).blurb;
  const description = metaBlurb
    ? metaBlurb.slice(0, 160)
    : `${b.name} · ${b.categoryLabel ?? "Magyar szakember"} ${countryLocative(b.country)}.${ratingText}`;
  const url = `https://kinti.app/szaknevsor/${b.id}`;
  const image = mediaUrl(b.logoKey) ?? "https://kinti.app/icons/og-default.png";

  return {
    title: b.name,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Kinti",
      type: "profile",
      images: [{ url: image, width: 1200, height: 630, alt: b.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

const actionBtn =
  "flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[14px] text-sm font-bold tracking-[-0.01em] transition active:scale-[0.98]";

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { st?: string; ertekeles?: string };
}) {
  const raw = await getBusinessById(params.id);
  if (!raw) notFound();
  // Publikus profil-oldal → érzékeny mezők (manageToken/ownerUserId/contactEmail)
  // NÉLKÜL, hogy semmiképp ne kerüljenek az RSC-payloadba (átvétel/PII-védelem).
  const b = toPublicBusiness(raw);

  // „Honnan jönnek" — ha a keresőből érkezett (?st=...), rögzítjük a keresőszót.
  if (typeof searchParams.st === "string" && searchParams.st.trim()) {
    await recordBusinessSearchTerm(params.id, searchParams.st);
  }
  // Publikus profil-oldal: csak admin által jóváhagyott (moderation_status=1)
  // vállalkozás látható. Pending / rejected → 404. A tulajdonos a saját
  // manage-link szerkesztő-oldalán látja az állapotot.
  if ((b.moderationStatus ?? 0) !== 1) notFound();

  // „Hasonló magyar szakemberek" — PRO (featured) cégnél NEM töltjük be: a
  // Szaknévsor PRO ígérete a konkurencia kizárása a saját profilról.
  // „Ugyanennél a praxisnál" — azonos telefon (csoportpraxis kollégái); ez PRO
  // cégnél IS megy, mert a kollégák nem versenytársak (ugyanaz a klinika).
  const [reviews, similarRaw, colleagues] = await Promise.all([
    getReviewsByBusiness(b.id),
    b.featured ? Promise.resolve([]) : getSimilarBusinesses(b, 3),
    getPracticeColleagues(b, 4),
  ]);
  // Egy azonos-kategóriájú kolléga mindkét listába kerülhetne — a „praxis"
  // szekció erősebb kontextus, onnan hagyjuk; a „hasonló"-ból kiszűrjük.
  const colleagueIds = new Set(colleagues.map((c) => c.id));
  const similar = similarRaw.filter((s) => !colleagueIds.has(s.id));
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  // Útvonal CSAK utcaszintű címnél — városközpontra (pl. „Bécs"/„Online") navigálni
  // értelmetlen, nem vezet a tényleges helyre. Az országot is a query-be tesszük
  // a pontosabb Google Maps-találatért.
  const mapsHref = hasStreetAddress(b.address)
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [b.address, getCountry(b.country)?.name].filter(Boolean).join(", "),
      )}`
    : undefined;
  const heroUrl = mediaUrl(b.logoKey);

  // Frissesség-jelző: az utolsó szerkesztés (vagy létrehozás) időbélyege.
  const freshIso = b.updatedAt ?? b.createdAt ?? null;
  // Hivatalos nyilvántartás-link (csak ha van engedélyszám) — fél-automata ellenőrzés.
  const registry = b.licenseNumber ? registryForCategory(b.categoryId, b.name) : null;
  // Kapcsolódó tudásbázis-cikkek (belső link a kategória alapján).
  const relatedGuides = guidesForCategory(b.categoryId, b.country).slice(0, 3);

  // Live státusz CSAK ismert (strukturált) nyitvatartásnál — ismeretlennél nem
  // találunk ki 8–18 default-státuszt (fabricated precision); a szabad-szöveges
  // openText-et mutatjuk helyette, vagy semmit.
  const wh = parseWorkingHoursStrict(b.workingHours ?? null);
  const status = wh ? calculateBusinessHoursStatus(wh) : null;
  const openTextTrim = b.openText?.trim() || null;

  let socials: Record<string, string> | null = null;
  try {
    socials = b.socialLinks ? JSON.parse(b.socialLinks) : null;
  } catch {}
  // A booking-nak külön „Időpontfoglalás" szekciója van, ezért itt nem számít.
  const hasSocials = socials && (socials.facebook || socials.instagram || socials.linkedin);

  // A weboldalt/emailt a seed/CSV-import a blurb végére fűzi ` · ` szeparátorral —
  // NYERS szöveg helyett gombként jelenítjük meg, a leírásból pedig kivágjuk.
  const contact = extractContactFromBlurb(b.blurb);
  const website = socials?.website ?? contact.website;
  const email = socials?.email ?? contact.email;
  const displayBlurb = contact.blurb;

  // JSON-LD strukturált adat — Schema.org LocalBusiness (Google rich snippets)
  const schemaDays: Record<string, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };

  const openingHoursSpec = [];
  if (wh) {
    for (const [key, val] of Object.entries(wh)) {
      if (val && !val.closed) {
        openingHoursSpec.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": `https://schema.org/${schemaDays[key] || "Monday"}`,
          "opens": val.open,
          "closes": val.close
        });
      }
    }
  }

  const reviewSchema = reviews && reviews.length > 0
    ? reviews.slice(0, 5).map((r) => {
        const authorName = r.reviewerName?.trim() || handleFromId(r.id);
        return {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": authorName,
          },
          "datePublished": dbDateOnly(r.publishedAt) || new Date().toISOString().slice(0, 10),
          "reviewBody": r.body,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": r.rating,
            "bestRating": 5,
            "worstRating": 1,
          }
        };
      })
    : undefined;

  const sameAsArray: string[] = [];
  if (website) sameAsArray.push(website);
  if (socials) {
    if (socials.facebook) sameAsArray.push(socials.facebook);
    if (socials.instagram) sameAsArray.push(socials.instagram);
    if (socials.linkedin) sameAsArray.push(socials.linkedin);
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://kinti.app/szaknevsor/${b.id}`,
    name: b.name,
    url: `https://kinti.app/szaknevsor/${b.id}`,
    priceRange: "$$",
  };
  if (displayBlurb) jsonLd.description = displayBlurb;
  if (email) jsonLd.email = email;
  // A telefonszám SZÁNDÉKOSAN kimarad a JSON-LD-ből (scrape-védelem): a
  // strukturált adatból a botok nyersen kiolvasnák. A számot a felhasználó a
  // „Telefonszám mutatása" gombbal, a rate-limitelt kontakt-végpontról kapja.
  if (heroUrl) {
    jsonLd.image = heroUrl;
    jsonLd.logo = heroUrl;
  }
  if (b.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressCountry: (b.country || "CH").toUpperCase(),
    };
  }
  if (b.lat != null && b.lng != null) {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng };
  }
  // aggregateRating CSAK akkor, ha tényleg vannak megjelenített vélemények az
  // oldalon — különben a Google strukturált-adat irányelve „valótlan értékelés"-
  // ként jelölheti. A reviewCount a valódi lista-hossz, nem a denormalizált szám.
  if (b.rating > 0 && reviews.length > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: b.rating,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (b.categoryLabel) jsonLd.knowsAbout = b.categoryLabel;
  jsonLd.knowsLanguage = ["hu", ...(b.languages ?? []).map((l) => l.toLowerCase())];
  if (openingHoursSpec.length > 0) jsonLd.openingHoursSpecification = openingHoursSpec;
  if (reviewSchema) jsonLd.review = reviewSchema;
  if (sameAsArray.length > 0) jsonLd.sameAs = sameAsArray;
  if (freshIso) jsonLd.dateModified = freshIso.slice(0, 10);

  return (
    <div>
      {/* Anonim view-tracker — page-load-on egyszer POST-ol az analitikának. */}
      <TrackBusinessView businessId={b.id} />
      {/* „Legutóbb megnézted" rögzítés — TISZTÁN kliens-oldali (localStorage). */}
      <RecentBusinessRecorder id={b.id} name={b.name} categoryLabel={b.categoryLabel} />
      {/* SEO: Google rich snippets a vállalkozóhoz */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      {/* SEO: morzsasor a SERP-hez (a Tudásbázis-cikkek mintája). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Szaknévsor", item: "https://kinti.app/szaknevsor" },
              { "@type": "ListItem", position: 2, name: b.name, item: `https://kinti.app/szaknevsor/${b.id}` },
            ],
          }),
        }}
      />
      {/* hero fotó + lebegő vezérlők — R2-kép, ha van; különben PRO accent szín, vagy gradiens placeholder */}
      <div
        className={cn(
          "relative h-[280px]",
          !heroUrl && !b.accentColor && !b.photo &&
            "bg-gradient-to-br from-primary/15 via-surface-alt to-accent/10",
        )}
        style={
          heroUrl
            ? undefined
            : b.accentColor
              ? { background: `linear-gradient(135deg, ${b.accentColor}, ${b.accentColor}bb)` }
              : b.photo
                ? { background: b.photo }
                : undefined
        }
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
        {/* Üres borító → kategória-vízjel (nem fake fotó), hogy ne legyen csúnya az üres box */}
        {!heroUrl && !b.accentColor && !b.photo && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <CategoryIcon categoryId={b.categoryId} categoryLabel={b.categoryLabel} size={96} className="text-primary/20" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex gap-2 bg-gradient-to-b from-black/30 to-transparent px-3.5 pb-3.5 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <ProfileHeaderActions
            businessId={b.id}
            businessName={b.name}
            categoryLabel={b.categoryLabel ?? undefined}
            address={b.address}
          />
          <span className="flex-1" />
          <Link
            href="/szaknevsor"
            aria-label="Vissza"
            className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-surface/90 text-ink backdrop-blur-md"
          >
            <Icon name="arrowLeft" size={18} strokeWidth={2.2} />
          </Link>
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
        {b.claimed === false && (
          <div className="mt-3">
            <BusinessClaimCard businessId={b.id} businessName={b.name} />
          </div>
        )}
        {b.verified && (
          <p
            title="Az üzemeltető meggyőződött róla, hogy valódi magyarul beszélő vállalkozás — ez NEM minőségi garancia, a szakképesítést és a munka minőségét nem ellenőrizzük."
            className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success"
          >
            <Icon name="check" size={11} strokeWidth={2.6} />
            Hiteles magyar nyelvű vállalkozó
          </p>
        )}

        {/* meta sor */}
        <div className="mt-3 flex items-center gap-4">
          <div>
            {b.reviews > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <Icon name="star" size={14} filled className="text-star" />
                  <span className="text-[15px] font-bold text-ink">{b.rating.toFixed(1)}</span>
                </div>
                <div className="text-[11px] font-medium text-ink-muted">{b.reviews} vélemény</div>
              </>
            ) : (
              <>
                <div className="text-[15px] font-bold text-ink-muted">Új</div>
                <div className="text-[11px] font-medium text-ink-muted">Még nincs értékelés</div>
              </>
            )}
          </div>
          <span className="h-8 w-px self-stretch bg-line" />
          <div>
            <DynamicDistance lat={b.lat} lng={b.lng} address={b.address} precise={hasStreetAddress(b.address)} />
          </div>
          <span className="h-8 w-px self-stretch bg-line" />
          <div>
            {status ? (
              <>
                <div className={cn("text-[15px] font-bold flex items-center gap-1.5", status.isOpen ? "text-success" : "text-accent")}>
                  <span className={cn("h-2 w-2 rounded-full", status.isOpen ? "bg-success animate-pulse" : "bg-accent")} />
                  {status.statusText}
                </div>
                <div className="text-[11px] font-medium text-ink-muted capitalize">
                  {status.detailText}
                </div>
              </>
            ) : (
              // Nincs strukturált nyitvatartás → nem találunk ki státuszt; a valódi
              // openText-et mutatjuk (ha van), vagy „Nyitvatartás nem ismert".
              <>
                <div className="text-[15px] font-bold text-ink-muted">Nyitvatartás</div>
                <div className="text-[11px] font-medium text-ink-muted">
                  {openTextTrim ?? "nem ismert"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* akciók — a Hívás CSAK ha van telefonszám (nincs letiltott „nem hívható"
            gomb), az Útvonal CSAK utcaszintű címnél, a Weboldal/Email pedig ha a
            leírásból kinyert (vagy social) érték van. Flex-wrap: 2 gomb/sor mobilon,
            a sor elrejtve, ha egyik sincs. */}
        {(b.phone || mapsHref || website || email) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Árajánlatkérés — a lead a monetizált akció (inbox→freemium→PRO),
                ezért az akció-sor ELSŐ gombja. Szerver-oldali kapu: csak ha a
                cég fogad leadet (van kontakt-email, nincs lead_opt_out) — az
                email-cím maga NEM kerül a kliensre. */}
            {b.contactEmail && !b.leadOptOut && (
              <BusinessLeadCta
                businessId={b.id}
                businessName={b.name}
                className={cn(actionBtn, "min-w-[calc(50%-0.25rem)] bg-pro text-white shadow-card-hover")}
              />
            )}
            {b.phone && (
              // Scrape-védelem: a szám NINCS a HTML-ben — a PhoneReveal a
              // rate-limitelt kontakt-végpontról kéri le kattintásra.
              <PhoneReveal
                businessId={b.id}
                businessName={b.name}
                variant="button"
                country={b.country}
                className={cn(actionBtn, "min-w-[calc(50%-0.25rem)] bg-primary text-white shadow-card-hover")}
                // WhatsApp — a felfedés után második gombként (fix márka-zöld +
                // fix fehér szöveg = téma-biztos pár; a szám ország-tudatosan
                // normalizálódik, bizonytalan formátumnál a gomb el sem készül).
                waClassName={cn(actionBtn, "min-w-[calc(50%-0.25rem)] bg-[#25D366] text-white shadow-card-hover")}
              />
            )}
            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className={cn(actionBtn, "min-w-[calc(50%-0.25rem)] bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))]")}
              >
                <Icon name="nav" size={16} strokeWidth={2.2} /> Útvonal
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(actionBtn, "min-w-[calc(50%-0.25rem)] bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))]")}
              >
                <Icon name="globe" size={16} strokeWidth={2.2} /> Weboldal
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className={cn(actionBtn, "min-w-[calc(50%-0.25rem)] bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))]")}
              >
                <Icon name="mail" size={16} strokeWidth={2.2} /> Email
              </a>
            )}
          </div>
        )}

        {/* "Kérj árajánlatot" email-relay forma ELTÁVOLÍTVA — a kapcsolat
            telefon/WhatsApp gombokkal megy közvetlenül (zero relay, zero
            stored PII). Ha a vállalkozó nem adott meg telefont, írni rá a
            saját web/Facebook profilján keresztül lehet. */}

        {/* A korábbi Clerk-alapú "Igényeld a vállalkozást" gombot lecseréltük:
            a vállalkozás-szerkesztés a confirmáló emailben kapott kezelő-linkkel
            megy. Ha valaki elveszítette, írhat az info@kinti.app-ra. */}

        {/* Közösségi és foglalási linkek */}
        {hasSocials && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-surface px-3 py-2 border border-line shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
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
            </div>
          </div>
        )}

        {/* Időpontfoglalás widget (PRO) — Calendly esetén beágyazott, egyébként CTA.
            Csak PRO (featured) cégnél jelenik meg → PRO-feature. */}
        {b.featured && socials?.booking && (
          <section className="mt-6">
            <h2 className="mb-2 text-[14px] font-bold uppercase tracking-wide text-ink-muted">Időpontfoglalás</h2>
            {socials.booking.includes("calendly.com") ? (
              <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
                <iframe
                  src={`${socials.booking}${socials.booking.includes("?") ? "&" : "?"}embed_domain=kinti.app&embed_type=Inline&hide_gdpr_banner=1`}
                  title="Időpontfoglalás"
                  className="h-[640px] w-full"
                  loading="lazy"
                />
              </div>
            ) : (
              <a
                href={socials.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]"
              >
                <Icon name="calendar" size={16} strokeWidth={2.4} /> Foglalj időpontot
              </a>
            )}
          </section>
        )}

        {/* Kinti Pass kedvezmény — arany doboz + link a felhasználó saját kártyájához. */}
        {b.kintiPassActive && (
          <div className="mt-4 rounded-card border border-star/40 bg-star/10 p-4 shadow-card">
            <div className="flex items-start gap-2.5">
              <span aria-hidden className="mt-0.5 text-[20px] leading-none">🎟️</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#b8860b]">
                  Kinti Pass elfogadóhely
                </p>
                <p className="mt-0.5 text-[14px] font-extrabold leading-snug text-ink">
                  {b.kintiPassOffer ?? "Kedvezmény a Kinti Pass kártyával"}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-ink-muted">
                  Mutasd fel a digitális kártyád fizetéskor. A kedvezményt a vállalkozás adja és
                  váltja be.
                </p>
                <Link
                  href="/profil/kinti-pass"
                  className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-[#b8860b] underline underline-offset-2 active:opacity-80"
                >
                  Kinti Pass kártyám megnyitása →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* erről a helyről */}
        <section className="mt-6">
          <SectionHeader>Erről a helyről</SectionHeader>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink text-pretty">{displayBlurb}</p>
          
          {b.licenseNumber && (
            <div className="mt-3 rounded-[12px] border border-star/40 bg-[#fff8ed] dark:bg-[#241d10] px-3 py-2 flex items-start gap-2">
              <span className="text-[14px] shrink-0 mt-0.5">📜</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#b8860b]">
                  Hatósági engedélyszám / Kamarai szám
                </p>
                <p className="text-[13px] font-bold text-ink">{b.licenseNumber}</p>
                {registry && (
                  <a
                    href={registry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#b8860b] underline underline-offset-2 active:opacity-80"
                  >
                    Ellenőrizd: {registry.label} ↗
                  </a>
                )}
              </div>
            </div>
          )}

          <p className="mt-3 text-[11.5px] leading-snug text-ink-faint italic">
            ⓘ A profil adatait a vállalkozó tölti fel — frissességüket az üzemeltető nem ellenőrzi.
            Hivatalos adatokat (engedélyszám, cégjegyzékszám) közvetlenül a hatóságoknál erősíts meg.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {/* Nyitvatartás-chip: ismert strukturált → élő státusz; egyébként a valódi
                openText; ha egyik sincs, a chip kimarad (nincs kitalált státusz). */}
            {status ? (
              <Chip icon="clock">{`${status.statusText} · ${status.detailText}`}</Chip>
            ) : openTextTrim ? (
              <Chip icon="clock">{openTextTrim}</Chip>
            ) : null}
            <Chip icon="globe">{b.languages?.length ? b.languages.join(" · ") : "Magyar"}</Chip>
            {b.yearsHere != null && <Chip>{b.yearsHere} éve kint</Chip>}
            {freshIso && <Chip icon="calendar">Frissítve {fmtRelative(freshIso)}</Chip>}
          </div>
          {!hasContactInfo(b) && (
            <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">
              ⓘ Erről a bejegyzésről csak a nevet és a várost ismerjük — nincs pontos cím, telefon vagy
              weboldal.
              {b.claimed === false && (
                <>
                  {" "}
                  Ha a tiéd, <span className="font-semibold text-ink-muted">vedd át és egészítsd ki</span> fent.
                </>
              )}
            </p>
          )}
        </section>

        {/* Galéria — granuláris hiba-határ: ha a képnézegető elhasal, csak ez a
            blokk tűnik el, a profil többi része (elérhetőség, vélemények) marad. */}
        <ErrorBoundary label="business-gallery" fallback={null}>
          <BusinessGallery galleryKeys={b.galleryKeys} businessName={b.name} />
        </ErrorBoundary>

        {/* vélemények */}
        <section className="mt-6">
          <SectionHeader>
            {reviews.length > 0
              ? `Kintiek véleménye (${reviews.length})`
              : "Kintiek véleménye"}
          </SectionHeader>



          {/* Vélemény-írás CTA + form (account nélküli, email-megerősítéses).
              A #ertekeles horgony + ?ertekeles=1 a vélemény-nudge email mélylinkje. */}
          <div id="ertekeles" className="mt-2.5 scroll-mt-24">
            <ReviewForm
              businessId={b.id}
              businessName={b.name}
              turnstileSiteKey={turnstileSiteKey}
              initialOpen={searchParams.ertekeles === "1"}
            />
          </div>

          {/* Omnibus-irányelv: a vélemények MELLETT kell közölni, hogyan (nem)
              ellenőrizzük az eredetüket — nem elég az ÁSZF 7. pontja. */}
          <p className="mt-2 text-[11px] leading-snug text-ink-faint">
            ⓘ Az értékelések a felhasználók szubjektív véleményei. Közzététel előtt
            visszaélés-szűrésen esnek át (moderáció), de azt <strong>nem ellenőrizzük</strong>,
            hogy az értékelő valóban igénybe vette-e a szolgáltatást.
          </p>

          <div className="mt-2.5 space-y-2.5">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface-alt px-4 py-6 text-center text-[13px] text-ink-muted">
                Még nincs vélemény. Légy te az első!
              </div>
            ) : (
              reviews.map((r) => {
                const reviewerHandle = r.reviewerName?.trim() || handleFromId(r.id);
                return (
                <article key={r.id} className="rounded-2xl border border-line bg-surface p-3.5">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                      {reviewerHandle.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-ink">{reviewerHandle}</div>
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

                  {r.body?.trim() && (
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">
                      {r.body.trim()}
                    </p>
                  )}

                  {/* A vállalkozás nyilvános válasza (Google-stílusú bizalmi jel). */}
                  {r.ownerResponse?.trim() && (
                    <div className="mt-2.5 rounded-[12px] border-l-2 border-primary/40 bg-primary-soft/50 px-3 py-2.5">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-[13px]">💬</span>
                        <span className="text-[11.5px] font-bold uppercase tracking-wide text-primary">
                          {b.name} válasza
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">
                        {r.ownerResponse.trim()}
                      </p>
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-end border-t border-line/30 pt-2">
                    <ReportButton contentType="review" contentId={r.id} variant="link" />
                  </div>
                </article>
                );
              })
            )}
          </div>
        </section>

        {/* Kapcsolódó tudásbázis-cikkek (belső link) */}
        {relatedGuides.length > 0 && (
          <section className="mt-6">
            <SectionHeader>Hasznos útmutatók</SectionHeader>
            <div className="mt-2.5 grid gap-2">
              {relatedGuides.map((g) => (
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

        {/* Nyitvatartás — CSAK ismert (strukturált) heti nyitvatartásnál; a mai nap
            kiemelve. Ismeretlennél nincs szekció (nem találunk ki 8–18 default-ot). */}
        {wh && (() => {
          const rows = formatWeeklyHours(wh);
          const todayKey = swissWeekdayKey();
          return (
            <section className="mt-6">
              <SectionHeader>Nyitvatartás</SectionHeader>
              <div className="mt-2.5 overflow-hidden rounded-card border border-line bg-surface shadow-card">
                {rows.map((row, i) => {
                  const isToday = row.dayKeys.includes(todayKey);
                  const isClosed = row.value === "Zárva";
                  return (
                    <div
                      key={row.label}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 text-[13.5px]",
                        i > 0 && "border-t border-line/60",
                        isToday && "bg-primary-soft/60",
                      )}
                    >
                      <span className={cn("font-bold", isToday ? "text-primary" : "text-ink")}>
                        {row.label}
                        {isToday && <span className="ml-1.5 text-[11px] font-semibold text-primary/80">· ma</span>}
                      </span>
                      <span className={cn("font-semibold tabular-nums", isClosed ? "text-ink-faint" : "text-ink-muted")}>
                        {row.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

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

        {/* Ugyanennél a praxisnál / rendelőnél (azonos telefonszám = csoportpraxis
            kollégái) — a megbízható helyen belül a kellő szakember megtalálása.
            Nem versenytárs → PRO cégnél is megjelenik. */}
        {colleagues.length > 0 && (
          <section className="mt-6">
            <SectionHeader>Ugyanennél a praxisnál</SectionHeader>
            <div className="mt-2.5 grid gap-2.5">
              {colleagues.map((c) => (
                <BusinessCard key={c.id} business={businessToListItem(c)} href={`/szaknevsor/${c.id}`} />
              ))}
            </div>
          </section>
        )}

        {/* Hasonló magyar szakemberek (azonos kategória+ország, kanton/közelség
            szerint rangsorolva) — zsákutca-mentesítés: ha ez a szaki nem elérhető
            vagy nem válaszol, innen egy koppintással van alternatíva. PRO cégnél
            nem jelenik meg (konkurencia-kizárás, ld. lent). */}
        {similar.length > 0 && (
          <section className="mt-6">
            <SectionHeader>Hasonló magyar szakemberek</SectionHeader>
            <div className="mt-2.5 grid gap-2.5">
              {similar.map((s) => (
                <BusinessCard key={s.id} business={businessToListItem(s)} href={`/szaknevsor/${s.id}`} />
              ))}
            </div>
          </section>
        )}

        {/* SEO belső link a kategória×terület landing oldalra (más magyar szakemberekhez).
            PRO (featured) cégnél NEM jelenik meg → „Konkurencia kizárása a profilodról"
            (a Szaknévsor PRO ígért funkciója): a saját profilodról nem viszünk el
            versenytársakhoz.
            ORSZÁG-TUDATOS (ld. [[binary-country-fallthrough]]): korábban a
            cantonFromAddress ment minden országra, és a bécsi „1150" PLZ-t a
            svájci 1xxx-sávba (Vaud!) sorolta — a seo-areas terület-modell viszont
            a business.canton + ország párost nézi, ország-oldal fallbackkel. */}
        {!b.featured && (() => {
          if (!b.categoryId) return null;
          const areas = areasForBusiness(b);
          // A legspecifikusabb terület (régió-kódos), különben az ország-oldal.
          const area = areas.find((a) => a.code !== null) ?? areas[0];
          if (!area) return null;
          // Ne legyen „magyar magyar …", ha a kategória neve maga is „magyar"-ral
          // kezdődik (pl. „Magyar bolt, pékség" → „magyar bolt, pékség").
          const catLabel = (b.categoryLabel || "szakember").toLowerCase().replace(/^magyar\s+/i, "");
          return (
            <Link
              href={`/magyar/${b.categoryId}/${area.slug}`}
              className="mt-6 flex items-center gap-2 text-[13px] font-bold text-primary"
            >
              Több magyar {catLabel} {area.locative}
              <Icon name="arrowRight" size={14} strokeWidth={2.4} />
            </Link>
          );
        })()}
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
