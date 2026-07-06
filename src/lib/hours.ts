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
