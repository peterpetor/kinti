"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { BulletinKind, BulletinPost, KintiEvent } from "@/lib/types";
import type { Ride } from "@/lib/repo";
import { TelekocsiView } from "./telekocsi-view";
import { mediaUrl } from "@/lib/media";
import { CANTONS } from "@/lib/cantons";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { ShareSheet } from "@/components/share-sheet";
import { AddToCalendar } from "@/components/add-to-calendar";
import { ReportButton } from "@/components/report-button";
import type { CalendarEvent } from "@/lib/calendar";

// --- helperek a hirdetésekhez -----------------------------------------------

const SAVED_KEY = "kinti.savedBulletins";

export function loadSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function saveSavedIds(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));
  } catch {
    /* quota-overflow / privát mód → ignoráljuk */
  }
}

function formatPrice(n: number | null): string | null {
  if (n == null) return null;
  return `${n.toLocaleString("hu-HU").replace(/,/g, " ")} CHF`;
}

/** Hány nap van még a lejáratig. null → nincs lejárat. */
function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const t = Date.parse(expiresAt);
  if (Number.isNaN(t)) return null;
  const ms = t - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

function formatExpiry(days: number | null): string | null {
  if (days == null) return null;
  if (days === 0) return "ma jár le";
  if (days === 1) return "még 1 nap";
  return `még ${days} nap`;
}


type Tab = "board" | "events" | "rides";

export function CommunityView({
  events,
  kinds,
  posts,
  rides,
  currentUserId,
  turnstileSiteKey = "",
}: {
  events: KintiEvent[];
  kinds: BulletinKind[];
  posts: BulletinPost[];
  rides: Ride[];
  currentUserId: string | null;
  turnstileSiteKey?: string;
}) {
  const [tab, setTab] = useState<Tab>("board");

  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: "board", label: "Hirdetések", count: posts.length },
    { id: "events", label: "Események", count: events.length },
    { id: "rides", label: "Telekocsi", count: rides.length },
  ];

  return (
    <div className="space-y-4">
      {/* szegmentált fülek */}
      <div className="mx-5 flex gap-1 rounded-xl border border-line bg-surface-alt p-1">
        {tabs.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold tracking-[-0.01em] transition",
                on ? "bg-surface text-ink shadow-card" : "text-ink-muted",
              )}
            >
              {t.label}
              {t.count != null && (
                <span
                  className={cn(
                    "rounded-pill px-1.5 py-px text-[10.5px] font-bold",
                    on ? "bg-primary text-white" : "bg-line-strong text-ink-muted",
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab !== "rides" ? (
        <div className="space-y-2.5 px-5">
          {tab === "events" && <EventsList events={events} />}
          {tab === "board" && <BulletinList posts={posts} kinds={kinds} turnstileSiteKey={turnstileSiteKey} />}
        </div>
      ) : (
        <TelekocsiView rides={rides} currentUserId={currentUserId} />
      )}
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

function EventsList({ events }: { events: KintiEvent[] }) {
  // Hónapos szűrő: "all" vagy "2025-06" formátum
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Lokális RSVP-állapot eseményenként (felülírja a szerver going-ját).
  const [rsvp, setRsvp] = useState<Record<string, RsvpState>>({});
  // Melyik eseményhez nyitottuk meg a „naptárba" választót.
  const [calFor, setCalFor] = useState<KintiEvent | null>(null);

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
      } else {
        setRsvp((p) => ({ ...p, [e.id]: { going: goingOf(e), voted: false, busy: false } }));
      }
    } catch {
      setRsvp((p) => ({ ...p, [e.id]: { going: goingOf(e), voted: false, busy: false } }));
    }
  }

  if (events.length === 0) return <Empty label="Nincs közelgő esemény." />;

  // Hero = a LEGTÖBB „Megyek"-et kapott esemény a szűrt listából.
  const hero = [...filtered].sort((a, b) => b.going - a.going)[0];
  const rest = filtered.filter((e) => e.id !== hero.id);

  // Hány esemény van összesen a szűrt hónapban (limit nélkül)
  const totalInFilter =
    monthFilter === "all"
      ? events.length
      : events.filter((e) => e.eventDate?.startsWith(monthFilter)).length;

  return (
    <>
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

      {filtered.length === 0 ? (
        <Empty label="Ebben a hónapban nincs esemény." />
      ) : (
        <>
          <article className="relative overflow-hidden rounded-[22px] p-[18px] text-white shadow-pop bg-gradient-to-br from-primary to-[#2e6a4e]">
            <span className="mb-3.5 inline-block rounded-pill bg-white/[0.18] px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
              ★ Kiemelt esemény
            </span>
            <div className="flex items-start gap-3.5">
              <DateChip event={hero} solid />
              <div className="min-w-0 flex-1">
                <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-balance">
                  {hero.title}
                </h2>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] opacity-90">
                  <Icon name="pin" size={12} strokeWidth={2.2} /> {hero.venue}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] opacity-90">
                  <Icon name="clock" size={12} strokeWidth={2.2} /> {hero.startTime}
                </p>
              </div>
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
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <TagBadge tag={e.tag} color={e.color} />
                  <span className="text-[11.5px] font-semibold text-ink-muted">
                    {e.dateWeekday} · {e.startTime}
                  </span>
                </div>
                <div className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">
                  {e.title}
                </div>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {e.venue}
                  {goingOf(e) > 0 && <> · {goingOf(e)} fő megy</>}
                </div>
              </div>
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
                {votedOf(e) ? "Megyek" : busyOf(e) ? "…" : "Megyek"}
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
    </>
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
      <div className={cn("text-[9px] font-extrabold uppercase tracking-wide", solid ? "text-accent" : "text-primary")}>
        {event.dateMonth}
      </div>
      <div className="text-xl font-extrabold leading-none text-ink">{event.dateDay}</div>
      {solid && <div className="mt-0.5 text-[8.5px] font-bold uppercase text-ink-muted">{event.dateWeekday?.slice(0, 3)}</div>}
    </div>
  );
}

function TagBadge({ tag, color }: { tag: string | null; color: string | null }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
      style={{ color: color ?? undefined, backgroundColor: color ? `${color}1f` : undefined }}
    >
      {tag}
    </span>
  );
}

// --- Hirdetőtábla -----------------------------------------------------------
function parseImageKeys(keyStr: string | null | undefined): string[] {
  if (!keyStr) return [];
  if (keyStr.startsWith("[")) {
    try {
      return JSON.parse(keyStr) as string[];
    } catch {
      return [keyStr];
    }
  }
  return [keyStr];
}

export function BulletinCard({
  post,
  isSaved,
  onToggleSaved,
  turnstileSiteKey = "",
}: {
  post: BulletinPost;
  isSaved: boolean;
  onToggleSaved: () => void;
  turnstileSiteKey?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hpWebsite, setHpWebsite] = useState(""); // honeypot — bot-csapda, sose lássa ember
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const color = post.kind?.color ?? undefined;
  const imageKeys = parseImageKeys(post.imageKey);
  const remaining = daysRemaining(post.expiresAt);
  const expiryLabel = formatExpiry(remaining);
  const priceLabel = formatPrice(post.price);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/kozosseg/hirdetes/${post.id}`;

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) {
      setContactError("Kérlek tölts ki minden mezőt.");
      return;
    }
    if (!turnstileToken) {
      setContactError("Várd meg a robot-ellenőrzést.");
      return;
    }
    setContactError(null);
    setSending(true);

    try {
      const res = await fetch("/api/bulletin/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          senderName,
          senderEmail,
          message,
          turnstileToken,
          website: hpWebsite, // honeypot
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Hiba történt a küldés során.");
      }

      setSentSuccess(true);
      setSenderName("");
      setSenderEmail("");
      setMessage("");
      setTimeout(() => {
        setContactOpen(false);
        setSentSuccess(false);
      }, 2500);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Nem sikerült elküldeni a levelet.");
      turnstileRef.current?.reset();
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-3.5 transition-all hover:shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
          style={{ color, backgroundColor: color ? `${color}22` : undefined }}
        >
          {post.kind?.label}
        </span>
        {post.cantonCode && (
          <span className="rounded-md bg-surface-alt border border-line px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-ink-muted flex items-center gap-0.5">
            <span className="text-[11px] leading-none">🇨🇭</span> {post.cantonCode}
          </span>
        )}
        <span className="text-[11.5px] font-medium text-ink-muted">{post.ageText}</span>
        {expiryLabel && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10.5px] font-bold",
              remaining != null && remaining <= 3
                ? "bg-accent/10 text-accent"
                : "bg-surface-alt text-ink-muted",
            )}
            title="Hátralévő idő"
          >
            ⏳ {expiryLabel}
          </span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          aria-label="Megosztás"
          className="text-ink-faint transition hover:text-ink-muted active:scale-90"
        >
          <Icon name="share" size={14} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={onToggleSaved}
          aria-label={isSaved ? "Mentés visszavonása" : "Hirdetés mentése"}
          aria-pressed={isSaved}
          className={cn(
            "transition active:scale-90",
            isSaved ? "text-accent" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          <Icon name="bookmark" size={14} filled={isSaved} />
        </button>
        <ReportButton contentType="bulletin" contentId={post.id} />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={post.title}
        text={`Nézd meg ezt a hirdetést a kintin: ${post.title}`}
      />

      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        <h3 className="mb-1 text-[15.5px] font-bold tracking-[-0.01em] text-ink text-pretty hover:text-primary transition-colors">
          {post.title}
        </h3>
        {priceLabel && (
          <p className="text-[15px] font-extrabold tracking-tight text-primary">
            {priceLabel}
          </p>
        )}
        <p className="text-[13px] font-medium text-ink-muted">{post.meta}</p>
      </div>

      {/* Tömörített képek scrollable listája */}
      {imageKeys.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto snap-x scrollbar-none pb-1">
          {imageKeys.map((k) => {
            const url = mediaUrl(k);
            if (!url) return null;
            return (
              <div
                key={k}
                onClick={() => setLightboxImage(url)}
                className="relative aspect-video w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-surface-alt shadow-sm cursor-zoom-in transition hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            );
          })}
        </div>
      )}

      {/* Leírás szekció */}
      {post.body && (
        <div className="mt-2.5">
          <p
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "text-[13.5px] leading-relaxed text-ink-muted cursor-pointer whitespace-pre-wrap",
              !expanded && "line-clamp-2",
            )}
          >
            {post.body}
          </p>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:underline"
          >
            {expanded ? "Kevesebb" : "Teljes leírás mutatása"}
            <Icon name={expanded ? "chevU" : "chevD"} size={12} strokeWidth={2.4} />
          </button>
        </div>
      )}

      {/* Alsó sor */}
      <div className="mt-3 flex items-center gap-2 border-t border-dashed border-line pt-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10.5px] font-bold text-white uppercase">
          {post.poster?.charAt(0) || "?"}
        </span>
        <span className="text-[12.5px] font-semibold text-ink">{post.poster}</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="rounded-lg bg-primary hover:bg-primary-dark active:scale-95 transition px-3.5 py-1.5 text-xs font-bold text-white shadow-sm flex items-center gap-1"
        >
          <Icon name="send" size={11} strokeWidth={2.5} />
          Írok neki
        </button>
      </div>

      {/* Kapcsolatfelvételi modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="relative w-full max-w-md rounded-[24px] border border-line bg-surface p-6 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bezárás gomb */}
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-surface-alt border border-line text-ink-muted hover:text-ink active:scale-90 transition"
            >
              <Icon name="close" size={14} strokeWidth={2.4} />
            </button>

            {sentSuccess ? (
              <div className="py-8 text-center space-y-3 flex flex-col items-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary animate-bounce">
                  <Icon name="check" size={24} strokeWidth={3} />
                </div>
                <h4 className="text-lg font-bold text-ink">Üzenet elküldve!</h4>
                <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
                  Sikeresen továbbítottuk a leveledet. A hirdető közvetlenül a te megadott email címedre fog válaszolni.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {/* Honeypot — bot-csapda: sose lássa az ember */}
                <input
                  type="text"
                  name="website"
                  value={hpWebsite}
                  onChange={(e) => setHpWebsite(e.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                />

                <div>
                  <h4 className="text-lg font-extrabold text-ink tracking-tight">Válasz a hirdetésre</h4>
                  <p className="text-xs text-ink-muted mt-1 truncate">
                    Címzett: <strong>{post.poster}</strong> · {post.title}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-ink-muted mb-1.5 uppercase">A te neved</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Gipsz Jakab"
                      className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold text-ink placeholder-ink-faint focus:border-primary focus:outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-ink-muted mb-1.5 uppercase">A te email címed</label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="jakab@gmail.com"
                      className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold text-ink placeholder-ink-faint focus:border-primary focus:outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-ink-muted mb-1.5 uppercase">Üzenet</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Szia, érdekelne a hirdetésed…"
                      className="w-full rounded-[16px] border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold text-ink placeholder-ink-faint focus:border-primary focus:outline-none shadow-sm resize-none"
                    />
                  </div>
                </div>

                {contactError && <p className="text-xs font-bold text-accent">{contactError}</p>}

                  {/* Turnstile CAPTCHA — bot-védelem */}
                  {turnstileSiteKey && (
                    <TurnstileWidget
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onToken={setTurnstileToken}
                    />
                  )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="flex-1 rounded-[14px] border border-line bg-surface-alt hover:bg-surface text-[13px] font-extrabold text-ink-muted py-3 transition active:scale-95"
                  >
                    Mégsem
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 rounded-[14px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-[13px] font-extrabold text-white py-3 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                  >
                    {sending ? (
                      "Küldés…"
                    ) : (
                      <>
                        <Icon name="send" size={13} strokeWidth={2.4} />
                        Üzenet küldése
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox képnézegető */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </article>
  );
}

type SortMode = "newest" | "price-asc" | "price-desc";

function BulletinList({
  posts,
  kinds,
  turnstileSiteKey = "",
}: {
  posts: BulletinPost[];
  kinds: BulletinKind[];
  turnstileSiteKey?: string;
}) {
  const [q, setQ] = useState("");
  const [kindId, setKindId] = useState("all");
  const [canton, setCanton] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [savedOnly, setSavedOnly] = useState(false);

  // Mentett hirdetések — localStorage, mount után töltődik.
  const [saved, setSaved] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSaved(loadSavedIds());
  }, []);
  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSavedIds(next);
      return next;
    });
  }

  // Csak azokat a kantonokat kínáljuk a legördülőben, amikben TÉNYLEG van hirdetés.
  const availableCantons = useMemo(() => {
    const codes = new Set(
      posts.map((p) => p.cantonCode).filter((c): c is string => !!c),
    );
    return CANTONS.filter((c) => codes.has(c.code));
  }, [posts]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = posts.filter((p) => {
      const byKind = kindId === "all" || p.kindId === kindId;
      const byCanton = canton === "all" || p.cantonCode === canton;
      const bySaved = !savedOnly || saved.has(p.id);
      const byText =
        !needle ||
        p.title.toLowerCase().includes(needle) ||
        (p.meta ?? "").toLowerCase().includes(needle) ||
        (p.body ?? "").toLowerCase().includes(needle) ||
        (p.poster ?? "").toLowerCase().includes(needle);
      return byKind && byCanton && bySaved && byText;
    });

    // Rendezés. Ár-rendezésnél az ár nélküli (null) hirdetések a végére.
    if (sort === "price-asc" || sort === "price-desc") {
      const dir = sort === "price-asc" ? 1 : -1;
      return [...list].sort((a, b) => {
        const ap = a.price;
        const bp = b.price;
        if (ap == null && bp == null) return 0;
        if (ap == null) return 1;
        if (bp == null) return -1;
        return (ap - bp) * dir;
      });
    }
    // "newest": a getBulletinPosts ORDER BY published_at DESC már elvégezte
    return list;
  }, [posts, q, kindId, canton, sort, savedOnly, saved]);

  const hasFilter =
    q.trim() !== "" || kindId !== "all" || canton !== "all" || savedOnly;

  function resetFilters() {
    setQ("");
    setKindId("all");
    setCanton("all");
    setSavedOnly(false);
  }

  return (
    <>
      {/* CTA — account nélkül lehet hirdetést feladni */}
      <Link
        href="/kozosseg/uj-hirdetes"
        className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/60 p-3.5 transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">Új hirdetés</div>
          <div className="text-[11.5px] text-ink-muted">
            Albérlet, állás, eladó, szolgáltatás — regisztráció nélkül
          </div>
        </div>
        <Icon name="chevR" size={14} className="text-ink-muted" />
      </Link>

      {posts.length === 0 ? (
        <Empty label="Még nincs hirdetés. Légy te az első!" />
      ) : (
        <>
          {/* Kereső */}
          <div className="flex items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3 py-2.5 shadow-card">
            <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Keresés a hirdetések közt…"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-ink-faint"
            />
            {q && (
              <button
                type="button"
                aria-label="Törlés"
                onClick={() => setQ("")}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-surface-alt text-ink-muted"
              >
                <Icon name="close" size={13} strokeWidth={2.4} />
              </button>
            )}
          </div>

          {/* Kategória-pillek (bulletin_kinds) */}
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
            <KindPill label="Mind" active={kindId === "all"} onClick={() => setKindId("all")} />
            {kinds.map((k) => (
              <KindPill
                key={k.id}
                label={k.label}
                color={k.color}
                active={kindId === k.id}
                onClick={() => setKindId(k.id)}
              />
            ))}
          </div>

          {/* Kanton + rendezés + Mentett + darabszám */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 shadow-card">
              <Icon name="pin" size={12} strokeWidth={2.2} className="shrink-0 text-accent" />
              <select
                value={canton}
                onChange={(e) => setCanton(e.target.value)}
                aria-label="Kanton szűrő"
                className="appearance-none bg-transparent text-[12.5px] font-bold tracking-[-0.01em] text-ink outline-none"
              >
                <option value="all">Egész Svájc</option>
                {(availableCantons.length > 0 ? availableCantons : CANTONS).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <Icon name="chevD" size={12} strokeWidth={2.2} className="text-ink-muted" />
            </label>

            <label className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 shadow-card">
              <Icon name="filter" size={12} strokeWidth={2.2} className="shrink-0 text-primary" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                aria-label="Rendezés"
                className="appearance-none bg-transparent text-[12.5px] font-bold tracking-[-0.01em] text-ink outline-none"
              >
                <option value="newest">Legújabb elöl</option>
                <option value="price-asc">Ár szerint ↑</option>
                <option value="price-desc">Ár szerint ↓</option>
              </select>
              <Icon name="chevD" size={12} strokeWidth={2.2} className="text-ink-muted" />
            </label>

            <button
              type="button"
              onClick={() => setSavedOnly((v) => !v)}
              aria-pressed={savedOnly}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-[12.5px] font-bold shadow-card transition",
                savedOnly
                  ? "bg-accent text-white"
                  : "border border-line bg-surface text-ink",
              )}
            >
              <Icon name="bookmark" size={12} strokeWidth={2.4} filled={savedOnly} />
              Mentett{saved.size > 0 && ` (${saved.size})`}
            </button>

            <span className="ml-auto text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
              {filtered.length} hirdetés
            </span>
          </div>

          {/* Találatok / üres állapot */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-alt px-6 py-10 text-center">
              <Icon name="search" size={24} className="text-ink-faint" />
              <p className="text-[13px] font-semibold text-ink">Nincs ilyen hirdetés</p>
              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-1 rounded-pill bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white"
                >
                  Szűrők törlése
                </button>
              )}
            </div>
          ) : (
            filtered.map((p) => (
              <BulletinCard
                key={p.id}
                post={p}
                isSaved={saved.has(p.id)}
                onToggleSaved={() => toggleSaved(p.id)}
                turnstileSiteKey={turnstileSiteKey}
              />
            ))
          )}
        </>
      )}
    </>
  );
}

function KindPill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex flex-none items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-bold tracking-[-0.01em] transition",
        active
          ? "bg-primary text-white shadow-card"
          : "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-alpha))]",
      )}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: active ? "rgba(255,255,255,0.7)" : color }}
        />
      )}
      {label}
    </button>
  );
}


function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-6 py-12 text-center text-sm text-ink-muted shadow-card">
      {label}
    </div>
  );
}
