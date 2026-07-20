"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { reportClientError } from "@/lib/report-client-error";

/**
 * Barátságos, újrapróbálható hiba-határ a route-szintű error.tsx-ekhez.
 * A Next a `reset()`-tel újrarendereli a szegmenst (újrapróbálja a fetch-et).
 */
export function RouteError({
  error,
  reset,
  title = "Hoppá, valami nem sikerült",
  message = "Átmeneti hiba lépett fel a betöltés közben. Próbáld újra — ha továbbra is fennáll, írj nekünk: info@kinti.app.",
  className,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
  className?: string;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
    // Éles hiba-jelentés a monitoringnak (redaktálva, best-effort).
    reportClientError(error);
  }, [error]);

  return (
    <div
      className={cn(
        "grid min-h-[60dvh] place-items-center px-5 pt-[calc(env(safe-area-inset-top)+2rem)]",
        className,
      )}
    >
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 text-center shadow-card">
        {/* Ugyanaz az ikon-halo nyelv, mint az EmptyState-nél — az „üres" és a
            „hiba" állapot így testvérként néz ki; itt accent (piros) tonalitással. */}
        <span
          aria-hidden
          className="kinti-pop mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent shadow-[0_0_0_5px_rgb(var(--accent)/0.06),0_0_0_11px_rgb(var(--accent)/0.03)]"
        >
          <Icon name="alert" size={24} strokeWidth={2.1} />
        </span>
        <h1 className="mt-4 text-[18px] font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          {message}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 text-[13px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]"
        >
          <Icon name="arrowRight" size={14} strokeWidth={2.6} />
          Újrapróbálom
        </button>
      </div>
    </div>
  );
}
