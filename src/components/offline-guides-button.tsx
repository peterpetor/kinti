"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * OfflineGuidesButton — a tudásbázis útmutatóinak letöltése offline olvasásra.
 *
 * A guide-oldalakat a böngésző Cache API-ján keresztül egy STABIL nevű cache-be
 * (`kinti-guides-offline`) tölti, amit a service worker megőriz app-frissítésnél
 * és offline navigációnál kiszolgál (lásd public/sw.js). Nincs szerver-oldal.
 */
const CACHE_NAME = "kinti-guides-offline";

export function OfflineGuidesButton({
  paths,
  idleTitle = "Olvasd offline is",
  doneTitle = "Elérhető offline",
  noun = "útmutató",
  hint = "Internet nélkül is olvashatod az útmutatókat.",
  storageKey = "kinti.guidesOfflineAt",
}: {
  paths: string[];
  idleTitle?: string;
  doneTitle?: string;
  noun?: string;
  hint?: string;
  storageKey?: string;
}) {
  const LS_KEY = storageKey;
  const [status, setStatus] = useState<"idle" | "downloading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const at = localStorage.getItem(LS_KEY);
      if (at) { setSavedAt(at); setStatus("done"); }
    } catch {
      /* ignore */
    }
  }, []);

  async function download() {
    if (typeof caches === "undefined") { setStatus("error"); return; }
    setStatus("downloading");
    setProgress(0);
    try {
      const cache = await caches.open(CACHE_NAME);
      let done = 0;
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "reload" });
          if (res.ok) await cache.put(p, res.clone());
        } catch {
          /* egy-egy oldal kihagyható */
        }
        done++;
        setProgress(Math.round((done / paths.length) * 100));
      }
      const now = new Date().toISOString();
      try { localStorage.setItem(LS_KEY, now); } catch { /* ignore */ }
      setSavedAt(now);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const done = status === "done";
  const downloading = status === "downloading";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-card border px-4 py-3 shadow-card",
        done ? "border-success/30 bg-success/5" : "border-line bg-surface",
      )}
    >
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-lg", done ? "bg-success/15" : "bg-primary-soft text-primary")}>
        {done ? "✓" : "📥"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
          {done ? doneTitle : idleTitle}
        </p>
        <p className="text-[11.5px] leading-snug text-ink-muted">
          {downloading
            ? `Letöltés… ${progress}%`
            : done
              ? `${paths.length} ${noun} a böngésződben${savedAt ? ` · ${new Date(savedAt).toLocaleDateString("hu-HU")}` : ""}`
              : hint}
        </p>
      </div>
      <button
        type="button"
        onClick={download}
        disabled={downloading}
        className={cn(
          "shrink-0 rounded-pill px-3.5 py-2 text-[12.5px] font-bold transition active:scale-95",
          downloading ? "bg-surface-alt text-ink-muted cursor-wait" : done ? "border border-line bg-surface text-ink-muted" : "bg-primary text-white shadow-card",
        )}
      >
        {downloading ? `${progress}%` : done ? "Frissítés" : "Letöltés"}
      </button>
    </div>
  );
}
