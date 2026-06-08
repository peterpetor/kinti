"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { KintiLogo } from "@/components/ui/kinti-logo";

const CHECKLIST_ITEMS = [
  {
    id: "ahv",
    title: "AHV-Szám (TB Szám) igénylése",
    description: "A munkáltatónak kell kiváltania az első fizetéshez. Kérdezz rá a HR-nél!",
    icon: "briefcase" as const,
  },
  {
    id: "bank",
    title: "Svájci Bankszámla Nyitása",
    description: "Kantonalbank, UBS vagy Neon/Yuh (digitális). Szükség lesz a munkaszerződésre hozzá.",
    icon: "bank" as const, // We might not have 'bank', using 'creditCard' or similar later if it fails. Let's use generic ones.
    iconFallback: "briefcase",
  },
  {
    id: "kreisburo",
    title: "Lakcím Bejelentés (Kreisbüro / Gemeinde)",
    description: "A beköltözéstől számított 14 napon belül be kell jelentkezned az önkormányzatnál.",
    icon: "home" as const,
  },
  {
    id: "krankenkasse",
    title: "Egészségbiztosítás (Krankenkasse)",
    description: "3 hónapod van kötni, de visszamenőleg kell fizetni az első naptól! Válaszd ki a franchiset okosan.",
    icon: "heart" as const,
  },
  {
    id: "permit",
    title: "Tartózkodási Engedély (Ausweis) átvétele",
    description: "Általában postán küldik ki (L vagy B engedély) a bejelentkezés után 2-4 héttel.",
    icon: "fileText" as const,
  },
  {
    id: "phone",
    title: "Svájci Telefonszám",
    description: "Wingo, Yallo vagy Swisscom. A legtöbb helyi cég nem szívesen hív vissza magyar számot.",
    icon: "smartphone" as const,
  }
];

export default function OnboardingChecklistPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kinti_onboarding");
    if (saved) {
      try { setCompleted(JSON.parse(saved)); } catch (e) {}
    }
    setMounted(true);
  }, []);

  const toggleItem = (id: string) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    localStorage.setItem("kinti_onboarding", JSON.stringify(next));
  };

  const progress = Math.round((Object.values(completed).filter(Boolean).length / CHECKLIST_ITEMS.length) * 100) || 0;

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      <header className="mb-8 text-center">
        <KintiLogo size={42} className="mx-auto" />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-ink">
          Svájci Kezdőcsomag 🇨🇭
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Gratulálunk az új munkához! Ez a lista segít abban, hogy az első 3 hónapban 
          minden hivatalos papírt időben elintézz.
        </p>

        {/* Progress Bar */}
        <div className="mt-6 rounded-2xl bg-surface-alt p-5 border border-line text-left">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[13px] font-bold text-ink">Folyamat</span>
            <span className="text-[16px] font-extrabold text-primary">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-line overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
              style={{ width: \`\${progress}%\` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-[12px] text-success font-bold mt-3 text-center animate-pulse">
              🎉 Minden hivatalos teendőt kipipáltál! Szép munka!
            </p>
          )}
        </div>
      </header>

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = completed[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                "w-full flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition hover:scale-[1.01] active:scale-[0.99]",
                isDone 
                  ? "border-success/30 bg-success/5" 
                  : "border-line bg-surface hover:border-primary/50"
              )}
            >
              <div className={cn(
                "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                isDone 
                  ? "border-success bg-success text-white" 
                  : "border-ink-faint text-transparent"
              )}>
                <Icon name="check" size={14} strokeWidth={4} />
              </div>
              
              <div>
                <h3 className={cn(
                  "text-[15px] font-extrabold transition-colors",
                  isDone ? "text-success/80 line-through" : "text-ink"
                )}>
                  {item.title}
                </h3>
                <p className={cn(
                  "mt-1 text-[13px] leading-relaxed",
                  isDone ? "text-ink-faint" : "text-ink-muted"
                )}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/allasok"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition underline"
        >
          ← Vissza az állásokhoz
        </Link>
      </div>
    </div>
  );
}
