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
  detailText: string; // Pl: "zár 19:00-kor", "nyit holnap 8:00-kor"
}

export function parseWorkingHours(jsonStr: string | null): WorkingHours {
  if (!jsonStr) return DEFAULT_WORKING_HOURS;
  try {
    const parsed = JSON.parse(jsonStr);
    // Merge-öljük a default-tal a biztonság kedvéért
    return {
      ...DEFAULT_WORKING_HOURS,
      ...parsed,
    };
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
      return {
        isOpen: true,
        statusText: "Most nyitva",
        detailText: `zár ${todayHours.close}-kor`,
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
        return {
          isOpen: false,
          statusText: "Zárva",
          detailText: `nyit ma ${nextHours.open}-kor`,
        };
      }
    } else if (i === 1) {
      // Holnap nyit ki
      return {
        isOpen: false,
        statusText: "Zárva",
        detailText: `nyit holnap ${nextHours.open}-kor`,
      };
    } else {
      // Egy későbbi napon nyit ki
      const dayName = HUNGARIAN_DAYS[nextKey];
      return {
        isOpen: false,
        statusText: "Zárva",
        detailText: `nyit ${dayName} ${nextHours.open}-kor`,
      };
    }
  }

  // Ha a hét minden napján zárva van
  return {
    isOpen: false,
    statusText: "Zárva",
    detailText: "tartósan zárva",
  };
}
