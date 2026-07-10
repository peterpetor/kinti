"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * „Legutóbb megnézted" — a visszatérő user leggyakoribb igénye: újra megtalálni
 * a korábban nézett vállalkozást. TISZTÁN kliens-oldali (localStorage, max 8,
 * privacy-elv: a szerver semmit nem lát belőle).
 *
 *   • RecentBusinessRecorder — a cégprofil-oldalon ül, mount-on rögzít.
 *   • RecentBusinessesStrip — a Szaknévsor lista tetején, vízszintes chip-sor;
 *     csak alap-nézetben jelenik meg (keresés/szűrés közben nem zavar).
 */

const KEY = "kinti.recentBusinesses";
const MAX = 8;

interface RecentBiz {
  id: string;
  name: string;
  categoryLabel?: string | null;
  ts: number;
}

function readRecent(): RecentBiz[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentBiz[];
    return Array.isArray(arr) ? arr.filter((r) => r && typeof r.id === "string" && typeof r.name === "string") : [];
  } catch {
    return [];
  }
}

export function RecentBusinessRecorder({
  id,
  name,
  categoryLabel,
}: {
  id: string;
  name: string;
  categoryLabel?: string | null;
}) {
  useEffect(() => {
    try {
      const next: RecentBiz[] = [
        { id, name, categoryLabel: categoryLabel ?? null, ts: Date.now() },
        ...readRecent().filter((r) => r.id !== id),
      ].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode — nem baj */
    }
  }, [id, name, categoryLabel]);
  return null;
}

export function RecentBusinessesStrip() {
  // Hidratálás-biztos: mount után olvasunk.
  const [items, setItems] = useState<RecentBiz[]>([]);
  useEffect(() => {
    setItems(readRecent());
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
        Legutóbb megnézted
      </p>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
        {items.map((r) => (
          <Link
            key={r.id}
            href={`/szaknevsor/${r.id}`}
            className="flex shrink-0 items-center gap-2 rounded-pill border border-line bg-surface px-3 py-2 transition active:scale-[0.97]"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon name="clock" size={12} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block max-w-[140px] truncate text-[12.5px] font-bold leading-tight text-ink">
                {r.name}
              </span>
              {r.categoryLabel && (
                <span className="block max-w-[140px] truncate text-[10.5px] leading-tight text-ink-muted">
                  {r.categoryLabel}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
