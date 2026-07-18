/**
 * weekly-report.ts — a hétfői operátori pulzus-email TISZTA összeállítója.
 *
 * A számok begyűjtése (D1) a cron-oldalon történik (getWeeklyOpsCounts +
 * getFeatureUsageStats) — ez a modul csak formáz, ezért vitest-elhető
 * (Cloudflare-import TILOS — a quiz-percentile minta).
 */

import type { WeeklyOpsCounts } from "./repo-misc";

export interface WeeklyReportRow {
  label: string;
  value: string;
}

export interface WeeklyReport {
  subject: string;
  rows: WeeklyReportRow[];
  topPages: { name: string; count: number }[];
  topActions: { name: string; count: number }[];
}

/** Esemény-sorok szétválogatása page/action listákra (top N, ember-olvasható névvel). */
export function splitUsageRows(
  rows: { event: string; count: number }[],
  topN = 5,
): { topPages: { name: string; count: number }[]; topActions: { name: string; count: number }[] } {
  const pages: { name: string; count: number }[] = [];
  const actions: { name: string; count: number }[] = [];
  for (const r of rows) {
    if (r.event.startsWith("page:")) pages.push({ name: r.event.slice(5), count: r.count });
    else if (r.event.startsWith("action:")) actions.push({ name: r.event.slice(7), count: r.count });
  }
  return { topPages: pages.slice(0, topN), topActions: actions.slice(0, topN) };
}

/** A jelentés összeállítása — a hét dátum-tartományával a tárgyban. */
export function buildWeeklyReport(
  counts: WeeklyOpsCounts,
  usageRows: { event: string; count: number }[],
  now: Date = new Date(),
): WeeklyReport {
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const { topPages, topActions } = splitUsageRows(usageRows);
  return {
    subject: `📊 Kinti heti pulzus (${from} – ${to})`,
    rows: [
      { label: "Árajánlat-kérés (lead)", value: `${counts.leads7} db — ebből zárolt: ${counts.lockedLeads7}` },
      { label: "Állás-jelentkezés", value: `${counts.jobApps7} db` },
      { label: "CV-profil mentés", value: `${counts.cv7} db` },
      { label: "Új B2B projekt", value: `${counts.b2bNew7} db` },
      { label: "Albérlet-börze", value: `${counts.housingNew7} új hirdetés a héten · ${counts.housingLive} élő` },
      { label: "Kvíz-játék", value: `${counts.quizPlays7} db` },
      { label: "Push-feliratkozó (összesen)", value: `${counts.pushSubsTotal} fő` },
      { label: "Hírlevél-feliratkozó (összesen)", value: `${counts.newsletterSubsTotal} fő` },
      // Moderációs sor — a Keresek-jóváhagyás indítja a lead-routingot, a
      // várakozó tétel = kiadatlan lead; a történet = kiadatlan SEO-oldal.
      {
        label: "⏳ Moderációra vár",
        value: `${counts.pendingRequests} Keresek-hirdetés · ${counts.pendingStories} élettörténet · ${counts.pendingHousing} albérlet-hirdetés`,
      },
      // Adat-integritási pulzus — CSAK ha van hiba (0-nál nincs sor, ne zajongjon).
      // A részletekhez: `npm run db:health`. A hiba magától nem áll helyre.
      ...(counts.dataHealthIssues > 0
        ? [{
            label: "🩺 Szaknévsor adat-hiba",
            value: `${counts.dataHealthIssues} kritikus (rossz pin / hiányzó tartomány) — futtasd: npm run db:health`,
          }]
        : []),
    ],
    topPages,
    topActions,
  };
}
