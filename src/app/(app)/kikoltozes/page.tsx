"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/ui/headers";
import { Icon, IconName } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import {
  PHASES,
  taskDeadline,
  daysFromToday,
  fmtDate,
  relLabel,
  parseYMD,
} from "@/lib/relocation";

export default function RelocationTrackerPage() {
  const [mounted, setMounted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedPhase, setExpandedPhase] = useState<string>("phase-1");
  const [moveDate, setMoveDate] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("kinti_relocation_tasks");
    if (saved) {
      try {
        setCompletedTasks(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    const savedDate = localStorage.getItem("kinti_relocation_movedate");
    if (savedDate) setMoveDate(savedDate);
    setMounted(true);
  }, []);

  const updateMoveDate = (v: string) => {
    setMoveDate(v);
    try {
      localStorage.setItem("kinti_relocation_movedate", v);
    } catch {
      /* ignore */
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId];
      localStorage.setItem("kinti_relocation_tasks", JSON.stringify(next));
      return next;
    });
  };

  const totalTasks = PHASES.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const progressPercent = Math.round((completedTasks.length / totalTasks) * 100) || 0;

  const moveDateObj = parseYMD(moveDate);
  const daysToMove = moveDateObj ? daysFromToday(moveDateObj) : null;

  // Sürgős/lejárt határidők (≤7 nap), a be nem fejezett feladatokból.
  const reminders = moveDateObj
    ? PHASES.flatMap((p) => p.tasks)
        .filter((t) => !completedTasks.includes(t.id))
        .map((t) => ({ task: t, dl: taskDeadline(t.id, moveDateObj)! }))
        .filter((x) => x.dl && x.dl.days <= 7)
        .sort((a, b) => a.dl.days - b.dl.days)
    : [];

  if (!mounted) {
    return <div className="p-4">Betöltés...</div>;
  }

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pb-4 pt-6">
        <ScreenHeader 
          eyebrow="Tervező" 
          title="Kiköltözés Tracker" 
          back={
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 transition">
              <Icon name="arrowLeft" size={20} strokeWidth={2.5} />
            </Link>
          }
        />

        {/* Progress Bar */}
        <div className="mt-6 rounded-2xl border border-border-subtle bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-ink/70 uppercase tracking-wide">
              Készültség
            </span>
            <span className="text-[15px] font-extrabold text-primary">
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink/5">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-[13px] font-medium text-ink/60">
            {completedTasks.length} a {totalTasks} feladatból teljesítve.
          </p>
        </div>

        {/* Tervezett kiköltözés dátuma + visszaszámláló */}
        <div className="mt-4 rounded-2xl border border-border-subtle bg-surface p-4 shadow-card">
          <label htmlFor="movedate" className="mb-2 block text-[13px] font-bold uppercase tracking-wide text-ink/70">
            🗓️ Tervezett kiköltözés
          </label>
          <input
            id="movedate"
            type="date"
            value={moveDate}
            onChange={(e) => updateMoveDate(e.target.value)}
            className="w-full rounded-xl border border-border-subtle bg-ink/5 px-3 py-2.5 text-[14px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {daysToMove !== null ? (
            <p className="mt-3 text-center text-[14px] font-bold text-ink">
              {daysToMove > 0 ? (
                <>⏳ <span className="text-[20px] font-extrabold text-primary">{daysToMove}</span> nap a kiköltözésig</>
              ) : daysToMove === 0 ? (
                "🎉 Ma van a nagy nap — sok sikert!"
              ) : (
                <>🇨🇭 <span className="text-[20px] font-extrabold text-primary">{Math.abs(daysToMove)}</span>. napod Svájcban</>
              )}
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-ink/60">
              Add meg a dátumot, és minden határidőt a te idővonaladhoz igazítunk.
            </p>
          )}
        </div>

        {/* Sürgős / lejárt határidők — emlékeztető az app megnyitásakor */}
        {reminders.length > 0 && (
          <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-accent">
              <Icon name="clock" size={15} strokeWidth={2.5} /> Közelgő / lejárt határidők
            </p>
            <ul className="mt-2 space-y-1.5">
              {reminders.slice(0, 3).map(({ task, dl }) => (
                <li key={task.id} className="text-[12.5px] leading-snug text-ink">
                  <strong>{task.title}</strong> —{" "}
                  <span className={cn("font-bold", dl.days <= 3 ? "text-accent" : "text-ink/70")}>
                    {relLabel(dl.days)}
                  </span>
                  {dl.hard && <span className="ml-1 text-[10.5px] font-bold text-accent">⚖️ jogi</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="px-4 py-2 space-y-4">
        {PHASES.map((phase, index) => {
          const isExpanded = expandedPhase === phase.id;
          const phaseTasksCompleted = phase.tasks.filter((t) => completedTasks.includes(t.id)).length;
          const phaseProgress = phaseTasksCompleted === phase.tasks.length;

          return (
            <div 
              key={phase.id} 
              className={cn(
                "overflow-hidden rounded-3xl border transition-all duration-300",
                isExpanded ? "border-border-strong bg-surface shadow-card" : "border-border-subtle bg-surface/50 hover:bg-surface"
              )}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 outline-none"
                onClick={() => setExpandedPhase(isExpanded ? "" : phase.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                    phaseProgress ? "bg-primary text-white" : "bg-ink/5 text-ink/70"
                  )}>
                    <Icon name={phaseProgress ? "check" : phase.icon} size={20} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-ink">{phase.title}</h3>
                    <p className="text-[13px] font-medium text-ink/60">
                      {phaseTasksCompleted} / {phase.tasks.length} kész
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 transition-transform duration-300",
                  isExpanded ? "rotate-180" : ""
                )}>
                  <Icon name="chevD" size={18} strokeWidth={2.5} />
                </div>
              </button>

              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border-subtle px-4 pb-4 pt-2">
                    <div className="flex flex-col gap-4">
                      {phase.tasks.map((task) => {
                        const isDone = completedTasks.includes(task.id);
                        return (
                          <div key={task.id} className="relative flex items-start gap-3 rounded-2xl bg-ink/5 p-3">
                            <button
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                isDone 
                                  ? "border-primary bg-primary text-white" 
                                  : "border-ink/20 bg-transparent text-transparent hover:border-ink/40"
                              )}
                            >
                              <Icon name="check" size={14} strokeWidth={3} />
                            </button>
                            <div className="flex-1">
                              <h4 className={cn(
                                "text-[15px] font-bold transition-colors",
                                isDone ? "text-ink/50 line-through" : "text-ink"
                              )}>
                                {task.title}
                              </h4>
                              <p className={cn(
                                "mt-1 text-[13px] leading-snug transition-colors",
                                isDone ? "text-ink/40" : "text-ink/70"
                              )}>
                                {task.description}
                              </p>

                              {(() => {
                                const dl = taskDeadline(task.id, moveDateObj);
                                if (!dl || isDone) return null;
                                const tone =
                                  dl.days < 0
                                    ? "bg-accent/10 text-accent"
                                    : dl.days <= 7
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      : "bg-ink/5 text-ink/60";
                                return (
                                  <span className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", tone)}>
                                    <Icon name="clock" size={11} strokeWidth={2.4} />
                                    {fmtDate(dl.date)} · {relLabel(dl.days)}{dl.hard ? " · ⚖️" : ""}
                                  </span>
                                );
                              })()}

                              {task.linkHref && (
                                <div className="mt-3">
                                  <Link 
                                    href={task.linkHref}
                                    className="inline-flex items-center justify-center font-bold tracking-[-0.01em] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))] h-9 gap-1.5 rounded-xl px-3 text-[12px]"
                                  >
                                    {task.linkIcon && <Icon name={task.linkIcon} size={14} />}
                                    {task.linkLabel}
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
