"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToasts, type ToastItem, type ToastVariant } from "@/lib/toast";
import { haptic } from "@/lib/haptics";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

/** Variáns → ikon + szín-osztályok (token-alapú, mindkét témán jó). */
const ICON: Record<ToastVariant, IconName> = {
  success: "check",
  info: "bell",
  error: "close",
};
const STYLE: Record<ToastVariant, string> = {
  success: "border-success/30 bg-success/10 text-success",
  info: "border-line bg-surface/95 text-ink",
  error: "border-accent/30 bg-accent-soft text-accent",
};

/**
 * ToastHost — a globális toast-sín EGYETLEN példánya (az (app) layoutban).
 * A `lib/toast.ts` pub/sub-jára iratkozik fel; a TabBar fölött, középen jeleníti
 * meg a buborékokat (egyszerre max 3, felúszó belépéssel, auto-eltűnéssel).
 * Kattintásra azonnal eltűnik. Haptika megjelenéskor. `aria-live=polite`.
 */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return subscribeToasts((t) => {
      // Max 3 egyszerre — a legrégebbit kiszorítja.
      setItems((prev) => [...prev.slice(-2), t]);
      haptic(t.variant === "error" ? "warning" : "success");
      window.setTimeout(() => remove(t.id), t.duration);
    });
  }, [remove]);

  if (items.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[95] flex flex-col items-center gap-2 px-4"
      // A TabBar (~82px) + a készülék safe-area fölé emeljük.
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 94px)" }}
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => remove(t.id)}
          className={cn(
            "kinti-toast-in pointer-events-auto flex max-w-[22rem] items-center gap-2.5 rounded-pill border px-4 py-2.5 text-[13px] font-bold shadow-card backdrop-blur",
            STYLE[t.variant],
          )}
        >
          <Icon name={ICON[t.variant]} size={15} strokeWidth={2.6} className="shrink-0" />
          <span className="truncate">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
