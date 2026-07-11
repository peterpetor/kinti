"use client";

/**
 * quiz-battle-board.tsx — „Országok és Régiók Harca" heti versenytábla + badge.
 *
 * Két helyen él: a napi kvíz eredmény-képernyőjén (a WeeklyCompareBanner adja az
 * adatot a percentile-válaszból) és a /ranglista oldalon (QuizBattleSection saját
 * GET-tel). A táblák a szerveren min-minta kapuval készülnek (quiz-battle lib):
 * ha üresek, SEMMI nem renderelődik — ürességet nem reklámozunk. A badge-gomb a
 * user csapatának állásával megosztható szöveget ad (viral kör, ingyen reklám).
 */

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { trackAction } from "@/components/usage-tracker";
import { usePreferredCountry } from "@/lib/country-pref";
import { readPreferredCanton } from "@/lib/canton-pref";
import { getCountry } from "@/lib/countries";
import { getRegions } from "@/lib/regions";
import { battlePlace, type BattleRow } from "@/lib/quiz-battle";

export interface BattleData {
  countries: BattleRow[];
  regions: BattleRow[];
}

/** „a svájci magyarok" — a badge-mondat országos csapat-kifejezése. */
const COUNTRY_TEAM: Record<string, string> = {
  CH: "a svájci magyarok",
  AT: "az ausztriai magyarok",
  DE: "a németországi magyarok",
  NL: "a hollandiai magyarok",
};

const MEDALS = ["🥇", "🥈", "🥉"];

function fmtAvg(avg: number): string {
  return `⌀ ${avg.toFixed(2).replace(".", ",")} pont`;
}

function BattleTable({
  title,
  rows,
  ownKey,
  nameOf,
}: {
  title: string;
  rows: BattleRow[];
  ownKey: string | null;
  nameOf: (key: string) => string;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</p>
      <div className="space-y-1">
        {rows.map((r, i) => {
          const own = ownKey != null && r.key === ownKey;
          return (
            <div
              key={r.key}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2",
                own ? "border-primary/40 bg-primary-soft/50" : "border-line bg-surface",
              )}
            >
              <span className="w-6 shrink-0 text-center text-[13px] font-extrabold text-ink">
                {MEDALS[i] ?? `${i + 1}.`}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink">
                {nameOf(r.key)}
                {own && <span className="ml-1.5 text-[10.5px] font-extrabold text-primary">a te csapatod</span>}
              </span>
              <span className="shrink-0 text-[12.5px] font-extrabold text-ink">{fmtAvg(r.avg)}</span>
              <span className="shrink-0 text-[10.5px] text-ink-faint">{r.plays} játék</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BattleBoard({
  battle,
  country,
  canton,
  score,
}: {
  battle: BattleData;
  country: string;
  /** A user régió-preferenciája (a saját sor kiemeléséhez + badge-hez), vagy null. */
  canton: string | null;
  /** A mai pontszám (a kvíz-eredményről jövet) — a badge-szövegbe kerül. */
  score?: number;
}) {
  const [copied, setCopied] = useState(false);
  const regions = useMemo(() => getRegions(country), [country]);
  const regionName = (code: string) => regions.find((r) => r.code === code)?.name ?? code;
  const countryName = (code: string) => {
    const c = getCountry(code);
    return c ? `${c.flag} ${c.name}` : code;
  };

  const regionPlace = canton ? battlePlace(battle.regions, canton) : null;
  const countryPlace = battlePlace(battle.countries, country);
  if (battle.countries.length === 0 && battle.regions.length === 0) return null;

  // Badge: elsőként a régió-csapat (személyesebb), különben az ország-csapat.
  const badge =
    regionPlace != null && canton
      ? `a pontom ${regionName(canton)} csapatát erősíti a heti Régiók Harcában (most ${regionPlace}. hely)`
      : countryPlace != null
        ? `a pontom ${COUNTRY_TEAM[country] ?? "a csapatom"} javára ment az Országok Harcában (most ${countryPlace}. hely)`
        : null;

  async function shareBadge() {
    if (!badge) return;
    const text =
      score != null
        ? `🏆 ${score}/3 a mai Kinti kvízen — ${badge}! Te melyik csapatot erősíted?`
        : `🏆 ${badge} a Kinti napi kvízben! Te melyik csapatot erősíted?`;
    const url = "https://kinti.app/kviz";
    trackAction("battle-share");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Kinti Kvíz — Régiók Harca", text, url });
        return;
      }
    } catch {
      return; // a user bezárta a megosztót → nem hiba
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard-engedély hiánya — csendben elnyeljük */
    }
  }

  return (
    <section className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <p className="text-[14px] font-extrabold text-ink">⚔️ Országok és Régiók Harca</p>
      <BattleTable title="Országok — e heti állás" rows={battle.countries} ownKey={country} nameOf={countryName} />
      <BattleTable
        title={`Régiók — ${getCountry(country)?.name ?? country}`}
        rows={battle.regions}
        ownKey={canton}
        nameOf={regionName}
      />
      <p className="text-[10.5px] leading-snug text-ink-faint">
        Heti átlagpont, anonim játékokból. Régió-csapatba a Szaknévsorban választott
        {" "}régiód alapján kerülsz.
      </p>
      {badge && (
        <button
          type="button"
          onClick={shareBadge}
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-primary/30 bg-primary-soft/40 px-4 py-2.5 text-[13.5px] font-bold text-primary transition active:scale-[0.98]"
        >
          {copied ? "Kimásolva ✓" : "🏆 Csapat-badge megosztása"}
        </button>
      )}
    </section>
  );
}

/** Önállóan töltő szekció a /ranglista oldalra (score nélküli battle-GET). */
export function QuizBattleSection() {
  const [prefCountry] = usePreferredCountry();
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [canton, setCanton] = useState<string | null>(null);

  useEffect(() => {
    // Az ország-preferencia KÉSVE érkezik — megvárjuk, különben előbb a CH-default
    // országra megy egy felesleges kérés, aztán a valósra még egy (audit #5).
    if (prefCountry === null) return;
    setCanton(readPreferredCanton());
    let cancelled = false;
    fetch(`/api/kviz/percentile?country=${encodeURIComponent(prefCountry)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ battle?: BattleData }>) : null))
      .then((d) => {
        if (!cancelled && d?.battle) setBattle(d.battle);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [prefCountry]);

  if (!battle || prefCountry === null) return null;
  return <BattleBoard battle={battle} country={prefCountry} canton={canton} />;
}
