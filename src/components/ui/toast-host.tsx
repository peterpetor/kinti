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
  success: "border-success/30 bg-success/10 text-success-ink",
  info: "border-line bg-surface/95 text-ink",
  error: "border-accent/30 bg-accent-soft text-accent",
};

/** Ennyi ideig fut a zsugorodó kilépés — egyeznie kell a CSS-beli 0,18 s-cel. */
const KILEPES_MS = 180;

/**
 * ToastHost — a globális toast-sín EGYETLEN példánya (az (app) layoutban).
 * A `lib/toast.ts` pub/sub-jára iratkozik fel; FELÜL, középen jeleníti meg a
 * kapszulákat (egyszerre max 3). Kattintásra azonnal eltűnik. Haptika
 * megjelenéskor. `aria-live=polite`.
 *
 * ⚠️ FELÜL, NEM ALUL. Korábban a TabBar fölött úszott fel. A megerősítés
 * viszont arra a MŰVELETRE vonatkozik, amit a felhasználó épp elvégzett, és az
 * ujja ilyenkor a képernyő alján van — a saját keze takarta ki a visszajelzést.
 *
 * ⚠️ A KILÉPÉS KÜLÖN ÁLLAPOT. Enélkül a kapszula egyik képkockáról a másikra
 * eltűnne; a Dynamic Island-érzethez össze kell mennie. Ezért a lejáratkor
 * előbb `tavozo` jelölést kap, és csak az animáció után kerül ki a listából.
 */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [tavozo, setTavozo] = useState<number[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    setTavozo((prev) => prev.filter((x) => x !== id));
  }, []);

  /** Zsugorodó kilépés, majd tényleges eltávolítás. */
  const zar = useCallback((id: number) => {
    setTavozo((prev) => (prev.includes(id) ? prev : [...prev, id]));
    window.setTimeout(() => remove(id), KILEPES_MS);
  }, [remove]);

  useEffect(() => {
    return subscribeToasts((t) => {
      // Max 3 egyszerre — a legrégebbit kiszorítja.
      setItems((prev) => [...prev.slice(-2), t]);
      haptic(t.variant === "error" ? "warning" : "success");
      window.setTimeout(() => zar(t.id), t.duration);
    });
  }, [zar]);

  if (items.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[95] flex flex-col items-center gap-2 px-4"
      // A notch/állapotsáv alá. A z-95 a notch-scrim (z-80) fölött van, tehát
      // állványos PWA-ban sem úszik alá.
      style={{ top: "calc(env(safe-area-inset-top) + 10px)" }}
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => zar(t.id)}
          className={cn(
            "pointer-events-auto flex max-w-[22rem] items-center gap-2.5 rounded-pill border px-4 py-2.5 text-[13px] font-bold shadow-card backdrop-blur",
            tavozo.includes(t.id) ? "kinti-toast-out" : "kinti-toast-in",
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
