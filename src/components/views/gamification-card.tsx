"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { loadMyPosts } from "@/lib/my-posts";
import { computeGamification, type GamificationStats } from "@/lib/gamification";
import { streakXp } from "@/lib/streak";
import { gatherAchievementExtras } from "@/lib/achievements";

/**
 * /sajatjaim — "Kinti eredményeim" kártya.
 *
 * Teljesen kliensoldali: a szint/XP/kitűzők a localStorage-ban tárolt saját
 * posztokból számolódnak ([[gamification]]). Szerver-tracking nincs.
 */
export function GamificationCard() {
  const [stats, setStats] = useState<GamificationStats | null>(null);

  // localStorage csak kliensen — useEffect a hidratációs eltérés elkerülésére.
  useEffect(() => {
    setStats(computeGamification(loadMyPosts(), streakXp(), gatherAchievementExtras()));
  }, []);

  if (!stats) {
    // Szerver-render / első festés: rögzített magasságú skeleton, hogy ne ugráljon.
    return <div className="h-[150px] rounded-card border border-line bg-surface-alt/40 animate-pulse" />;
  }

  const pointsIntoLevel = stats.points - stats.levelBase;
  const pointsSpan = stats.nextLevelAt - stats.levelBase;
  const toNext = Math.max(0, stats.nextLevelAt - stats.points);

  return (
    <div className="space-y-3">
      {/* Szint + XP fejléc */}
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white text-[18px] font-black shadow-card">
            {stats.level}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[14px] font-extrabold tracking-tight text-ink">
                {stats.level}. szint
              </span>
              <span className="text-[12px] font-bold text-primary">{stats.points} XP</span>
            </div>

            {/* Haladás-sáv a következő szintig */}
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${Math.round(stats.levelProgress * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11.5px] font-semibold text-ink-faint">
              {pointsSpan > 0
                ? `${pointsIntoLevel} / ${pointsSpan} XP — még ${toNext} a következő szintig`
                : "Elérted a legmagasabb szintet 🎉"}
            </p>
          </div>
        </div>

        {stats.total === 0 && (
          <p className="mt-3 rounded-[10px] bg-surface-alt/60 px-3 py-2 text-[11.5px] leading-relaxed text-ink-muted">
            Gyűjts XP-t és kitűzőket: írj véleményt, szervezz eseményt vagy
            regisztráld a vállalkozásodat. Minden saját posztod itt számít!
          </p>
        )}
      </div>

      {/* Kitűzők */}
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="mb-3 flex items-baseline justify-between">
          <h4 className="text-[13px] font-extrabold tracking-tight text-ink">Kitűzők</h4>
          <span className="text-[11px] font-bold text-ink-faint">
            {stats.earnedBadgeCount} / {stats.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.badges.map((b) => (
            <div
              key={b.id}
              title={`${b.label}${b.rare ? " (ritka)" : ""} — ${b.earned ? "megszerezve" : "még zárolva"}`}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition",
                b.earned
                  ? b.rare
                    ? "border-[#e3a233]/45 bg-[#e3a233]/15 shadow-[0_0_0_1px_rgba(227,162,51,0.25)]"
                    : "border-primary/25 bg-primary/10"
                  : "border-line bg-surface-alt/40",
              )}
            >
              {b.rare && (
                <span
                  className={cn(
                    "absolute right-1 top-1 text-[9px] font-black",
                    b.earned ? "text-[#b8860b]" : "text-ink-faint/50",
                  )}
                >
                  ✦
                </span>
              )}
              <span className={cn("text-2xl leading-none", !b.earned && "opacity-30 grayscale")}>
                {b.icon}
              </span>
              <span
                className={cn(
                  "text-[11.5px] font-bold leading-tight",
                  b.earned ? (b.rare ? "text-[#b8860b]" : "text-primary") : "text-ink-faint",
                )}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
