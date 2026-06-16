"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { haptic } from "@/lib/haptics";

/**
 * BottomSheet — natív-szerű alsó lap (húzd-le-bezár). Portálon a body szintjén
 * jelenik meg, alulról felcsúszik, a fogantyút lehúzva (vagy a háttérre koppintva)
 * bezárul. Mobil-first natív minta a szűrőkhöz / választókhoz, teljes oldal helyett.
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
  const [show, setShow] = useState(false); // belépő-csúszás
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setDragY(0);
      const id = requestAnimationFrame(() => setShow(true));
      return () => {
        cancelAnimationFrame(id);
        document.body.style.overflow = "";
      };
    }
    setShow(false);
    document.body.style.overflow = "";
  }, [open]);

  if (!mounted || !open) return null;

  const onStart = (y: number) => {
    startY.current = y;
    setDragging(true);
  };
  const onMove = (y: number) => {
    if (startY.current == null) return;
    const dy = y - startY.current;
    setDragY(dy > 0 ? dy : 0);
  };
  const onEnd = () => {
    setDragging(false);
    startY.current = null;
    if (dragY > 90) {
      haptic("tap");
      onClose();
    } else {
      setDragY(0);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <button
        type="button"
        aria-label="Bezárás"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-300"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-t-3xl border border-line bg-surface shadow-pop"
        style={{
          transform: show ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging ? "none" : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
          maxHeight: "88vh",
        }}
      >
        {/* Fogantyú + cím — innen húzható lefelé. */}
        <div
          onTouchStart={(e) => onStart(e.touches[0].clientY)}
          onTouchMove={(e) => onMove(e.touches[0].clientY)}
          onTouchEnd={onEnd}
          className="touch-none pb-1 pt-3"
        >
          <div className="mx-auto h-1.5 w-10 rounded-full bg-line" />
          {title && (
            <h2 className="mt-2.5 px-5 text-center text-[15px] font-extrabold tracking-tight text-ink">
              {title}
            </h2>
          )}
        </div>
        <div
          className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
          style={{ maxHeight: "calc(88vh - 56px)" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
