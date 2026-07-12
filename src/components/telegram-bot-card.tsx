"use client";

import { useEffect, useState } from "react";
import { trackAction } from "@/components/usage-tracker";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/** Ország-illő példa-keresés (user-kérés: Svájcban ne Graz legyen a példa). */
const EXAMPLE_BY_COUNTRY: Record<string, string> = {
  CH: "fodrász Zürich",
  AT: "fodrász Graz",
  DE: "fodrász München",
  NL: "fodrász Rotterdam",
};

/**
 * TelegramBotCard — a Kinti Telegram-bot (@KintiSzaknevsorBot) promója.
 * A bot a Szaknévsort viszi a magyar expat-csoportokba: inline módban
 * (@botnév + keresés) bármely chatben működik, hozzáadás nélkül.
 * Hidratálás-biztos: mount előtt CH-példa (az SSR is azt adja).
 * Kattintás-mérés: telegram-bot-open.
 */
export function TelegramBotCard() {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const example = EXAMPLE_BY_COUNTRY[country] ?? EXAMPLE_BY_COUNTRY[DEFAULT_COUNTRY];

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
          Írd be bármelyik csoportban: <strong>@KintiSzaknevsorBot {example}</strong> — azonnal hozza a magyar szakikat.
        </span>
      </span>
      <span className="shrink-0 rounded-pill bg-info px-3 py-1.5 text-[11.5px] font-extrabold text-white">Megnyitás</span>
    </a>
  );
}
