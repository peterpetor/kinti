"use client";

import { trackAction } from "@/components/usage-tracker";

/**
 * TelegramBotCard — a Kinti Telegram-bot (@KintiSzaknevsorBot) promója.
 * A bot a Szaknévsort viszi a magyar expat-csoportokba: inline módban
 * (@botnév fodrász Graz) bármely chatben működik, hozzáadás nélkül.
 * Kattintás-mérés: telegram-bot-open.
 */
export function TelegramBotCard() {
  return (
    <a
      href="https://t.me/KintiSzaknevsorBot"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackAction("telegram-bot-open")}
      className="flex items-center gap-3 rounded-card border border-info/25 bg-info/5 px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-info text-[19px] text-white">🤖</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
          Keress Telegramból is — Kinti bot
        </span>
        <span className="block text-[11.5px] leading-snug text-ink-muted">
          Írd be bármelyik csoportban: <strong>@KintiSzaknevsorBot fodrász Graz</strong> — azonnal hozza a magyar szakikat.
        </span>
      </span>
      <span className="shrink-0 rounded-pill bg-info px-3 py-1.5 text-[11.5px] font-extrabold text-white">Megnyitás</span>
    </a>
  );
}
