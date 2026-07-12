/**
 * deadline-pro-map.ts — „Pánik-konverzió" híd TISZTA logikája (vitest-elhető —
 * Cloudflare-import tilos): a Határidő-asszisztens határidő-címeit KURÁLT,
 * őszinte téma→szakma párokra illeszti (adó → könyvelő/adótanácsadó; engedély →
 * ügyvéd). A gyenge párok (biztosítás, autó, iskola) szándékosan kimaradnak —
 * az erőltetett ajánló hiteltelenít (quiz-pro-map elv). A kategória-id-k az
 * ÉLES categories táblából ellenőrzöttek (2026-07-12).
 */

export interface DeadlineTopic {
  /** Kulcsszó-illesztés a határidő címére (sablon + kézi cím egyaránt). */
  re: RegExp;
  /** Szaknévsor kategória-id-k, relevancia-sorrendben (ellenőrzött id-k!). */
  cats: string[];
  /** A kártya felvezetője — a határidőre utal, tényállítás nélkül. */
  lead: string;
}

export const DEADLINE_TOPICS: DeadlineTopic[] = [
  {
    re: /ad[oó]|steuer|veranlagung|belasting|aangifte/i,
    cats: ["konyveles", "adotanacsado"],
    lead: "Az adó-ügyeket nem kell egyedül intézned — magyar könyvelő/adótanácsadó segít, anyanyelveden:",
  },
  {
    re: /enged[eé]ly|tart[oó]zkod[aá]s|aufenthalt|verblijf/i,
    cats: ["ugyved"],
    lead: "Engedély-ügyben magyar ügyvéd segíthet, anyanyelveden:",
  },
];

/** A pánik-ablak: ennyi nappal a határidő előtt (és röviddel utána) ajánlunk. */
export const WINDOW_BEFORE_DAYS = 45;
export const WINDOW_AFTER_DAYS = 14;

export interface DeadlineForCta {
  title: string;
  /** Hátralévő napok (negatív = lejárt). */
  daysLeft: number;
}

/** A legsürgősebb, kurált témára illő határidő kiválasztása. */
export function pickDeadlineTopic(
  deadlines: DeadlineForCta[],
): { topic: DeadlineTopic; deadline: DeadlineForCta } | null {
  const inWindow = deadlines
    .filter((d) => d.daysLeft <= WINDOW_BEFORE_DAYS && d.daysLeft >= -WINDOW_AFTER_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  for (const d of inWindow) {
    const topic = DEADLINE_TOPICS.find((t) => t.re.test(d.title));
    if (topic) return { topic, deadline: d };
  }
  return null;
}
