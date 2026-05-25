import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * GlassPill — áttetsző, blur-effektes pilula (címkékhez, lebegő chipekhez).
 * A háttér `bg-surface/60` + `backdrop-blur-md` adja az üveghatást, a finom
 * keret/árnyék a mélységet. Témára reaktív (surface + line tokenek).
 */
export function GlassPill({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface/60 px-3 py-1.5",
        "text-sm font-semibold text-ink shadow-card backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * IconButton — kör/négyzet alakú ikongomb.
 *  - glass:   áttetsző üveg (lebegő térkép-vezérlők, profil-fejléc)
 *  - surface: tömör felület + árnyék (alapértelmezett)
 *  - primary: márkaszínű kiemelt akció
 */
type IconButtonVariant = "glass" | "surface" | "primary";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: number;
}

const ICON_BTN: Record<IconButtonVariant, string> = {
  glass: "glass text-ink",
  surface: "bg-surface text-ink shadow-card",
  primary: "bg-primary text-white shadow-card",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "surface", size = 38, className, style, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      style={{ width: size, height: size, ...style }}
      className={cn(
        "grid shrink-0 place-items-center rounded-[12px] transition active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ICON_BTN[variant],
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
