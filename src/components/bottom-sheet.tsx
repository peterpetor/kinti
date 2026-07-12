"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icons";
import { haptic } from "@/lib/haptics";

/**
 * Egyszerű mobil-barát alsó lap (bottom sheet). A megosztás- és naptár-választó
 * használja. Háttérre kattintva / Esc-re zár, mobilon a natív mintát követve
 * LEHÚZÁSSAL is (a lap az ujjat követi; ~90px felett elenged és zár, alatta
 * visszaugrik). A közvetlen ujj-követés nem animáció, ezért nem igényel
 * reduced-motion guardot; a visszaugró transition rövid és funkcionális.
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
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Új nyitáskor a húzás-állapot nullázása (ne "félig lehúzva" nyíljon).
  useEffect(() => {
    if (open) {
      setDragY(0);
      setDragging(false);
      dragStart.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0]?.clientY ?? null;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    const dy = (e.touches[0]?.clientY ?? dragStart.current) - dragStart.current;
    // Csak lefelé követünk; felfelé nem mozdul (natív sheet-viselkedés).
    setDragY(dy > 0 ? dy : 0);
  };
  const onTouchEnd = () => {
    setDragging(false);
    dragStart.current = null;
    if (dragY > 90) {
      haptic("tap");
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[9998] flex sm:items-center items-end justify-center sm:p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Bezárás"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        style={{ opacity: dragY > 0 ? Math.max(0.25, 1 - dragY / 300) : undefined }}
      />
      <div
        className="relative z-[1] w-full max-w-md sm:rounded-[24px] rounded-t-[24px] border border-line bg-surface p-5 sm:pb-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-pop animate-fade-up"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform .25s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* Húzás-zóna: CSAK a fogantyú-sáv — a tartalomban görgetés/kijelölés
            (pl. textarea) ne mozgassa a lapot. touch-none: a zónán a böngésző
            ne görgessen, az ujj a lapot vezesse. */}
        <div
          className="absolute inset-x-0 top-0 h-9 cursor-grab touch-none sm:hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          aria-hidden
        />
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" />
        {/* Egyértelmű bezáró gomb — mobilon nem volt nyilvánvaló, hogy a háttérre
            koppintva lehet kilépni. */}
        <button
          type="button"
          aria-label="Bezárás"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-[2] grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted transition hover:text-ink active:scale-90"
        >
          <Icon name="close" size={16} strokeWidth={2.4} />
        </button>
        {title && (
          <h3 className="mb-3 px-8 text-center text-[14px] font-extrabold tracking-tight text-ink">
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
