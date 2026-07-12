import { NextResponse } from "next/server";
import {
  upsertLeaderboardEntry,
  isNicknameTaken,
  getTopLeaderboard,
  getLeaderboardByToken,
  getLeaderboardCount,
  rankForScore,
  deleteLeaderboardEntry,
  parseLeaderboardCategory,
} from "@/lib/repo";
import { containsProfanity } from "@/lib/profanity";
import { getReferralCount } from "@/lib/repo-referral";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_SCORE = 100_000; // épelméjűségi felső korlát (önbevallott pont)
const NICK_MIN = 3;
const NICK_MAX = 20;

/** GET /api/leaderboard[?token=] — top 50 + (ha token) a saját rangod. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim() || null;
    const category = parseLeaderboardCategory(url.searchParams.get("category"));
    const [top, total, me] = await Promise.all([
      getTopLeaderboard(category, 50),
      getLeaderboardCount(),
      token ? getLeaderboardByToken(category, token) : Promise.resolve(null),
    ]);
    return NextResponse.json(
      { entries: top, total, me },
      { headers: { "cache-control": "public, max-age=30" } },
    );
  } catch (err) {
    safeLogError("api/leaderboard GET", err);
    return NextResponse.json({ entries: [], total: 0, me: null }, { status: 500 });
  }
}

/** POST /api/leaderboard — opt-in csatlakozás / pont-szinkron. */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      clientToken?: string; nickname?: string; score?: number; level?: number; badges?: number;
      scoreLanguage?: number; scoreCommunity?: number; referralCode?: string;
    };

    const clientToken = typeof body.clientToken === "string" ? body.clientToken.trim() : "";
    if (clientToken.length < 8 || clientToken.length > 80) {
      return NextResponse.json({ error: "Érvénytelen token." }, { status: 400 });
    }

    const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
    if (nickname.length < NICK_MIN || nickname.length > NICK_MAX) {
      return NextResponse.json({ error: `A becenév ${NICK_MIN}–${NICK_MAX} karakter.` }, { status: 400 });
    }
    if (!/^[\p{L}0-9 ._-]+$/u.test(nickname)) {
      return NextResponse.json({ error: "A becenév csak betűt, számot, szóközt és . _ - jelet tartalmazhat." }, { status: 400 });
    }
    if (containsProfanity(nickname).hit) {
      return NextResponse.json({ error: "Ez a becenév nem engedélyezett." }, { status: 400 });
    }

    const score = Math.max(0, Math.min(MAX_SCORE, Math.round(Number(body.score) || 0)));
    const level = Math.max(1, Math.min(999, Math.round(Number(body.level) || 1)));
    const badges = Math.max(0, Math.min(999, Math.round(Number(body.badges) || 0)));
    const scoreLanguage = Math.max(0, Math.min(MAX_SCORE, Math.round(Number(body.scoreLanguage) || 0)));
    const scoreCommunity = Math.max(0, Math.min(MAX_SCORE, Math.round(Number(body.scoreCommunity) || 0)));

    // „Meghívók" pont: NEM önbevallás — a kliens csak a saját meghívó-KÓDJÁT
    // küldi, a konverzió-számot a szerver számolja a referral_conversions-ből
    // (anonim kód, identitás nélkül; a kód-formátum a referral route-tal azonos).
    let scoreReferral = 0;
    const referralCode = typeof body.referralCode === "string" ? body.referralCode.trim() : "";
    if (/^[a-z0-9]{4,16}$/i.test(referralCode)) {
      scoreReferral = Math.min(MAX_SCORE, await getReferralCount(referralCode));
    }

    // Rate-limit (csatlakozás/szinkron spam ellen)
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("leaderboard", ipHash);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Túl sok kérés. Próbáld újra később." }, { status: 429 });
    }

    if (await isNicknameTaken(nickname, clientToken)) {
      return NextResponse.json({ error: "Ezt a becenevet már használják. Válassz másikat." }, { status: 409 });
    }

    // A fenti ellenőrzés + írás nem atomi: két egyidejű kérés (más token, azonos
    // becenév) mindkettő "szabad"-nak látja a nevet, majd a `nickname` egyedi
    // indexébe (COLLATE NOCASE) az egyik ütközik. Duplikátum így sem jöhet létre —
    // de a vesztesnek a helyes válasz 409 (foglalt), nem 500 (belső hiba).
    try {
      await upsertLeaderboardEntry({ clientToken, nickname, score, level, badges, scoreLanguage, scoreCommunity, scoreReferral });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/UNIQUE/i.test(msg)) {
        return NextResponse.json({ error: "Ezt a becenevet már használják. Válassz másikat." }, { status: 409 });
      }
      throw err;
    }
    await logAiRateLimit("leaderboard", ipHash);

    const rank = await rankForScore("overall", score);
    return NextResponse.json({ ok: true, rank, nickname }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/leaderboard POST", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}

/** DELETE /api/leaderboard — kilépés a ranglistáról (token alapján). */
export async function DELETE(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { clientToken?: string };
    const clientToken = typeof body.clientToken === "string" ? body.clientToken.trim() : "";
    if (!clientToken) return NextResponse.json({ error: "Hiányzó token." }, { status: 400 });
    await deleteLeaderboardEntry(clientToken);
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/leaderboard DELETE", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
