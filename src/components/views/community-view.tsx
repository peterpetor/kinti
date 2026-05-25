"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { BulletinKind, BulletinPost, KintiEvent } from "@/lib/types";

type Tab = "events" | "board" | "newbie";

export function CommunityView({
  events,
  posts,
}: {
  events: KintiEvent[];
  kinds: BulletinKind[];
  posts: BulletinPost[];
}) {
  const [tab, setTab] = useState<Tab>("events");

  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: "events", label: "Események", count: events.length },
    { id: "board", label: "Hirdetőtábla", count: posts.length },
    { id: "newbie", label: "Újonnan", count: null },
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

      <div className="space-y-2.5 px-5">
        {tab === "events" && <EventsList events={events} />}
        {tab === "board" && <BulletinList posts={posts} />}
        {tab === "newbie" && <NewbieList />}
      </div>
    </div>
  );
}

// --- Események --------------------------------------------------------------
function EventsList({ events }: { events: KintiEvent[] }) {
  if (events.length === 0) return <Empty label="Nincs közelgő esemény." />;
  // „A hónap eseménye": a legtöbb résztvevővel.
  const hero = [...events].sort((a, b) => b.going - a.going)[0];
  const rest = events.filter((e) => e.id !== hero.id);

  return (
    <>
      <article className="relative overflow-hidden rounded-[22px] p-[18px] text-white shadow-pop bg-gradient-to-br from-primary to-[#2e6a4e]">
        <span className="mb-3.5 inline-block rounded-pill bg-white/[0.18] px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
          ★ A hónap eseménye
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
            <strong>{hero.going} kinti</strong> jelezte, hogy megy
          </p>
          <button className="rounded-pill bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-primary">
            Megyek
          </button>
        </div>
      </article>

      <p className="px-1 pt-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
        Következő hetek
      </p>

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
              {e.venue} · {e.going} fő megy
            </div>
          </div>
          <Icon name="chevR" size={14} className="text-ink-muted" />
        </div>
      ))}
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
function BulletinList({ posts }: { posts: BulletinPost[] }) {
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
          <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
            Új hirdetés
          </div>
          <div className="text-[11.5px] text-ink-muted">
            Albérlet, állás, eladó, szolgáltatás — regisztráció nélkül
          </div>
        </div>
        <Icon name="chevR" size={14} className="text-ink-muted" />
      </Link>

      {posts.length === 0 && <Empty label="Még nincs hirdetés. Légy te az első!" />}

      {posts.map((p) => {
        const color = p.kind?.color ?? undefined;
        return (
          <article key={p.id} className="rounded-2xl border border-line bg-surface p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color, backgroundColor: color ? `${color}22` : undefined }}
              >
                {p.kind?.label}
              </span>
              <span className="text-[11.5px] font-medium text-ink-muted">{p.ageText}</span>
              <span className="flex-1" />
              <Icon name="bookmark" size={14} className="text-ink-faint" />
            </div>
            <h3 className="mb-1 text-[15.5px] font-bold tracking-[-0.01em] text-ink text-pretty">
              {p.title}
            </h3>
            <p className="text-[13px] font-medium text-ink-muted">{p.meta}</p>
            <div className="mt-2.5 flex items-center gap-2 border-t border-dashed border-line pt-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10.5px] font-bold text-white">
                {p.poster?.charAt(0)}
              </span>
              <span className="text-[12.5px] font-semibold text-ink">{p.poster}</span>
              <span className="flex-1" />
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white">
                Megírom
              </button>
            </div>
          </article>
        );
      })}
    </>
  );
}

// --- Újonnan érkezőknek (statikus útmutatók) --------------------------------
const NEWBIE = [
  { n: "1", title: "Bankszámla nyitás Svájcban", meta: "Postfinance, UBS, Migros — magyar tippekkel · 8 perc olvasás" },
  { n: "2", title: "Lakásbérlés első 90 napban", meta: "Bürgschaft, Schufa, mire figyelj · 12 perc olvasás" },
  { n: "3", title: "Anmeldung — hova menj, mit vigyél", meta: "Kreisbüro, határidők, AHV · 6 perc olvasás" },
  { n: "4", title: "Krankenkasse-választás magyaroknak", meta: "Modellek, költségek, magyar orvosok · 10 perc" },
];

function NewbieList() {
  return (
    <>
      <div className="rounded-[18px] border border-accent/20 bg-accent-soft p-4">
        <p className="mb-1 text-[13.5px] font-bold tracking-[-0.01em] text-accent">
          Most költöztél ki?
        </p>
        <p className="text-sm leading-relaxed text-ink">
          Itt összeszedtük, amit mi is bárcsak tudtunk volna az első hónapokban.{" "}
          <strong>Magyaroktól, magyaroknak.</strong>
        </p>
      </div>
      {NEWBIE.map((it) => (
        <div
          key={it.n}
          className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-lg font-extrabold text-primary">
            {it.n}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-bold tracking-[-0.01em] text-ink">{it.title}</div>
            <div className="mt-0.5 text-xs text-ink-muted">{it.meta}</div>
          </div>
          <Icon name="chevR" size={14} className="text-ink-muted" />
        </div>
      ))}
    </>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-6 py-12 text-center text-sm text-ink-muted shadow-card">
      {label}
    </div>
  );
}
