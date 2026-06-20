"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/ui/headers";
import { Icon, IconName } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type RoadmapTask = {
  id: string;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
  linkIcon?: IconName;
};

type RoadmapPhase = {
  id: string;
  title: string;
  icon: IconName;
  tasks: RoadmapTask[];
};

const PHASES: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      {
        id: "cv",
        title: "Svájci önéletrajz (CV) elkészítése",
        description: "A svájci munkáltatók specifikus formátumot várnak el. Készíts egy letisztult CV-t az itteni sztenderdek szerint.",
        linkHref: "/tudasbazis",
        linkLabel: "Tudásbázis",
        linkIcon: "bookmark",
      },
      {
        id: "ber",
        title: "Bérszint ellenőrzése",
        description: "Nézd meg a célkantonod átlagos fizetéseit, hogy reális bérigénnyel jelentkezz.",
        linkHref: "/iranytu",
        linkLabel: "Bérkalkulátor",
        linkIcon: "trending",
      },
      {
        id: "megtakaritas",
        title: "Megtakarítás kalkuláció",
        description: "A kiköltözés költséges. Számolj legalább 3 havi kaucióval és 2 hónapnyi megélhetéssel (kb. 8-10 ezer CHF).",
        linkHref: "/tudasbazis",
        linkLabel: "Kiköltözési cikkek",
        linkIcon: "bookmark",
      },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      {
        id: "kreisburo",
        title: "Lakcím bejelentés (Kreisbüro)",
        description: "Az érkezéstől számított 14 napon belül, de még az első munkanapod előtt be kell jelentkezned a helyi önkormányzatnál.",
        linkHref: "/ugyintezes",
        linkLabel: "Hivatalos ügyek",
        linkIcon: "bookmark",
      },
      {
        id: "sim",
        title: "Svájci SIM kártya vásárlása",
        description: "Szinte mindenhez (bankszámla, lakásbérlés) szükséged lesz egy svájci telefonszámra.",
        linkHref: "/szolgaltato-valto",
        linkLabel: "Szolgáltatók",
        linkIcon: "phone",
      },
      {
        id: "bank",
        title: "Bankszámlanyitás",
        description: "A fizetésed fogadásához elengedhetetlen. Szükséged lesz a munkaszerződésre és a tartózkodási engedélyre.",
        linkHref: "/szolgaltato-valto",
        linkLabel: "Bankszámlák",
        linkIcon: "globe",
      },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      {
        id: "krankenkasse",
        title: "Betegbiztosítás (Krankenkasse)",
        description: "Kötelező megkötni 3 hónapon belül, de visszamenőleg kell fizetni az érkezés napjától! Intézd el mielőbb.",
        linkHref: "/szolgaltato-valto",
        linkLabel: "Krankenkasse",
        linkIcon: "heart",
      },
      {
        id: "lakas",
        title: "Albérlet keresés és Kaució",
        description: "Ideiglenes szállás után állandó lakás keresése. Ha nincs elég készpénzed kaucióra, vannak biztosítós megoldások is.",
        linkHref: "/tudasbazis",
        linkLabel: "Tudásbázis: Albérlet",
        linkIcon: "bookmark",
      },
      {
        id: "ado",
        title: "Adózás (Quellensteuer)",
        description: "Külföldiként forrásadót vonnak a fizetésedből. Tudd meg, mikor éri meg önkéntes adóbevallást kérni.",
        linkHref: "/szaknevsor",
        linkLabel: "Könyvelők",
        linkIcon: "users",
      },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      {
        id: "kozosseg",
        title: "Magyar közösség megtalálása",
        description: "Ne maradj egyedül! Csatlakozz túrákhoz, eseményekhez, vagy keress embereket a közeledben.",
        linkHref: "/kozosseg",
        linkLabel: "Közösség",
        linkIcon: "users",
      },
      {
        id: "nyelv",
        title: "Nyelvtanfolyam",
        description: "A beilleszkedés és a jobb munkahely kulcsa a helyi nyelv (esetleg a svájci német) elsajátítása.",
        linkHref: "/tudasbazis",
        linkLabel: "Nyelvtanulás",
        linkIcon: "magic",
      },
    ],
  },
];

export default function RelocationTrackerPage() {
  const [mounted, setMounted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedPhase, setExpandedPhase] = useState<string>("phase-1");

  useEffect(() => {
    const saved = localStorage.getItem("kinti_relocation_tasks");
    if (saved) {
      try {
        setCompletedTasks(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    setMounted(true);
  }, []);

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
