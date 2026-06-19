"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";

/** A kereséshez átadott könnyű guide-index (a teljes body is benne a hay-ben). */
export interface GuideSearchItem {
  slug: string;
  title: string;
  summary: string;
  icon: IconName;
  /** Előre kisbetűsített kereshető szöveg (cím + összefoglaló + szakaszok). */
  hay: string;
}

/**
 * GuideSearch — INGYENES, azonnali kulcsszavas kereső a Tudásbázis guide-jai
 * felett. Az AI-asszisztens helyett: zárt, hiteles tartalomnál a böngészés +
 * kulcsszavas kereső gyorsabb, ingyenes és NEM hallucinál — a felhasználót a
 * hiteles guide-ra viszi, nem AI-parafrázist ad.
 */
export function GuideSearch({ guides }: { guides: GuideSearchItem[] }) {
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
    if (tokens.length === 0) return [];
    return guides
      .map((g) => ({
        g,
        score: tokens.reduce((n, t) => n + (g.hay.includes(t) ? 1 : 0), 0),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.g);
  }, [q, guides]);

  const hasQuery = q.trim().length >= 2;

  return (
    <div className="rounded-[22px] border border-primary/15 bg-primary-soft/30 p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white shadow-md">
          <Icon name="search" size={20} strokeWidth={2.3} />
        </div>
        <div>
          <h3 className="text-[15.5px] font-extrabold tracking-[-0.01em] text-ink">
            Keresés a tudásbázisban
          </h3>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            Írd be, mi érdekel (pl. „vám bor", „jogosítvány", „adó") — és rögtön a
            megfelelő, hiteles leíráshoz viszünk.
          </p>
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="pl. mennyi vám 5 liter borra?"
          className="h-[46px] w-full rounded-2xl border border-line bg-surface pl-4 pr-12 text-[14px] font-medium text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        <span className="absolute right-3 grid h-[30px] w-[30px] place-items-center text-ink-faint">
          <Icon name="search" size={18} strokeWidth={2.4} />
        </span>
      </div>

      {hasQuery && (
        <div className="mt-3 space-y-1.5">
          {matches.length === 0 ? (
            <p className="px-1 text-[12.5px] text-ink-muted">
              Nincs közvetlen találat — görgess le, és böngészd a témákat.
            </p>
          ) : (
            matches.map((g) => (
              <Link
                key={g.slug}
                href={`/tudasbazis/${g.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card transition active:scale-[0.99] hover:border-primary/30"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-primary-soft/60 text-primary">
                  <Icon name={g.icon} size={18} strokeWidth={2.3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-extrabold text-ink">{g.title}</span>
                  <span className="block truncate text-[11.5px] text-ink-muted">{g.summary}</span>
                </span>
                <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
