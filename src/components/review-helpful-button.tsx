"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * ReviewHelpfulButton — „Hasznos volt 👍" szavazás egy véleményre.
 *
 * Account nélkül: a szerver IP-hash-en deduplikál (1 szavazat / készülék-IP),
 * a saját „szavaztam" állapot pedig a böngésző localStorage-jában él, hogy
 * újratöltés után is látszódjon. Ugyanaz az adatvédelmi minta, mint az
 * esemény-RSVP — nincs per-user azonosító.
 */

const LS_KEY = "kinti.helpfulVotes";

function loadVoted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function markVoted(reviewId: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = new Set(loadVoted());
    set.add(reviewId);
    window.localStorage.setItem(LS_KEY, JSON.stringify([...set].slice(-500)));
  } catch {
    /* private mode / quota → ok */
  }
}

export function ReviewHelpfulButton({
  reviewId,
  initialCount,
}: {
  reviewId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVoted(loadVoted().includes(reviewId));
  }, [reviewId]);

  async function onVote() {
    if (voted || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { total?: number };
      if (res.ok) {
        setCount(data.total ?? count + 1);
        setVoted(true);
        markVoted(reviewId);
      }
    } catch {
      /* hálózati hiba — silent */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onVote}
      disabled={voted || busy}
      aria-pressed={voted}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-[11.5px] font-bold transition active:scale-95",
        voted
          ? "border-primary/30 bg-primary/10 text-primary cursor-default"
          : "border-line bg-surface text-ink-muted hover:text-ink",
        busy && "opacity-60 cursor-wait",
      )}
    >
      <span aria-hidden>👍</span>
      {voted ? "Hasznos" : "Hasznos volt?"}
      {count > 0 && <span className="tabular-nums">· {count}</span>}
    </button>
  );
}
