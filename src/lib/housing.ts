/**
 * housing.ts — a „Szoba- és albérlet-börze" TISZTA rétege (típusok, címkék,
 * validálás). Nincs D1/Clerk függősége → unit-tesztelhető; a kliens-oldali
 * űrlap ÉS a szerver-oldali API ugyanezt a validátort futtatja (a kliens a
 * gyors hibaüzenetért, a szerver a tényleges kényszerítésért).
 */

export const HOUSING_TYPES = ["room_offered", "apartment_offered", "looking_for_room"] as const;
export type HousingType = (typeof HOUSING_TYPES)[number];

export const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  room_offered: "Kiadó szoba",
  apartment_offered: "Kiadó lakás",
  looking_for_room: "Szobát / albérletet keres",
};

export const HOUSING_CURRENCIES = ["EUR", "CHF"] as const;
export type HousingCurrency = (typeof HOUSING_CURRENCIES)[number];

/** A jogi pajzs (guardrail) nyilatkozat — a feladó EZT pipálja ki; e nélkül
 *  a beküldés kliens- ÉS szerver-oldalon is elutasítva. */
export const HOUSING_CONSENT_TEXT =
  "Büntetőjogi felelősségem tudatában kijelentem, hogy rendelkezem a tulajdonos/főbérlő " +
  "írásos engedélyével a lakás/szoba albérletbe (Untermiete) adásához.";

/** A lista-oldali felelősség-kizáró szöveg (safe harbor). */
export const HOUSING_DISCLAIMER =
  "A Kinti kizárólag hirdetési felületet biztosít. A hirdetések tartalmáért, a bérlő/kiadó " +
  "megbízhatóságáért, vagy a bérleti díjhoz kapcsolódó kérdésekért semmilyen felelősséget nem vállalunk.";

export interface HousingInput {
  type: HousingType;
  country: string;
  city: string;
  /** Kanton/tartomány/provincia-kód — opcionális; a route validálja a
   *  lib/regions készlete ellen (itt csak forma-ellenőrzés, ország-kontextus
   *  nélkül nem dönthető el az érvényesség). */
  regionCode: string | null;
  price: number;
  currency: HousingCurrency;
  description: string;
  contact: string;
  consent: boolean;
}

export type HousingValidation =
  | { ok: true; value: HousingInput }
  | { ok: false; error: string };

const VALID_COUNTRIES = new Set(["CH", "AT", "DE", "NL"]);

/**
 * A beküldött (ismeretlen alakú) body → validált HousingInput. Az első hibánál
 * megáll, felhasználónak szánt magyar hibaüzenettel (a route változtatás nélkül
 * továbbadja).
 */
export function validateHousingInput(body: Record<string, unknown>): HousingValidation {
  const type = typeof body.type === "string" ? body.type : "";
  if (!(HOUSING_TYPES as readonly string[]).includes(type)) {
    return { ok: false, error: "Válaszd ki a hirdetés típusát." };
  }

  const country = typeof body.country === "string" ? body.country : "";
  if (!VALID_COUNTRIES.has(country)) {
    return { ok: false, error: "Ismeretlen ország." };
  }

  const city = typeof body.city === "string" ? body.city.trim().slice(0, 60) : "";
  if (city.length < 2) {
    return { ok: false, error: "Add meg a települést." };
  }

  // Régió: opcionális, forma-ellenőrzés (a valódi kód-készletet a route
  // ellenőrzi a lib/regions ellen — érvénytelen kód ott null-ra esik).
  const rawRegion = typeof body.regionCode === "string" ? body.regionCode.trim().slice(0, 8) : "";
  const regionCode = rawRegion !== "" ? rawRegion : null;

  const price = typeof body.price === "number" ? body.price : Number(body.price);
  if (!Number.isFinite(price) || price <= 0 || price > 20000) {
    return { ok: false, error: "Adj meg egy valós havi árat (1–20 000)." };
  }

  const currency = typeof body.currency === "string" ? body.currency : "";
  if (!(HOUSING_CURRENCIES as readonly string[]).includes(currency)) {
    return { ok: false, error: "Válassz devizát (EUR vagy CHF)." };
  }

  const description = typeof body.description === "string" ? body.description.trim().slice(0, 1200) : "";
  if (description.length < 20) {
    return { ok: false, error: "Írj pár mondatot a hirdetésről (legalább 20 karakter)." };
  }

  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";
  if (contact.length < 5) {
    return { ok: false, error: "Adj meg egy elérhetőséget (e-mail vagy telefonszám)." };
  }

  // A jogi pajzs: kiadó hirdetésnél KÖTELEZŐ a főbérlői-engedély nyilatkozat.
  // (A kereső hirdetés nem ad ki ingatlant, ott nincs mit engedélyeztetni —
  // de a kliens ott is kipipáltatja az ÁSZF-elfogadást a beküldés-gombbal.)
  const consent = body.consent === true;
  if (!consent && type !== "looking_for_room") {
    return { ok: false, error: "A hirdetés feladásához el kell fogadnod a főbérlői-engedély nyilatkozatot." };
  }

  return {
    ok: true,
    value: {
      type: type as HousingType,
      country,
      city,
      regionCode,
      price: Math.round(price),
      currency: currency as HousingCurrency,
      description,
      contact,
      consent,
    },
  };
}

/** Ár-címke a kártyára: „850 EUR / hó" (kereső hirdetésnél „max 850 EUR / hó"). */
export function formatHousingPrice(type: HousingType, price: number, currency: string): string {
  const base = `${new Intl.NumberFormat("hu-HU").format(price)} ${currency} / hó`;
  return type === "looking_for_room" ? `max ${base}` : base;
}

/** Relatív feladás-idő címke unixepoch (mp) alapján: „ma", „3 napja"… */
export function housingAgeLabel(createdAtSec: number, nowMs: number = Date.now()): string {
  const days = Math.floor((nowMs / 1000 - createdAtSec) / 86_400);
  if (days <= 0) return "ma";
  if (days === 1) return "tegnap";
  if (days < 7) return `${days} napja`;
  if (days < 30) return `${Math.round(days / 7)} hete`;
  return `${Math.round(days / 30)} hónapja`;
}
