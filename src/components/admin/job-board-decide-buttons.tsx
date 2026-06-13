"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type JobBoardTable = "employers" | "jobs";

interface Props {
  table: JobBoardTable;
  id: string;
  current: number; // 0=pending, 1=approved, 2=rejected
}

export function JobBoardDecideButtons({ table, id, current }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  const decide = async (decision: "approved" | "rejected") => {
    setLoading(decision);
    try {
      const res = await fetch("/api/admin/job-board/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id, decision }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  };

  if (current === 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-extrabold uppercase text-success">
          Jóváhagyva
        </span>
        <button
          onClick={() => decide("rejected")}
          disabled={!!loading}
          className="rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-ink-muted hover:bg-surface-alt transition-colors"
        >
          Visszavon
        </button>
      </div>
    );
  }

  if (current === 2) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-extrabold uppercase text-accent">
          Elutasítva
        </span>
        <button
          onClick={() => decide("approved")}
          disabled={!!loading}
          className="rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-ink-muted hover:bg-surface-alt transition-colors"
        >
          Jóváhagy
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => decide("approved")}
        disabled={!!loading}
        className="rounded-lg bg-success px-3 py-1.5 text-[11px] font-extrabold text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {loading === "approved" ? "..." : "✓ Jóváhagy"}
      </button>
      <button
        onClick={() => decide("rejected")}
        disabled={!!loading}
        className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-extrabold text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {loading === "rejected" ? "..." : "✕ Elutasít"}
      </button>
    </div>
  );
}
