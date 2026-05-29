"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMyPosts } from "@/lib/my-posts";

/**
 * MyPostsBanner — a főoldalra mutatja, hogy a usernek vannak saját posztjai
 * a böngészőjében. Csak a kliensen, csak ha 1+ poszt található.
 */
export function MyPostsBanner() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(loadMyPosts().length);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/sajatjaim"
      className="flex items-center gap-3 rounded-card border border-primary/30 bg-primary-soft px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-lg">
        📌
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
          {count === 1 ? "1 saját posztod van" : `${count} saját posztod van`}
        </span>
        <span className="block text-[11.5px] text-ink-muted">
          Szerkesztés, törlés, mentés másik eszközre — kattints rá!
        </span>
      </span>
      <span className="shrink-0 text-primary text-[14px] font-bold">›</span>
    </Link>
  );
}
