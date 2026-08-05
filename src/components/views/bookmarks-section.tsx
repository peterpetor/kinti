"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import {
  BOOKMARK_LABEL,
  groupBookmarks,
  readBookmarks,
  removeBookmark,
  type Bookmark,
} from "@/lib/bookmarks";

/**
 * Saját Gyűjtemény a /sajatjaim oldalon — az elmentett cikkek, szakemberek,
 * állások és szavak.
 *
 * ⚠️ A befogadó oldal `force-static`, ezért itt SEMMILYEN szerverhívás nem
 * lehet: minden a localStorage-ból jön (ld. [[deploy-edge-route-ceiling]] —
 * egy fetch itt edge-route-ot fogyasztana).
 *
 * ⚠️ HIDRATÁLÁS: az első render mindig ÜRES listát rajzol (az SSR sem lát
 * localStorage-ot), a valódi tartalom mount után jön. Ezért a „még nincs
 * mentésed" üzenetet CSAK mount után mutatjuk — különben egy pillanatra
 * felvillanna annak is, akinek van mentése.
 */
export function BookmarksSection() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frissit = () => setItems(readBookmarks());
    frissit();
    setMounted(true);
    // Másik fülön / másik komponensben történt változás is látszódjon.
    window.addEventListener("kinti:bookmarks", frissit);
    window.addEventListener("storage", frissit);
    return () => {
      window.removeEventListener("kinti:bookmarks", frissit);
      window.removeEventListener("storage", frissit);
    };
  }, []);

  const csoportok = groupBookmarks(items);

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 px-1 text-[13.5px] font-extrabold tracking-tight text-ink">
        <span className="text-base">🔖</span>
        Saját gyűjtemény
        {mounted && items.length > 0 && (
          <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary-ink">
            {items.length}
          </span>
        )}
      </h2>

      {mounted && items.length === 0 && (
        <p className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
          Még nincs mentésed. A cikkek alján, a szakemberek és állások adatlapján
          a <strong className="text-ink">könyvjelző</strong> gombbal menthetsz ide bármit
          — egy kattintás, és itt megtalálod.
        </p>
      )}

      {csoportok.map(({ kind, items: sorok }) => (
        <div key={kind} className="space-y-1.5">
          <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            {BOOKMARK_LABEL[kind].emoji} {BOOKMARK_LABEL[kind].title}
            <span className="ml-1 font-semibold text-ink-faint">({sorok.length})</span>
          </p>
          <ul className="space-y-1.5">
            {sorok.map((b) => (
              <li
                key={`${b.kind}:${b.id}`}
                className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2.5 shadow-card"
              >
                <Link href={b.href} className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold tracking-[-0.01em] text-ink">
                    {b.title}
                  </span>
                  {b.subtitle && (
                    <span className="block truncate text-[11.5px] text-ink-muted">{b.subtitle}</span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => removeBookmark(b.kind, b.id)}
                  aria-label={`${b.title} eltávolítása a gyűjteményből`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-alt text-ink-faint transition active:scale-95"
                >
                  <Icon name="trash" size={14} strokeWidth={2.4} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
