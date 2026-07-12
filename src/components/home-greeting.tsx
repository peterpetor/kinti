"use client";

import { useEffect, useState } from "react";

/**
 * HomeGreeting — napszak-függő köszöntés a kezdőlap fejléce alatt (natív app
 * melegség, mint a banki appok „Good morning"-ja). CLS-mentes: fix magasságú
 * sor, az SSR a semleges „Szia!"-t adja, mount után vált a napszak-változatra
 * (az óra kliens-oldali — a szerver nem ismeri az időzónád).
 */
function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 10) return "Jó reggelt! ☕";
  if (hour >= 10 && hour < 18) return "Szép napot! 👋";
  if (hour >= 18 && hour < 22) return "Jó estét! 🌆";
  return "Jó éjszakát! 🌙";
}

export function HomeGreeting() {
  const [text, setText] = useState("Szia! 👋");
  useEffect(() => {
    setText(greetingFor(new Date().getHours()));
  }, []);
  return (
    <p className="h-5 text-[13.5px] font-semibold text-ink-muted">
      {text} <span className="text-ink-faint">Mit intézzünk ma?</span>
    </p>
  );
}
