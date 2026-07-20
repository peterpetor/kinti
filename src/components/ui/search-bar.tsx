"use client";

import { Icon } from "./icons";
import { cn } from "@/lib/cn";

/**
 * SearchBar — kereső pilula a kinti stílusában. Két üzemmód:
 *
 *   • **Élő szűrő** (default — `onChange`): ahogy a felhasználó gépel,
 *     a `value` változik. Ha van szöveg, jobboldalt egy „törlés" (×) gomb
 *     jelenik meg.
 *   • **Form / submit** (ha megadod `onSubmit`-et): Enter-re vagy a jobboldali
 *     nyíl-gombra submit-eli. Ezt használja a főoldali HomeSearch, ami a
 *     `/szaknevsor?q=…` URL-re navigál.
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Ha megadod, a komponens `<form>`-ot rendel és Enter-re submitol. */
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

const SHELL_CLS =
  "flex items-center gap-2.5 rounded-[18px] border border-line bg-surface px-3.5 py-3 shadow-card";

const INPUT_CLS =
  "min-w-0 flex-1 bg-transparent text-[15px] font-medium tracking-[-0.01em] text-ink outline-none placeholder:text-ink-faint";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Mit keresel?",
  className,
}: SearchBarProps) {
  const isForm = !!onSubmit;
  const showClear = !isForm && value.length > 0;

  const inner = (
    <>
      <Icon name="search" size={20} className="shrink-0 text-ink-muted" />
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLS}
      />
      {isForm && (
        <button
          type="submit"
          aria-label="Keresés"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary text-white shadow-card transition active:scale-95"
        >
          <Icon name="arrowRight" size={16} strokeWidth={2.4} />
        </button>
      )}
      {showClear && (
        <button
          type="button"
          aria-label="Törlés"
          onClick={() => onChange("")}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-surface-alt text-ink-muted transition hover:text-ink"
        >
          <Icon name="close" size={14} strokeWidth={2.4} />
        </button>
      )}
    </>
  );

  if (isForm) {
    return (
      <form
        className={cn(SHELL_CLS, className)}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        {inner}
      </form>
    );
  }

  return <div className={cn(SHELL_CLS, className)}>{inner}</div>;
}
