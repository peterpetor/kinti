"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMyPosts } from "@/lib/my-posts";
import { computeGamification, type GamificationStats } from "@/lib/gamification";
import { streakXp } from "@/lib/streak";
import { gatherAchievementExtras } from "@/lib/achievements";

/**
 * MyPostsBanner — a főoldalra mutatja, hogy a usernek vannak saját posztjai
 * a böngészőjében, a gamifikációs szintjével/XP-jével együtt. Csak a kliensen,
 * csak ha 1+ poszt található.
 */
export function MyPostsBanner() {
  const [stats, setStats] = useState<GamificationStats | null>(null);

  useEffect(() => {
    setStats(computeGamification(loadMyPosts(), streakXp(), gatherAchievementExtras()));
  }, []);

  if (!stats || stats.total === 0) return null;

  return (
    <Link
      href="/sajatjaim"
      className="flex items-center gap-3 rounded-card border border-primary/30 bg-primary-soft px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      {/* Szint-jelvény + haladás-gyűrű helyett kompakt szint-badge */}
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
        <span className="text-[15px] font-black leading-none">{stats.level}</span>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-1.5 py-px text-[8px] font-black uppercase tracking-wide text-white shadow-sm">
          szint
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
            {stats.total === 1 ? "1 saját posztod van" : `${stats.total} saját posztod van`}
          </span>
          <span className="text-[11px] font-bold text-primary">· {stats.points} XP</span>
        </span>
        {/* Haladás-sáv a következő szintig */}
        <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${Math.round(stats.levelProgress * 100)}%` }}
          />
        </span>
        <span className="mt-0.5 block text-[11px] text-ink-muted">
          {stats.earnedBadgeCount > 0
            ? `${stats.earnedBadgeCount} kitűző · szerkesztés, mentés — kattints!`
            : "Szerkesztés, törlés, mentés másik eszközre — kattints rá!"}
        </span>
      </span>
      <span className="shrink-0 text-primary text-[14px] font-bold">›</span>
    </Link>
  );
}
