/**
 * seasonal-push.ts — szezonális, NAPTÁR-vezérelt push-kampányok.
 *
 * A lényeg: ezek nem spamek, hanem pont időben jövő, RELEVÁNS emlékeztetők (ezért éri
 * meg telepíteni az appot). Mindegyik ÉVENTE EGYSZER megy ki (idempotencia:
 * seasonal_push_log + claimSeasonalPush), az időablakában az első cron-futáskor.
 * A határidők a [[provider-switch]] (Krankenkasse nov. 30.) és az életciklus-naptár alapján.
 */
export interface SeasonalCampaign {
  id: string;
  /** Aktív időablak (inclusive), [hónap, nap]. */
  from: [number, number];
  to: [number, number];
  title: string;
  body: string;
  /** Cél-útvonal (a kinti.app-hoz relatív). */
  url: string;
}

export const SEASONAL_CAMPAIGNS: SeasonalCampaign[] = [
  {
    id: "tanev",
    from: [8, 18],
    to: [9, 15],
    title: "🎒 Új tanév — itt a checklist",
    body: "Iskolai/óvodai bejelentkezés, határidők, teendők egy helyen. Nézd meg az Ügyintézés varázslót.",
    url: "/ugyintezes",
  },
  {
    id: "krankenkasse",
    from: [10, 20],
    to: [11, 27],
    title: "⏰ Hamarosan lejár a Krankenkasse-váltás!",
    body: "November 30. a határidő. Pár perc alatt összehasonlítod és spórolsz — nézd meg a Kintin.",
    url: "/szolgaltato-valto",
  },
  {
    id: "karacsony",
    from: [12, 1],
    to: [12, 18],
    title: "✈️ Karácsony itthon?",
    body: "Aktiváld a repülőjegy-figyelőt, és szólunk, ha esik az ár a hazaúton.",
    url: "/repulojegy",
  },
];

/** A ma (UTC) aktív kampányok (időablak szerint). */
export function activeSeasonalCampaigns(date: Date = new Date()): SeasonalCampaign[] {
  const md = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
  return SEASONAL_CAMPAIGNS.filter((c) => {
    const from = c.from[0] * 100 + c.from[1];
    const to = c.to[0] * 100 + c.to[1];
    return md >= from && md <= to;
  });
}
