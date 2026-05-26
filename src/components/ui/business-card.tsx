import Link from "next/link";
import type { Business } from "@/lib/types";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";

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
}

export function BusinessCard({ business: b, href, className }: BusinessCardProps) {
  const classes = cn(
    "relative flex gap-3 rounded-card border border-line bg-surface p-3 shadow-card",
    href && "transition hover:shadow-card-hover active:scale-[0.99]",
    className,
  );

  const logoUrl = mediaUrl(b.logoKey);

  const inner = (
    <>
      {/* fotó / logó — ha van feltöltött R2-kép, azt mutatjuk; különben gradiens placeholder */}
      <div
        className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-primary-soft"
        style={!logoUrl && b.photo ? { background: b.photo } : undefined}
      >
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${b.name} logója`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-primary">
            {b.categoryLabel}
          </span>
          <span className="text-[10px] text-ink-faint">•</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-ink">
            <Icon name="star" size={11} filled className="text-star" />
            {b.rating.toFixed(1)}
            <span className="font-medium text-ink-muted">({b.reviews})</span>
          </span>
        </div>

        <div className="mb-1 truncate text-[15.5px] font-bold tracking-[-0.02em] text-ink">
          {b.name}
        </div>

        <div className="mb-1.5 flex items-center gap-2 text-[12.5px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Icon name="nav" size={11} strokeWidth={2.2} />
            {b.distText}
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-ink-faint" />
          <span className={cn("font-semibold", b.openNow ? "text-success" : "text-accent")}>
            {b.openNow ? "Nyitva" : "Zárva"}
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
