"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { KintiEvent } from "@/lib/types";
import { getTagEmoji } from "@/lib/tag-emoji";

const HU_MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];

const HU_WEEKDAYS_SHORT = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];

/**
 * EventCalendar — vizuális hónap-naptár: 7×6 grid, minden napon az események
 * sűrűségét mutatjuk (üres = halvány, 1+ event = színes). Kattintásra
 * megnyílik a nap eseményei (alul). Hónap-navigáció ← / →.
 */
export function EventCalendar({ events }: { events: KintiEvent[] }) {
  // Csoportosítás dátum szerint (YYYY-MM-DD → events[])
  const byDate = useMemo(() => {
    const m = new Map<string, KintiEvent[]>();
    for (const e of events) {
      if (!e.eventDate) continue;
      const key = e.eventDate.slice(0, 10);
      const arr = m.get(key) ?? [];
      arr.push(e);
      m.set(key, arr);
    }
    return m;
  }, [events]);

  // Kezdő hónap: a legközelebbi jövőbeli esemény hónapja (vagy az aktuális)
  const initial = useMemo(() => {
    const now = new Date();
    const future = events
      .filter((e) => e.eventDate)
      .map((e) => new Date(e.eventDate!))
      .filter((d) => d >= now)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const ref = future ?? now;
    return { year: ref.getFullYear(), month: ref.getMonth() };
  }, [events]);

  const [{ year, month }, setYM] = useState(initial);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const todayKey = formatDate(new Date());

  const cells = useMemo(() => buildMonthGrid(year, month, byDate), [year, month, byDate]);

  // Max event-szám egy napon — a heat-intenzitáshoz
  const maxOnDay = Math.max(1, ...cells.filter((c) => c.inMonth).map((c) => c.events.length));

  function prevMonth() {
    setYM((p) => (p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 }));
    setSelectedDay(null);
  }
  function nextMonth() {
    setYM((p) => (p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 }));
    setSelectedDay(null);
  }

  const selectedEvents = selectedDay ? byDate.get(selectedDay) ?? [] : [];

  return (
    <div className="space-y-3">
      {/* Hónap-navigáció */}
      <div className="flex items-center justify-between rounded-card border border-line bg-surface px-2 py-2 shadow-card">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Előző hónap"
          className="grid h-8 w-8 place-items-center rounded-pill text-ink-muted active:scale-95 hover:bg-surface-alt"
        >
          <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
        </button>
        <h3 className="text-[14px] font-extrabold tracking-tight text-ink">
          {HU_MONTHS[month]} {year}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Következő hónap"
          className="grid h-8 w-8 place-items-center rounded-pill text-ink-muted active:scale-95 hover:bg-surface-alt"
        >
          <Icon name="arrowRight" size={14} strokeWidth={2.4} />
        </button>
      </div>

      {/* Hetek fejléce */}
      <div className="grid grid-cols-7 gap-1 px-1 text-center text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">
        {HU_WEEKDAYS_SHORT.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Naptár grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, idx) => {
          const isToday = c.dateKey === todayKey;
          const isSelected = c.dateKey === selectedDay;
          const count = c.events.length;
          const intensity = count === 0 ? 0 : count / maxOnDay;
          const heatBg = c.inMonth && count > 0
            ? `rgb(46 106 78 / ${0.18 + intensity * 0.55})`
            : undefined;
          return (
            <button
              key={idx}
              type="button"
              disabled={!c.inMonth || count === 0}
              onClick={() => setSelectedDay(c.dateKey)}
              className={cn(
                "aspect-square rounded-[10px] flex flex-col items-center justify-center transition relative",
                c.inMonth ? "text-ink" : "text-ink-faint",
                count > 0 && c.inMonth && "active:scale-95 cursor-pointer",
                count === 0 && c.inMonth && "bg-surface-alt/40",
                !c.inMonth && "bg-surface-alt/20",
                isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
                isToday && !isSelected && "ring-1 ring-accent",
              )}
              style={count > 0 && c.inMonth ? { backgroundColor: heatBg } : undefined}
            >
              <span className={cn(
                "text-[12px] font-bold",
                isToday && "text-accent",
                count > 0 && c.inMonth && "text-ink",
              )}>
                {c.day}
              </span>
              {count > 0 && c.inMonth && (
                <span className="text-[8.5px] font-bold leading-none mt-0.5 text-primary">
                  {count > 1 ? `${count} esem.` : "1 esem."}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Kiválasztott nap eseményei */}
      {selectedDay && (
        <div className="space-y-2">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            {fmtSelectedDay(selectedDay)} ({selectedEvents.length} esemény)
          </p>
          {selectedEvents.length === 0 ? (
            <div className="rounded-card border border-line bg-surface-alt px-4 py-4 text-center text-[12.5px] text-ink-muted">
              Nincs esemény erre a napra.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/kozosseg/esemeny/${e.id}`}
                  className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-3 shadow-card transition active:scale-[0.99]"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-lg"
                    style={{
                      backgroundColor: e.color ? `${e.color}1f` : "rgb(var(--surface-alt))",
                      color: e.color ?? undefined,
                    }}
                  >
                    {getTagEmoji(e.tag)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-extrabold text-ink">{e.title}</p>
                    <p className="text-[11.5px] text-ink-muted">
                      {e.startTime ? `${e.startTime} · ` : ""}
                      {e.venue}
                    </p>
                  </div>
                  <Icon name="chevR" size={14} className="text-ink-faint shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DayCell {
  day: number;
  dateKey: string;
  inMonth: boolean;
  events: KintiEvent[];
}

function buildMonthGrid(year: number, month: number, byDate: Map<string, KintiEvent[]>): DayCell[] {
  const first = new Date(year, month, 1);
  // hétfő-kezdetű hét: a JS getDay() 0=vasárnap → konvertálunk (0 = hétfő)
  const dow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = dow;
  const totalCells = Math.ceil((prevDays + daysInMonth) / 7) * 7;
  const cells: DayCell[] = [];

  // Előző hónap utolsó napjai
  const prevMonthEnd = new Date(year, month, 0).getDate();
  for (let i = prevDays - 1; i >= 0; i--) {
    const d = prevMonthEnd - i;
    const date = new Date(year, month - 1, d);
    const key = formatDate(date);
    cells.push({ day: d, dateKey: key, inMonth: false, events: byDate.get(key) ?? [] });
  }
  // Aktuális hónap napjai
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = formatDate(date);
    cells.push({ day: d, dateKey: key, inMonth: true, events: byDate.get(key) ?? [] });
  }
  // Következő hónap eleje (a rács kitöltése)
  let nd = 1;
  while (cells.length < totalCells) {
    const date = new Date(year, month + 1, nd);
    const key = formatDate(date);
    cells.push({ day: nd, dateKey: key, inMonth: false, events: byDate.get(key) ?? [] });
    nd++;
  }
  return cells;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtSelectedDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}
