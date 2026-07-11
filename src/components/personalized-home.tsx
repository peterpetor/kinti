"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon, SectionHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { usePreferredCanton } from "@/lib/canton-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { getRegions } from "@/lib/regions";
import { trackAction } from "@/components/usage-tracker";
import {
  PERSONALIZE_KEY,
  PERSONALIZE_DISMISS_KEY,
  STAGE_OPTIONS,
  FOCUS_OPTIONS,
  parsePersonalizeProfile,
  buildPersonalizedItems,
  type PersonalizeProfile,
  type PersonalizeStage,
  type PersonalizeFocus,
} from "@/lib/personalize";

/**
 * PersonalizedHome — „Személyre szabott irányítópult" a kezdőlapon.
 *
 * Új felhasználónak 2-3 gyors kérdés (életszakasz → fókusz → régió, ha még
 * nincs), utána a kártya helyén rád-hangolt gyorslinkek („Neked ajánljuk").
 * Minden jel kliensoldali (localStorage) — a szerver nem tud a felhasználóról
 * (privacy-elv). A régió-választás a közös canton-prefbe ír, így az aktivációs
 * checklist régió-lépését is teljesíti (nem két külön kérdés).
 */
export function PersonalizedHome() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<PersonalizeProfile | null>(null);
  const [dismissed, setDismissed] = useState(true); // amíg nem tudjuk, ne villanjon
  const [editing, setEditing] = useState(false);

  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const [canton, setCanton] = usePreferredCanton();

  // Varázsló-állapot
  const [stage, setStage] = useState<PersonalizeStage | null>(null);
  const [focus, setFocus] = useState<PersonalizeFocus | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      setProfile(parsePersonalizeProfile(localStorage.getItem(PERSONALIZE_KEY)));
      setDismissed(localStorage.getItem(PERSONALIZE_DISMISS_KEY) === "1");
    } catch {
      /* private mode → rejtve marad */
    }
  }, []);

  const items = useMemo(
    () => (profile ? buildPersonalizedItems(country, profile.stage, profile.focus) : []),
    [profile, country],
  );

  if (!mounted) return null;

  // ── „Neked ajánljuk" — kész profil, rád-hangolt gyorslinkek ────────────────
  if (profile && !editing) {
    const stageMeta = STAGE_OPTIONS.find((o) => o.id === profile.stage);
    return (
      <section className="space-y-3" aria-label="Neked ajánljuk">
        <SectionHeader
          right={
            <button
              type="button"
              onClick={() => {
                // Újraindítjuk a varázslót az elejéről — így a lépés-számláló
                // akkor is helyes, ha a régió már be van állítva (2 lépés).
                setStage(null);
                setFocus(null);
                setEditing(true);
              }}
              className="text-[13px] font-bold text-primary"
            >
              Módosítás
            </button>
          }
        >
          Neked ajánljuk {stageMeta ? stageMeta.emoji : ""}
        </SectionHeader>
        <div className="space-y-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => trackAction("personalize-click")}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-[19px]">
                {it.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold tracking-[-0.01em] text-ink">{it.title}</span>
                <span className="block text-[12px] leading-snug text-ink-muted">{it.desc}</span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (dismissed && !editing) return null;

  // ── Varázsló — 2-3 gyors kérdés ────────────────────────────────────────────
  const askRegion = !canton;
  const totalSteps = askRegion ? 3 : 2;
  const step = stage === null ? 0 : focus === null ? 1 : 2;

  const dismiss = () => {
    setEditing(false);
    setDismissed(true);
    try {
      localStorage.setItem(PERSONALIZE_DISMISS_KEY, "1");
    } catch { /* ignore */ }
  };

  const save = (s: PersonalizeStage, f: PersonalizeFocus) => {
    const p: PersonalizeProfile = { v: 1, stage: s, focus: f };
    setProfile(p);
    setEditing(false);
    try {
      localStorage.setItem(PERSONALIZE_KEY, JSON.stringify(p));
      localStorage.removeItem(PERSONALIZE_DISMISS_KEY);
    } catch { /* ignore */ }
    trackAction("personalize-done");
  };

  const pickFocus = (f: PersonalizeFocus) => {
    setFocus(f);
    // Ha nincs régió-kérdés, a fókusszal kész is vagyunk.
    if (!askRegion && stage) save(stage, f);
  };

  const regions = getRegions(country);

  return (
    <section
      className="animate-fade-up rounded-card border border-primary/25 bg-primary-soft/50 p-4 shadow-card"
      aria-label="Szabjuk rád a kintit"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Szabjuk rád</p>
          <h2 className="text-[15.5px] font-extrabold tracking-[-0.01em] text-ink">
            {step === 0
              ? "Hol tartasz a kintlétben?"
              : step === 1
                ? "Miben segítsünk most a leginkább?"
                : "Hol élsz? Válassz régiót"}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {step + 1}/{totalSteps} — a kezdőlap a válaszaidra hangolódik. Csak ezen az eszközön tároljuk.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Személyre szabás kihagyása"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-ink-muted active:scale-90"
        >
          <Icon name="close" size={13} strokeWidth={2.4} />
        </button>
      </div>

      {step === 0 && (
        <div className="mt-3 space-y-1.5">
          {STAGE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setStage(o.id)}
              className="flex w-full items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3 py-2.5 text-left transition active:scale-[0.99] hover:border-primary/40"
            >
              <span className="text-[18px]" aria-hidden>{o.emoji}</span>
              <span className="text-[13.5px] font-bold text-ink">{o.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {FOCUS_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => pickFocus(o.id)}
              className={cn(
                "flex items-center gap-2 rounded-[12px] border border-line bg-surface px-3 py-2.5 text-left transition active:scale-[0.98] hover:border-primary/40",
                o.id === "nyelv" && "col-span-2",
              )}
            >
              <span className="text-[17px]" aria-hidden>{o.emoji}</span>
              <span className="text-[12.5px] font-bold leading-tight text-ink">{o.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <>
          <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {regions.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => {
                  setCanton(r.code);
                  if (stage && focus) save(stage, focus);
                }}
                className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95 hover:border-primary/40 hover:text-primary"
              >
                {r.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => stage && focus && save(stage, focus)}
            className="mt-2 text-[12px] font-bold text-ink-muted underline-offset-2 hover:underline"
          >
            Kihagyom most
          </button>
        </>
      )}
    </section>
  );
}
