export interface DayHours {
  open: string;  // HH:MM
  close: string; // HH:MM
  closed: boolean;
}

export interface WorkingHours {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  mon: { open: "08:00", close: "18:00", closed: false },
  tue: { open: "08:00", close: "18:00", closed: false },
  wed: { open: "08:00", close: "18:00", closed: false },
  thu: { open: "08:00", close: "18:00", closed: false },
  fri: { open: "08:00", close: "18:00", closed: false },
  sat: { open: "09:00", close: "16:00", closed: false },
  sun: { open: "00:00", close: "00:00", closed: true },
};

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const HUNGARIAN_DAYS = {
  mon: "hétfőn",
  tue: "kedden",
  wed: "szerdán",
  thu: "csütörtökön",
  fri: "pénteken",
  sat: "szombaton",
  sun: "vasárnap",
} as const;

export const HUNGARIAN_DAY_NAMES = {
  mon: "Hétfő",
  tue: "Kedd",
  wed: "Szerda",
  thu: "Csütörtök",
  fri: "Péntek",
  sat: "Szombat",
  sun: "Vasárnap",
} as const;

/** Svájci helyi idő (Europe/Zurich) lekérdezése zónafüggetlenül */
export function getSwissDateTime(date: Date = new Date()) {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Europe/Zurich",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

    const year = parseInt(getPart("year"), 10);
    const month = parseInt(getPart("month"), 10) - 1; // 0-based
    const day = parseInt(getPart("day"), 10);
    const hour = parseInt(getPart("hour"), 10);
    const minute = parseInt(getPart("minute"), 10);

    // Készítünk egy Date objektumot a svájci zóna szerint
    const swissDate = new Date(year, month, day, hour, minute);
    const dayOfWeek = swissDate.getDay(); // 0: vasárnap, 1: hétfő stb.

    return { year, month, day, hour, minute, dayOfWeek };
  } catch {
    // Biztonsági fallback ha az Intl nem támogatott
    const local = new Date();
    return {
      year: local.getFullYear(),
      month: local.getMonth(),
      day: local.getDate(),
      hour: local.getHours(),
      minute: local.getMinutes(),
      dayOfWeek: local.getDay(),
    };
  }
}

export interface StatusResult {
  isOpen: boolean;
  statusText: string; // Pl: "Most nyitva", "Zárva"
  detailText: string; // Pl: "zár 19:00-kor", "zár 20 perc múlva", "nyit holnap 8:00-kor"
  /** Nyitva ÉS legfeljebb `SOON_MINUTES` perc múlva zár — a UI figyelmeztetheti a usert. */
  closingSoon: boolean;
  /** Zárva ÉS ma, legfeljebb `SOON_MINUTES` perc múlva nyit. */
  openingSoon: boolean;
  /** Percek a következő állapotváltásig (nyitásig/zárásig), ha ma ismert; különben null. */
  minutesUntilChange: number | null;
}

/** Ezen a horizonton belül „hamarosan" (relatív időt + jelzést mutatunk). */
export const SOON_MINUTES = 60;

/** Percek → köznyelvi relatív alak: „1 perc múlva", „20 perc múlva", „1 óra múlva". */
function relativeMinutes(m: number): string {
  if (m <= 1) return "1 perc múlva";
  if (m < 60) return `${m} perc múlva`;
  const h = Math.round(m / 60);
  return `${h} óra múlva`;
}

/** HH:MM-formátumú-e (különben a downstream .split(":") megbízhatatlan). */
function isValidTime(v: unknown): v is string {
  return typeof v === "string" && /^\d{1,2}:\d{2}$/.test(v);
}

/**
 * Egy nap-objektum biztonságos normalizálása. A tárolt JSON lehet hiányos (pl.
 * `{ open: "09:00" }` close nélkül) vagy rossz típusú — ilyenkor a downstream
 * `.close.split(":")` `undefined`-on hívódna és TypeError-t dobna, ami a
 * BusinessCard-on át az EGÉSZ lista/oldal renderjét megdöntené. Ezért itt
 * garantáljuk, hogy minden nap teljes, érvényes `DayHours`.
 */
function normalizeDay(raw: unknown, fallback: DayHours): DayHours {
  if (!raw || typeof raw !== "object") return fallback;
  const d = raw as Partial<DayHours>;
  if (d.closed === true) return { open: fallback.open, close: fallback.close, closed: true };
  const open = isValidTime(d.open) ? d.open : fallback.open;
  const close = isValidTime(d.close) ? d.close : fallback.close;
  return { open, close, closed: false };
}

export function parseWorkingHours(jsonStr: string | null): WorkingHours {
  if (!jsonStr) return DEFAULT_WORKING_HOURS;
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object") return DEFAULT_WORKING_HOURS;
    // Naponként normalizálunk (nem sekély-merge): egy hiányos/rossz nap sose
    // hagyjon hátra érvénytelen open/close-t, ami a státusz-számítást elhasalná.
    const out = {} as WorkingHours;
    for (const key of Object.keys(DEFAULT_WORKING_HOURS) as (keyof WorkingHours)[]) {
      out[key] = normalizeDay((parsed as Record<string, unknown>)[key], DEFAULT_WORKING_HOURS[key]);
    }
    return out;
  } catch {
    return DEFAULT_WORKING_HOURS;
  }
}

/**
 * SZIGORÚ parse: `null`, ha NINCS valódi strukturált nyitvatartási adat
 * (hiányzó / üres / rossz JSON / nap-objektum nélküli). Így a megjelenítő réteg
 * megkülönböztetheti a „nem ismerjük a nyitvatartást" esetet az „ismerjük"-től,
 * és nem mutat KITALÁLT „Nyitva/Zárva" státuszt a default 8–18 alapján (fabricated
 * precision — az app elve, hogy ilyet nem teszünk: vö. távolság-gating, „Csak
 * névre ismert"). Ha van legalább egy valódi nap, a teljes hetet a
 * `parseWorkingHours` normalizálja (a hiányzó napok defaultra esnek — a strukturált
 * szerkesztő amúgy is mind a 7 napot beállítja).
 */
export function parseWorkingHoursStrict(jsonStr: string | null): WorkingHours | null {
  if (!jsonStr) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const obj = parsed as Record<string, unknown>;
  const hasAnyDay = (Object.keys(DEFAULT_WORKING_HOURS) as (keyof WorkingHours)[])
    .some((k) => obj[k] != null && typeof obj[k] === "object");
  if (!hasAnyDay) return null;
  return parseWorkingHours(jsonStr);
}

export function calculateBusinessHoursStatus(
  workingHours: WorkingHours,
  currentTime: Date = new Date(),
): StatusResult {
  const { hour, minute, dayOfWeek } = getSwissDateTime(currentTime);
  const currentMins = hour * 60 + minute;
  const todayKey = DAYS[dayOfWeek];
  const todayHours = workingHours[todayKey];

  // 1) Ellenőrizzük, hogy most épp nyitva van-e
  if (todayHours && !todayHours.closed) {
    const [openH, openM] = todayHours.open.split(":").map(Number);
    const [closeH, closeM] = todayHours.close.split(":").map(Number);
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    if (currentMins >= openMins && currentMins < closeMins) {
      const toClose = closeMins - currentMins;
      const closingSoon = toClose <= SOON_MINUTES;
      return {
        isOpen: true,
        statusText: "Most nyitva",
        // Hamarosan zár → cselekvésre ösztönző relatív idő; különben abszolút.
        detailText: closingSoon ? `zár ${relativeMinutes(toClose)}` : `zár ${todayHours.close}-kor`,
        closingSoon,
        openingSoon: false,
        minutesUntilChange: toClose,
      };
    }
  }

  // 2) Zárva van, keressük meg a következő nyitást!
  for (let i = 0; i < 7; i++) {
    const nextIndex = (dayOfWeek + i) % 7;
    const nextKey = DAYS[nextIndex];
    const nextHours = workingHours[nextKey];

    if (!nextHours || nextHours.closed) continue;

    const [openH, openM] = nextHours.open.split(":").map(Number);
    const openMins = openH * 60 + openM;

    if (i === 0) {
      // Ma nyit ki később
      if (currentMins < openMins) {
        const toOpen = openMins - currentMins;
        const openingSoon = toOpen <= SOON_MINUTES;
        return {
          isOpen: false,
          statusText: "Zárva",
          detailText: openingSoon ? `nyit ${relativeMinutes(toOpen)}` : `nyit ma ${nextHours.open}-kor`,
          closingSoon: false,
          openingSoon,
          minutesUntilChange: toOpen,
        };
      }
    } else if (i === 1) {
      // Holnap nyit ki
      return {
        isOpen: false,
        statusText: "Zárva",
        detailText: `nyit holnap ${nextHours.open}-kor`,
        closingSoon: false,
        openingSoon: false,
        minutesUntilChange: null,
      };
    } else {
      // Egy későbbi napon nyit ki
      const dayName = HUNGARIAN_DAYS[nextKey];
      return {
        isOpen: false,
        statusText: "Zárva",
        detailText: `nyit ${dayName} ${nextHours.open}-kor`,
        closingSoon: false,
        openingSoon: false,
        minutesUntilChange: null,
      };
    }
  }

  // Ha a hét minden napján zárva van
  return {
    isOpen: false,
    statusText: "Zárva",
    detailText: "tartósan zárva",
    closingSoon: false,
    openingSoon: false,
    minutesUntilChange: null,
  };
}

// --- Heti nyitvatartás emberi olvasásra ------------------------------------

/** Hét sorrendje magyar konvenció szerint (hétfővel kezdve). */
const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Rövid nap-címke a kompakt táblához. */
const SHORT_DAY: Record<keyof WorkingHours, string> = {
  mon: "H", tue: "K", wed: "Sze", thu: "Cs", fri: "P", sat: "Szo", sun: "V",
};

export interface WeeklyHoursRow {
  /** Nap(ok) címkéje, pl. „H–P", „Szo", „V". */
  label: string;
  /** Nyitvatartás, pl. „09:00–18:00" vagy „Zárva". */
  value: string;
  /** A csoportba tartozó nap-kulcsok (a mai nap kiemeléséhez). */
  dayKeys: (keyof WorkingHours)[];
}

function dayValueText(d: DayHours): string {
  return d.closed ? "Zárva" : `${d.open}–${d.close}`;
}

/**
 * A heti nyitvatartás KOMPAKT, emberi olvasásra szánt formája: az EGYMÁST KÖVETŐ,
 * AZONOS idejű napokat egy sorba vonja (pl. H–P 09:00–18:00, Szo 09:00–13:00,
 * V Zárva). A hét hétfővel kezdődik. Csak ISMERT (strukturált) nyitvatartásra
 * hívd — a default-oló parseWorkingHours-t NE add ide, mert az kitalált 8–18-at
 * mutatna (fabricated). A publikus részletoldal ezzel jeleníti meg a heti tervet.
 */
export function formatWeeklyHours(wh: WorkingHours): WeeklyHoursRow[] {
  const groups: WeeklyHoursRow[] = [];
  for (const key of WEEK_ORDER) {
    const value = dayValueText(wh[key]);
    const last = groups[groups.length - 1];
    if (last && last.value === value) {
      last.dayKeys.push(key);
    } else {
      groups.push({ value, dayKeys: [key], label: "" });
    }
  }
  // Címke: egy nap → rövid név; több egymást követő → „első–utolsó".
  for (const g of groups) {
    const first = SHORT_DAY[g.dayKeys[0]];
    const lastDay = SHORT_DAY[g.dayKeys[g.dayKeys.length - 1]];
    g.label = g.dayKeys.length === 1 ? first : `${first}–${lastDay}`;
  }
  return groups;
}

/** A MAI nap kulcsa svájci idő szerint (a heti tábla mai sorának kiemeléséhez). */
export function swissWeekdayKey(currentTime: Date = new Date()): keyof WorkingHours {
  return DAYS[getSwissDateTime(currentTime).dayOfWeek];
}
