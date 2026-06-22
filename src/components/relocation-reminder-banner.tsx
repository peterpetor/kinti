"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { getPhases, parseYMD, taskDeadline, relLabel } from "@/lib/relocation";
import { readPreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export function RelocationReminderBanner() {
  const [mounted, setMounted] = useState(false);
  const [reminders, setReminders] = useState<{ task: any; dl: any }[]>([]);

  useEffect(() => {
    const savedDate = localStorage.getItem("kinti_relocation_movedate");
    const savedTasks = localStorage.getItem("kinti_relocation_tasks");
    
    if (savedDate) {
      let completedTasks: string[] = [];
      try {
        if (savedTasks) completedTasks = JSON.parse(savedTasks);
      } catch (e) {
        // ignore
      }

      const moveDateObj = parseYMD(savedDate);
      if (moveDateObj) {
        const urgentTasks = getPhases(readPreferredCountry() ?? DEFAULT_COUNTRY).flatMap((p) => p.tasks)
          .filter((t) => !completedTasks.includes(t.id))
          .map((t) => ({ task: t, dl: taskDeadline(t.id, moveDateObj)! }))
          .filter((x) => x.dl && x.dl.days <= 7)
          .sort((a, b) => a.dl.days - b.dl.days);

        setReminders(urgentTasks);
      }
    }
    setMounted(true);
  }, []);

  if (!mounted || reminders.length === 0) return null;

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 shadow-sm mb-4">
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
      <Link href="/kikoltozes" className="mt-3 inline-flex text-[12.5px] font-bold text-primary active:scale-95 transition-transform">
        Ugrás a kiköltözés-tervezőhöz ›
      </Link>
    </div>
  );
}
