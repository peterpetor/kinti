"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

/**
 * HomeWidgets — testreszabható kezdőlap-blokk. A felhasználó a „Napi infó"
 * widgeteket átrendezheti (fel/le) vagy elrejtheti; a beállítás a localStorage-ba
 * mentődik (`kinti.homeWidgets`). Teljesen kliensoldali, privacy-barát.
 *
 * A widgetek szerver-renderelt React-node-ként érkeznek (slot), így a szerveroldali
 * adat (pl. árfolyam) megmarad — csak a sorrend/láthatóság kliensoldali.
 */
interface WidgetDef {
  id: string;
  label: string;
  node: ReactNode;
}
interface Prefs {
  order: string[];
  hidden: string[];
}
const KEY = "kinti.homeWidgets";

export function HomeWidgets({ widgets }: { widgets: WidgetDef[] }) {
  const [mounted, setMounted] = useState(false);
  const [edit, setEdit] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ order: [], hidden: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Prefs>;
        setPrefs({
          order: Array.isArray(p.order) ? p.order : [],
          hidden: Array.isArray(p.hidden) ? p.hidden : [],
        });
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  function save(next: Prefs) {
    setPrefs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
  }

  // A prefs.order szerint rendezve; az ismeretlen (új) id-k a végére kerülnek.
  const ordered = [...widgets].sort((a, b) => {
    const ia = prefs.order.indexOf(a.id);
    const ib = prefs.order.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
  // Hidratálás előtt az alap-sorrend (különben SSR-eltérés).
  const list = mounted ? ordered : widgets;

  function move(id: string, dir: -1 | 1) {
    haptic("selection");
    const ids = ordered.map((w) => w.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    save({ ...prefs, order: ids });
  }
  function toggleHide(id: string) {
    haptic("selection");
    const hidden = prefs.hidden.includes(id)
      ? prefs.hidden.filter((x) => x !== id)
      : [...prefs.hidden, id];
    save({ ...prefs, hidden });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">Kezdőlap</span>
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            setEdit((e) => !e);
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11.5px] font-bold transition active:scale-95",
            edit ? "bg-primary text-white shadow-card" : "bg-surface-alt text-ink-muted",
          )}
        >
          <Icon name={edit ? "check" : "sliders"} size={12} strokeWidth={2.4} />
          {edit ? "Kész" : "Testreszabás"}
        </button>
      </div>

      {list.map((w) => {
        const hidden = prefs.hidden.includes(w.id);
        if (hidden && !edit) return null;
        return (
          <div
            key={w.id}
            className={cn(
              edit && "rounded-2xl border border-dashed border-primary/30 p-2",
              hidden && edit && "opacity-50",
            )}
          >
            {edit && (
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className="flex-1 truncate text-[12px] font-bold text-ink">{w.label}</span>
                <button
                  type="button"
                  onClick={() => move(w.id, -1)}
                  aria-label={`${w.label} feljebb`}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-surface-alt text-ink-muted active:scale-90"
                >
                  <Icon name="arrowUp" size={13} strokeWidth={2.6} />
                </button>
                <button
                  type="button"
                  onClick={() => move(w.id, 1)}
                  aria-label={`${w.label} lejjebb`}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-surface-alt text-ink-muted active:scale-90"
                >
                  <Icon name="arrowUp" size={13} strokeWidth={2.6} className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleHide(w.id)}
                  aria-label={hidden ? `${w.label} megmutatása` : `${w.label} elrejtése`}
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-lg active:scale-90",
                    hidden ? "bg-primary/15 text-primary" : "bg-surface-alt text-ink-muted",
                  )}
                >
                  <Icon name="eye" size={13} strokeWidth={2.2} className={cn(!hidden && "opacity-100", hidden && "opacity-60")} />
                </button>
              </div>
            )}
            {w.node}
          </div>
        );
      })}
    </div>
  );
}
