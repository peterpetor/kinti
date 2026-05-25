import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, ListGroup, ListRow, SectionHeader } from "@/components/ui";
import { getBusinessById } from "@/lib/repo";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Vélemények: külön reviews tábla nincs (prototípus), statikus minta.
const REVIEWS = [
  { name: "Eszter T.", date: "2 hete", rating: 5, text: "Anyukámat is hozzá viszem, ha Pestről jön. Anna érti, mit jelent magyarul fésülködni — nem kell elmagyarázni." },
  { name: "Péter M.", date: "1 hónapja", rating: 5, text: "Pontos időpontok, normális ár (svájci viszonylatban tényleg az). Magyarul kedves, az ollót nem felejtjük el." },
];

export async function generateMetadata({ params }: { params: { id: string } }) {
  const b = await getBusinessById(params.id);
  return { title: b?.name ?? "Vállalkozás" };
}

const actionBtn =
  "flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[14px] text-sm font-bold tracking-[-0.01em] transition active:scale-[0.98]";

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const b = await getBusinessById(params.id);
  if (!b) notFound();

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
        {b.featured && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-pill bg-accent px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white">
            ★ Kiemelt partner
          </span>
        )}

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
          <SectionHeader right={<span className="text-[13px] font-bold text-primary">Mind ›</span>}>
            Kintiek véleménye
          </SectionHeader>
          <div className="mt-2.5 space-y-2.5">
            {REVIEWS.map((r) => (
              <article key={r.name} className="rounded-2xl border border-line bg-surface p-3.5">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {r.name.charAt(0)}
                  </span>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold text-ink">{r.name}</div>
                    <div className="text-[11px] font-medium text-ink-muted">{r.date}</div>
                  </div>
                  <div className="flex gap-px text-star">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Icon key={i} name="star" size={12} filled />
                    ))}
                  </div>
                </div>
                <p className="text-[13.5px] leading-relaxed text-ink text-pretty">„{r.text}"</p>
              </article>
            ))}
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
