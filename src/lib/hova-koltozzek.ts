/**
 * hova-koltozzek.ts — a „Hová költözzek?" döntési mátrix KURÁLT tényei.
 *
 * ⚠️ UGYANAZ A FEGYELEM, MINT A `guide-comparisons.ts`-BEN: minden cella a
 * MEGLÉVŐ, hivatalos forrásból írt tartalom (lib/guides.ts, illetve a kurált
 * kvízbankok) tömörítése — NEM új tényállítás. Ahol a saját tartalmunk nem
 * mondja ki, ott `null` áll, és a felület kiírja, hogy „nincs adatunk” —
 * NEM tippelünk, és NEM következtetünk („ha nem írja, akkor nincs ilyen”).
 *
 * ⚠️ A `null` NEM ROSSZ ÉRTÉK. A rangsorolásnál külön kell kezelni: ha a
 * hiányzó adatot 0-nak vennénk, az adott ország úgy esne a lista aljára,
 * mintha MÉRTEN rossz lenne — pedig csak nem tudjuk. Ez ugyanaz a hibaosztály,
 * mint a hallgatólagos ország-default (binary-country-fallthrough), és teszt őrzi.
 *
 * A számszerű oszlopok (nettó, adóterhelés, albérlet) NEM itt vannak: azokat
 * az `orszag-osszehasonlito.ts` motorja számolja élő adatból.
 */

import type { BudgetCountry } from "./budget-plan";

export interface OrszagTeny {
  /** Hány év jogszerű tartózkodás után igényelhető az állampolgárság. */
  allampolgarsagEv: number | null;
  /** Rövid kiegészítés az évhez (kivételes, gyorsított út). */
  allampolgarsagJegyzet?: string;
  /**
   * Megtarthatod-e a magyar állampolgárságot.
   * ⚠️ Magyar olvasónak ez a mátrix EGYIK LEGDÖNTŐBB cellája — egy 5 éves
   * honosítás semmit sem ér, ha le kell mondanod a magyarról.
   */
  kettosAllampolgarsag: boolean | null;
  kettosJegyzet?: string;
  /** Tartós tartózkodás (letelepedés) évei. */
  letelepedesEv: number | null;
  /** Nyelvi elvárás a honosításhoz, ahogy a saját cikkünk kimondja. */
  nyelvSzint: string | null;
  /** Lakcím-bejelentkezési határidő — a cikkek megfogalmazásában. */
  bejelentkezesHatarido: string | null;
  /** Melyik saját cikkünkből jön az adat (a felület ide linkel). */
  forrasSlug: string;
}

/*
 * FORRÁSOK (fájl + a kimondott állítás):
 *   CH — einburgerung-bank.ts „civic” kérdés: „Általában 10 év (2018 óta).
 *        C-engedéllyel kell rendelkezni. Magyar állampolgárként a kettős
 *        állampolgárság engedélyezett.” + guides.ts: 14 napon belüli bejelentkezés.
 *        A C-engedély „5-10 év B után igényelhető” (ugyanaz a bank).
 *   AT — guides.ts (at-bejelentkezes): „5 év jogszerű tartózkodás →
 *        Daueraufenthalt”, „10 év (különleges esetben 6) → Staatsbürgerschaft —
 *        DE le kell mondani a magyar állampolgárságról!”, „3 napon belül”.
 *   DE — guides.ts (de-bejelentkezes): „Állampolgárság a 2024-es reform óta már
 *        5 év után (kivételes integrációval 3) — és a KETTŐS állampolgárság
 *        ENGEDÉLYEZETT”, „általában 1-2 héten belül”.
 *   NL — guides.ts (nl-bejelentkezes): „Állampolgárság (naturalisatie) 5 év
 *        után, inburgering (A2 nyelv + KNM) vizsgával — Hollandia fő szabály
 *        szerint a korábbi állampolgárság LEMONDÁSÁT kéri (sok kivétellel)”.
 *   ES — guides.ts (es-bejelentkezes): „jellemzően 10 év jogszerű, folyamatos
 *        […] tartózkodás után”, „fő szabályként a korábbi állampolgárságról való
 *        lemondást kívánja meg […] Magyarország nem tartozik közéjük”,
 *        „CCSE […] és […] a DELE A2 nyelvvizsga”.
 *   GB — guides.ts (gb-letelepedes): Brexit óta nincs szabad mozgás; a 2020 vége
 *        előtt érkezőkre az EU Settlement Scheme vonatkozik. A honosítás éveit a
 *        saját cikkeink NEM mondják ki → null.
 */
export const ORSZAG_TENYEK: Record<BudgetCountry, OrszagTeny> = {
  CH: {
    allampolgarsagEv: 10,
    allampolgarsagJegyzet: "C-engedéllyel; a C maga 5–10 év B után",
    kettosAllampolgarsag: true,
    kettosJegyzet: "A magyar megtartható",
    letelepedesEv: null,
    nyelvSzint: null,
    bejelentkezesHatarido: "14 napon belül",
    forrasSlug: "bejelentkezes-letelepedes",
  },
  AT: {
    allampolgarsagEv: 10,
    allampolgarsagJegyzet: "különleges esetben 6",
    kettosAllampolgarsag: false,
    kettosJegyzet: "A magyarról LE KELL mondani",
    letelepedesEv: 5,
    nyelvSzint: null,
    bejelentkezesHatarido: "3 napon belül",
    forrasSlug: "at-bejelentkezes",
  },
  DE: {
    allampolgarsagEv: 5,
    allampolgarsagJegyzet: "kivételes integrációval 3 (2024-es reform)",
    kettosAllampolgarsag: true,
    kettosJegyzet: "A magyar megtartható",
    letelepedesEv: 5,
    nyelvSzint: null,
    bejelentkezesHatarido: "1–2 héten belül",
    forrasSlug: "de-bejelentkezes",
  },
  NL: {
    allampolgarsagEv: 5,
    kettosAllampolgarsag: false,
    kettosJegyzet: "Fő szabályként lemondás (sok kivétellel)",
    letelepedesEv: 5,
    nyelvSzint: "A2 (inburgering: nyelv + KNM)",
    bejelentkezesHatarido: "pár napon belül",
    forrasSlug: "nl-bejelentkezes",
  },
  GB: {
    // ⚠️ Brexit után nincs szabad beköltözés; a honosítás éveit a saját
    // cikkeink nem mondják ki. NEM tippelünk — a felület „nincs adatunk”-ot ír.
    allampolgarsagEv: null,
    kettosAllampolgarsag: null,
    letelepedesEv: null,
    nyelvSzint: null,
    bejelentkezesHatarido: null,
    forrasSlug: "gb-letelepedes",
  },
  ES: {
    allampolgarsagEv: 10,
    kettosAllampolgarsag: false,
    kettosJegyzet: "Lemondás — Magyarország nem kivétel",
    letelepedesEv: null,
    nyelvSzint: "DELE A2 + CCSE vizsga",
    bejelentkezesHatarido: null,
    forrasSlug: "es-bejelentkezes",
  },
};

/** Amit a felhasználó fontosnak jelölhet. */
export type Szempont = "megtakaritas" | "olcso_alberlet" | "gyors_allampolgarsag" | "ketto_allampolgarsag" | "alacsony_ado";

export const SZEMPONTOK: { id: Szempont; label: string; emoji: string; magyarazat: string }[] = [
  { id: "megtakaritas", label: "Marad a hónap végén", emoji: "💰", magyarazat: "A nettó bérből a lakhatás és a megélhetés után maradó arány." },
  { id: "olcso_alberlet", label: "Olcsó albérlet", emoji: "🏠", magyarazat: "A közösségi lakbér-medián a helyi nettó bérhez mérve." },
  { id: "alacsony_ado", label: "Alacsony levonás", emoji: "🧾", magyarazat: "Mennyi marad a bruttóból a járulékok és az adó után." },
  { id: "gyors_allampolgarsag", label: "Gyors állampolgárság", emoji: "🛂", magyarazat: "Hány év jogszerű tartózkodás után igényelhető." },
  { id: "ketto_allampolgarsag", label: "Magyar megtartható", emoji: "🇭🇺", magyarazat: "Megtarthatod-e a magyar állampolgárságot a honosítás után." },
];

export interface Ertekeles {
  /** 0–1 pont, vagy `null`, ha ehhez az országhoz NINCS adatunk. */
  pont: number | null;
  /** Amit a cellában mutatunk. */
  ertek: string;
}

/**
 * Egy szempont pontszáma egy országra.
 *
 * ⚠️ A `null` pont NEM nulla pont. A hívónak KI KELL HAGYNIA az átlagból,
 * különben a hiányzó adat büntetésként viselkedik.
 */
export function ertekel(
  szempont: Szempont,
  country: BudgetCountry,
  szamok: { maradPct: number; alberletPct: number; nettoArany: number },
): Ertekeles {
  const t = ORSZAG_TENYEK[country];
  switch (szempont) {
    case "megtakaritas":
      return { pont: szamok.maradPct / 100, ertek: `${Math.round(szamok.maradPct)}% marad` };
    case "olcso_alberlet":
      // Minél kisebb a lakhatás aránya, annál jobb.
      return { pont: Math.max(0, 1 - szamok.alberletPct / 100), ertek: `${Math.round(szamok.alberletPct)}% lakhatás` };
    case "alacsony_ado":
      return { pont: szamok.nettoArany, ertek: `${Math.round(szamok.nettoArany * 100)}% marad bruttóból` };
    case "gyors_allampolgarsag": {
      if (t.allampolgarsagEv == null) return { pont: null, ertek: "nincs adatunk" };
      // 5 év → 1,0 ; 15 év → 0,0 (lineáris, a valós sáv 5–10 év)
      const p = Math.max(0, Math.min(1, (15 - t.allampolgarsagEv) / 10));
      return { pont: p, ertek: `${t.allampolgarsagEv} év` };
    }
    case "ketto_allampolgarsag": {
      if (t.kettosAllampolgarsag == null) return { pont: null, ertek: "nincs adatunk" };
      return { pont: t.kettosAllampolgarsag ? 1 : 0, ertek: t.kettosAllampolgarsag ? "megtartható" : "le kell mondani" };
    }
  }
}

/**
 * Összesített pont a kiválasztott szempontokból (0–1), és hogy hány szempontot
 * tudtunk egyáltalán értékelni.
 *
 * `null` egyetlen értékelhető szempont esetén sincs → a hívó nem rangsorol.
 */
export function osszPont(
  szempontok: Szempont[],
  country: BudgetCountry,
  szamok: { maradPct: number; alberletPct: number; nettoArany: number },
): { pont: number | null; ertekelt: number; ossz: number } {
  const ertekek = szempontok.map((sz) => ertekel(sz, country, szamok).pont).filter((p): p is number => p != null);
  return {
    pont: ertekek.length > 0 ? ertekek.reduce((a, b) => a + b, 0) / ertekek.length : null,
    ertekelt: ertekek.length,
    ossz: szempontok.length,
  };
}

/**
 * Rangsorolható / nem rangsorolható szétválasztás.
 *
 * ⚠️ A HIÁNYZÓ ADAT MINDKÉT IRÁNYBAN TORZÍT. Először csak arra ügyeltem, hogy
 * ne HÚZZON LE (nem 0-val számolunk). A böngészős próbán derült ki a tükör-
 * hiba: Anglia a 3. helyre került, mert a nem tudott szempontja egyszerűen
 * kimaradt az átlagából — így csak a jól teljesítő szempontja számított, és
 * úgy tűnt, mintha MÉRTÜK volna, hogy jó.
 *
 * Ezért: csak az kap helyezés-számot, akinél MINDEN választott szempontot
 * értékelni tudtunk. A többi külön, megjelölt csoportba megy.
 */
export function csoportosit<T extends { pont: { ertekelt: number; ossz: number } }>(
  sorok: T[],
): { rangsorolhato: T[]; hianyos: T[] } {
  const teljes = (x: T) => x.pont.ossz > 0 && x.pont.ertekelt === x.pont.ossz;
  return { rangsorolhato: sorok.filter(teljes), hianyos: sorok.filter((x) => !teljes(x)) };
}
