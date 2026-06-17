"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

/**
 * Button — a CTA-k atomja (Hívás, Útvonal, Kezdjük el…).
 *  - primary/accent: tömör márkagomb, emelt árnyékkal
 *  - secondary:      felület + belső 1px keret (a prototípus inset border-e)
 *  - ghost:          háttér nélküli, finom hover
 */
type ButtonVariant = "primary" | "accent" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-card-hover hover:brightness-110",
  accent: "bg-accent text-white shadow-card-hover hover:brightness-110",
  secondary:
    "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))]",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-xl px-3 text-sm",
  md: "h-11 gap-2 rounded-2xl px-4 text-[15px]",
  lg: "h-[54px] gap-2 rounded-2xl px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className, type = "button", onClick, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        // Haptikus visszajelzés a tömör CTA-kon (a ghost/secondary csendben marad).
        if (variant === "primary" || variant === "accent") haptic("tap");
        onClick?.(e);
      }}
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-[-0.01em] transition active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
