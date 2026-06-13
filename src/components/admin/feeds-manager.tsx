"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import type { EventFeed } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Kliens-oldali admin felület az iCal feedek kezeléséhez. Az API:
 *   POST    /api/admin/feeds         { url, label } → add
 *   PATCH   /api/admin/feeds/:id     { enabled?, label? } → toggle / rename
 *   DELETE  /api/admin/feeds/:id     → eseményekkel együtt
 *
 * Sikeres mutáció után `router.refresh()` újraolvassa a szerver-komponensből
 * a friss listát (force-dynamic).
 */
export function FeedsManager({ initialFeeds }: { initialFeeds: EventFeed[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feeds, setFeeds] = useState(initialFeeds);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function syncNow() {
    setSyncing(true);
    setSyncMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/cron/sync-events", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; imported?: number; feeds?: number };
      if (!res.ok || !data.ok) {
        setError("A szinkron nem sikerült (jogosultság vagy hálózat).");
      } else {
        setSyncMsg(`Kész: ${data.feeds ?? 0} forrás, ${data.imported ?? 0} esemény frissítve.`);
        startTransition(() => router.refresh());
      }
    } catch {
      setError("Hálózati hiba a szinkron közben.");
    } finally {
      setSyncing(false);
    }
  }

  // optimista UI: kis változtatásokat lokálban is alkalmazzuk
  function patchLocal(id: string, p: Partial<EventFeed>) {
    setFeeds((cur) => cur.map((f) => (f.id === id ? { ...f, ...p } : f)));
  }

  async function add(url: string, label: string) {
    setError(null);
    const res = await fetch("/api/admin/feeds", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, label }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      feed?: EventFeed;
    };
    if (!res.ok || !data.feed) {
      setError(data.error ?? "Hiba történt a hozzáadáskor.");
      return;
    }
    setFeeds((cur) => [data.feed!, ...cur]);
    startTransition(() => router.refresh());
  }

  async function toggle(id: string, enabled: boolean) {
    patchLocal(id, { enabled });
    const res = await fetch(`/api/admin/feeds/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      patchLocal(id, { enabled: !enabled });
      setError("Nem sikerült váltani a státuszt.");
    }
  }

  async function rename(id: string, label: string) {
    patchLocal(id, { label });
    const res = await fetch(`/api/admin/feeds/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) setError("A címke mentése nem sikerült.");
  }

  async function remove(id: string) {
    if (!confirm("Biztos törlöd? A feed-hez tartozó események is törlődnek.")) return;
    setFeeds((cur) => cur.filter((f) => f.id !== id));
    const res = await fetch(`/api/admin/feeds/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Törlés nem sikerült. Frissítsd az oldalt.");
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <AddForm onAdd={add} busy={pending} />

      {error && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {error}
        </div>
      )}

      {syncMsg && (
        <div className="rounded-card border border-success/30 bg-success/10 px-4 py-3 text-[12.5px] font-semibold text-success">
          {syncMsg}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            Bejegyzett források ({feeds.length})
          </h2>
          <button
            type="button"
            onClick={syncNow}
            disabled={syncing || feeds.length === 0}
            className="rounded-pill border border-primary/30 bg-primary-soft/40 px-3 py-1.5 text-[12px] font-bold text-primary transition active:scale-95 disabled:opacity-50"
          >
            {syncing ? "Szinkron…" : "Szinkronizálás most"}
          </button>
        </div>
        <p className="text-[11.5px] leading-snug text-ink-faint">
          Az események maguktól is frissülnek (kb. {12} óránként, a forgalom alapján).
          Ez a gomb azonnal lefuttatja a szinkront.
        </p>
        {feeds.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-8 text-center text-[13px] text-ink-muted">
            Még nincs felvett forrás. Adj hozzá egyet fent.
          </div>
        ) : (
          <ul className="space-y-2">
            {feeds.map((f) => (
              <FeedRow
                key={f.id}
                feed={f}
                onToggle={(v) => toggle(f.id, v)}
                onRename={(v) => rename(f.id, v)}
                onDelete={() => remove(f.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AddForm({
  onAdd,
  busy,
}: {
  onAdd: (url: string, label: string) => void;
  busy: boolean;
}) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!url.trim()) return;
        onAdd(url.trim(), label.trim());
        setUrl("");
        setLabel("");
      }}
      className="space-y-2 rounded-card border border-line bg-surface p-4 shadow-card"
    >
      <h2 className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
        Új forrás (iCal vagy RSS/Atom)
      </h2>
      <input
        type="url"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder=".../basic.ics  vagy  .../rss.xml  vagy  .../feed"
        className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Címke (pl. Magyar Egyesület Zürich) — opcionális"
        maxLength={80}
        className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button
        type="submit"
        disabled={busy || !url.trim()}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[13.5px] font-extrabold text-white shadow-card-hover",
          (busy || !url.trim()) && "opacity-60",
        )}
      >
        <Icon name="plus" size={14} strokeWidth={2.4} /> Felvétel
      </button>
    </form>
  );
}

function FeedRow({
  feed,
  onToggle,
  onRename,
  onDelete,
}: {
  feed: EventFeed;
  onToggle: (v: boolean) => void;
  onRename: (v: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(feed.label ?? "");
  const synced = feed.lastSyncedAt ? fmtAgo(feed.lastSyncedAt) : "még sosem";

  return (
    <li className="rounded-card border border-line bg-surface p-3 shadow-card">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-1.5">
              <input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                className="flex-1 rounded-[10px] border border-line bg-surface-alt px-2 py-1 text-[13px] text-ink outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={80}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  onRename(labelDraft.trim());
                  setEditing(false);
                }}
                className="rounded-[10px] bg-primary px-2.5 py-1 text-[11.5px] font-bold text-white"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => {
                  setLabelDraft(feed.label ?? "");
                  setEditing(false);
                }}
                className="rounded-[10px] bg-surface-alt px-2.5 py-1 text-[11.5px] font-bold text-ink-muted"
              >
                Mégse
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-left text-[14px] font-bold tracking-[-0.01em] text-ink hover:underline"
              title="Címke szerkesztése"
            >
              {feed.label || <span className="italic text-ink-muted">(címke nélkül)</span>}
            </button>
          )}
          <div className="mt-0.5 break-all text-[11px] text-ink-muted">{feed.url}</div>
        </div>
        <label className="flex shrink-0 items-center gap-1.5 text-[11.5px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={feed.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          {feed.enabled ? "aktív" : "kikapcsolva"}
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
        <span>
          Utolsó sync: <span className="font-semibold text-ink">{synced}</span>
        </span>
        <span>
          Események: <span className="font-semibold text-ink">{feed.eventsCount}</span>
        </span>
        {feed.lastError && (
          <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11.5px] font-semibold text-accent">
            Hiba: {feed.lastError.slice(0, 80)}
          </span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-accent hover:underline"
        >
          <Icon name="close" size={11} strokeWidth={2.4} /> Törlés
        </button>
      </div>
    </li>
  );
}

function fmtAgo(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffMin = Math.floor((Date.now() - t) / 60_000);
  if (diffMin < 1) return "az imént";
  if (diffMin < 60) return `${diffMin} perce`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} órája`;
  const d = Math.floor(h / 24);
  return `${d} napja`;
}
