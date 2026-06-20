"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { KintiEvent } from "@/lib/types";
import { getTagEmoji } from "@/lib/tag-emoji";
import { scheduleEventReminder } from "@/lib/event-reminder-client";
import { OwnPostBadge } from "@/components/own-post-badge";
import { EventCalendar } from "@/components/event-calendar";
import { AddToCalendar } from "@/components/add-to-calendar";
import { ShareSheet } from "@/components/share-sheet";
import type { CalendarEvent } from "@/lib/calendar";

export function CommunityView({
  events,
}: {
  events: KintiEvent[];
}) {
  return (
    <div className="space-y-2.5 px-5">
      <EventsList events={events} />
    </div>
  );
}

// --- Események --------------------------------------------------------------

interface RsvpState {
  going: number;
  voted: boolean;
  busy: boolean;
}

// Hungarian month names for the filter pills
const HU_MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];

const MAX_EVENTS = 10;

function eventToCal(e: KintiEvent): CalendarEvent {
  return {
    title: e.title,
    date: e.eventDate ?? "",
    startTime: e.startTime,
    venue: e.venue,
    description: e.description ?? null,
  };
}

/**
 * Best-effort push-emlékeztető rögzítése RSVP után — CSAK ha a böngésző már fel
 * van iratkozva (a Közösség oldalon a „Szólunk, ha új esemény van" kártyával).
 * Sose dob hibát kifelé; ha nincs feliratkozás, csendben kihagyja.
 */

function EventsList({ events }: { events: KintiEvent[] }) {
  // Nézet: lista vagy naptár
  const [view, setView] = useState<"list" | "calendar">("list");

  // Hónapos szűrő: "all" vagy "2025-06" formátum
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Lokális RSVP-állapot eseményenként (felülírja a szerver going-ját).
  const [rsvp, setRsvp] = useState<Record<string, RsvpState>>({});
  // Melyik eseményhez nyitottuk meg a „naptárba" választót.
  const [calFor, setCalFor] = useState<KintiEvent | null>(null);
  // Melyik eseményt osztjuk meg most.
  const [shareFor, setShareFor] = useState<KintiEvent | null>(null);

  const goingOf = (e: KintiEvent) => rsvp[e.id]?.going ?? e.going;
  const votedOf = (e: KintiEvent) => rsvp[e.id]?.voted ?? false;
  const busyOf = (e: KintiEvent) => rsvp[e.id]?.busy ?? false;

  // Elérhető hónapok dinamikusan az esemény-adatokból
  const availableMonths = useMemo(() => {
    const seen = new Set<string>();
    const months: { key: string; label: string }[] = [];
    for (const e of events) {
      if (!e.eventDate) continue;
      const key = e.eventDate.slice(0, 7); // "2025-06"
      if (seen.has(key)) continue;
      seen.add(key);
      const [year, mon] = key.split("-");
      const monIdx = parseInt(mon, 10) - 1;
      const label = `${HU_MONTHS[monIdx] ?? mon} ${year}`;
      months.push({ key, label });
    }
    return months;
  }, [events]);

  // Szűrt + max 10 esemény
  const filtered = useMemo(() => {
    const base =
      monthFilter === "all"
        ? events
        : events.filter((e) => e.eventDate?.startsWith(monthFilter));
    return base.slice(0, MAX_EVENTS);
  }, [events, monthFilter]);

  async function handleRsvp(e: KintiEvent) {
    if (votedOf(e) || busyOf(e)) return;
    setRsvp((p) => ({ ...p, [e.id]: { going: goingOf(e), voted: false, busy: true } }));
    try {
      const res = await fetch(`/api/events/${e.id}/rsvp`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { total?: number };
      if (res.ok) {
        setRsvp((p) => ({
          ...p,
          [e.id]: { going: data.total ?? goingOf(e) + 1, voted: true, busy: false },
        }));
        // Ha a user fel van iratkozva push-ra, emlékeztetőt is kérünk (best-effort).
        void scheduleEventReminder(e.id);
      } else {
        setRsvp((p) => ({ ...p, [e.id]: { going: goingOf(e), voted: false, busy: false } }));
      }
    } catch {
      setRsvp((p) => ({ ...p, [e.id]: { going: goingOf(e), voted: false, busy: false } }));
    }
  }

  if (events.length === 0) return <Empty label="Nincs közelgő esemény." />;

  // Naptár-nézet — különálló blokk a hónap-szűrő és lista helyett
  if (view === "calendar") {
    return (
      <>
        <ViewToggle view={view} setView={setView} />
        <EventCalendar events={events} />
      </>
    );
  }

  // Hero = a LEGTÖBB „Megyek"-et kapott esemény a szűrt listából.
  // Lehet undefined, ha a szűrt lista üres (pl. hónap-szűrő találat nélkül) —
  // a `rest` és a render is guardolt, hogy ne dobjon `hero.id`-n.
  const hero = [...filtered].sort((a, b) => b.going - a.going)[0];
  const rest = hero ? filtered.filter((e) => e.id !== hero.id) : [];

  // Hány esemény van összesen a szűrt hónapban (limit nélkül)
  const totalInFilter =
    monthFilter === "all"
      ? events.length
      : events.filter((e) => e.eventDate?.startsWith(monthFilter)).length;

  return (
    <>
      <ViewToggle view={view} setView={setView} />

      {/* Hónap-szűrő pillek */}
      {availableMonths.length > 1 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
          <button
            type="button"
            onClick={() => setMonthFilter("all")}
            aria-pressed={monthFilter === "all"}
            className={cn(
              "inline-flex flex-none items-center rounded-pill px-3 py-1.5 text-[12.5px] font-bold tracking-[-0.01em] transition",
              monthFilter === "all"
                ? "bg-primary text-white shadow-card"
                : "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-alpha))]",
            )}
          >
            Mind
          </button>
          {availableMonths.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMonthFilter(m.key)}
              aria-pressed={monthFilter === m.key}
              className={cn(
                "inline-flex flex-none items-center rounded-pill px-3 py-1.5 text-[12.5px] font-bold tracking-[-0.01em] transition",
                monthFilter === m.key
                  ? "bg-primary text-white shadow-card"
                  : "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-alpha))]",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Darabszám jelzés */}
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {filtered.length} esemény
        {totalInFilter > MAX_EVENTS && (
          <span className="ml-1 text-accent">
            (összesen {totalInFilter})
          </span>
        )}
      </p>

      {!hero ? (
        <Empty label="Ebben a hónapban nincs esemény." />
      ) : (
        <>
          <article className="relative overflow-hidden rounded-[22px] p-[18px] text-white shadow-pop bg-gradient-to-br from-primary to-[#2e6a4e]">
            <span className="mb-3.5 inline-block rounded-pill bg-white/[0.18] px-2.5 py-1 text-[11.5px] font-bold tracking-wide">
              ★ Kiemelt esemény
            </span>
            <div className="flex items-start gap-3.5">
              <DateChip event={hero} solid />
              <Link
                href={`/kozosseg/esemeny/${hero.id}`}
                className="min-w-0 flex-1 transition active:opacity-80"
              >
                <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-balance">
                  {hero.title}
                </h2>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] opacity-90">
                  <Icon name="pin" size={12} strokeWidth={2.2} /> {hero.venue}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] opacity-90">
                  <Icon name="clock" size={12} strokeWidth={2.2} /> {hero.startTime}
                </p>
              </Link>
            </div>
            <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-white/[0.12] px-3.5 py-2.5">
              <p className="flex-1 text-[12.5px] font-semibold">
                {goingOf(hero) > 0 ? (
                  <>
                    <strong>{goingOf(hero)} kinti</strong> jelezte, hogy megy
                  </>
                ) : (
                  "Legyél te az első, aki jelzi!"
                )}
              </p>
              {hero.eventDate && (
                <button
                  type="button"
                  onClick={() => setCalFor(hero)}
                  aria-label="Add a naptáradhoz"
                  className="inline-flex items-center rounded-pill bg-white/20 px-2.5 py-1.5 text-white active:scale-95"
                >
                  <Icon name="calendar" size={13} strokeWidth={2.4} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShareFor(hero)}
                aria-label="Megosztás"
                className="inline-flex items-center rounded-pill bg-white/20 px-2.5 py-1.5 text-white active:scale-95"
              >
                <Icon name="share" size={13} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => handleRsvp(hero)}
                disabled={votedOf(hero) || busyOf(hero)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-pill px-3.5 py-1.5 text-[12.5px] font-bold transition",
                  votedOf(hero)
                    ? "bg-white/25 text-white"
                    : "bg-white text-primary active:scale-95",
                  busyOf(hero) && "opacity-60",
                )}
              >
                {votedOf(hero) && <Icon name="check" size={12} strokeWidth={2.6} />}
                {votedOf(hero) ? "Ott leszek" : busyOf(hero) ? "…" : "Megyek"}
              </button>
            </div>
          </article>

          {rest.length > 0 && (
            <p className="px-1 pt-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              Következő hetek
            </p>
          )}

          {rest.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
            >
              <DateChip event={e} />
              <Link
                href={`/kozosseg/esemeny/${e.id}`}
                className="min-w-0 flex-1 transition active:opacity-70"
                aria-label={`${e.title} — részletek`}
              >
                <div className="mb-0.5 flex items-center gap-1.5">
                  <TagBadge tag={e.tag} color={e.color} />
                  <OwnPostBadge type="event" id={e.id} />
                  <span className="text-[11.5px] font-semibold text-ink-muted">
                    {e.dateWeekday} · {e.startTime}
                  </span>
                </div>
                <div className="line-clamp-2 text-[14.5px] font-bold leading-snug tracking-[-0.01em] text-ink">
                  {e.title}
                </div>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {e.venue}
                  {goingOf(e) > 0 && <> · {goingOf(e)} fő megy</>}
                </div>
              </Link>
              {e.eventDate && (
                <button
                  type="button"
                  onClick={() => setCalFor(e)}
                  aria-label="Add a naptáradhoz"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-pill border border-line bg-surface text-ink-muted active:scale-95"
                >
                  <Icon name="calendar" size={13} strokeWidth={2.2} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShareFor(e)}
                aria-label="Megosztás"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-pill border border-line bg-surface text-ink-muted active:scale-95"
              >
                <Icon name="share" size={12} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => handleRsvp(e)}
                disabled={votedOf(e) || busyOf(e)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-pill px-3 py-1.5 text-[11.5px] font-bold transition",
                  votedOf(e)
                    ? "bg-success/15 text-success"
                    : "bg-primary text-white active:scale-95",
                  busyOf(e) && "opacity-60",
                )}
              >
                {votedOf(e) && <Icon name="check" size={11} strokeWidth={2.6} />}
                {votedOf(e) ? "Ott leszek" : busyOf(e) ? "…" : "Megyek"}
              </button>
            </div>
          ))}

          {/* Ha a hónapban több mint 10 van, de nem mutatjuk → info */}
          {totalInFilter > MAX_EVENTS && (
            <div className="rounded-2xl border border-dashed border-line bg-surface-alt px-5 py-4 text-center">
              <p className="text-[12.5px] font-semibold text-ink-muted">
                + {totalInFilter - MAX_EVENTS} további esemény ebben a hónapban —
                válassz hónapot a szűrőkkel!
              </p>
            </div>
          )}
        </>
      )}

      <AddToCalendar
        open={!!calFor}
        onClose={() => setCalFor(null)}
        event={calFor ? eventToCal(calFor) : null}
      />

      <ShareSheet
        open={!!shareFor}
        onClose={() => setShareFor(null)}
        url={
          shareFor
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/kozosseg/esemeny/${shareFor.id}`
            : ""
        }
        title={shareFor?.title ?? ""}
        text={shareFor ? `Nézd meg ezt az eseményt a kintin: ${shareFor.title}` : ""}
      />

    </>
  );
}


function ViewToggle({
  view,
  setView,
}: {
  view: "list" | "calendar";
  setView: (v: "list" | "calendar") => void;
}) {
  return (
    <div className="flex gap-1 rounded-pill border border-line bg-surface-alt p-1 w-fit">
      <button
        type="button"
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        className={cn(
          "rounded-pill px-3 py-1 text-[11.5px] font-bold transition",
          view === "list" ? "bg-surface text-ink shadow-card" : "text-ink-muted",
        )}
      >
        📋 Lista
      </button>
      <button
        type="button"
        onClick={() => setView("calendar")}
        aria-pressed={view === "calendar"}
        className={cn(
          "rounded-pill px-3 py-1 text-[11.5px] font-bold transition",
          view === "calendar" ? "bg-surface text-ink shadow-card" : "text-ink-muted",
        )}
      >
        📅 Naptár
      </button>
    </div>
  );
}

function DateChip({ event, solid = false }: { event: KintiEvent; solid?: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-xl text-center",
        solid ? "w-[58px] bg-white px-0 py-2" : "w-[50px] border border-line bg-surface-alt py-1.5",
      )}
    >
      <div className={cn("text-[10px] font-extrabold uppercase tracking-wide", solid ? "text-accent" : "text-primary")}>
        {event.dateMonth}
      </div>
      <div className="text-xl font-extrabold leading-none text-ink">{event.dateDay}</div>
      {solid && <div className="mt-0.5 text-[8.5px] font-bold uppercase text-ink-muted">{event.dateWeekday?.slice(0, 3)}</div>}
    </div>
  );
}

function TagBadge({ tag, color }: { tag: string | null; color: string | null }) {
  const emoji = getTagEmoji(tag);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
      style={{ color: color ?? undefined, backgroundColor: color ? `${color}1f` : undefined }}
    >
      <span className="text-[12px] leading-none">{emoji}</span>
      {tag}
    </span>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-10 text-center shadow-card">
      <Icon name="calendar" size={28} className="text-ink-faint" />
      <p className="text-[15px] font-extrabold text-ink">{label}</p>
      <p className="max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
        Iratkozz fel fent a <strong className="text-ink">„Szólunk, ha új esemény van"</strong>{" "}
        kártyán — és elsőként értesülsz a kantonod magyar programjairól.
      </p>
    </div>
  );
}
