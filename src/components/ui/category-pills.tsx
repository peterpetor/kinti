"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CategoryIcon } from "./category-icon";

/**
 * CategoryPills — kategória-választó (Szaknévsor lista-nézet).
 *
 * TÖRDELT elrendezés lenyitóval (user-visszajelzés: a vízszintesen görgethető
 * sor „levágta a menük végét" — rejtett scrollbar mellett asztali gépen el sem
 * lehetett érni a sor végét). Alapból az első néhány kategória látszik +
 * „+N további" gomb; lenyitva mind. Az aktív kategória mindig látható.
 * Vezérelt komponens: `active` + `onSelect`.
 */
export interface CategoryPillsProps {
  categories: Category[];
  active: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/** Ennyi pill látszik összecsukva (az aktív ezen felül is bekerül). */
const COLLAPSED_COUNT = 8;

export function CategoryPills({ categories, active, onSelect, className }: CategoryPillsProps) {
  const [expanded, setExpanded] = useState(false);

  const head = categories.slice(0, COLLAPSED_COUNT);
  const activeItem = categories.find((c) => c.id === active);
  const visible = expanded
    ? categories
    : activeItem && !head.some((c) => c.id === active)
      ? [...head, activeItem]
      : head;
  const hiddenCount = categories.length - visible.length;

  return (
    <div className={cn("flex flex-wrap gap-2 px-4 pb-1", className)}>
      {visible.map((c) => {
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
      {(hiddenCount > 0 || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex flex-none items-center gap-1 rounded-pill border border-dashed border-line bg-surface-alt px-3.5 py-2 text-[13px] font-bold text-ink-muted transition active:scale-[0.97]"
        >
          {expanded ? "Kevesebb kategória" : `+${hiddenCount} további`}
        </button>
      )}
    </div>
  );
}
