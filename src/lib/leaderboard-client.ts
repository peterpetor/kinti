"use client";

import { loadMyPosts } from "./my-posts";
import { computeGamification } from "./gamification";
import { streakXp } from "./streak";
import { gatherAchievementExtras } from "./achievements";

/**
 * leaderboard-client.ts — opt-in ranglista kliens-oldala. A pontszám a meglévő
 * kliensoldali gamifikációból jön; az identitás egy random `client_token`
 * (localStorage), valódi név/email NÉLKÜL. Csak a böngészőben hívható.
 */
const KEY_TOKEN = "kinti.leaderboardToken";
const KEY_NICK = "kinti.leaderboardNick";

function ls(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getLeaderboardToken(): string | null {
  return ls()?.getItem(KEY_TOKEN) ?? null;
}

export function getMyNickname(): string | null {
  return ls()?.getItem(KEY_NICK) ?? null;
}

export function isOnLeaderboard(): boolean {
  return !!getLeaderboardToken() && !!getMyNickname();
}

/** A saját, ranglistára küldendő statisztika a kliensoldali gamifikációból. */
export function computeMyStats(): { score: number; level: number; badges: number } {
  const g = computeGamification(loadMyPosts(), streakXp(), gatherAchievementExtras());
  return { score: g.points, level: g.level, badges: g.earnedBadgeCount };
}

function ensureToken(): string {
  const store = ls();
  let t = store?.getItem(KEY_TOKEN) ?? null;
  if (!t) {
    t = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    store?.setItem(KEY_TOKEN, t);
  }
  return t;
}

export async function joinLeaderboard(nickname: string): Promise<{ ok: boolean; rank?: number; error?: string }> {
  const clientToken = ensureToken();
  const stats = computeMyStats();
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientToken, nickname, ...stats }),
    });
    const data = (await res.json().catch(() => ({}))) as { rank?: number; error?: string };
    if (!res.ok) {
      // sikertelen csatlakozásnál ne ragadjon bent egy "félkész" token-állapot
      if (!getMyNickname()) ls()?.removeItem(KEY_TOKEN);
      return { ok: false, error: data.error ?? "Csatlakozás sikertelen." };
    }
    ls()?.setItem(KEY_NICK, nickname);
    return { ok: true, rank: data.rank };
  } catch {
    if (!getMyNickname()) ls()?.removeItem(KEY_TOKEN);
    return { ok: false, error: "Hálózati hiba." };
  }
}

/** Pont-szinkron (best-effort) — ha már a ranglistán van. */
export async function syncLeaderboard(): Promise<void> {
  if (!isOnLeaderboard()) return;
  const clientToken = getLeaderboardToken()!;
  const nickname = getMyNickname()!;
  const stats = computeMyStats();
  try {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientToken, nickname, ...stats }),
    });
  } catch {
    /* best-effort */
  }
}

export async function leaveLeaderboard(): Promise<void> {
  const clientToken = getLeaderboardToken();
  if (clientToken) {
    try {
      await fetch("/api/leaderboard", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientToken }),
      });
    } catch {
      /* ignore */
    }
  }
  ls()?.removeItem(KEY_TOKEN);
  ls()?.removeItem(KEY_NICK);
}
