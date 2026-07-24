"use client";

import { useRef, useState } from "react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icons";

/**
 * SwipeAction — natív lista-sor gesztus (iOS Mail-minta): balra húzva felfedi
 * a jobb szélen ülő akció-gombot; tap rá aktiválja, tap a sorra (nyitott
 * állapotban) visszazárja. A meglévő, mindig-látható gombot NEM helyettesíti —
 * ez egy kiegészítő, gesztus-alapú út UGYANAHHOZ az akcióhoz (egér/billentyűzet-
 * használóknak a gomb marad az elsődleges út).
 *
 * Függőleges görgetéssel nem ütközik: a `touch-action: pan-y` a natív függőleges
 * görgetést a böngészőre bízza, a vízszintes tengelyt pedig csak akkor "fogjuk
 * el" (setDragX), ha az elmozdulás egyértelműen vízszintes — nincs preventDefault,
 * a görgetés sosem akad be.
 */
export function SwipeAction({
  children,
  actionLabel,
  actionIcon,
  onAction,
  actionWidth = 84,
  className,
}: {
  children: React.ReactNode;
  actionLabel: string;
  actionIcon: IconName;
  onAction: () => void;
  actionWidth?: number;
  /** Keret/árnyék/háttér a KÜLSŐ (nem-vágott) rétegen — a `children`-nek magának
   * ne legyen saját box-shadow/border-ja, mert az `overflow-hidden` (a húzás-
   * vágáshoz szükséges, egy réteggel beljebb ül) levágná. */
  className?: string;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    axis.current = null;
    setDragging(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!start.current) return;
    const dx = e.touches[0].clientX - start.current.x;
    const dy = e.touches[0].clientY - start.current.y;
    if (axis.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        axis.current = Math.abs(dx) > Math.abs(dy) * 1.5 ? "x" : "y";
      }
    }
    if (axis.current !== "x") return;
    const base = open ? -actionWidth : 0;
    setDragX(Math.max(-actionWidth * 1.05, Math.min(0, base + dx)));
  }
  function onTouchEnd() {
    setDragging(false);
    start.current = null;
    const wasHorizontal = axis.current === "x";
    axis.current = null;
    if (!wasHorizontal) return;
    if (dragX < -actionWidth * 0.4) {
      if (!open) haptic("selection");
      setDragX(-actionWidth);
      setOpen(true);
    } else {
      setDragX(0);
      setOpen(false);
    }
  }
  function close() {
    setDragX(0);
    setOpen(false);
  }

  return (
    <div className={cn("rounded-card", className)}>
      <div className="relative overflow-hidden rounded-card">
        <button
          type="button"
          aria-label={actionLabel}
          onClick={() => {
            close();
            onAction();
          }}
          className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-accent px-4 text-[11px] font-bold text-white"
          style={{ width: actionWidth }}
        >
          <Icon name={actionIcon} size={18} strokeWidth={2.4} />
          {actionLabel}
        </button>
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClickCapture={(e) => {
            if (open) {
              e.preventDefault();
              e.stopPropagation();
              close();
            }
          }}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? "none" : "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
            touchAction: "pan-y",
          }}
          className="relative bg-surface"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
