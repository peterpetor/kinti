"use client";

export const dynamic = "force-static";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { KintiLogo } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { kezdoLepesek } from "@/lib/kezdocsomag";


export default function OnboardingChecklistPage() {
  // ⚠️ ORSZÁG-TUDATOS. Ez a lap az ÁLTALÁNOS jelentkezés-visszaigazolóból
  // nyílik, tehát bármelyik ország állására jelentkező ide kerülhet —
  // korábban mindenki svájci teendőlistát kapott.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const lepesek = kezdoLepesek(country);
  const orszag = getCountry(country);
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

  // ⚠️ CSAK az adott ország lépéseit számoljuk. Ország-váltás után a másik
  // ország pipái nem duzzaszthatják fel a százalékot („7/6 kész”).
  const keszSzam = lepesek.filter((l) => completed[l.id]).length;
  const progress = lepesek.length > 0 ? Math.round((keszSzam / lepesek.length) * 100) : 0;

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      <div className="mb-4 flex justify-end">
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </div>
      <header className="mb-8 text-center">
        <KintiLogo size={42} className="mx-auto" />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-ink">
          Kezdőcsomag {orszag?.flag} {orszag?.name}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Gratulálunk az új munkához! Ez a lista segít abban, hogy az első 3 hónapban 
          minden hivatalos papírt időben elintézz.
        </p>

        {/* Progress Bar */}
        <div className="mt-6 rounded-2xl bg-surface-alt p-5 border border-line text-left">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[13px] font-bold text-ink">Folyamat</span>
            <span className="text-[16px] font-extrabold text-primary-ink">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-line overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-[12px] text-success font-bold mt-3 text-center animate-pulse">
              🎉 Minden hivatalos teendőt kipipáltál! Szép munka!
            </p>
          )}
        </div>
      </header>

      {lepesek.length === 0 && (
        <p className="rounded-card border border-line bg-surface-alt px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
          Ehhez az országhoz még nincs kezdőcsomagunk. Addig is nézd meg a{" "}
          <Link href="/tudasbazis" className="font-bold text-ink underline">Tudásbázis</Link>{" "}
          bejelentkezés- és biztosítás-útmutatóit.
        </p>
      )}

      <div className="space-y-3">
        {lepesek.map((item) => {
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
