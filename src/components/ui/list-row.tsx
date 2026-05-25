import type { ReactNode } from "react";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";

/**
 * ListGroup — iOS-stílusú, befoglalt (inset) kártya a sorok köré (r:26),
 * opcionális, kis nagybetűs fejléccel.
 */
export function ListGroup({
  header,
  children,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {header && (
        <div className="px-9 pb-1.5 pt-2 text-[13px] uppercase tracking-tight text-ink-muted">
          {header}
        </div>
      )}
      <div className="overflow-hidden rounded-[26px] bg-surface shadow-card">{children}</div>
    </div>
  );
}

/**
 * ListRow — 52px magas listasor: vezető elem (ikon/avatar), cím, részlet,
 * chevron és hajszálvékony elválasztó. Kattinthatóként <button>-né válik.
 */
export interface ListRowProps {
  title: ReactNode;
  detail?: ReactNode;
  leading?: ReactNode;
  chevron?: boolean;
  isLast?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListRow({
  title,
  detail,
  leading,
  chevron = true,
  isLast = false,
  onClick,
  className,
}: ListRowProps) {
  const interactive = Boolean(onClick);
  const content = (
    <>
      {leading}
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {detail != null && <span className="shrink-0 text-ink-muted">{detail}</span>}
      {chevron && <Icon name="chevR" size={14} className="shrink-0 text-ink-faint" />}
      {!isLast && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-px bg-line",
            leading ? "left-[58px]" : "left-4",
          )}
        />
      )}
    </>
  );

  const classes = cn(
    "relative flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[17px] tracking-[-0.01em] text-ink",
    interactive && "transition active:bg-ink/[0.03]",
    className,
  );

  return interactive ? (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  );
}
