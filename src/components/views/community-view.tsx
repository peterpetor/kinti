"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { BulletinKind, BulletinPost, KintiEvent } from "@/lib/types";
import { mediaUrl } from "@/lib/media";

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

function BulletinCard({ post }: { post: BulletinPost }) {
  const [expanded, setExpanded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const color = post.kind?.color ?? undefined;
  const imageKeys = parseImageKeys(post.imageKey);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) {
      setContactError("Kérlek tölts ki minden mezőt.");
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
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-3.5 transition-all hover:shadow-sm">
      <div className="mb-2 flex items-center gap-2">
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
        <span className="flex-1" />
        <button type="button" className="text-ink-faint hover:text-ink-muted">
          <Icon name="bookmark" size={14} />
        </button>
      </div>

      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        <h3 className="mb-1 text-[15.5px] font-bold tracking-[-0.01em] text-ink text-pretty hover:text-primary transition-colors">
          {post.title}
        </h3>
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
          Megírom
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
          <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">Új hirdetés</div>
          <div className="text-[11.5px] text-ink-muted">
            Albérlet, állás, eladó, szolgáltatás — regisztráció nélkül
          </div>
        </div>
        <Icon name="chevR" size={14} className="text-ink-muted" />
      </Link>

      {posts.length === 0 && <Empty label="Még nincs hirdetés. Légy te az első!" />}

      {posts.map((p) => (
        <BulletinCard key={p.id} post={p} />
      ))}
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
