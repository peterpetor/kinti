"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { BadgeMedal } from "@/components/ui/badge-medal";
import { loadMyPosts } from "@/lib/my-posts";
import { computeGamification, type GamificationStats } from "@/lib/gamification";
import { streakXp } from "@/lib/streak";
import { gatherAchievementExtras } from "@/lib/achievements";
import { getMyInviteCode, getReferredBy } from "@/lib/referral-client";
import { haptic } from "@/lib/haptics";

const REFERRAL_XP = 40; // XP behívott magyaronként
const REFERRED_BONUS = 25; // egyszeri XP, ha meghívó-linkről érkeztél

const SEEN_BADGES_KEY = "kinti.seenBadges";

/**
 * /sajatjaim — "Kinti eredményeim" kártya.
 *
 * Teljesen kliensoldali: a szint/XP/kitűzők a localStorage-ban tárolt saját
 * posztokból számolódnak ([[gamification]]). Szerver-tracking nincs.
 */
export function GamificationCard() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [freshBadges, setFreshBadges] = useState<Set<string>>(new Set());

  // localStorage csak kliensen — useEffect a hidratációs eltérés elkerülésére.
  useEffect(() => {
    // Új kitűző észlelése: a most megszerzett azonosítók összevetése a korábban
    // látottakkal. Az ELSŐ betöltéskor csak rögzítünk (nincs rezgés a meglévőkre).
    const detectFresh = (s: GamificationStats) => {
      try {
        const earnedIds = s.badges.filter((b) => b.earned).map((b) => b.id);
        const raw = localStorage.getItem(SEEN_BADGES_KEY);
        if (raw == null) {
          localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(earnedIds));
        } else {
          const seen = new Set<string>(JSON.parse(raw));
          const fresh = earnedIds.filter((id) => !seen.has(id));
          if (fresh.length > 0) {
            haptic("success");
            setFreshBadges((prev) => new Set([...prev, ...fresh]));
            localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(earnedIds));
          }
        }
      } catch {
        /* localStorage nem elérhető — kihagyjuk */
      }
    };

    const referredBonus = getReferredBy() ? REFERRED_BONUS : 0;
    const compute = (referrals: number) =>
      computeGamification(loadMyPosts(), streakXp() + referredBonus + referrals * REFERRAL_XP, {
        ...gatherAchievementExtras(),
        referrals,
      });

    // Azonnali render (referrals=0), majd a szerver-konverziószámmal finomítjuk.
    const initial = compute(0);
    setStats(initial);
    detectFresh(initial);

    const code = getMyInviteCode();
    if (!code) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/referral?code=${code}`);
        const data = (await res.json()) as { count?: number };
        const referrals = data.count ?? 0;
        if (!active || referrals === 0) return;
        const refined = compute(referrals);
        setStats(refined);
        detectFresh(refined);
      } catch { /* hálózati hiba → marad a kliens-érték */ }
    })();
    return () => { active = false; };
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
                : "Elérted a legmagasabb szintet"}
            </p>
          </div>
        </div>

        {stats.total === 0 && (
          <p className="mt-3 rounded-[10px] bg-surface-alt/60 px-3 py-2 text-[11.5px] leading-relaxed text-ink-muted">
            Gyűjts XP-t és kitűzőket: értékelj egy magyar vállalkozást, vagy
            vidd fel a sajátodat a Szaknévsorba. Minden saját posztod itt számít!
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
                    ? "border-star/45 bg-star/15 shadow-[0_0_0_1px_rgba(227,162,51,0.25)]"
                    : "border-primary/25 bg-primary/10"
                  : "border-line bg-surface-alt/40",
                freshBadges.has(b.id) && "animate-pulse ring-2 ring-primary ring-offset-1",
              )}
            >
              {freshBadges.has(b.id) && (
                <span className="absolute -left-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow">
                  Új
                </span>
              )}
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
              <BadgeMedal icon={b.icon} earned={b.earned} rare={b.rare} size={46} />
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
