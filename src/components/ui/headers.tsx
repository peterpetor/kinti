import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DropdownMenu } from "./dropdown-menu";

/**
 * ScreenHeader — nézet-fejléc nagy címmel + opcionális eyebrow-val és jobb
 * oldali akcióval (pl. ikongomb).
 *
 * `back` — a jobb oldalra (a menü/right elé) kerülő vissza-gomb. Az `left`
 * prop megmaradt kompatibilitás miatt, de új oldalakon `back`-et használj.
 */
export function ScreenHeader({
  eyebrow,
  title,
  left,
  right,
  back,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  back?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      {left && <div className="shrink-0">{left}</div>}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-0.5 text-[30px] font-extrabold leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
      </div>
      {/* A menü gomb a tartalom tetejéhez (content-top) igazodik — így MINDEN
          oldalon ugyanazon a szinten van (a logó-soros oldalak is content-top-ok). */}
      <div className="flex shrink-0 items-center gap-2">
        {back}
        {right !== undefined ? right : <DropdownMenu />}
      </div>
    </header>
  );
}

/**
 * SectionHeader — szekciócím (h3) opcionális jobb oldali linkkel/gombbal.
 */
export function SectionHeader({
  children,
  right,
  className,
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between", className)}>
      <h3 className="text-[17px] font-bold tracking-tight text-ink">{children}</h3>
      {right}
    </div>
  );
}
