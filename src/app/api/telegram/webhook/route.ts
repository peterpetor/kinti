import { NextResponse } from "next/server";
import { getDB, getCloudflareEnv } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getCategories, recordUsage } from "@/lib/repo";
import {
  parseBotQuery,
  formatBotReply,
  businessProfileUrl,
  escapeTgHtml,
  BOT_HELP_TEXT,
  BOT_NEEDS_PLACE_TEXT,
  BOT_UNPARSED_TEXT,
  type BotBusiness,
  type BotParse,
} from "@/lib/telegram-bot";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook — a Kinti Telegram-bot webhookja.
 *
 * A magyar expat-csoportok Telegramon élnek — a bot odaviszi a Szaknévsort:
 *   • privát chat / csoport-parancs: „/kinti villanyszerelő Bécs" → top 3 találat
 *   • INLINE mód: bármely csoportban „@<botnév> fodrász Graz" — a bot hozzáadása
 *     nélkül is működik (ez a fő terjedési út).
 *
 * Elvek: heurisztika-parse (AI nélkül, determinisztikus); kontakt-adat SOHA nem
 * megy ki (anti-scraping — profil-link visz az appba); a szerver semmit nem tárol
 * a chatből (privacy — csak a rate-limit kulcs: tg:<user_id>).
 *
 * Hitelesítés: a setWebhook-nál megadott secret_token-t a Telegram minden
 * kérésben visszaküldi — enélkül 401. Mindig 200-at adunk vissza a feldolgozott
 * update-ekre (különben a Telegram újra-küldene).
 */

interface TgUpdate {
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; is_bot?: boolean };
  };
  inline_query?: {
    id: string;
    query: string;
    from: { id: number };
  };
}

interface BizRow {
  id: string;
  name: string;
  category_label: string | null;
  canton_code: string | null;
  rating: number | null;
  reviews: number | null;
  featured: number;
}

async function tgApi(token: string, method: string, payload: unknown): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`telegram ${method}: ${res.status} ${body.slice(0, 200)}`);
  }
}

/** Top találatok a Szaknévsorból — kontakt-mezők NÉLKÜL (anti-scraping). */
async function findBusinesses(parsed: BotParse, limit = 3): Promise<{ items: BotBusiness[]; countryWide: boolean }> {
  const run = async (withRegion: boolean): Promise<BizRow[]> => {
    const binds: unknown[] = [parsed.country];
    let where = "COALESCE(country_code,'CH') = ? AND moderation_status = 1 AND COALESCE(hidden,0) = 0";
    if (parsed.categoryId) { where += " AND category_id = ?"; binds.push(parsed.categoryId); }
    if (withRegion && parsed.cantonCode) { where += " AND canton_code = ?"; binds.push(parsed.cantonCode); }
    binds.push(limit);
    const { results } = await getDB()
      .prepare(
        `SELECT id, name, category_label, canton_code, rating, reviews, COALESCE(featured,0) AS featured
         FROM businesses WHERE ${where}
         ORDER BY COALESCE(featured,0) DESC, COALESCE(rating,0) DESC, COALESCE(reviews,0) DESC
         LIMIT ?`,
      )
      .bind(...binds)
      .all<BizRow>();
    return results ?? [];
  };

  let rows = await run(true);
  let countryWide = false;
  // Régióban üres → országos fallback (jelöljük a válaszban — őszinte copy).
  if (rows.length === 0 && parsed.cantonCode) {
    rows = await run(false);
    countryWide = rows.length > 0;
  }
  return {
    items: rows.map((r) => ({
      id: r.id, name: r.name, categoryLabel: r.category_label,
      cantonCode: r.canton_code, rating: r.rating, reviews: r.reviews,
      featured: Number(r.featured) === 1,
    })),
    countryWide,
  };
}

/** A parancs/mention lehántása: „/kinti@KintiBot fodrász Graz" → „fodrász Graz". */
function stripCommand(text: string): { isCommand: boolean; isHelp: boolean; query: string } {
  const t = text.trim();
  const m = t.match(/^\/(start|help|kinti)(@\w+)?\s*/i);
  if (m) {
    const cmd = m[1].toLowerCase();
    return { isCommand: true, isHelp: cmd === "start" || cmd === "help", query: t.slice(m[0].length).trim() };
  }
  // Mention-prefix (csoportban a bot @nevével szólítva)
  const mention = t.match(/^@\w+\s+/);
  if (mention) return { isCommand: true, isHelp: false, query: t.slice(mention[0].length).trim() };
  return { isCommand: false, isHelp: false, query: t };
}

export async function POST(req: Request) {
  try {
    const env = getCloudflareEnv();
    const token = env.TELEGRAM_BOT_TOKEN;
    const secret = env.TELEGRAM_WEBHOOK_SECRET;
    if (!token || !secret) {
      return NextResponse.json({ error: "not-configured" }, { status: 503 });
    }
    if (req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const update = (await req.json().catch(() => ({}))) as TgUpdate;

    // ── Inline mód: „@botnév fodrász Graz" bármely csoportban ────────────────
    if (update.inline_query) {
      const q = update.inline_query.query.trim();
      const results: unknown[] = [];
      if (q.length >= 3) {
        const rl = await checkAiRateLimit("telegram-bot", `tg:${update.inline_query.from.id}`);
        if (rl.allowed) {
          await logAiRateLimit("telegram-bot", `tg:${update.inline_query.from.id}`);
          // Anonim napi számláló a heti ops-reporthoz (nincs user-adat).
          await recordUsage("action:telegram-query");
          const categories = await getCategories();
          const outcome = parseBotQuery(q, categories);
          if (outcome.parsed) {
            const { items } = await findBusinesses(outcome.parsed);
            for (const b of items) {
              results.push({
                type: "article",
                id: b.id.slice(0, 60),
                title: b.name,
                description: [b.categoryLabel, b.rating ? `⭐ ${b.rating.toFixed(1)}` : null].filter(Boolean).join(" · "),
                input_message_content: {
                  message_text: `<b>${escapeTgHtml(b.name)}</b>${b.categoryLabel ? ` — ${escapeTgHtml(b.categoryLabel)}` : ""}\n${businessProfileUrl(b.id)}`,
                  parse_mode: "HTML",
                },
              });
            }
          }
        }
      }
      await tgApi(token, "answerInlineQuery", {
        inline_query_id: update.inline_query.id,
        results,
        cache_time: 300,
        // Üres panelnél az inline-válasz nem tud szöveget mutatni — a gomb ad
        // kiutat: privátra vált és a /start súgót adja (példa-querykkel).
        ...(results.length === 0 && q.length >= 3
          ? { button: { text: "Nincs találat — így keress ✍️", start_parameter: "sugo" } }
          : {}),
      });
      return NextResponse.json({ ok: true });
    }

    // ── Üzenet (privát chat vagy csoport-parancs) ────────────────────────────
    const msg = update.message;
    if (!msg?.text || msg.from?.is_bot) return NextResponse.json({ ok: true });

    const { isCommand, isHelp, query } = stripCommand(msg.text);
    const isPrivate = msg.chat.type === "private";
    // Csoportban csak parancsra/mentionre válaszolunk (a privacy-mód amúgy is
    // csak ezeket kézbesíti); privátban minden szöveg keresés.
    if (!isPrivate && !isCommand) return NextResponse.json({ ok: true });

    const reply = (text: string) =>
      tgApi(token, "sendMessage", {
        chat_id: msg.chat.id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_to_message_id: isPrivate ? undefined : msg.message_id,
      });

    if (isHelp || query.length === 0) {
      await reply(BOT_HELP_TEXT);
      return NextResponse.json({ ok: true });
    }

    const rl = await checkAiRateLimit("telegram-bot", `tg:${msg.from?.id ?? msg.chat.id}`);
    if (!rl.allowed) {
      await reply("Túl sok keresés rövid idő alatt — próbáld újra kicsit később. 🙏");
      return NextResponse.json({ ok: true });
    }
    await logAiRateLimit("telegram-bot", `tg:${msg.from?.id ?? msg.chat.id}`);
    // Anonim napi számláló a heti ops-reporthoz (nincs user-adat).
    await recordUsage("action:telegram-query");

    const categories = await getCategories();
    const outcome = parseBotQuery(query, categories);
    if (!outcome.parsed) {
      await reply(outcome.needsPlace ? BOT_NEEDS_PLACE_TEXT : BOT_UNPARSED_TEXT);
      return NextResponse.json({ ok: true });
    }

    const { items, countryWide } = await findBusinesses(outcome.parsed);
    await reply(formatBotReply(outcome.parsed, items, { countryWideFallback: countryWide }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("api/telegram/webhook", err);
    // 200: a Telegram ne álljon rá az újraküldésre (a hibát mi naplózzuk).
    return NextResponse.json({ ok: false });
  }
}
