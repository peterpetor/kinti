/**
 * „Használhatóság" pontszám a szaknévsor alapértelmezett rendezéséhez.
 *
 * ⚠️ MIÉRT KELL: az eddigi „Relevans" képlet `0.6 × közelség + 0.4 × értékelés`
 * volt — de a JELENLEGI adatállapotban MINDKÉT tag konstans:
 *   • 0 cégnek van véleménye (2248-ból) → az értékelés mindenkinél 0.6,
 *   • helymeghatározás nélkül a közelség mindenkinél 0.4.
 * Vagyis a pontszám MINDEN cégre 0.48 volt, és a rendezés visszaesett a tömb
 * eredeti (gyakorlatilag véletlen) sorrendjére. Az első látogató — aki még nem
 * adott helyhozzáférést — véletlen sorrendű listát kapott.
 *
 * A Google nem csak közelség/értékelés szerint rangsorol, hanem HASZNÁLHATÓSÁG
 * szerint is. A felhasználó célja a KAPCSOLATFELVÉTEL: egy adatlap telefonnal
 * és utcacímmel többet ér, mint egy puszta név. Ez egybevág a tölcsér-lelettel
 * (a profil-megnyitások jelentős része zsákutcába futott, mert nem volt mit
 * megnyomni) — ld. [[funnel-reality-check]].
 *
 * ⚠️ EZ NEM RANGSOR-VÁSÁRLÁS: a PRO (featured) kiemelés a hívó oldalon,
 * ETTŐL FÜGGETLENÜL, előre van rögzítve. Ez a pontszám csak a maradékot
 * rendezi hasznosság szerint.
 */

export interface ScorableListing {
  hasPhone?: boolean;
  blurb?: string | null;
  address?: string | null;
  verified?: boolean;
  photo?: string | null;
  logoKey?: string | null;
  rating?: number | null;
  reviews?: number | null;
}

/** Súlyok — a KAPCSOLATFELVÉTELT segítő jelek érnek a legtöbbet. */
export const WEIGHTS = {
  phone: 0.40,        // a legerősebb: azonnal hívható
  webOrEmail: 0.20,   // másodlagos kapcsolatfelvétel
  streetAddress: 0.20, // útvonaltervezés + hitelesség
  description: 0.10,  // van mit elolvasni
  verified: 0.05,
  image: 0.05,
} as const;

const WEB_RE = /https?:\/\/|www\.|\.(ch|de|at|nl|com|hu|eu|be|org|co\.uk|es)\b/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/**
 * 0..1 közötti „mennyire tud ezzel kezdeni valamit a felhasználó" pontszám.
 *
 * ⚠️ A cím-jelnél NEM elég, hogy van `address` — a „Bécs" önmagában nem tesz
 * lehetővé útvonaltervezést. Házszám kell (`hasStreet`), ezért kapja a hívó
 * paraméterként (az `address.ts` logikáját nem duplikáljuk).
 */
export function usefulnessScore(b: ScorableListing, hasStreet: boolean): number {
  const blurb = b.blurb ?? "";
  let s = 0;
  if (b.hasPhone) s += WEIGHTS.phone;
  if (WEB_RE.test(blurb) || EMAIL_RE.test(blurb)) s += WEIGHTS.webOrEmail;
  if (hasStreet) s += WEIGHTS.streetAddress;
  // A blurb tartalmaz gépi „típus · város · domain" részt is; a valódi
  // bemutatkozás ennél hosszabb — 60 karakter fölött tekintjük tartalomnak.
  if (blurb.trim().length > 60) s += WEIGHTS.description;
  if (b.verified) s += WEIGHTS.verified;
  if (b.photo || b.logoKey) s += WEIGHTS.image;
  return Math.min(1, s);
}

/**
 * A teljes relevancia-pontszám: közelség + értékelés + HASZNÁLHATÓSÁG.
 *
 * @param prox 0..1 közelség (helymeghatározás nélkül semleges alap)
 * @param hasStreet utcaszintű-e a cím
 */
export function relevanceScore(b: ScorableListing, prox: number, hasStreet: boolean): number {
  // Értékelés: értékelt cégnél a csillag, újnál semleges — DE ez ma minden
  // cégnél azonos (0 vélemény), ezért a súlya szándékosan kicsi.
  const rate = (b.reviews ?? 0) > 0 ? (b.rating ?? 0) / 5 : 0.6;
  return 0.45 * prox + 0.15 * rate + 0.40 * usefulnessScore(b, hasStreet);
}
