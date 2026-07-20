import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

const CTA_CLS =
  "mt-4 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-extrabold text-white shadow-card transition active:scale-[0.97]";

/**
 * EmptyState — egységes, meleg „nincs itt semmi" kártya: ikon-halo + cím +
 * leírás + opcionális CTA. Az üres lista / postaláda / keresési találat a
 * leggyakoribb üres pillanat az appban; korábban minden nézet a saját ad-hoc
 * szövegdobozát rajzolta (van, ahol ikon nélkül). Ez adja a márka-karaktert
 * egységesen.
 *
 * Token-alapú (mindkét témán jó), a halo koncentrikus lágy gyűrűkkel a primér
 * tokenből, egyszeri `kinti-pop` belépéssel (reduced-motion-guardos a
 * globals.css-ben). Nincs hook / állapot → szerver- ÉS kliens-fában is
 * használható (az `onClick`-es action-t csak kliens-szülő adhat át).
 */
export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  secondary,
  compact = false,
  className,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  /** Halványabb másodlagos elem az elsődleges CTA alatt (pl. „szólj, ha jön"). */
  secondary?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-line bg-surface text-center",
        compact ? "px-5 py-8" : "px-6 py-11",
        className,
      )}
    >
      <span
        aria-hidden
        className="kinti-pop grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary shadow-[0_0_0_5px_rgb(var(--primary)/0.06),0_0_0_11px_rgb(var(--primary)/0.03)]"
      >
        <Icon name={icon} size={24} strokeWidth={2.1} />
      </span>

      <p className="mt-4 text-[15px] font-extrabold tracking-tight text-ink text-balance">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-[17rem] text-[12.5px] leading-snug text-ink-muted text-pretty">
          {description}
        </p>
      )}

      {action?.href ? (
        <Link href={action.href} className={CTA_CLS}>
          {action.label}
          <Icon name="arrowRight" size={14} strokeWidth={2.6} />
        </Link>
      ) : action?.onClick ? (
        <button type="button" onClick={action.onClick} className={CTA_CLS}>
          {action.label}
          <Icon name="arrowRight" size={14} strokeWidth={2.6} />
        </button>
      ) : null}

      {secondary && <div className="mt-3">{secondary}</div>}
    </div>
  );
}
