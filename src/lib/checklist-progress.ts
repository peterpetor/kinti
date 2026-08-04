/**
 * checklist-progress.ts — a cikk-teendőlisták kipipált állapota.
 *
 * ⚠️ SZERVERRE SEMMI NEM MEGY. Ugyanaz az adatvédelmi modell, mint a Saját
 * Gyűjteménynél és az ismétlőnél: a Kintinek nincs per-user azonosítója, ezért
 * a haladás a böngésző localStorage-ában él. A felület ezt ki is írja.
 *
 * ⚠️ A KIPIPÁLT LÉPÉST A SZÖVEGÉVEL tároljuk, NEM a sorszámával. Ha egy lépést
 * átfogalmazunk vagy beszúrunk egyet közé, az indexre kulcsolt mentés
 * elcsúszna, és a felhasználó olyan tételeket látna késznek, amiket sosem
 * pipált ki — egy ügyintézési listán ez konkrét kárt okoz (kihagyott határidő).
 * Szövegre kulcsolva az átírt lépés visszaáll pipálatlanra, ami helyes: az már
 * egy másik teendő.
 */

const KEY = "kinti.checklist.v1";
/** Cikkenként ennyi kipipált lépést tartunk el (a leghosszabb lista 7 elemű). */
const MAX_PER_GUIDE = 40;
/** Ennyi cikk haladását őrizzük — a legrégebben érintett esik ki. */
const MAX_GUIDES = 120;

type Tarolo = Record<string, string[]>;

function olvas(): Tarolo {
  if (typeof window === "undefined") return {};
  try {
    const nyers = window.localStorage.getItem(KEY);
    if (!nyers) return {};
    const p: unknown = JSON.parse(nyers);
    if (!p || typeof p !== "object" || Array.isArray(p)) return {};
    const ki: Tarolo = {};
    for (const [slug, ertek] of Object.entries(p as Record<string, unknown>)) {
      if (!Array.isArray(ertek)) continue;
      const tisztitott = ertek.filter((x): x is string => typeof x === "string" && x.length > 0);
      if (tisztitott.length > 0) ki[slug] = tisztitott.slice(0, MAX_PER_GUIDE);
    }
    return ki;
  } catch {
    return {};
  }
}

function ir(t: Tarolo): void {
  if (typeof window === "undefined") return;
  try {
    let mentendo = t;
    const kulcsok = Object.keys(t);
    if (kulcsok.length > MAX_GUIDES) {
      mentendo = {};
      for (const k of kulcsok.slice(-MAX_GUIDES)) mentendo[k] = t[k];
    }
    window.localStorage.setItem(KEY, JSON.stringify(mentendo));
    window.dispatchEvent(new CustomEvent("kinti:checklist"));
  } catch {
    /* tele a tároló / privát mód — a pipálás ettől még működik, csak nem őrződik meg */
  }
}

/** Az adott cikkben kipipált lépések szövegei. */
export function readDone(slug: string): string[] {
  return olvas()[slug] ?? [];
}

/** Kapcsoló: kipipál vagy visszavon. Az új állapotot adja vissza (`true` = kész). */
export function toggleStep(slug: string, text: string): boolean {
  const t = olvas();
  const lista = t[slug] ?? [];
  const bent = lista.includes(text);
  const uj = bent ? lista.filter((x) => x !== text) : [...lista, text].slice(-MAX_PER_GUIDE);
  if (uj.length > 0) t[slug] = uj;
  else delete t[slug];
  ir(t);
  return !bent;
}

/** Egy cikk teljes haladásának törlése. */
export function resetGuide(slug: string): void {
  const t = olvas();
  delete t[slug];
  ir(t);
}

export interface ChecklistHaladas {
  kesz: number;
  ossz: number;
  /** 0–100 egész. */
  pct: number;
}

/**
 * Haladás — a MOSTANI lépéslistához mérve.
 *
 * ⚠️ A `kesz` csak azokat számolja, amik a mai listában is szerepelnek. Egy
 * korábban kipipált, azóta átírt lépés nem duzzaszthatja fel a számlálót
 * („5/4 kész”).
 */
export function haladas(slug: string, lepesek: { text: string }[]): ChecklistHaladas {
  const done = new Set(readDone(slug));
  const kesz = lepesek.filter((l) => done.has(l.text)).length;
  const ossz = lepesek.length;
  return { kesz, ossz, pct: ossz > 0 ? Math.round((kesz / ossz) * 100) : 0 };
}
