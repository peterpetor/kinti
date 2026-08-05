"use client";

import { useEffect, useMemo, useState } from "react";
import { RangeSlider } from "@/components/ui/range-slider";
import Link from "next/link";
import { Icon, EmptyState } from "@/components/ui";
import { CountryFlag } from "@/components/ui/country-flag";
import { cn } from "@/lib/cn";
import { szam } from "@/lib/szam-format";
import { getCountry } from "@/lib/countries";
import { currencySymbol } from "@/lib/country-examples";
import { suggestedRooms, type BudgetCountry } from "@/lib/budget-plan";
import {
  orszagSor, egyenleg, MEDIAN_GROSS, OSSZEHASONLITO_ORSZAGOK, type OrszagSor,
} from "@/lib/orszag-osszehasonlito";
import {
  ORSZAG_TENYEK, SZEMPONTOK, ertekel, osszPont, csoportosit, type Szempont,
} from "@/lib/hova-koltozzek";

/**
 * HovaKoltozzekMatrix — „Hová költözzek?” döntési mátrix.
 *
 * A számszerű oszlopok (nettó, levonás, lakhatás) a bér-összehasonlító
 * motorjából jönnek (`orszag-osszehasonlito.ts`) — SZÁNDÉKOSAN ugyanaz a
 * számítás, hogy a két felület ne mondjon mást ugyanarra a kérdésre. A kurált
 * tények (állampolgárság, nyelv, határidő) a `hova-koltozzek.ts`-ből.
 *
 * ⚠️ A HIÁNYZÓ ADAT NEM ROSSZ ADAT. Ahol a saját cikkeink nem mondanak ki egy
 * tényt, ott „nincs adatunk” áll, és az a szempont KIMARAD az adott ország
 * átlagából — nem nullaként húzza le. A felület ezt ki is írja, hogy a rangsor
 * ne tűnjön többnek, mint amennyi.
 */

interface CmpApi {
  rooms: number;
  countries: { country_code: string; median_rent: number; entry_count: number }[];
}

const ROOMS = suggestedRooms(1, 0);

export function HovaKoltozzekMatrix() {
  const [szazalek, setSzazalek] = useState(100);
  const [valasztott, setValasztott] = useState<Szempont[]>(["megtakaritas", "ketto_allampolgarsag"]);
  const [adat, setAdat] = useState<CmpApi | null>(null);
  const [hiba, setHiba] = useState(false);
  const [nyitott, setNyitott] = useState<string | null>(null);

  useEffect(() => {
    let el = true;
    fetch(`/api/koltsegvetes?country=CH&compare=1&rooms=${ROOMS}`)
      .then((r) => (r.ok ? (r.json() as Promise<CmpApi>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => el && setAdat(d))
      .catch(() => el && setHiba(true));
    return () => {
      el = false;
    };
  }, []);

  const sorok = useMemo(() => {
    if (!adat) return [];
    const map = new Map(adat.countries.map((c) => [c.country_code, c]));
    return OSSZEHASONLITO_ORSZAGOK.map((c) => {
      const r = map.get(c);
      const sor = orszagSor(c as BudgetCountry, szazalek, r?.median_rent ?? null, r?.entry_count ?? 0);
      const szamok = {
        maradPct: sor.arany.marad,
        alberletPct: sor.arany.lakhatas,
        nettoArany: sor.gross > 0 ? sor.net / sor.gross : 0,
      };
      return { sor, szamok, pont: osszPont(valasztott, c as BudgetCountry, szamok) };
    })
      .filter((x) => !x.sor.keves)
      .sort((a, b) => (b.pont.pont ?? -1) - (a.pont.pont ?? -1));
  }, [adat, szazalek, valasztott]);

  // Két csoport, nem egy rangsor — az indoklás a `csoportosit` fejlécében.
  const { rangsorolhato: teljes, hianyos } = csoportosit(sorok);

  function kapcsol(id: Szempont) {
    setValasztott((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }

  if (hiba) {
    // ⚠️ A hiba-állapot is a KÖZÖS formanyelvet viseli (ikon-halo + cím +
    // leírás), mint minden „nincs itt semmi" pillanat — eddig egyedi szürke
    // szövegdoboz volt. És ami fontosabb: ad KIUTAT. Egy zsákutcás hibaüzenet
    // ugyanolyan rossz, mint a hibátlan üres lista.
    return (
      <EmptyState
        icon="alert"
        tone="accent"
        title="Az összehasonlítás most nem érhető el"
        description="Az élő lakbér- és bér-adat nem jött meg. Próbáld újra — vagy nézd meg addig a témánkénti táblázatokat."
        action={{ label: "Újra", onClick: () => window.location.reload() }}
        secondary={
          <Link href="/tudasbazis/osszehasonlitas" className="font-bold text-ink underline underline-offset-2">
            Témánkénti összehasonlítás
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Mi fontos neked? ──────────────────────────────────────────── */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">Mi fontos neked?</h2>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
          Koppints a szempontokra — a sorrend ezek alapján áll össze.
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {SZEMPONTOK.map((sz) => {
            const aktiv = valasztott.includes(sz.id);
            return (
              <li key={sz.id}>
                <button
                  type="button"
                  aria-pressed={aktiv}
                  onClick={() => kapcsol(sz.id)}
                  title={sz.magyarazat}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition active:scale-95",
                    aktiv ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink",
                  )}
                >
                  {sz.emoji} {sz.label}
                </button>
              </li>
            );
          })}
        </ul>
        {valasztott.length === 0 && (
          <p className="mt-2 text-[11.5px] font-semibold text-accent">
            Válassz legalább egy szempontot — enélkül nincs mit rangsorolni.
          </p>
        )}
      </section>

      {/* ── 2. Jövedelem-szint ───────────────────────────────────────────── */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label htmlFor="hk-slider" className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-bold text-ink">Milyen jól keresel?</span>
          <span className="text-[13px] font-extrabold tabular-nums text-primary">
            a helyi átlag {szazalek}%-a
          </span>
        </label>
        <RangeSlider
          id="hk-slider"
          min={50}
          max={250}
          step={5}
          value={szazalek}
          onChange={(e) => setSzazalek(Number(e.target.value))}
          className="mt-2 h-6 w-full cursor-pointer accent-primary"
        />
        <p className="text-[11px] leading-snug text-ink-faint">
          A helyi átlaghoz mérünk, mert három pénznem van: ez Németországban{" "}
          {szam(Math.round((MEDIAN_GROSS.DE * szazalek) / 100))} € bruttó, Svájcban{" "}
          {szam(Math.round((MEDIAN_GROSS.CH * szazalek) / 100))} CHF.
        </p>
      </section>

      {/* ── 3. A rangsor ─────────────────────────────────────────────────── */}
      {!adat ? (
        <div className="space-y-2.5" aria-busy="true">
          <span className="sr-only">Összehasonlítás betöltése…</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="kinti-shimmer h-[86px] w-full rounded-card bg-ink/10" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {teljes.map((x, i) => (
            <OrszagKartya
              key={x.sor.country}
              helyezes={valasztott.length > 0 ? i + 1 : null}
              sor={x.sor}
              szamok={x.szamok}
              pont={x.pont}
              szempontok={valasztott}
              nyitott={nyitott === x.sor.country}
              onToggle={() => setNyitott((n) => (n === x.sor.country ? null : x.sor.country))}
            />
          ))}

          {hianyos.length > 0 && (
            <>
              <p className="px-1 pt-1.5 text-[11.5px] font-bold leading-snug text-ink-muted">
                Nem rangsoroljuk — hiányos adat
                {/* „mind a 1 szempontot" magyartalan — szám nélkül fogalmazunk. */}
                <span className="block font-medium text-ink-faint">
                  Ezekhez az országokhoz nem tudunk minden szempontot értékelni, ezért nem állítjuk őket sorba
                  a többivel. Ez nem jelenti, hogy rosszabbak.
                </span>
              </p>
              {hianyos.map((x) => (
                <OrszagKartya
                  key={x.sor.country}
                  helyezes={null}
                  sor={x.sor}
                  szamok={x.szamok}
                  pont={x.pont}
                  szempontok={valasztott}
                  nyitott={nyitott === x.sor.country}
                  onToggle={() => setNyitott((n) => (n === x.sor.country ? null : x.sor.country))}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── 4. Amit tudni kell a rangsorról ──────────────────────────────── */}
      <section className="space-y-1.5 rounded-card border border-line bg-surface-alt px-4 py-3 text-[11.5px] leading-snug text-ink-muted">
        <p>
          <strong className="text-ink">Ez nem tanács, hanem kiindulópont.</strong> Egyszemélyes háztartással,{" "}
          {ROOMS} szobás albérlettel számolunk. A lakbér a közösségi beküldések mediánja, a megélhetés tipikus
          referencia-szint — a te helyzeted ettől eltérhet.
        </p>
        <p>
          <strong className="text-ink">A „nincs adatunk” nem rossz jegy.</strong> Azt jelenti, hogy a saját
          cikkeink azt a tényt nem mondják ki. Az ilyen ország nem kap rosszabb helyezést — de jobbat sem:
          kivesszük a rangsorból, és külön mutatjuk. Nem tippelünk értéket.
        </p>
        <p>
          Az állampolgársági és nyelvi adatok a saját útmutatóinkból származnak, és a jogszabályok változnak.
          Honosítás előtt kérj személyre szabott jogi tanácsot.
        </p>
      </section>
    </div>
  );
}

function OrszagKartya({
  helyezes, sor, szamok, pont, szempontok, nyitott, onToggle,
}: {
  helyezes: number | null;
  sor: OrszagSor;
  szamok: { maradPct: number; alberletPct: number; nettoArany: number };
  pont: { pont: number | null; ertekelt: number; ossz: number };
  szempontok: Szempont[];
  nyitott: boolean;
  onToggle: () => void;
}) {
  const o = getCountry(sor.country);
  const t = ORSZAG_TENYEK[sor.country];
  const eg = egyenleg(sor);
  const jel = currencySymbol(sor.currency);
  const hianyzo = pont.ossz - pont.ertekelt;

  return (
    <article className="rounded-card border border-line bg-surface shadow-card">
      <button type="button" onClick={onToggle} aria-expanded={nyitott} className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
        {helyezes != null && (
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-extrabold",
              helyezes === 1 ? "bg-primary text-white" : "bg-surface-alt text-ink-muted",
            )}
          >
            {helyezes}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[14px] font-extrabold tracking-[-0.01em] text-ink">
            {/* ⚠️ SVG-zászló, NEM a `flag` emoji: Anglia zászlaja tag-sequence,
                amihez a legtöbb Android/Windows fontban nincs glyph — a listában
                emiatt egyedül Anglia állt zászló NÉLKÜL. */}
            <CountryFlag code={sor.country} className="h-[13px] w-[19px]" />
            {o?.name ?? sor.country}
          </span>
          <span className="block text-[11.5px] text-ink-muted">
            {eg >= 0 ? "~" : "−"}
            {szam(Math.abs(eg))} {jel} marad · {t.allampolgarsagEv != null ? `${t.allampolgarsagEv} év állampolgárság` : "állampolgárság: nincs adatunk"}
          </span>
        </span>
        <Icon name="chevD" size={15} strokeWidth={2.4} className={cn("shrink-0 text-ink-faint transition-transform", nyitott && "rotate-180")} />
      </button>

      {/* A választott szempontok teljesülése — mindig látszik, nem csak nyitva.
          ⚠️ RÁCS, NEM TÖRDELT PIRULA-SOR. A pirulák szélessége a szövegtől
          függött, ezért Ausztria „41%”-a és Németország „39%”-a MÁS x-pozícióra
          került, a harmadik érték pedig külön sorba csúszott. Egy összehasonlító
          képernyőn ez a lényeget veszi el: összevetni csak azt lehet, ami egy
          vonalban van. Fix oszlopok + `tabular-nums` + azonos hosszúságú
          mérce-sáv → a szem végig tud futni a kártyákon. */}
      {szempontok.length > 0 && (
        <ul
          className="grid gap-x-3 gap-y-2 px-4 pb-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(szempontok.length, 3)}, minmax(0, 1fr))` }}
        >
          {szempontok.map((sz) => {
            const e = ertekel(sz, sor.country, szamok);
            const meta = SZEMPONTOK.find((m) => m.id === sz)!;
            const nincs = e.pont == null;
            // Három sávos állapot — ugyanaz a küszöb, mint eddig a pirula-színnél.
            const sav = nincs ? "nincs" : e.pont! >= 0.66 ? "jo" : e.pont! >= 0.33 ? "kozepes" : "gyenge";
            return (
              <li key={sz} className="min-w-0">
                <span className="flex items-baseline gap-1 truncate text-[10px] font-bold uppercase tracking-[0.04em] text-ink-faint">
                  <span aria-hidden="true">{meta.emoji}</span>
                  <span className="truncate">{meta.rovid}</span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[12.5px] font-extrabold tabular-nums",
                    nincs ? "text-ink-faint" : "text-ink",
                  )}
                >
                  {e.rovidErtek}
                </span>
                {/* Mérce-sáv: azonos hosszon fut minden kártyán, ezért a
                    kitöltöttsége ránézésre összevethető. Hiányzó adatnál
                    SZÁNDÉKOSAN nincs sáv — a 0 hosszúságú sáv „mértük, és
                    rossz”-at jelentene. */}
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-ink/10">
                  {!nincs && (
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        sav === "jo" ? "bg-success" : sav === "kozepes" ? "bg-star" : "bg-accent",
                      )}
                      style={{ width: `${Math.max(6, Math.round(e.pont! * 100))}%` }}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {hianyzo > 0 && (
        <p className="px-4 pb-3 text-[10.5px] leading-snug text-ink-faint">
          {hianyzo} szempontot nem tudtunk értékelni — ezért nem rangsoroljuk ezt az országot a többivel.
        </p>
      )}

      {nyitott && (
        <dl className="space-y-1.5 border-t border-line px-4 py-3">
          <Sor cimke="Bruttó (a csúszka szerint)" ertek={`${szam(sor.gross)} ${jel}`} />
          <Sor cimke="Nettó" ertek={`${szam(sor.net)} ${jel}`} />
          <Sor cimke="Levonás a bruttóból" ertek={`${Math.round((1 - szamok.nettoArany) * 100)}%`} />
          <Sor cimke="Albérlet + rezsi" ertek={`${szam(sor.osszeg.lakhatas)} ${jel}`} />
          <Sor cimke="Megélhetés" ertek={`${szam(sor.osszeg.megelhetes)} ${jel}`} />
          {sor.osszeg.biztositas > 0 && (
            <Sor cimke="Egészségbiztosítás" ertek={`${szam(sor.osszeg.biztositas)} ${jel}`} />
          )}
          <div className="my-1 border-t border-line/60" />
          <Sor
            cimke="Állampolgárság"
            ertek={t.allampolgarsagEv != null ? `${t.allampolgarsagEv} év${t.allampolgarsagJegyzet ? ` (${t.allampolgarsagJegyzet})` : ""}` : "nincs adatunk"}
          />
          <Sor
            cimke="Magyar megtartható?"
            ertek={t.kettosAllampolgarsag == null ? "nincs adatunk" : t.kettosJegyzet ?? (t.kettosAllampolgarsag ? "igen" : "nem")}
          />
          <Sor cimke="Tartós tartózkodás" ertek={t.letelepedesEv != null ? `${t.letelepedesEv} év` : "nincs adatunk"} />
          <Sor cimke="Nyelvvizsga a honosításhoz" ertek={t.nyelvSzint ?? "nincs adatunk"} />
          <Sor cimke="Lakcím-bejelentkezés" ertek={t.bejelentkezesHatarido ?? "nincs adatunk"} />
          <Sor cimke="Lakbér-minta" ertek={`${sor.rentMinta} beküldés`} />

          <Link
            href={`/tudasbazis/${t.forrasSlug}`}
            className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-primary underline underline-offset-2"
          >
            {o?.name ?? sor.country} — a teljes útmutató
            <Icon name="chevR" size={13} strokeWidth={2.6} />
          </Link>
        </dl>
      )}
    </article>
  );
}

function Sor({ cimke, ertek }: { cimke: string; ertek: string }) {
  const nincs = ertek === "nincs adatunk";
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="min-w-0 flex-1 text-[12px] text-ink-muted">{cimke}</dt>
      <dd className={cn("shrink-0 text-[12px] font-bold tabular-nums", nincs ? "text-ink-faint" : "text-ink")}>{ertek}</dd>
    </div>
  );
}
