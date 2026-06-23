"use client";

import { useEffect, useState } from "react";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { getDailyWord, hasDailyWord, ttsLang, type DailyWord } from "@/lib/napi-szo";

/**
 * NapiSzoCard — „Napi szó": napi nyelvjárási kifejezés a kezdőlapon, a napi
 * szokás tartalom-horga. Ország-tudatos (CH=Mundart, AT=osztrák), determinisztikus
 * a nap sorszámából. Hang böngésző-TTS-sel; csak az élő nyelvi országoknak (CH/AT)
 * jelenik meg. Hidratálás-biztos: mount előtt nem renderel.
 */
export function NapiSzoCard() {
  const [prefCountry] = usePreferredCountry();
  const [word, setWord] = useState<DailyWord | null>(null);
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const [canSpeak, setCanSpeak] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const c = prefCountry ?? DEFAULT_COUNTRY;
    setCountry(c);
    if (!hasDailyWord(c)) {
      setWord(null);
      return;
    }
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    setWord(getDailyWord(c, dayIndex));
    try {
      setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    } catch {
      setCanSpeak(false);
    }
  }, [prefCountry]);

  function speak() {
    if (!word) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.word.replace(/\s*\/\s*/g, ", "));
      u.lang = ttsLang(country);
      u.rate = 0.9;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  }

  if (!word) return null;
  const flag = getCountry(country)?.flag ?? "🇨🇭";

  return (
    <div className="rounded-card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          {flag} Napi szó
        </span>
        <span className="text-[11px] font-semibold text-ink-faint">{word.hu}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[22px] font-extrabold tracking-tight text-ink">{word.word}</p>
          <p className="text-[12.5px] text-ink-muted">
            <span className="font-semibold">[{word.phonetic}]</span>
            <span className="mx-1.5 text-ink-faint">·</span>
            <span>{word.standard}</span>
          </p>
        </div>
        {canSpeak && (
          <button
            type="button"
            onClick={speak}
            aria-label="Hallgasd meg"
            className={
              "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-card transition active:scale-95 " +
              (speaking ? "animate-pulse" : "")
            }
          >
            <span className="text-lg">🔊</span>
          </button>
        )}
      </div>

      {word.note && (
        <p className="mt-2.5 rounded-xl bg-surface-alt/60 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
          💡 {word.note}
        </p>
      )}
    </div>
  );
}
