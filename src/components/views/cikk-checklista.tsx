"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { confirmDialog } from "@/lib/confirm";
import { getChecklist } from "@/lib/guide-checklists";
import { haladas, readDone, resetGuide, toggleStep } from "@/lib/checklist-progress";

/**
 * CikkChecklista — a cikk lépései bepipálható teendőkként, haladás-jelzővel.
 *
 * Hidratálás-biztos: a pipák localStorage-ból jönnek, ezért mount ELŐTT a
 * kipipálatlan alapállapotot rendereljük, és csak utána frissítünk. Enélkül a
 * szerver-oldali HTML és a kliens eltérne (React #418/#419).
 */
export function CikkChecklista({ slug }: { slug: string }) {
  const lepesek = getChecklist(slug);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  const frissit = useCallback(() => setDone(new Set(readDone(slug))), [slug]);

  useEffect(() => {
    setMounted(true);
    frissit();
    window.addEventListener("kinti:checklist", frissit);
    return () => window.removeEventListener("kinti:checklist", frissit);
  }, [frissit]);

  if (lepesek.length === 0) return null;

  const h = mounted ? haladas(slug, lepesek) : { kesz: 0, ossz: lepesek.length, pct: 0 };
  const keszVan = mounted && h.kesz === h.ossz;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <header className="mb-2.5 flex items-baseline gap-2">
        <span className="text-[15px]">✅</span>
        <h2 className="min-w-0 flex-1 text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">Teendőlista</h2>
        <span className="shrink-0 text-[12.5px] font-extrabold tabular-nums text-ink" aria-live="polite">
          {h.kesz}/{h.ossz} kész
        </span>
      </header>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-alt">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", keszVan ? "bg-success" : "bg-primary")}
          style={{ width: `${h.pct}%` }}
        />
      </div>

      {keszVan && (
        <p className="mb-3 rounded-[12px] bg-success/10 px-3 py-2 text-[12px] font-bold text-ink">
          🎉 Végigmentél a listán. Ha valamit mégis újra kell intézned, vedd ki a pipát.
        </p>
      )}

      <ul className="space-y-1.5">
        {lepesek.map((l, i) => {
          const kesz = done.has(l.text);
          return (
            <li key={l.text}>
              <button
                type="button"
                aria-pressed={kesz}
                onClick={() => {
                  const uj = toggleStep(slug, l.text);
                  frissit();
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-[12px] border px-3 py-2.5 text-left transition active:scale-[0.99]",
                  kesz ? "border-success/30 bg-success/5" : "border-line bg-surface",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-2 transition",
                    kesz ? "border-success bg-success text-white" : "border-line bg-surface",
                  )}
                >
                  {kesz && <Icon name="check" size={12} strokeWidth={3.2} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[13px] font-semibold leading-snug", kesz ? "text-ink-muted line-through" : "text-ink")}>
                    <span className="mr-1 text-ink-faint tabular-nums">{i + 1}.</span>
                    {l.text}
                  </span>
                  {l.hint && !kesz && (
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-muted">{l.hint}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center gap-3">
        <p className="min-w-0 flex-1 text-[10.5px] leading-snug text-ink-faint">
          A pipák csak a te böngésződben látszanak — a Kinti szerverén nincs felhasználói azonosítód.
        </p>
        {mounted && h.kesz > 0 && (
          <button
            type="button"
            onClick={async () => {
              if (await confirmDialog({
                title: "Pipák törlése",
                message: "Ennek a cikknek a haladása nullázódik.",
                confirmLabel: "Törlés",
                destructive: true,
              })) {
                resetGuide(slug);
                frissit();
              }
            }}
            className="shrink-0 text-[10.5px] font-bold text-ink-faint underline underline-offset-2"
          >
            Pipák törlése
          </button>
        )}
      </div>
    </section>
  );
}
