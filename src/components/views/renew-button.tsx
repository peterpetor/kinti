"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

interface RenewButtonProps {
  token: string;
}

type Phase = "idle" | "loading" | "success" | "error";

export function RenewButton({ token }: RenewButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleRenew() {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch(`/api/bulletin/renew/${token}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Nem sikerült meghosszabbítani.");
      }
      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
      setPhase("error");
    }
  }

  if (phase === "success") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-success/30 bg-success/8 px-4 py-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-[13.5px] font-bold text-success">Sikeresen meghosszabbítva!</p>
          <p className="text-[12px] text-ink-muted">
            A hirdetésed újabb 30 napig aktív a kinti hirdetőfalon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRenew}
        disabled={phase === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-4 py-3 text-[14px] font-bold text-white shadow-card-hover transition active:scale-[0.98] disabled:opacity-60"
      >
        {phase === "loading" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Hosszabbítás folyamatban…
          </>
        ) : (
          <>
            <Icon name="calendar" size={15} strokeWidth={2.4} />
            Hirdetésem meghosszabbítása (+30 nap)
          </>
        )}
      </button>

      {phase === "error" && error && (
        <p className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-[12.5px] font-semibold text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
