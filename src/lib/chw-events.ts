/**
 * chw-events.ts — a Liszt Intézet-hálózat (Magyar Kulturális Intézetek) valós
 * esemény-forrása a Közösség-oldalhoz.
 *
 * A culture.hu PUBLIKUS JSON API-ját használjuk — nem HTML-scraping, hanem
 * hivatalos, strukturált végpont. Intézetenként (UUID) kérünk le, idempotens
 * szinkron a saját `source`-szal; az események a megfelelő country_code-dal
 * kerülnek be. Jelenleg: Bécs (AT), Berlin (DE), Stuttgart (DE). CH/NL-ben nincs
 * Liszt Intézet → oda nincs filiális forrás.
 *
 * A VÉG-dátummal (`eventDateTill`) szűrünk: a már LEZÁRULT eseményeket eldobjuk,
 * de a MOST IS FUTÓ (korábban indult, de még tartó) kiállításokat MEGTARTJUK —
 * így a szekció nyári szünetben sem ürül ki.
 */

import { huDateParts } from "./ical";

export interface LisztInstitute {
  /** intézet-UUID a culture.hu API-ban */
  uuid: string;
  /** Kinti esemény-forrás azonosító (idempotens szinkronhoz) */
  source: string;
  /** ország-kód, amelyhez az események kerülnek */
  country: string;
  /** intézet megnevezése (a leírásban) */
  label: string;
  /** alapértelmezett helyszín, ha az eseményhez nincs cím */
  venueDefault: string;
  /** esemény-címke (tag) */
  tag: string;
}

/** A bekötött Liszt Intézetek. Bővítés: vedd ki az UUID-t az intézet
 *  culture.hu/hu/<város> oldalának HTML-jéből (a leggyakoribb, város-specifikus
 *  UUID), és ellenőrizd a /publicapi/.../pages/event végponttal. */
export const LISZT_INSTITUTES: LisztInstitute[] = [
  {
    uuid: "1762130a-9cc1-413f-907b-9b372c738523",
    source: "chw:wien",
    country: "AT",
    label: "Collegium Hungaricum Wien (Magyar Kulturális Intézet, Bécs)",
    venueDefault: "Collegium Hungaricum, Bécs",
    tag: "Kultúra · Bécs",
  },
  {
    uuid: "58e9dd15-9a0b-4533-a862-9f44c0a1eeda",
    source: "li:berlin",
    country: "DE",
    label: "Collegium Hungaricum Berlin (Magyar Kulturális Intézet)",
    venueDefault: "Collegium Hungaricum, Berlin",
    tag: "Kultúra · Berlin",
  },
  {
    uuid: "97e25135-5d14-4b26-80cb-8a43b14e8f8b",
    source: "li:stuttgart",
    country: "DE",
    label: "Liszt Intézet Stuttgart (Magyar Kulturális Központ)",
    venueDefault: "Liszt Intézet, Stuttgart",
    tag: "Kultúra · Stuttgart",
  },
];

/** Vissza-kompatibilitás (régi import). */
export const CHW_SOURCE = "chw:wien";

export interface ChwMappedEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;        // YYYY-MM-DD (közelgőként megjelenítendő dátum)
  startTime: string | null; // HH:MM
  dateDay: string;
  dateMonth: string;
  dateWeekday: string;
  venue: string;
  tag: string;
  color: string;
}

interface ChwApiEvent {
  uuid?: string;
  title?: string | null;
  subtitle?: string | null;
  status?: {
    eventDateFrom?: string | null;
    eventDateTill?: string | null;
    isHidden?: boolean;
    isDeleted?: boolean;
    isActive?: boolean;
  };
  relation?: { primaryTag?: { text?: string | null; backgroundColor?: string | null } | null };
  locDateTime?: Array<{ locationAddress?: string | null }> | null;
}

/**
 * Egy intézet aktuális (közelgő VAGY most is futó) eseményeit kéri le a publikus
 * API-ból és Kinti-rekordokká alakítja. Hiba esetén üres tömb (sosem dob).
 */
export async function fetchInstituteEvents(inst: LisztInstitute, now: Date = new Date()): Promise<ChwMappedEvent[]> {
  // Ablak: MA-tól 8 hónap előre. Az API az `eventDateGt`-től az AKTÍV eseményeket
  // adja vissza (a most is futó, korábban indult kiállítások is bejönnek, mert
  // még tartanak) — ezért a kezdet = ma (NE múlt: az API 10-es limitje miatt a
  // múltbeli kezdet a már LEZÁRULT eseményeket adná). A vég-dátum-szűrés lent.
  const from = now;
  const to = new Date(now); to.setMonth(to.getMonth() + 8);
  const fromS = `${from.toISOString().slice(0, 10)} 00:00:00`;
  const toS = `${to.toISOString().slice(0, 10)} 23:59:59`;

  const url =
    `https://culture.hu/publicapi/hu/institute/${inst.uuid}/pages/event/with-extra-info` +
    `?listingInfo&eventDateGt=${encodeURIComponent(fromS)}&eventDateLt=${encodeURIComponent(toS)}`;

  let data: ChwApiEvent[];
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 3600, cacheEverything: true },
      signal: AbortSignal.timeout(6000),
    } as RequestInit);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: ChwApiEvent[] };
    data = json.data ?? [];
  } catch {
    return [];
  }

  const today = now.toISOString().slice(0, 10);
  const out: ChwMappedEvent[] = [];
  for (const ev of data) {
    const st = ev.status;
    const fromRaw = st?.eventDateFrom;
    if (!ev.uuid || !ev.title || !fromRaw) continue;
    if (st?.isHidden || st?.isDeleted || st?.isActive === false) continue;

    const startDate = fromRaw.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) continue;

    // Vég-dátum (ha van). LEZÁRULT eseményt eldobunk; a most is futót megtartjuk.
    const tillRaw = st?.eventDateTill;
    const tillDate = typeof tillRaw === "string" && /^\d{4}-\d{2}-\d{2}/.test(tillRaw) ? tillRaw.slice(0, 10) : null;
    const ongoing = startDate < today && (!!tillDate && tillDate >= today);
    if (tillDate) {
      if (tillDate < today) continue;      // már véget ért
    } else if (startDate < today) {
      continue;                            // vég-dátum nélküli, múltbeli (régi diszkrét esemény)
    }

    // Megjelenítési dátum: ha már fut (múltbeli kezdet, de tart) → MA, hogy
    // közelgőként jelenjen meg; egyébként a tényleges kezdő dátum.
    const eventDate = startDate < today ? today : startDate;
    const hhmm = fromRaw.slice(11, 16);
    const startTime = !ongoing && /^\d{2}:\d{2}$/.test(hhmm) && hhmm !== "00:00" ? hhmm : null;
    const { day, month, weekday } = huDateParts(eventDate);
    const addr = ev.locDateTime?.[0]?.locationAddress?.trim();
    const subtitle = ev.subtitle?.trim();

    const descParts = [subtitle, `${inst.label} programja.`];
    if (ongoing && tillDate) descParts.push(`Megtekinthető ${tillDate}-ig.`);

    out.push({
      id: `${inst.source.replace(/[^a-z0-9]/gi, "-")}-${ev.uuid}`,
      title: ev.title.trim(),
      description: descParts.filter(Boolean).join(" — "),
      eventDate,
      startTime,
      dateDay: day,
      dateMonth: month,
      dateWeekday: weekday,
      venue: addr || inst.venueDefault,
      tag: inst.tag,
      color: ev.relation?.primaryTag?.backgroundColor || "#c8a24a",
    });
  }
  return out;
}

/** Vissza-kompatibilitás: csak a bécsi intézet (a régi hívókhoz). */
export async function fetchChwEvents(now: Date = new Date()): Promise<ChwMappedEvent[]> {
  const vienna = LISZT_INSTITUTES.find((i) => i.source === CHW_SOURCE);
  return vienna ? fetchInstituteEvents(vienna, now) : [];
}
