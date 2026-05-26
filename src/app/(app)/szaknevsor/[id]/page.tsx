import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, ListGroup, ListRow, SectionHeader } from "@/components/ui";
import { getBusinessById, getReviewsByBusiness } from "@/lib/repo";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";
import { ReviewForm } from "@/components/views/review-form";

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

  return (
    <div>
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
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/90 text-ink backdrop-blur-md">
            <Icon name="share" size={17} />
          </span>
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/90 text-accent backdrop-blur-md">
            <Icon name="heart" size={17} strokeWidth={2.2} />
          </span>
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
            <div className="text-[15px] font-bold text-ink">{b.distText}</div>
            <div className="text-[11px] font-medium text-ink-muted">{b.distMeters} m</div>
          </div>
          <span className="h-8 w-px self-stretch bg-line" />
          <div>
            <div className={cn("text-[15px] font-bold", b.openNow ? "text-success" : "text-accent")}>
              {b.openNow ? "Nyitva" : "Zárva"}
            </div>
            <div className="text-[11px] font-medium text-ink-muted">
              {b.openText?.replace(/^.*?·\s*/, "")}
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
          <span className="grid h-[46px] w-[50px] place-items-center rounded-[14px] bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))]">
            <Icon name="send" size={16} strokeWidth={2.2} />
          </span>
        </div>

        {/* erről a helyről */}
        <section className="mt-6">
          <SectionHeader>Erről a helyről</SectionHeader>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink text-pretty">{b.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip icon="clock">{b.openText}</Chip>
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
                  <div className="mt-2.5 flex justify-end border-t border-line/30 pt-2">
                    <a
                      href={`mailto:abuse@kinti.app?subject=${encodeURIComponent(`Visszaélés bejelentése: Vélemény (${r.id})`)}&body=${encodeURIComponent(
                        `Tisztelt Kinti!\n\nBejelentem az alábbi véleményt, mert sérti a szabályzatot:\n- Vélemény azonosító: ${r.id}\n- Szerző: ${r.reviewerName}\n- Cég: ${b.name} (${b.id})\n- Vélemény szövege: "${r.body}"\n\nIndoklás (kérjük írja le, miért tartja jogsértőnek vagy alaptalannak): `
                      )}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-faint hover:text-accent transition-colors"
                    >
                      <Icon name="flag" size={11} strokeWidth={2.4} /> Vélemény bejelentése
                    </a>
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
                title={b.address}
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
