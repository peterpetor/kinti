"use client";

import { useEffect, useState } from "react";
import { recordVisit, STREAK_MILESTONES, type VisitResult } from "@/lib/streak";

/**
 * DailyStreak — napi belépési sorozat kártya a főoldalon. Mount-kor beszámítja a
 * mai látogatást (naponta egyszer számít), és megmutatja a sorozatot + a ma kapott
 * XP-t. Mérföldkőnél kiemelt visszajelzés. Kliensoldali (localStorage), lib/streak.
 */
const MILESTONE_DAYS = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b);

export function DailyStreak() {
  const [visit, setVisit] = useState<VisitResult | null>(null);

  useEffect(() => {
    const v = recordVisit();
    setVisit(v);
    // Streak-szinkron a push-feliratkozásra (ha van) — így a streak-mentő cron
    // tud szólni, mielőtt ma megszakad. Fire-and-forget, endpoint-scope.
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) return;
        await fetch("/api/push/streak", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint, streak: v.state.current, day: v.state.lastDate }),
          keepalive: true,
        });
      } catch {
        /* legrosszabb esetben nincs streak-mentő — nem kritikus */
      }
    })();
  }, []);

  if (!visit || visit.state.current <= 0) return null;
  const { current } = visit.state;
  const nextMilestone = MILESTONE_DAYS.find((d) => d > current) ?? null;
  const daysToNext = nextMilestone ? nextMilestone - current : null;
  const isMilestone = visit.milestoneBonus > 0;

  return (
    <div
      className={
        "flex items-center gap-3 rounded-card border px-4 py-3 shadow-card " +
        (isMilestone ? "border-[#e3a233]/40 bg-[#e3a233]/10" : "border-line bg-surface")
      }
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e3a233]/15 text-2xl">
        🔥
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-extrabold tracking-tight text-ink">
          {current} napos sorozat
          {visit.incremented && (
            <span className="ml-1.5 text-[12px] font-bold text-success">+{visit.awardedXp} XP</span>
          )}
        </p>
        <p className="text-[11.5px] leading-snug text-ink-muted">
          {isMilestone ? (
            <span className="font-bold text-[#b8860b]">🎉 Mérföldkő! +{visit.milestoneBonus} bónusz XP</span>
          ) : daysToNext ? (
            <>Gyere vissza holnap is! Még {daysToNext} nap a következő bónuszig.</>
          ) : (
            <>Hihetetlen kitartás — tartsd a lángot! 🔥</>
          )}
        </p>
      </div>
    </div>
  );
}
