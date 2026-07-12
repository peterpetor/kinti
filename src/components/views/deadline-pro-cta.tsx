"use client";

/**
 * deadline-pro-cta.tsx — „Pánik-konverzió" híd: a Határidő-asszisztens közelgő
 * határideje mellé magyar szakértőt ajánl a Szaknévsorból (KIEMELT cég elöl —
 * a Szaknévsor PRO kézzelfogható értéke: pont határidő előtt kap meleg hívást).
 *
 * Elv (quiz-pro-map minta): CSAK kurált, őszinte téma→szakma pároknál jelenik
 * meg (adó → könyvelő/adótanácsadó; engedély → ügyvéd) — a gyenge párok
 * (biztosítás, autó, iskola) szándékosan kimaradnak. A kategória-id-k az ÉLES
 * categories táblából ellenőrzöttek (quiz-pro-map, 2026-07-12). 0 találatnál
 * SEMMI nem jelenik meg (üresség-elv). Az ajánló a meglévő, edge-cachelt
 * /api/szaknevsor/ajanlo végpontról él — új edge-route nincs.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { trackAction } from "@/components/usage-tracker";
import { pickDeadlineTopic, type DeadlineForCta } from "@/lib/deadline-pro-map";

interface CtaBusiness {
  id: string;
  name: string;
  categoryLabel: string | null;
  featured: boolean;
}

export function DeadlineProCta({
  deadlines,
  country,
}: {
  deadlines: DeadlineForCta[];
  country: string;
}) {
  const picked = useMemo(() => pickDeadlineTopic(deadlines), [deadlines]);
  const [businesses, setBusinesses] = useState<CtaBusiness[]>([]);
  const viewTracked = useRef(false);
  const catsKey = picked?.topic.cats.join(",") ?? "";

  useEffect(() => {
    if (!catsKey) {
      setBusinesses([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/szaknevsor/ajanlo?country=${encodeURIComponent(country)}&cats=${catsKey}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ businesses?: CtaBusiness[] }>) : null))
      .then((d) => {
        if (cancelled) return;
        const list = d?.businesses ?? [];
        setBusinesses(list);
        if (list.length > 0 && !viewTracked.current) {
          viewTracked.current = true;
          trackAction("deadline-pro-view");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [country, catsKey]);

  if (!picked || businesses.length === 0) return null;

  const { topic, deadline } = picked;
  const urgency =
    deadline.daysLeft < 0
      ? `${Math.abs(deadline.daysLeft)} napja lejárt`
      : deadline.daysLeft === 0
        ? "ma jár le"
        : `${deadline.daysLeft} nap van hátra`;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <p className="text-[13.5px] font-extrabold leading-snug text-ink">
        🤝 Segítség kell hozzá? „{deadline.title}" — {urgency}.
      </p>
      <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{topic.lead}</p>
      <div className="mt-2.5 space-y-2">
        {businesses.map((b) => (
          <Link
            key={b.id}
            href={`/szaknevsor/${b.id}`}
            onClick={() => trackAction("deadline-pro-click")}
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
        href={`/szaknevsor?cat=${encodeURIComponent(topic.cats[0])}`}
        onClick={() => trackAction("deadline-pro-click")}
        className="mt-2.5 block text-center text-[12px] font-bold text-primary"
      >
        Több szakértő a Szaknévsorban →
      </Link>
    </section>
  );
}
