import Link from "next/link";
import type { Business } from "@/lib/types";
import { Icon } from "./icons";
import { CategoryIcon } from "./category-icon";
import { cn } from "@/lib/cn";
import { mediaImageUrl } from "@/lib/media";
import { OwnPostBadge } from "@/components/own-post-badge";
import { FavoriteButton } from "./favorite-button";
import { formatDistanceKm } from "@/lib/distance";
import { parseWorkingHours, calculateBusinessHoursStatus } from "@/lib/hours";

/**
 * BusinessCard — a Szaknévsor / találati lista kártyája. Fotó/logó placeholder
 * (CSS gradiens vagy később R2 kép), kiemelt badge, kategória, csillagos
 * értékelés, név, távolság + nyitvatartás, nyelvi chipek. Liquid Glass:
 * lekerekített sarok, finom keret (border-line) és lágy árnyék (shadow-card).
 */
export interface BusinessCardProps {
  business: Business;
  href?: string;
  className?: string;
  /** A tényleges Haversine-távolság km-ben (GPS-szel). Csak ezt mutatjuk — null esetén nincs táv-címke. */
  distanceKm?: number | null;
  /** Szív-toggle a kártya sarkában (kedvencek). Lista-nézetben kapcsoljuk be. */
  showFavorite?: boolean;
}

export function BusinessCard({ business: b, href, className, distanceKm, showFavorite }: BusinessCardProps) {
  const classes = cn(
    "relative flex min-w-0 gap-3 rounded-card border bg-surface p-3",
    b.featured ? "border-2 border-pro shadow-pop bg-pro/[0.02]" : "border-line shadow-card",
    href && "transition hover:shadow-card-hover active:scale-[0.99]",
    className,
  );

  const logoUrl = mediaImageUrl(b.logoKey, { width: 160 });

  // Élő nyitva/zárva a tényleges nyitvatartásból (svájci idő) — NEM a statikus
  // open_now DB-flagből, ami mindig "Zárva"-t mutatott. (Mint a részlet-oldalon.)
  const openStatus = calculateBusinessHoursStatus(parseWorkingHours(b.workingHours ?? null));

  const inner = (
    <>
      {showFavorite && (
        <FavoriteButton businessId={b.id} className="absolute right-2 top-2 z-10" />
      )}
      {/* fotó / logó — ha van feltöltött R2-kép, azt mutatjuk; különben gradiens placeholder */}
      <div
        className="relative grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-gradient-to-br from-primary-soft to-primary/15 text-primary/75"
        style={!logoUrl && b.photo ? { background: b.photo } : undefined}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${b.name} logója`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={72}
            height={72}
          />
        ) : (
          // Nincs feltöltött logó → kategória-ikon (releváns, nem üres szürke doboz).
          <CategoryIcon categoryId={b.categoryId} size={32} aria-hidden="true" />
        )}
      </div>

      <div className={cn("min-w-0 flex-1", showFavorite && "pr-7")}>
        {b.featured && (
          <div className="mb-1.5 inline-flex items-center gap-1 rounded-pill bg-pro px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
            <Icon name="star" size={9} filled /> Szaknévsor PRO
          </div>
        )}
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-primary">
            {b.categoryLabel}
          </span>
          <span className="text-[11px] text-ink-faint">•</span>
          {b.reviews > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-ink">
              <Icon name="star" size={11} filled className="text-star" />
              {b.rating.toFixed(1)}
              <span className="font-medium text-ink-muted">({b.reviews})</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-ink-faint">Új</span>
          )}
        </div>

        <div className="mb-1 flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[15.5px] font-bold tracking-[-0.02em] text-ink">
            {b.name}
          </span>
          {b.verified && (
            <span
              title="Az üzemeltető meggyőződött róla, hogy valódi magyarul beszélő vállalkozás — ez NEM minőségi garancia, a szakképesítést és a munka minőségét nem ellenőrizzük."
              className="inline-flex shrink-0 items-center gap-0.5 rounded-pill bg-success/15 px-1.5 py-0.5 text-[10.5px] font-bold text-success"
            >
              <Icon name="check" size={9} strokeWidth={3} />
              Hiteles
            </span>
          )}
          <OwnPostBadge type="business" id={b.id} />
        </div>

        <div className="mb-1.5 flex items-center gap-2 text-[12.5px] text-ink-muted">
          {/* Csak VALÓDI, élőben számolt távolságot mutatunk — a distText egy
              prototípus-placeholder (kézi seed-érték), azt sosem jelenítjük meg. */}
          {distanceKm != null && (
            <>
              <span className="inline-flex items-center gap-1">
                <Icon name="nav" size={11} strokeWidth={2.2} />
                {formatDistanceKm(distanceKm)}
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-ink-faint" />
            </>
          )}
          <span className={cn("font-semibold", openStatus.isOpen ? "text-success" : "text-accent")}>
            {openStatus.isOpen ? "Nyitva" : "Zárva"}
          </span>
        </div>

        <div className="flex gap-1.5">
          <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
            magyarul
          </span>
          {b.languages?.includes("Deutsch") && (
            <span className="rounded-md border border-line bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
              DE
            </span>
          )}
        </div>
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  ) : (
    <div className={classes}>{inner}</div>
  );
}
