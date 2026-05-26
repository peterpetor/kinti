import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DropdownMenu } from "./dropdown-menu";

/**
 * ScreenHeader — nézet-fejléc nagy címmel + opcionális eyebrow-val és jobb
 * oldali akcióval (pl. ikongomb).
 */
export function ScreenHeader({
  eyebrow,
  title,
  left,
  right,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      {left && <div className="shrink-0 pt-1">{left}</div>}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-0.5 text-[30px] font-extrabold leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
      </div>
      {right !== undefined ? right : <DropdownMenu />}
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
