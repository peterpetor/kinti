"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { findMyPost, type PostType } from "@/lib/my-posts";

/**
 * OwnPostBadge — pirosas "TIED" pill a saját posztokon a feed-en.
 *
 * Csak akkor jelenik meg, ha a user böngészőjében localStorage-ban
 * tárolt a (type, id) párhoz tartozó manage_token. Linkelhető a kezelő
 * oldalra.
 */
export function OwnPostBadge({ type, id }: { type: PostType; id: string }) {
  const [manageUrl, setManageUrl] = useState<string | null>(null);

  useEffect(() => {
    const entry = findMyPost(type, id);
    setManageUrl(entry?.manageUrl ?? null);
  }, [type, id]);

  if (!manageUrl) return null;

  return (
    <Link
      href={manageUrl}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-md bg-accent/15 text-accent border border-accent/30 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide hover:bg-accent/25 transition"
      title="Saját posztod — kattints a szerkesztéshez"
    >
      ★ Tied
    </Link>
  );
}
