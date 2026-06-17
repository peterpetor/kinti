"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { AddToCalendar } from "@/components/add-to-calendar";
import { ShareSheet } from "@/components/share-sheet";
import type { CalendarEvent } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { scheduleEventReminder } from "@/lib/event-reminder-client";

/**
 * EventDetailActions — az esemény mély-link oldal aktív vezérlői:
 *   • "Ott leszek" RSVP (account NÉLKÜLI, IP-hash dedup szerveroldal)
 *   • "Mentsd el a naptárba" (Google + .ics)
 *   • "Megosztás" (Web Share API / fallback másolás)
 */
export function EventDetailActions({
  eventId,
  initialGoing,
  calendarEvent,
  shareTitle,
  shareUrl,
}: {
  eventId: string;
  initialGoing: number;
  calendarEvent: CalendarEvent;
  shareTitle: string;
  shareUrl: string;
}) {
  const [going, setGoing] = useState(initialGoing);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  async function onRsvp() {
    if (voted || busy) return;
    setBusy(true);
    // Optimista UI: azonnal váltunk (szám + „voted" + haptika), a szerver
    // válaszával reconcile-olunk; hiba esetén visszaállítjuk.
    const prev = going;
    setGoing((g) => g + 1);
    setVoted(true);
    haptic("success");
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { total?: number };
      if (res.ok) {
        if (typeof data.total === "number") setGoing(data.total);
        // Push-emlékeztető (24h + 1h) — best-effort, ha van feliratkozás.
        void scheduleEventReminder(eventId);
      } else {
        setGoing(prev);
        setVoted(false);
      }
    } catch {
      setGoing(prev);
      setVoted(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Megyek nagy CTA + szám */}
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
            Ki megy?
          </span>
          <span className="text-[24px] font-extrabold tabular-nums text-ink">
            {going.toLocaleString("hu-HU")}
          </span>
        </div>
        <button
          type="button"
          onClick={onRsvp}
          disabled={voted || busy}
          className={cn(
            "mt-3 flex h-12 w-full items-center justify-center gap-1.5 rounded-pill text-[14px] font-extrabold transition active:scale-[0.99]",
            voted
              ? "bg-success/15 text-success cursor-default"
              : "bg-primary text-white shadow-card-hover",
            busy && "opacity-60 cursor-wait",
          )}
        >
          {voted ? (
            <>
              <Icon name="check" size={16} strokeWidth={2.6} /> Ott leszel ✓
            </>
          ) : busy ? (
            "Mentés…"
          ) : (
            <>
              <Icon name="users" size={16} strokeWidth={2.4} /> Ott leszek!
            </>
          )}
        </button>
        <p className="mt-2 px-1 text-center text-[11.5px] leading-snug text-ink-faint">
          Account nélkül — egyetlen szavazat / készülék.
        </p>
      </div>

      {/* Másodlagos CTA-k */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCalOpen(true)}
          className="flex h-12 items-center justify-center gap-1.5 rounded-pill border border-line bg-surface text-[13px] font-bold text-ink shadow-card active:scale-[0.98] transition"
        >
          <Icon name="calendar" size={14} strokeWidth={2.4} /> Naptárba
        </button>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex h-12 items-center justify-center gap-1.5 rounded-pill border border-line bg-surface text-[13px] font-bold text-ink shadow-card active:scale-[0.98] transition"
        >
          <Icon name="share" size={14} strokeWidth={2.4} /> Megosztás
        </button>
      </div>

      <AddToCalendar open={calOpen} onClose={() => setCalOpen(false)} event={calendarEvent} />
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} title={shareTitle} url={shareUrl} />
    </>
  );
}
