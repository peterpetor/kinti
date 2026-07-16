"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  TASK_DEADLINES,
  taskDeadline,
  moveOffsetLabel,
  moveBucket,
  relLabel,
  fmtDate,
  type RoadmapTask,
} from "@/lib/relocation";

/**
 * Kiköltözési idővonal — a szakasz-nézet UGYANAZON (profil-szűrt) teendőit
 * IDŐRENDBEN, a költözés dátumához igazított „visszaszámláló-táblaként" mutatja:
 * a költözés előtti teendőktől az érkezés hetén át az első hónapokig. A pöttyök
 * egyben kész-kapcsolók (produktivitási board — nem tanács). Kliensoldali,
 * a pipák a szülő localStorage-állapotából jönnek.
 */
const BUCKET_ORDER = ["before", "arrival", "first-month", "settle", "later"] as const;

type TimelineItem = {
  task: RoadmapTask;
  offset: number;
  date: Date;
  daysFromToday: number;
  hard: boolean;
  done: boolean;
};

export function RelocationTimeline({
  tasks,
  completed,
  onToggle,
  moveDate,
}: {
  tasks: RoadmapTask[];
  completed: string[];
  onToggle: (id: string) => void;
  moveDate: Date | null;
}) {
  if (!moveDate) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle bg-surface p-5 text-center">
        <p className="text-[28px]">🗓️</p>
        <p className="mt-1 text-[14px] font-bold text-ink">Add meg a tervezett költözés dátumát</p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink/60">
          Az idővonal onnan számolja ki, mikor melyik teendő esedékes — a fenti dátummezőben állíthatod be.
        </p>
      </div>
    );
  }

  const items: TimelineItem[] = tasks
    .map((task): TimelineItem | null => {
      const def = TASK_DEADLINES[task.id];
      const dl = taskDeadline(task.id, moveDate);
      if (!def || !dl) return null;
      return {
        task,
        offset: def.days,
        date: dl.date,
        daysFromToday: dl.days,
        hard: dl.hard,
        done: completed.includes(task.id),
      };
    })
    .filter((x): x is TimelineItem => x !== null)
    .sort((a, b) => a.offset - b.offset);

  const buckets = BUCKET_ORDER.map((id) => {
    const bucketItems = items.filter((it) => moveBucket(it.offset).id === id);
    return { id, title: bucketItems[0] ? moveBucket(bucketItems[0].offset).title : "", items: bucketItems };
  }).filter((b) => b.items.length > 0);

  return (
    <div className="space-y-6">
      {buckets.map((bucket) => (
        <section key={bucket.id}>
          <h3 className="mb-2 px-1 text-[12px] font-extrabold uppercase tracking-wide text-ink/50">
            {bucket.title}
          </h3>
          <ul>
            {bucket.items.map((item, i) => {
              const isLast = i === bucket.items.length - 1;
              const overdue = !item.done && item.daysFromToday < 0;
              const soon = !item.done && item.daysFromToday >= 0 && item.daysFromToday <= 7;
              return (
                <li key={item.task.id} className="flex gap-3">
                  {/* Idővonal-sín: pötty (egyben kész-kapcsoló) + összekötő vonal */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => onToggle(item.task.id)}
                      aria-pressed={item.done}
                      aria-label={`${item.task.title} — kész`}
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
                        item.done
                          ? "border-primary bg-primary text-white"
                          : overdue
                            ? "border-accent bg-surface text-accent"
                            : "border-ink/25 bg-surface text-transparent hover:border-ink/40",
                      )}
                    >
                      <Icon name="check" size={13} strokeWidth={3} />
                    </button>
                    {!isLast && <span className="w-px flex-1 bg-border-subtle" />}
                  </div>

                  {/* Kártya */}
                  <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-4")}>
                    <div className="rounded-2xl bg-ink/5 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "text-[14.5px] font-bold leading-snug",
                            item.done ? "text-ink/45 line-through" : "text-ink",
                          )}
                        >
                          {item.task.title}
                        </h4>
                        <span className="mt-0.5 shrink-0 rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[10.5px] font-bold text-ink/55">
                          {moveOffsetLabel(item.offset)}
                        </span>
                      </div>

                      {!item.done && (
                        <p className="mt-1 text-[12.5px] leading-snug text-ink/65">{item.task.description}</p>
                      )}

                      {!item.done && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                              overdue
                                ? "bg-accent/10 text-accent"
                                : soon
                                  ? "bg-star/15 text-star"
                                  : "bg-ink/5 text-ink/60",
                            )}
                          >
                            <Icon name="clock" size={11} strokeWidth={2.4} />
                            {fmtDate(item.date)} · {relLabel(item.daysFromToday)}
                          </span>
                          {item.hard && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                              ⚖️ jogi határidő
                            </span>
                          )}
                        </div>
                      )}

                      {item.task.linkHref && !item.done && (
                        <div className="mt-2.5">
                          <Link
                            href={item.task.linkHref}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-[12px] font-bold text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))] transition active:scale-[0.98]"
                          >
                            {item.task.linkIcon && <Icon name={item.task.linkIcon} size={14} />}
                            {item.task.linkLabel}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
