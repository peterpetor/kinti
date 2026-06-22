"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Beacon a /api/track-ra (best-effort, nem blokkol). */
function send(event: string) {
  const body = JSON.stringify({ event });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    fetch("/api/track", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "content-type": "application/json" },
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/**
 * UsageTracker — privacy-first oldal-használat mérés. Route-váltáskor a felső
 * útvonal-szegmensből képez egy `page:<szegmens>` eseményt (a dinamikus
 * al-oldalak a modulra rollupolnak, pl. /szaknevsor/<id> → page:szaknevsor),
 * és SESSIONÖNKÉNT EGYSZER/esemény elküldi. Nincs cookie/azonosító — csak az
 * aggregált darabszám nő a szerveren. Így kiderül, melyik funkciót használják.
 */
export function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const seg = pathname.split("/").filter(Boolean)[0] ?? "home";
    const norm = seg.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || "home";
    const event = `page:${norm}`;
    try {
      const key = `kinti_tracked:${event}`;
      if (sessionStorage.getItem(key)) return; // sessionönként egyszer/esemény
      sessionStorage.setItem(key, "1");
    } catch {
      /* ha nincs sessionStorage, akkor is mérünk (csak nem dedupelünk) */
    }
    send(event);
  }, [pathname]);

  return null;
}

/** Konverziók kézi mérése a sikeres műveletek után, pl. trackAction("lead-submit"). */
export function trackAction(name: string) {
  const norm = name.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  if (norm) send(`action:${norm}`);
}
