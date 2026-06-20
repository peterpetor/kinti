"use client";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CategoryIcon } from "./category-icon";

/**
 * CategoryPills — vízszintesen görgethető kategória-választó (Szaknévsor/Térkép).
 * Az aktív pilula tömör primary, az inaktív felület + belső 1px keret.
 * Vezérelt komponens: `active` + `onSelect`.
 */
export interface CategoryPillsProps {
  categories: Category[];
  active: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function CategoryPills({ categories, active, onSelect, className }: CategoryPillsProps) {
  return (
    <div
      className={cn(
        "no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1",
        // Jobb oldali elhalványodó maszk → jelzi, hogy a sáv jobbra görgethető.
        "[mask-image:linear-gradient(to_right,#000_calc(100%-1.75rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,#000_calc(100%-1.75rem),transparent)]",
        className,
      )}
    >
      {categories.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect?.(c.id)}
            aria-pressed={on}
            className={cn(
              "inline-flex flex-none items-center gap-2 rounded-pill px-3.5 py-2 text-[13.5px] font-semibold tracking-[-0.01em] transition",
              on
                ? "bg-primary text-white shadow-card"
                : "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-alpha))]",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-md",
                on ? "bg-white/20 text-white" : "bg-primary-soft text-primary",
              )}
            >
              <CategoryIcon categoryId={c.id} size={13} />
            </span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
