"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Admin törlés gomb. A `type` adja meg az API-csoportot:
 *   businesses | events
 * Sikerre a `router.refresh()` újraolvassa az oldalt.
 */
export function AdminDeleteButton({
  type,
  id,
  label = "Töröl",
  confirmText,
  small = false,
}: {
  type: "businesses" | "events";
  id: string;
  label?: string;
  confirmText?: string;
  small?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const msg = confirmText ?? `Biztos törlöd? Ez nem visszavonható.`;
    if (!confirm(msg)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(`Törlés sikertelen: ${data.error ?? res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || pending;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border border-accent/40 bg-accent/10 font-bold text-accent transition active:scale-95 hover:bg-accent hover:text-white",
        small ? "px-2 py-0.5 text-[10.5px]" : "px-3 py-1 text-[11.5px]",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      🗑 {disabled ? "…" : label}
    </button>
  );
}
