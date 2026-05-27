"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Egyszerű mobil-barát alsó lap (bottom sheet). A megosztás- és naptár-választó
 * használja. Háttérre kattintva / Esc-re zár.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9998] flex sm:items-center items-end justify-center sm:p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Bezárás"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative z-[1] w-full max-w-md sm:rounded-[24px] rounded-t-[24px] border border-line bg-surface p-5 sm:pb-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-pop animate-fade-up">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" />
        {title && (
          <h3 className="mb-3 text-center text-[14px] font-extrabold tracking-tight text-ink">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

/** Egy sor az alsó lapon (ikon-badge + felirat). */
export function SheetRow({
  badgeColor,
  icon,
  label,
  href,
  onClick,
}: {
  badgeColor?: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-white"
        style={{ backgroundColor: badgeColor ?? "#1d4434" }}
      >
        {icon}
      </span>
      <span className="text-[14px] font-bold text-ink">{label}</span>
    </>
  );
  const cls =
    "flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-alt px-3 py-2.5 text-left transition active:scale-[0.99] hover:bg-surface";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
