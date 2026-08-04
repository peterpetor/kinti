"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { confirmDialog } from "@/lib/confirm";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import {
  bankStat, dueCards, readCards, recordAnswer, resetLearning,
  MASTERED_BOX, type BankStat, type LearnCard,
} from "@/lib/tanulas";
import type { BankInfo, Flashcard } from "@/lib/tanulas-bankok";

/**
 * TanulasSection — a profil tanulási blokkja: ismétlő kártyák + tudás-statisztika.
 *
 * ⚠️ A kérdésbankok NAGYOK, ezért a `tanulas-bankok` modult DINAMIKUSAN
 * töltjük (lásd a modul fejlécét). A „hány kártya esedékes" szám viszont a
 * kicsi `tanulas.ts`-ből azonnal megvan, így a kártya rögtön értelmeset mutat,
 * és a nehéz chunk csak akkor jön le, ha van mit mutatni vele.
 */
export function TanulasSection() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;

  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<LearnCard[]>([]);
  const [infok, setInfok] = useState<BankInfo[] | null>(null);
  const [ismetlo, setIsmetlo] = useState<Flashcard[] | null>(null);
  const [toltes, setToltes] = useState(false);

  const frissit = useCallback(() => setCards(readCards()), []);

  useEffect(() => {
    setMounted(true);
    frissit();
    window.addEventListener("kinti:tanulas", frissit);
    return () => window.removeEventListener("kinti:tanulas", frissit);
  }, [frissit]);

  // A bank-méretek a statisztikához kellenek — de csak akkor, ha már van mit
  // mérni. Üres előzménynél felesleges lenne behúzni a teljes kérdésbankot.
  useEffect(() => {
    if (!mounted || cards.length === 0 || infok) return;
    let el = true;
    void import("@/lib/tanulas-bankok").then((m) => {
      if (el) setInfok(m.bankInfok(country));
    });
    return () => {
      el = false;
    };
  }, [mounted, cards.length, infok, country]);

  // Ország-váltásnál a bank-méretek is mások.
  useEffect(() => {
    setInfok(null);
  }, [country]);

  async function ismetlestIndit() {
    setToltes(true);
    try {
      const m = await import("@/lib/tanulas-bankok");
      const feloldva = dueCards()
        .map(m.feloldKartya)
        .filter((k): k is Flashcard => k !== null)
        .slice(0, 20);
      if (feloldva.length === 0) {
        // Minden esedékes kártya árva (a kérdés kikerült a bankból) — ne nyíljon
        // üres ismétlő, inkább maradjon a statisztika.
        setIsmetlo(null);
        return;
      }
      haptic("tap");
      setIsmetlo(feloldva);
    } finally {
      setToltes(false);
    }
  }

  if (!mounted) return null;

  const esedekes = cards.filter((c) => c.due <= Math.floor(Date.now() / 86_400_000)).length;

  if (ismetlo) {
    return (
      <IsmetloJatek
        kartyak={ismetlo}
        onKilep={() => {
          setIsmetlo(null);
          frissit();
        }}
      />
    );
  }

  if (cards.length === 0) {
    return (
      <section className="rounded-card border border-line bg-surface px-4 py-4 shadow-card">
        <Fejlec />
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
          Játssz egy kvízt vagy nézd meg a napi szót — az elrontott kérdéseket megjegyezzük, és pár nap
          múlva újra elédhozzuk, amíg meg nem ragadnak.
        </p>
      </section>
    );
  }

  const statok = (infok ?? []).map((b) => ({ info: b, stat: bankStat(b.bank, b.total, cards) }));
  const osszTudott = statok.reduce((s, x) => s + x.stat.mastered, 0);

  return (
    <section className="space-y-3 rounded-card border border-line bg-surface px-4 py-4 shadow-card">
      <Fejlec />

      <button
        type="button"
        onClick={ismetlestIndit}
        disabled={esedekes === 0 || toltes}
        className={cn(
          "flex w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-left transition active:scale-[0.99]",
          esedekes > 0 ? "bg-primary text-white shadow-card" : "cursor-default bg-surface-alt/60 text-ink-muted",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-white/15 text-lg">🔄</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-extrabold tracking-[-0.01em]">
            {toltes ? "Betöltés…" : esedekes > 0 ? `${esedekes} kártya vár ismétlésre` : "Mára nincs ismétlendő"}
          </span>
          <span className={cn("block text-[11.5px]", esedekes > 0 ? "text-white/80" : "text-ink-faint")}>
            {esedekes > 0 ? "Az elrontott kérdéseid és szavaid" : "Gyere vissza holnap — addig pihennek a kártyák."}
          </span>
        </span>
        {esedekes > 0 && <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0" />}
      </button>

      {statok.length > 0 ? (
        <div className="space-y-2.5">
          {statok.map(({ info, stat }) => (
            <BankSor key={info.bank} info={info} stat={stat} />
          ))}
          <p className="pt-0.5 text-[11px] leading-snug text-ink-faint">
            „Tudod" = {MASTERED_BOX} egymás utáni helyes válasz. Eddig {osszTudott} kérdést/szót tudsz stabilan.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5" aria-busy="true">
          <span className="sr-only">Statisztika betöltése…</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="kinti-shimmer mb-1 h-3 w-1/3 rounded-md bg-ink/10" />
              <div className="kinti-shimmer h-1.5 w-full rounded-full bg-ink/10" />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={async () => {
          if (
            await confirmDialog({
              title: "Tanulási előzmény törlése",
              message: "A dobozok és a haladásod is elvesznek. Ez nem vonható vissza.",
              confirmLabel: "Törlés",
              destructive: true,
            })
          ) {
            resetLearning();
          }
        }}
        className="text-[11px] font-semibold text-ink-faint underline underline-offset-2"
      >
        Tanulási előzmény törlése
      </button>
    </section>
  );
}

function Fejlec() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[15px]">🏆</span>
      <h2 className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">Tanulás</h2>
    </div>
  );
}

function BankSor({ info, stat }: { info: BankInfo; stat: BankStat }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-[12px]">{info.emoji}</span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-ink">{info.label}</span>
        <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink">{stat.pct}%</span>
        <span className="shrink-0 text-[10.5px] tabular-nums text-ink-faint">
          {stat.mastered}/{stat.total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
        <div
          className="h-full rounded-full bg-success transition-[width] duration-500"
          style={{ width: `${Math.min(100, stat.pct)}%` }}
        />
      </div>
    </div>
  );
}

/** Az ismétlő játék: egyszerre egy kártya, válasz után azonnali visszajelzés. */
function IsmetloJatek({ kartyak, onKilep }: { kartyak: Flashcard[]; onKilep: () => void }) {
  const [i, setI] = useState(0);
  const [valasz, setValasz] = useState<number | null>(null);
  const [felfedve, setFelfedve] = useState(false);
  const [jok, setJok] = useState(0);

  const k = kartyak[i];
  const utolso = i >= kartyak.length - 1;

  function rogzit(helyes: boolean) {
    recordAnswer(k.kind, k.bank, k.id, helyes);
    if (helyes) setJok((x) => x + 1);
    haptic(helyes ? "success" : "warning");
  }

  function tovabb() {
    if (utolso) {
      onKilep();
      return;
    }
    setI((x) => x + 1);
    setValasz(null);
    setFelfedve(false);
  }

  const kesz = valasz !== null || felfedve;

  return (
    <section className="space-y-3 rounded-card border-2 border-primary/30 bg-surface px-4 py-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="text-[15px]">🔄</span>
        <h2 className="min-w-0 flex-1 text-[14px] font-extrabold tracking-[-0.01em] text-ink">Ismétlés</h2>
        <span className="text-[11.5px] font-bold tabular-nums text-ink-muted">
          {i + 1}/{kartyak.length}
        </span>
        <button type="button" onClick={onKilep} aria-label="Ismétlés bezárása" className="text-ink-faint">
          <Icon name="close" size={16} strokeWidth={2.4} />
        </button>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-surface-alt">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${((i + (kesz ? 1 : 0)) / kartyak.length) * 100}%` }}
        />
      </div>

      <p className="text-[14.5px] font-bold leading-snug text-ink">{k.elol}</p>

      {k.options ? (
        <div className="space-y-2">
          {k.options.map((o, idx) => {
            const jo = kesz && idx === k.correct;
            const rossz = kesz && idx === valasz && idx !== k.correct;
            return (
              <button
                key={idx}
                type="button"
                disabled={kesz}
                onClick={() => {
                  setValasz(idx);
                  rogzit(idx === k.correct);
                }}
                className={cn(
                  "w-full rounded-[12px] border px-3.5 py-2.5 text-left text-[13px] leading-snug transition active:scale-[0.99]",
                  jo && "border-success bg-success/10 font-bold text-ink",
                  rossz && "border-accent bg-accent/10 font-bold text-ink",
                  !jo && !rossz && "border-line bg-surface text-ink",
                )}
              >
                {o}
                {jo && " ✓"}
                {rossz && " ✕"}
              </button>
            );
          })}
        </div>
      ) : !felfedve ? (
        <button
          type="button"
          onClick={() => setFelfedve(true)}
          className="w-full rounded-[12px] bg-primary px-3.5 py-3 text-[13.5px] font-extrabold text-white transition active:scale-[0.99]"
        >
          Mutasd a megoldást
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className="rounded-[12px] border border-line bg-surface-alt/60 px-3.5 py-3">
            <p className="text-[18px] font-extrabold tracking-tight text-ink">{k.hatul}</p>
            {k.reszlet && <p className="mt-0.5 text-[12px] text-ink-muted">{k.reszlet}</p>}
          </div>
          {valasz === null && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValasz(-1);
                  rogzit(false);
                }}
                className="rounded-[12px] border border-accent/40 bg-accent/5 px-3 py-2.5 text-[13px] font-bold text-ink transition active:scale-[0.98]"
              >
                Nem tudtam
              </button>
              <button
                type="button"
                onClick={() => {
                  setValasz(-2);
                  rogzit(true);
                }}
                className="rounded-[12px] border border-success/40 bg-success/10 px-3 py-2.5 text-[13px] font-bold text-ink transition active:scale-[0.98]"
              >
                Tudtam
              </button>
            </div>
          )}
        </div>
      )}

      {kesz && k.options && k.reszlet && (
        <p className="rounded-xl bg-surface-alt/60 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">💡 {k.reszlet}</p>
      )}

      {kesz && valasz !== null && (
        <button
          type="button"
          onClick={tovabb}
          className="w-full rounded-[12px] bg-ink px-3.5 py-3 text-[13.5px] font-extrabold text-surface transition active:scale-[0.99]"
        >
          {utolso ? `Kész — ${jok}/${kartyak.length} helyes` : "Következő"}
        </button>
      )}
    </section>
  );
}
