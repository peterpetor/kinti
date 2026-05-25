"use client";

import { Icon } from "./icons";
import { cn } from "@/lib/cn";

/**
 * SearchBar — kereső pilula a prototípus stílusában (ikon · mező · szűrő-gomb).
 * Vezérelt input; a Szaknévsoron élő szöveges szűrésre kötjük.
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Mit keresel?", className }: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-[18px] border border-line bg-surface px-3.5 py-3 shadow-card",
        className,
      )}
    >
      <Icon name="search" size={20} className="shrink-0 text-ink-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] font-medium tracking-[-0.01em] text-ink outline-none placeholder:text-ink-faint"
      />
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary">
        <Icon name="sliders" size={16} strokeWidth={2.2} />
      </span>
    </div>
  );
}
