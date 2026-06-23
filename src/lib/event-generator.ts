/**
 * event-generator.ts — kódból generált, önfrissítő ismétlődő események.
 *
 * Cél: teljesen automatikus, „több esemény" KÉZI feltöltés és külső feed nélkül.
 * KIZÁRÓLAG dátum-biztos, valós, évente ismétlődő tételeket generálunk (magyar
 * nemzeti megemlékezések). NEM találunk ki helyszínt, időpontot vagy létszámot —
 * a kártya semleges, a konkrét programot a helyi szervezők hirdetik. Így nincs
 * félrevezető adat (vö. a fake „going" törlése).
 */

import { huDateParts } from "./ical";

export const GENERATED_SOURCE = "auto:hu-national";

/** Ország-specifikus felirat a generált megemlékezésekhez. */
const COUNTRY_META: Record<string, { adj: string; venue: string }> = {
  CH: { adj: "svájci", venue: "Svájc-szerte" },
  AT: { adj: "osztrák", venue: "Ausztria-szerte" },
};

interface RecurringDef {
  key: string;       // stabil slug a determinisztikus ID-hez
  month: number;     // 1–12
  day: number;       // 1–31
  title: string;
  description: string;
  color: string;
}

/** Magyar nemzeti ünnepek / megemlékezések — fix dátumúak, évente ismétlődők. */
const HU_NATIONAL: RecurringDef[] = [
  {
    key: "marc15", month: 3, day: 15,
    title: "Március 15. — 1848-as forradalom",
    description:
      "Nemzeti ünnep. A {adj} magyar egyesületek és missziók helyi megemlékezéseket szerveznek — a pontos helyszínt és időpontot a szervezők hirdetik meg.",
    color: "#c8392e",
  },
  {
    key: "trianon", month: 6, day: 4,
    title: "Nemzeti Összetartozás Napja",
    description:
      "Megemlékezés a nemzeti összetartozásról (1920, Trianon). A {adj} magyar közösségek helyi programokat tartanak — részletek a szervezőknél.",
    color: "#5b4a8c",
  },
  {
    key: "istvan", month: 8, day: 20,
    title: "Augusztus 20. — Szent István, államalapítás",
    description:
      "Nemzeti ünnep, az államalapítás és Szent István király emléknapja. A {adj} magyar közösségek ünnepi programokat, szentmisét szerveznek — részletek a szervezőknél.",
    color: "#c89a5c",
  },
  {
    key: "arad", month: 10, day: 6,
    title: "Október 6. — Aradi vértanúk emléknapja",
    description:
      "Nemzeti gyásznap az 1848–49-es szabadságharc vértanúinak emlékére. A helyi megemlékezéseket a magyar közösségek hirdetik.",
    color: "#3a3a3a",
  },
  {
    key: "1956", month: 10, day: 23,
    title: "Október 23. — 1956-os forradalom",
    description:
      "Nemzeti ünnep az 1956-os forradalom és szabadságharc emlékére. A {adj} magyar egyesületek megemlékezéseket szerveznek — a helyszínt és időpontot a szervezők hirdetik meg.",
    color: "#c8392e",
  },
];

export interface GeneratedEvent {
  id: string;
  title: string;
  eventDate: string;     // YYYY-MM-DD
  dateDay: string;
  dateMonth: string;
  dateWeekday: string;
  venue: string;
  tag: string;
  color: string;
  description: string;
}

/**
 * A következő ~18 hónap jövőbeli megemlékezéseit generálja (a mai naptól).
 * Determinisztikus ID-k (`auto:hu:<key>:<év>`) → idempotens újrafuttatás.
 */
export function generateRecurringEvents(now: Date = new Date(), country: string = "CH"): GeneratedEvent[] {
  const meta = COUNTRY_META[country] ?? COUNTRY_META.CH;
  const todayISO = now.toISOString().slice(0, 10);
  const startYear = now.getUTCFullYear();
  const out: GeneratedEvent[] = [];

  for (let y = startYear; y <= startYear + 1; y++) {
    for (const def of HU_NATIONAL) {
      const dateISO = `${y}-${String(def.month).padStart(2, "0")}-${String(def.day).padStart(2, "0")}`;
      if (dateISO < todayISO) continue;
      const { day, month, weekday } = huDateParts(dateISO);
      out.push({
        // URL-biztos ID (NINCS kettőspont) — ország a kulcsban, hogy CH és AT ne ütközzön.
        id: `auto-hu-${country.toLowerCase()}-${def.key}-${y}`,
        title: def.title,
        eventDate: dateISO,
        dateDay: day,
        dateMonth: month,
        dateWeekday: weekday,
        venue: meta.venue,
        tag: "Megemlékezés",
        color: def.color,
        description: def.description.replace(/\{adj\}/g, meta.adj),
      });
    }
  }
  return out.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}
