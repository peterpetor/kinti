"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  getLeaderboardToken,
  getMyNickname,
  isOnLeaderboard,
  joinLeaderboard,
  syncLeaderboard,
  leaveLeaderboard,
} from "@/lib/leaderboard-client";

interface Entry {
  nickname: string;
  score: number;
  level: number;
  badges: number;
}
interface Me extends Entry {
  rank: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [me, setMe] = useState<Me | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nick, setNick] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLeaderboardToken();
    try {
      const res = await fetch(`/api/leaderboard${token ? `?token=${encodeURIComponent(token)}` : ""}`);
      const data = (await res.json().catch(() => ({}))) as { entries?: Entry[]; total?: number; me?: Me | null };
      setEntries(data.entries ?? []);
      setTotal(data.total ?? 0);
      setMe(data.me ?? null);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setJoined(isOnLeaderboard());
    (async () => {
      if (isOnLeaderboard()) await syncLeaderboard(); // friss pont a szerverre
      await refresh();
    })();
  }, [refresh]);

  async function handleJoin() {
    const name = nick.trim();
    if (name.length < 3) {
      setError("A becenév legalább 3 karakter.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await joinLeaderboard(name);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Csatlakozás sikertelen.");
      return;
    }
    setJoined(true);
    setNick("");
    await refresh();
  }

  async function handleLeave() {
    if (!confirm("Biztosan kilépsz a ranglistáról? A becenevedet és pontodat töröljük onnan.")) return;
    setBusy(true);
    await leaveLeaderboard();
    setBusy(false);
    setJoined(false);
    setMe(null);
    await refresh();
  }

  const myNick = getMyNickname();

  return (
    <div className="space-y-4">
      {/* Opt-in / saját állapot */}
      {!joined ? (
        <section className="rounded-card border-2 border-primary/20 bg-primary-soft/40 p-5 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink">Csatlakozz a ranglistához</h2>
          </div>
          <p className="mb-3 text-[12.5px] leading-snug text-ink-muted">
            Opcionális és <strong className="text-ink">becenévvel</strong> — valódi név, e-mail nélkül. Csak a
            kiválasztott becenév és a pontszámod látszik. Bármikor kiléphetsz.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Becenév (3–20 karakter)"
              maxLength={20}
              className="flex-1 rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={busy}
              className={cn(
                "rounded-[10px] px-4 py-2.5 text-[13.5px] font-extrabold transition active:scale-95",
                busy ? "bg-surface-alt text-ink-muted cursor-wait" : "bg-primary text-white shadow-card",
              )}
            >
              {busy ? "…" : "Csatlakozom"}
            </button>
          </div>
          {error && <p className="mt-2 text-[12px] font-bold text-accent">{error}</p>}
        </section>
      ) : (
        <section className="rounded-card border-2 border-success/25 bg-success/5 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-wide text-success">A helyezésed</p>
              <p className="mt-0.5 text-[15px] font-extrabold text-ink">
                {me ? `#${me.rank}` : "—"} · {myNick}
                {me && <span className="ml-1.5 text-[13px] font-bold text-ink-muted">{me.score} XP</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLeave}
              disabled={busy}
              className="shrink-0 rounded-pill border border-accent/40 bg-accent/10 px-3 py-1.5 text-[12px] font-bold text-accent"
            >
              Kilépés
            </button>
          </div>
        </section>
      )}

      {/* Lista */}
      <section>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-ink-muted">Top 50</h3>
          <span className="text-[11.5px] font-bold text-ink-faint">{total} játékos</span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-card bg-surface-alt/50" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="rounded-card border border-line bg-surface px-4 py-8 text-center text-[13px] text-ink-muted shadow-card">
            Még senki sincs a ranglistán — legyél te az első! 🏆
          </p>
        ) : (
          <ol className="space-y-1.5">
            {entries.map((e, i) => {
              const isMe = joined && myNick && e.nickname.toLowerCase() === myNick.toLowerCase();
              return (
                <li
                  key={`${e.nickname}-${i}`}
                  className={cn(
                    "flex items-center gap-3 rounded-card border px-3 py-2.5 shadow-card",
                    isMe ? "border-success/40 bg-success/5" : "border-line bg-surface",
                  )}
                >
                  <span className="w-7 shrink-0 text-center text-[15px] font-black text-ink-muted">
                    {i < 3 ? MEDALS[i] : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">
                    {e.nickname}
                    {isMe && <span className="ml-1.5 text-[11px] font-bold text-success">(te)</span>}
                  </span>
                  <span className="shrink-0 rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    Lv {e.level}
                  </span>
                  <span className="shrink-0 text-[13.5px] font-extrabold text-ink">{e.score}</span>
                  <span className="shrink-0 text-[10px] font-bold uppercase text-ink-faint">XP</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <p className="flex items-start gap-1.5 px-1 text-[11px] leading-snug text-ink-faint">
        <Icon name="lock" size={11} strokeWidth={2.2} className="mt-0.5 shrink-0" />
        A pontszám a saját eszközöd gamifikációjából származik (önbevallott). Nincs valódi név vagy e-mail — csak a
        becenév és a pont. A részvétel önkéntes; bármikor kiléphetsz.
      </p>
    </div>
  );
}
