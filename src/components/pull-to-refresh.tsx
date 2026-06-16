"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { haptic } from "@/lib/haptics";

/**
 * PullToRefresh — natív „húzd-le-frissítéshez" minta a listákon. Csak a lap
 * tetején (scrollY ≤ 0) lefelé húzva aktiválódik; egy küszöb felett elengedve
 * frissít. Alapból `router.refresh()` (szerver-adat újratöltés) + minimum
 * spinner-idő, hogy érződjön. Az overscroll-behavior:none (natív-érzet 1. szint)
 * miatt a böngésző saját PTR-je nincs, így nincs ütközés.
 */
const THRESHOLD = 70;

export function PullToRefresh({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
}) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const doRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      router.refresh();
      await new Promise((r) => setTimeout(r, 700));
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = window.scrollY <= 0 && !refreshing ? e.touches[0].clientY : null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY <= 0) {
      setPull(Math.min(dy * 0.5, 110)); // ellenállás
    } else {
      setPull(0);
    }
  };
  const onTouchEnd = async () => {
    if (startY.current == null) return;
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      haptic("tap");
      try {
        await doRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const indicatorH = refreshing ? 44 : pull;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: indicatorH,
          transition: startY.current == null ? "height 0.25s cubic-bezier(0.22,1,0.36,1)" : "none",
        }}
      >
        <div
          className={`h-6 w-6 rounded-full border-2 border-line border-t-primary${refreshing ? " animate-spin" : ""}`}
          style={{
            opacity: Math.min(pull / THRESHOLD, 1),
            transform: refreshing ? undefined : `rotate(${pull * 3}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}
