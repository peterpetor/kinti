"use client";

/**
 * quiz-pro-cta.tsx — „Kvízből Lead": a kvíz-eredményen a ROSSZ válasz témájához
 * ajánl magyar szakértőt a Szaknévsorból (kurált téma→szakma pár, lásd
 * lib/quiz-pro-map.ts). KIEMELT (Szaknévsor PRO) cég elöl — ez a fizetett
 * elhelyezés kézzelfogható értéke. Hibátlan kvíznél, nem-párosított témánál
 * vagy 0 találatnál SEMMI nem jelenik meg (ürességet/erőltetést nem tolunk).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { trackAction } from "@/components/usage-tracker";
import type { QuizProTarget } from "@/lib/quiz-pro-map";

interface CtaBusiness {
  id: string;
  name: string;
  categoryLabel: string | null;
  featured: boolean;
}

export function QuizProCta({ target, country }: { target: QuizProTarget; country: string }) {
  const [businesses, setBusinesses] = useState<CtaBusiness[] | null>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/szaknevsor/ajanlo?country=${encodeURIComponent(country)}&cats=${target.businessCats.join(",")}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ businesses?: CtaBusiness[] }>) : null))
      .then((d) => {
        if (cancelled) return;
        const list = d?.businesses ?? [];
        setBusinesses(list);
        if (list.length > 0 && !viewTracked.current) {
          viewTracked.current = true;
          trackAction("quiz-pro-view");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [country, target]);

  if (!businesses || businesses.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <p className="text-[13.5px] font-extrabold leading-snug text-ink">🎓 {target.title}</p>
      <p className="mt-0.5 text-[11.5px] text-ink-muted">
        Magyar szakértő segít — anyanyelveden, a Szaknévsorból:
      </p>
      <div className="mt-2.5 space-y-2">
        {businesses.map((b) => (
          <Link
            key={b.id}
            href={`/szaknevsor/${b.id}`}
            onClick={() => trackAction("quiz-pro-click")}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-alt/50 px-3.5 py-2.5 transition active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-bold text-ink">{b.name}</span>
              {b.categoryLabel && (
                <span className="block truncate text-[11.5px] text-ink-muted">{b.categoryLabel}</span>
              )}
            </span>
            {b.featured && (
              <span className="shrink-0 rounded-pill bg-star/15 px-2 py-0.5 text-[10px] font-bold text-star">
                Kiemelt
              </span>
            )}
            <Icon name="chevR" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          </Link>
        ))}
      </div>
      <Link
        href={`/szaknevsor?cat=${encodeURIComponent(target.businessCats[0])}`}
        onClick={() => trackAction("quiz-pro-click")}
        className="mt-2.5 block text-center text-[12px] font-bold text-primary"
      >
        Több szakértő a Szaknévsorban →
      </Link>
    </section>
  );
}
