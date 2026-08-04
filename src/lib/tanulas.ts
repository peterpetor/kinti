/**
 * tanulas.ts — ismétlő (spaced repetition) tároló.
 *
 * Leitner-dobozos ütemezés: minden kártya (kvízkérdés vagy napi szó) egy
 * 0..5 dobozban ül. Rossz válasz visszadobja a 0. dobozba (holnap újra jön),
 * jó válasz eggyel feljebb tolja, és egyre ritkábban kerül elő.
 *
 * ⚠️ SZERVERRE SEMMI NEM MEGY. A Kintinek nincs per-user azonosítója
 * (lásd privacy-no-server-identity), ezért a teljes tanulási előzmény a
 * böngésző localStorage-ában él — ugyanúgy, mint a Saját Gyűjtemény
 * (`bookmarks.ts`). Cache-törléssel elveszik; ezt a felületen ki is írjuk.
 */

export type CardKind = "quiz" | "word";

export interface LearnCard {
  kind: CardKind;
  /** Melyik bankból való — pl. „polg-CH", „kviz-AT", „szo-DE". */
  bank: string;
  /** A kérdés id-je, illetve szónál maga a szó. */
  id: string;
  /** Leitner-doboz: 0 = frissen elrontva, 5 = rég tudod. */
  box: number;
  /** Mikor esedékes újra (epoch-nap). */
  due: number;
  /** Hányszor találkoztál vele. */
  seen: number;
  /** Hányszor rontottad el. */
  wrong: number;
}

const KEY = "kinti.tanulas.v1";
/** Doboz → hány nap múlva jöjjön elő újra. */
const BOX_NAPOK = [1, 2, 4, 8, 16, 32];
export const MAX_BOX = BOX_NAPOK.length - 1;
/** Ettől a doboztól tekintjük „tudottnak" (3 egymás utáni jó válasz). */
export const MASTERED_BOX = 3;
/** Tárolási plafon — a legrégebben látott kártyák esnek ki elsőként. */
const MAX_CARDS = 2000;

/** A mai nap sorszáma (epoch-nap) — ugyanaz a skála, mint a napi szónál. */
export function today(): number {
  return Math.floor(Date.now() / 86_400_000);
}

export function cardKey(bank: string, id: string): string {
  return `${bank}::${id}`;
}

/*
 * Bank-azonosítók. SZÁNDÉKOSAN ITT vannak, nem a `tanulas-bankok.ts`-ben: a
 * rögzítő oldalak (kvíz-komponensek, napi szó kártya) csak ezt a három
 * függvényt akarják, és nem szabad emiatt behúzniuk a teljes kérdésbankot.
 */
export function polgBank(country: string): string {
  return `polg-${country}`;
}
export function kvizBank(country: string): string {
  return `kviz-${country}`;
}
export function szoBank(country: string): string {
  return `szo-${country}`;
}

function ervenyes(c: unknown): c is LearnCard {
  if (!c || typeof c !== "object") return false;
  const x = c as Record<string, unknown>;
  return (
    (x.kind === "quiz" || x.kind === "word") &&
    typeof x.bank === "string" &&
    x.bank.length > 0 &&
    typeof x.id === "string" &&
    x.id.length > 0 &&
    typeof x.box === "number" &&
    Number.isFinite(x.box) &&
    typeof x.due === "number" &&
    Number.isFinite(x.due)
  );
}

/**
 * Beolvasás. SOHA nem dob: a localStorage-t a felhasználó is szerkesztheti, és
 * egy korábbi verzió más alakot írhatott — a sérült sorokat csendben eldobjuk.
 */
export function readCards(): LearnCard[] {
  if (typeof window === "undefined") return [];
  try {
    const nyers = window.localStorage.getItem(KEY);
    if (!nyers) return [];
    const p: unknown = JSON.parse(nyers);
    if (!Array.isArray(p)) return [];
    return p.filter(ervenyes).map((c) => ({
      ...c,
      box: Math.min(MAX_BOX, Math.max(0, Math.round(c.box))),
      seen: Number.isFinite(c.seen) ? c.seen : 1,
      wrong: Number.isFinite(c.wrong) ? c.wrong : 0,
    }));
  } catch {
    return [];
  }
}

function write(list: LearnCard[]): void {
  if (typeof window === "undefined") return;
  try {
    // Plafon: a legkésőbb esedékesek (= legrégebb óta tudottak) esnek ki.
    const mentendo = list.length > MAX_CARDS ? [...list].sort((a, b) => a.due - b.due).slice(0, MAX_CARDS) : list;
    window.localStorage.setItem(KEY, JSON.stringify(mentendo));
    window.dispatchEvent(new CustomEvent("kinti:tanulas"));
  } catch {
    /* tele a tároló / privát mód — a tanulás ettől még működik, csak nem őrződik meg */
  }
}

/**
 * Egy válasz rögzítése. Jó válasznál feljebb lép a doboz, rossznál vissza a
 * nullába — ez a lényeg: az elrontott kérdés HOLNAP újra elő fog jönni.
 */
export function recordAnswer(kind: CardKind, bank: string, id: string, helyes: boolean): void {
  const lista = readCards();
  const k = cardKey(bank, id);
  const i = lista.findIndex((c) => cardKey(c.bank, c.id) === k);
  const elozo = i >= 0 ? lista[i] : null;
  // A doboz száma = HÁNY egymás utáni helyes válasz van rá. Új kártya 0-ról
  // indul, így az első helyes válasz 1-be viszi — a felületen ígért
  // „MASTERED_BOX egymás utáni helyes válasz" ettől lesz szó szerint igaz.
  const box = helyes ? Math.min(MAX_BOX, (elozo?.box ?? 0) + 1) : 0;
  const kartya: LearnCard = {
    kind,
    bank,
    id,
    box,
    due: today() + BOX_NAPOK[box],
    seen: (elozo?.seen ?? 0) + 1,
    wrong: (elozo?.wrong ?? 0) + (helyes ? 0 : 1),
  };
  if (i >= 0) lista[i] = kartya;
  else lista.push(kartya);
  write(lista);
}

/** A ma (vagy korábban) esedékes kártyák — a nehezebbek elöl. */
export function dueCards(nap: number = today()): LearnCard[] {
  return readCards()
    .filter((c) => c.due <= nap)
    .sort((a, b) => a.box - b.box || b.wrong - a.wrong || a.due - b.due);
}

export interface BankStat {
  bank: string;
  /** Hány kérdést/szót láttál már ebből a bankból. */
  seen: number;
  /** Ebből hányat tudsz stabilan (box ≥ MASTERED_BOX). */
  mastered: number;
  /** A bank teljes mérete (a hívó adja — a bank-modult lustán töltjük). */
  total: number;
  /** Tudás a TELJES bankhoz mérve, százalékban. */
  pct: number;
  /** Ma esedékes ismétlés ebből a bankból. */
  due: number;
}

/**
 * Egy bank tanulási állapota.
 *
 * ⚠️ A százalék a TELJES bankra vonatkozik, nem a látott kérdésekre. Ha a
 * látott kérdésekhez mérnénk, egyetlen helyes válasz után 100%-ot mutatna —
 * ami hazugság, és pont a felhasználó kérte állítást („a kérdések 68%-át
 * tudod") tenné értelmetlenné.
 */
export function bankStat(bank: string, total: number, cards: LearnCard[] = readCards()): BankStat {
  const sajat = cards.filter((c) => c.bank === bank);
  const mastered = sajat.filter((c) => c.box >= MASTERED_BOX).length;
  const nap = today();
  return {
    bank,
    seen: sajat.length,
    mastered,
    total,
    pct: total > 0 ? Math.round((mastered / total) * 100) : 0,
    due: sajat.filter((c) => c.due <= nap).length,
  };
}

/** Teljes törlés (a felületen külön megerősítéssel). */
export function resetLearning(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("kinti:tanulas"));
  } catch {
    /* nincs teendő */
  }
}
