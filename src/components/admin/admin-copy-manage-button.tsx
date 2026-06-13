"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** A manage-flow path-prefix-e. */
const PATH_PREFIX: Record<"businesses" | "events", string> = {
  businesses: "/szaknevsor/kezeles",
  events:     "/esemeny-kezeles",
};

/**
 * Admin "Másold a kezelő-linket" gomb.
 *
 * Egy kattintás → a manage URL clipboardra kerül. Onnan az admin elküldheti
 * a felhasználónak (pl. ha valaki info@kinti.app-ra ír "elveszítettem a linket").
 *
 * Single-admin környezetben elfogadható: a token "god mode" — a teljes posztot
 * lehet rajta keresztül szerkeszteni vagy törölni. Visszaélés ellen csak az
 * admin önfegyelme véd.
 */
export function AdminCopyManageButton({
  type,
  manageToken,
}: {
  type: "businesses" | "events";
  manageToken: string | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!manageToken) {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-faint">
        nincs token
      </span>
    );
  }

  async function onCopy() {
    if (!manageToken) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://kinti.app";
    const fullUrl = `${origin}${PATH_PREFIX[type]}/${manageToken}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: prompt — ha a clipboard API nem érhető el (HTTP, régi böngésző)
      window.prompt("Manage URL (másold ki):", fullUrl);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title="Másold a kezelő URL-t — küldd el a felhasználónak ha elveszítette"
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[11.5px] font-bold transition active:scale-95",
        copied
          ? "border-success/40 bg-success/10 text-success"
          : "border-line bg-surface text-ink-muted hover:text-ink",
      )}
    >
      {copied ? "✓ Másolva" : "🔗 Kezelő-link"}
    </button>
  );
}
