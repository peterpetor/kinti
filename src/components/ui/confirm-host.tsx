"use client";

import { useEffect, useState } from "react";
import { subscribeConfirm, type ConfirmRequest } from "@/lib/confirm";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

/**
 * ConfirmHost — a globális megerősítő-dialógus EGYETLEN példánya (az (app)
 * layoutban). A `lib/confirm.ts` pub/sub-jára iratkozik fel. Háttérre
 * koppintva / Esc-re „Mégsem" (a hívó `false`-t kap). Csak EGY dialógus
 * látszik egyszerre (a queue eleje) — gyakorlatban sosem torlódik, a hívó
 * `await`-el a következő lépés előtt.
 */
export function ConfirmHost() {
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    return subscribeConfirm((req) => {
      setQueue((prev) => [...prev, req]);
      haptic(req.destructive ? "warning" : "tap");
    });
  }, []);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function settle(value: boolean) {
    if (!current) return;
    current.resolve(value);
    setQueue((prev) => prev.slice(1));
  }

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => settle(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={current.title ?? "Megerősítés"}
        className="kinti-page-in-cross w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {current.title && (
          <h3 className="text-[16px] font-extrabold tracking-tight text-ink">{current.title}</h3>
        )}
        <p className={cn("whitespace-pre-line text-[13.5px] leading-snug text-ink-muted", current.title && "mt-1.5")}>
          {current.message}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              haptic("tap");
              settle(false);
            }}
            className="flex-1 rounded-pill border border-line bg-surface-alt py-2.5 text-[13px] font-bold text-ink-muted transition active:scale-[0.98]"
          >
            {current.cancelLabel ?? "Mégsem"}
          </button>
          <button
            type="button"
            onClick={() => {
              haptic(current.destructive ? "warning" : "selection");
              settle(true);
            }}
            className={cn(
              "flex-1 rounded-pill py-2.5 text-[13px] font-bold text-white shadow-card transition active:scale-[0.98]",
              current.destructive ? "bg-accent" : "bg-primary",
            )}
          >
            {current.confirmLabel ?? (current.destructive ? "Törlés" : "Rendben")}
          </button>
        </div>
      </div>
    </div>
  );
}
