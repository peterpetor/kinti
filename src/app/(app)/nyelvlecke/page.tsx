"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/ui/headers";
import { Icon } from "@/components/ui/icons";
import { LESSONS } from "./data";
import { cn } from "@/lib/cn";

export default function LanguagePathPage() {
  const [mounted, setMounted] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("kinti_language_progress");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompletedLessons(data.completed || []);
        setTotalXp(data.xp || 0);
        
        let currentStreak = data.streak || 0;
        if (data.lastPlayedDate) {
          const todayDate = new Date();
          const today = new Date(todayDate.getTime() - (todayDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
          const lastDate = new Date(data.lastPlayedDate);
          const currentDate = new Date(today);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            currentStreak = 0; // Megszakadt a sorozat
          }
        }
        setStreak(currentStreak);
      } catch (e) {
        // ignore
      }
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-4">Betöltés...</div>;
  }

  // Group lessons by chapter dynamically
  const chapters = Array.from(new Set(LESSONS.map((l) => l.chapter))).sort((a, b) => a - b);

  return (
    <div className="flex flex-col pb-24 min-h-screen bg-surface">
      {/* Sticky Header with Stats */}
      <div className="sticky top-0 z-20 bg-background/80 px-4 pb-4 pt-6 backdrop-blur-xl border-b border-border-subtle">
        <ScreenHeader 
          eyebrow="Nyelvlecke" 
          title="Schwyzerdütsch" 
          back={
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 transition">
              <Icon name="arrowLeft" size={20} strokeWidth={2.5} />
            </Link>
          }
        />

        <div className="flex items-center gap-4 mt-6">
          <div className={cn("flex flex-1 items-center gap-3 rounded-2xl p-3", streak > 0 ? "bg-[#ff9600]/10" : "bg-ink/5")}>
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-white", streak > 0 ? "bg-[#ff9600]" : "bg-ink-muted/50")}>
              🔥
            </span>
            <div>
              <div className={cn("text-[11px] font-black uppercase tracking-wider", streak > 0 ? "text-[#ff9600]" : "text-ink-muted")}>Streak</div>
              <div className={cn("text-[17px] font-extrabold leading-none", streak > 0 ? "text-[#ff9600]" : "text-ink-muted")}>{streak} nap</div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-accent/10 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white">
              <Icon name="star" size={20} strokeWidth={2.5} filled={true} />
            </span>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-accent">Tapasztalat</div>
              <div className="text-[17px] font-extrabold text-accent leading-none">{totalXp} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* The Path */}
      <div className="flex flex-col items-center py-10 px-4 space-y-12">
        {chapters.map((chapter) => {
          const chapterLessons = LESSONS.filter(l => l.chapter === chapter);
          if (chapterLessons.length === 0) return null;

          return (
            <div key={chapter} className="flex flex-col items-center w-full">
              <div className="w-full max-w-sm mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border-strong/30" />
                <h2 className="text-[15px] font-bold tracking-widest uppercase text-ink-muted">
                  {chapter}. Fejezet
                </h2>
                <div className="h-px flex-1 bg-border-strong/30" />
              </div>

              <div className="relative flex flex-col items-center gap-8">
                {/* SVG Line connecting the dots */}
                <svg className="absolute top-0 bottom-0 w-32 -z-10 text-border-subtle" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Simplified wavy line (could be improved with SVG path logic based on items) */}
                  <path d="M50,0 C80,25 20,75 50,100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
                </svg>

                {chapterLessons.map((lesson, idx) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  // Next lesson is unlocked if previous is completed (or if it's the first lesson)
                  const prevLessonIndex = LESSONS.findIndex(l => l.id === lesson.id) - 1;
                  const isUnlocked = prevLessonIndex < 0 || completedLessons.includes(LESSONS[prevLessonIndex].id);
                  
                  // Zigzag offsets
                  const offsetClasses = [
                    "translate-x-0",
                    "translate-x-8",
                    "translate-x-0",
                    "-translate-x-8",
                  ];
                  const xOffset = offsetClasses[idx % 4];

                  return (
                    <div key={lesson.id} className={cn("relative flex flex-col items-center", xOffset)}>
                      {!isUnlocked && (
                        <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-surface-alt border-4 border-surface shadow-pop text-ink-muted text-2xl">
                          🔒
                        </div>
                      )}

                      {isUnlocked && isCompleted && (
                        <Link 
                          href={`/nyelvlecke/${lesson.id}`}
                          className="grid h-[70px] w-[70px] place-items-center rounded-full bg-success border-4 border-surface shadow-[0_6px_0_0_rgb(20,80,45)] text-white hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_0_rgb(20,80,45)] transition-all"
                        >
                          <Icon name="check" size={32} strokeWidth={3} />
                        </Link>
                      )}

                      {isUnlocked && !isCompleted && (
                        <div className="relative">
                          {/* Crown/Pulse for current active lesson */}
                          <div className="absolute -top-3 -right-3 text-2xl animate-bounce">👑</div>
                          <Link 
                            href={`/nyelvlecke/${lesson.id}`}
                            className="grid h-[70px] w-[70px] place-items-center rounded-full bg-primary border-4 border-surface shadow-[0_6px_0_0_rgb(var(--primary-soft))] text-white hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_0_rgb(var(--primary-soft))] transition-all animate-pulse-ring"
                          >
                            <Icon name="star" size={30} strokeWidth={2.5} filled />
                          </Link>
                        </div>
                      )}
                      
                      <div className="mt-4 rounded-xl bg-surface px-4 py-2 shadow-card text-center max-w-[200px]">
                        <div className="text-[14px] font-black tracking-tight text-ink">
                          {lesson.title}
                        </div>
                        <div className="text-[12px] text-ink-muted line-clamp-1">
                          {lesson.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
