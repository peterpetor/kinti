/**
 * repo-misc.ts — Push notifikációk, heti hírlevél, radarok és statisztikák.
 */
import { getDB } from "./cloudflare";

// --- Web Push ----------------------------------------------------------------

export interface PushSubscriptionRow { id: string; endpoint: string; p256dh: string; auth: string; canton_code: string | null; notify_business?: number; notify_daily?: number; }

export interface SavePushSubscriptionInput {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  cantonCode: string | null;
  /**
   * Ha true: meglévő feliratkozásnál a canton_code-ot NEM írja felül null-lal
   * (COALESCE-szal megőrzi a korábbit). A radar-feliratkozás ezt használja —
   * ott a cantonCode mindig null, de nem akarjuk törölni a user kanton-célzását.
   * A /api/push/subscribe NEM állítja be, mert ott a null szándékos ("egész
   * Svájc") és felül KELL írnia a korábbi kantont.
   */
  preserveCanton?: boolean;
}

export async function savePushSubscription(input: SavePushSubscriptionInput): Promise<void> {
  // preserveCanton esetén a meglévő canton_code marad, ha az új érték null.
  const cantonSet = input.preserveCanton
    ? "canton_code = COALESCE(excluded.canton_code, push_subscriptions.canton_code)"
    : "canton_code = excluded.canton_code";
  await getDB()
    .prepare(
      `INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, canton_code) VALUES (?, ?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, ${cantonSet}`,
    )
    .bind(input.id, input.endpoint, input.p256dh, input.auth, input.cantonCode)
    .run();
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await getDB().prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run();
}

/** Egy push-feliratkozás titkosító-kulcsai endpoint alapján (cron-célzott küldéshez). */
export async function getPushKeysByEndpoint(endpoint: string): Promise<{ p256dh: string; auth: string } | null> {
  const row = await getDB()
    .prepare("SELECT p256dh, auth FROM push_subscriptions WHERE endpoint = ? LIMIT 1")
    .bind(endpoint)
    .first<{ p256dh: string; auth: string }>();
  return row ?? null;
}

// ⚠️ Az "event" kategória KIVEZETVE (2026-07-09 feature-bloat leépítés — nincs
// esemény-modul). A `notify_event` OSZLOP a DB-ben marad (NOT NULL DEFAULT 1),
// csak már senki nem írja/olvassa: destruktív migrációt nem érünk meg vele.
export type PushCategory = "business" | "job" | "daily" | "keresek" | "housing" | "remit";

export async function listPushSubscriptions(
  cantonCode?: string | null,
  category?: PushCategory,
): Promise<PushSubscriptionRow[]> {
  const conds: string[] = [];
  const binds: unknown[] = [];
  if (cantonCode) {
    conds.push("(canton_code = ? OR canton_code IS NULL)");
    binds.push(cantonCode);
  }
  // Kategória-preferencia: csak az adott típusra feliratkozottakat (alapból be).
  // COALESCE(...,1): a 0075 migráció NOT NULL DEFAULT 1, így a régi sorok már
  // 1-et adnak — ez csak védőháló, hogy egy esetleges NULL se essen ki.
  if (category === "business") conds.push("COALESCE(notify_business, 1) = 1");
  else if (category === "job") conds.push("COALESCE(notify_job, 1) = 1");
  else if (category === "daily") conds.push("COALESCE(notify_daily, 1) = 1");
  else if (category === "keresek") conds.push("COALESCE(notify_keresek, 1) = 1");
  else if (category === "housing") conds.push("COALESCE(notify_housing, 1) = 1");
  // Árfolyam-riasztás: OPT-IN → NINCS COALESCE(...,1) védőháló (az visszahozná az
  // opt-out viselkedést, és mindenkinek menne). Csak a kifejezetten bekapcsolók.
  else if (category === "remit") conds.push("notify_remit = 1");

  const where = conds.length ? ` WHERE ${conds.join(" AND ")}` : "";
  const { results } = await getDB().prepare(`SELECT * FROM push_subscriptions${where}`).bind(...binds).all<PushSubscriptionRow>();
  return results;
}

export interface PushPreferences { notifyBusiness: boolean; notifyJob: boolean; notifyDaily: boolean; notifyKeresek: boolean; notifyHousing: boolean; }

/**
 * A feliratkozás kategória-preferenciái endpoint alapján (a beállítások UI-hoz).
 * Védőháló: ha a 0080 migráció (notify_job) még nem futott, a notify_job nélkül
 * olvasunk és a job-ot alapból bekapcsoltnak tekintjük.
 */
export async function getPushPreferences(endpoint: string): Promise<PushPreferences | null> {
  try {
    const row = await getDB()
      .prepare("SELECT notify_business, notify_job, notify_daily, notify_keresek, notify_housing FROM push_subscriptions WHERE endpoint = ? LIMIT 1")
      .bind(endpoint)
      .first<{ notify_business: number; notify_job: number; notify_daily: number; notify_keresek: number; notify_housing: number }>();
    if (!row) return null;
    return {
      notifyBusiness: row.notify_business === 1,
      notifyJob: row.notify_job === 1, notifyDaily: row.notify_daily === 1,
      notifyKeresek: row.notify_keresek === 1, notifyHousing: row.notify_housing === 1,
    };
  } catch {
    // A notify_housing (0136) / notify_keresek (0129) / notify_daily (0084) /
    // notify_job (0080) oszlop még hiányozhat — a hiányzókat alapból bekapcsoltnak vesszük.
    const row = await getDB()
      .prepare("SELECT notify_business FROM push_subscriptions WHERE endpoint = ? LIMIT 1")
      .bind(endpoint)
      .first<{ notify_business: number }>();
    if (!row) return null;
    return { notifyBusiness: row.notify_business === 1, notifyJob: true, notifyDaily: true, notifyKeresek: true, notifyHousing: true };
  }
}

export async function updatePushPreferences(endpoint: string, prefs: PushPreferences): Promise<boolean> {
  try {
    const res = await getDB()
      .prepare("UPDATE push_subscriptions SET notify_business = ?, notify_job = ?, notify_daily = ?, notify_keresek = ?, notify_housing = ? WHERE endpoint = ?")
      .bind(prefs.notifyBusiness ? 1 : 0, prefs.notifyJob ? 1 : 0, prefs.notifyDaily ? 1 : 0, prefs.notifyKeresek ? 1 : 0, prefs.notifyHousing ? 1 : 0, endpoint)
      .run();
    return (res.meta.changes ?? 0) > 0;
  } catch {
    // Újabb oszlopok még hiányozhatnak (migráció előtt) — a régi oszlopokat frissítjük.
    const res = await getDB()
      .prepare("UPDATE push_subscriptions SET notify_business = ? WHERE endpoint = ?")
      .bind(prefs.notifyBusiness ? 1 : 0, endpoint)
      .run();
    return (res.meta.changes ?? 0) > 0;
  }
}

/**
 * Árfolyam-riasztás (hazautalás) opt-in — KÜLÖN kezelve a többi kategóriától.
 *
 * ⚠️ Szándékosan NEM része a PushPreferences-nek: a beállítások-oldal a 6 régi
 * kategóriát EGYBEN írja (`UPDATE ... SET notify_business=?, ...`), és a PATCH
 * a hiányzó mezőket `!== false` miatt BEKAPCSOLTNAK veszi. Ha a remit is ott
 * lenne, minden beállítás-mentés vagy bekapcsolná, vagy kitörölné az opt-int.
 * Így viszont a két útvonal független: a remitet csak az írja, aki kifejezetten
 * azt kapcsolja.
 */
export async function getPushRemitPref(endpoint: string): Promise<boolean> {
  try {
    const row = await getDB()
      .prepare("SELECT notify_remit FROM push_subscriptions WHERE endpoint = ? LIMIT 1")
      .bind(endpoint)
      .first<{ notify_remit: number | null }>();
    return row?.notify_remit === 1;
  } catch {
    return false; // a 0137 migráció még nem futott → nincs opt-in
  }
}

export async function updatePushRemitPref(endpoint: string, on: boolean): Promise<boolean> {
  try {
    const res = await getDB()
      .prepare("UPDATE push_subscriptions SET notify_remit = ? WHERE endpoint = ?")
      .bind(on ? 1 : 0, endpoint)
      .run();
    return (res.meta.changes ?? 0) > 0;
  } catch {
    return false; // migráció előtt csendben nem-op (a UI hibát jelez)
  }
}

/**
 * Idempotens napi-guard a napi nudge cronhoz: „lefoglalja" a mai napot.
 * @returns true, ha MOST foglaltuk le (szabad küldeni); false, ha ma már ment
 *          (vagy a tábla még nincs migrálva — ilyenkor inkább NEM küldünk vakon).
 */
export async function claimDailyNudge(day: string): Promise<boolean> {
  try {
    const res = await getDB()
      .prepare("INSERT INTO daily_nudge_log (day) VALUES (?) ON CONFLICT(day) DO NOTHING")
      .bind(day)
      .run();
    return (res.meta.changes ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Szezonális push kampány „lefoglalása" (évente egyszer). `true`, ha MOST foglalta le
 * (még nem ment ki); `false`, ha már elküldve. Idempotens. Kulcs pl. "krankenkasse-2026".
 * Lásd 0099 migráció.
 */
export async function claimSeasonalPush(key: string): Promise<boolean> {
  try {
    const res = await getDB()
      .prepare("INSERT INTO seasonal_push_log (campaign_key) VALUES (?) ON CONFLICT(campaign_key) DO NOTHING")
      .bind(key)
      .run();
    return (res.meta.changes ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * A kliens szinkronizálja a (localStorage-beli) streak-jét a saját push-
 * feliratkozására, hogy a streak-mentő cron tudjon kinek szólni. Best-effort:
 * ha az oszlopok még hiányoznak (0085 előtt), csendben elnyeljük.
 */
export async function syncSubscriptionStreak(endpoint: string, streakLen: number, lastActiveDay: string): Promise<void> {
  try {
    await getDB()
      .prepare("UPDATE push_subscriptions SET streak_len = ?, last_active_day = ? WHERE endpoint = ?")
      .bind(Math.max(0, Math.round(streakLen) || 0), lastActiveDay, endpoint)
      .run();
  } catch {
    /* 0085 migráció előtt — nincs hova írni, kihagyjuk */
  }
}

export interface StreakSaveTarget { endpoint: string; p256dh: string; auth: string; streak_len: number; }

/**
 * Streak-mentő célpontok: akik TEGNAP voltak aktívak (azaz ma még nem, a
 * sorozatuk ma szakadhat meg), elég hosszú sorozattal, és ma még nem kaptak
 * streak-mentő pusht. A `notify_daily` opt-outot tiszteletben tartjuk.
 */
export async function getStreakSaveTargets(yesterday: string, today: string, minStreak: number): Promise<StreakSaveTarget[]> {
  try {
    const { results } = await getDB()
      .prepare(
        `SELECT endpoint, p256dh, auth, streak_len FROM push_subscriptions
         WHERE last_active_day = ? AND streak_len >= ?
           AND COALESCE(notify_daily, 1) = 1
           AND (streak_save_sent_day IS NULL OR streak_save_sent_day <> ?)`,
      )
      .bind(yesterday, minStreak, today)
      .all<StreakSaveTarget>();
    return results;
  } catch {
    return [];
  }
}

/** Megjelöli, hogy ez a feliratkozás ma kapott streak-mentő pusht (idempotencia). */
export async function markStreakSaveSent(endpoint: string, today: string): Promise<void> {
  try {
    await getDB()
      .prepare("UPDATE push_subscriptions SET streak_save_sent_day = ? WHERE endpoint = ?")
      .bind(today, endpoint)
      .run();
  } catch {
    /* best-effort */
  }
}

// --- Email Digest ------------------------------------------------------------

export interface DigestSubscriberRow {
  id: string; email: string; canton_code: string | null; confirmed: number; confirm_token: string | null; unsubscribe_token: string; terms_version: string | null; accepted_terms_at: string | null; ip_hash: string | null; created_at: string; last_sent_at: string | null;
}

export interface CreateDigestSubscriberInput {
  id: string; email: string; cantonCode: string | null; confirmToken: string; unsubscribeToken: string; termsVersion: string; acceptedTermsAt: string; ipHash: string | null;
}

export async function createDigestSubscriber(input: CreateDigestSubscriberInput): Promise<void> {
  await getDB().prepare(`INSERT INTO digest_subscribers (id, email, canton_code, confirm_token, unsubscribe_token, terms_version, accepted_terms_at, ip_hash, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0) ON CONFLICT(email) DO UPDATE SET canton_code = excluded.canton_code, confirm_token = excluded.confirm_token, unsubscribe_token = excluded.unsubscribe_token, terms_version = excluded.terms_version, accepted_terms_at = excluded.accepted_terms_at, ip_hash = excluded.ip_hash, confirmed = 0`).bind(input.id, input.email.toLowerCase(), input.cantonCode, input.confirmToken, input.unsubscribeToken, input.termsVersion, input.acceptedTermsAt, input.ipHash).run();
}

export async function confirmDigestSubscriber(confirmToken: string): Promise<boolean> {
  const res = await getDB().prepare("UPDATE digest_subscribers SET confirmed = 1, confirm_token = NULL WHERE confirm_token = ?").bind(confirmToken).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteDigestSubscriberByUnsubToken(token: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM digest_subscribers WHERE unsubscribe_token = ?").bind(token).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Admin Stats -------------------------------------------------------------

export interface AdminStats { businesses: number; businessesVerified: number; reviews: number; digestSubscribersConfirmed: number; pushSubscriptions: number; jobs: number; employers: number; }

export async function getAdminStats(country?: string | null): Promise<AdminStats> {
  const db = getDB();
  const q = (sql: string, ...binds: unknown[]) => db.prepare(sql).bind(...binds).first<{ n: number }>();
  // Ország-szűrő CSAK a country_code-os tábláknál (businesses/events/jobs). A
  // reviews/push/employers/newsletter platform-szintű (nincs country_code) → globális.
  const filter = !!country && country !== "all";
  const cc = filter ? " AND country_code = ?" : "";
  const ccW = filter ? " WHERE country_code = ?" : "";
  const a = filter ? [country] : [];
  const [businesses, verified, reviews, push, jobs, employers] = await Promise.all([
    q(`SELECT COUNT(*) AS n FROM businesses${ccW}`, ...a),
    q(`SELECT COUNT(*) AS n FROM businesses WHERE verified = 1${cc}`, ...a),
    q("SELECT COUNT(*) AS n FROM reviews WHERE hidden = 0"),
    q("SELECT COUNT(*) AS n FROM push_subscriptions"),
    q(`SELECT COUNT(*) AS n FROM jobs WHERE status = 'active' AND moderation_status = 1${cc}`, ...a),
    q("SELECT COUNT(*) AS n FROM employers"),
  ]);
  // Megerősített hírlevél-feliratkozók. A régi digest_subscribers táblát eldobtuk
  // (0033); az új newsletter_subscribers (0066). Defenzív: ha a tábla hiányozna
  // (migráció nem futott), 0-ra esünk vissza a régi viselkedés szerint.
  const newsletter = await db
    .prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE confirmed_at IS NOT NULL")
    .first<{ n: number }>()
    .catch(() => null);
  return {
    businesses: businesses?.n ?? 0,
    businessesVerified: verified?.n ?? 0,
    reviews: reviews?.n ?? 0,
    digestSubscribersConfirmed: newsletter?.n ?? 0,
    pushSubscriptions: push?.n ?? 0,
    jobs: jobs?.n ?? 0,
    employers: employers?.n ?? 0
  };
}

// --- AI-használat (Workers AI token-fogyás, admin monitoring) -----------------

export interface AiUsageModelRow {
  model: string;
  calls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
export interface AiUsageStats {
  /** Mai (UTC) összes hívás + token. */
  todayCalls: number;
  todayTokens: number;
  /** Utolsó 7 nap (mai napot is beleértve). */
  last7Calls: number;
  last7Tokens: number;
  /** Mai bontás modellenként (fogyás szerint csökkenő). */
  todayByModel: AiUsageModelRow[];
}

export async function getAiUsageStats(): Promise<AiUsageStats> {
  const today = new Date().toISOString().slice(0, 10);
  const d7 = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
  const db = getDB();

  // A tábla a 0077 migrációval jön létre; ha még nincs, üres statot adunk vissza.
  const byModel = await db
    .prepare(
      `SELECT model, calls, prompt_tokens AS pt, completion_tokens AS ct
       FROM ai_usage_daily WHERE day = ?
       ORDER BY (prompt_tokens + completion_tokens) DESC`,
    )
    .bind(today)
    .all<{ model: string; calls: number; pt: number; ct: number }>()
    .catch(() => ({ results: [] as { model: string; calls: number; pt: number; ct: number }[] }));

  const last7 = await db
    .prepare(
      `SELECT COALESCE(SUM(calls),0) AS calls, COALESCE(SUM(prompt_tokens + completion_tokens),0) AS tot
       FROM ai_usage_daily WHERE day >= ?`,
    )
    .bind(d7)
    .first<{ calls: number; tot: number }>()
    .catch(() => null);

  const todayByModel: AiUsageModelRow[] = (byModel.results ?? []).map((r) => ({
    model: r.model,
    calls: r.calls ?? 0,
    promptTokens: r.pt ?? 0,
    completionTokens: r.ct ?? 0,
    totalTokens: (r.pt ?? 0) + (r.ct ?? 0),
  }));

  return {
    todayCalls: todayByModel.reduce((n, r) => n + r.calls, 0),
    todayTokens: todayByModel.reduce((n, r) => n + r.totalTokens, 0),
    last7Calls: last7?.calls ?? 0,
    last7Tokens: last7?.tot ?? 0,
    todayByModel,
  };
}

// --- Email-használat (Resend napi limit-figyelés, admin monitoring) ----------

/** Egy SIKERES email-küldés naplózása (napi összesítő). Best-effort: a számláló
 *  (tábla hiányzik / hiba) SOSEM törheti meg az email-küldést. */
export async function recordEmailSent(): Promise<void> {
  return recordEmailsSent(1);
}

/** Napi email-számláló növelése N-nel (pl. tömeges hírlevél-batch után). Best-effort. */
export async function recordEmailsSent(n: number): Promise<void> {
  if (n <= 0) return;
  try {
    const day = new Date().toISOString().slice(0, 10);
    await getDB()
      .prepare(
        `INSERT INTO email_usage_daily (day, count) VALUES (?, ?)
         ON CONFLICT(day) DO UPDATE SET count = count + ?`,
      )
      .bind(day, n, n)
      .run();
  } catch {
    /* a számláló sosem törheti meg az emailt */
  }
}

export interface EmailUsageStats {
  todayCount: number;
  last7Count: number;
  /** A Resend ingyenes napi limitje (tájékoztató küszöb). */
  dailyFreeLimit: number;
}

export async function getEmailUsageStats(): Promise<EmailUsageStats> {
  const today = new Date().toISOString().slice(0, 10);
  const d7 = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
  const db = getDB();
  // A 0078 migráció hozza létre a táblát; addig defenzíven 0.
  const todayRow = await db
    .prepare("SELECT count FROM email_usage_daily WHERE day = ?")
    .bind(today)
    .first<{ count: number }>()
    .catch(() => null);
  const last7 = await db
    .prepare("SELECT COALESCE(SUM(count),0) AS n FROM email_usage_daily WHERE day >= ?")
    .bind(d7)
    .first<{ n: number }>()
    .catch(() => null);
  return {
    todayCount: todayRow?.count ?? 0,
    last7Count: last7?.n ?? 0,
    dailyFreeLimit: 100,
  };
}

// --- Funkció-/oldal-használat (privacy-first termék-analitika) ---------------

/**
 * Aggregált használat-számláló: (nap + esemény) → +1. NINCS per-user/IP/cookie
 * adat. A számlálás SOHA nem törhet meg semmit (best-effort, elnyeli a hibát;
 * a tábla a 0079 migrációval jön létre).
 */
export async function recordUsage(event: string): Promise<void> {
  try {
    const day = new Date().toISOString().slice(0, 10);
    await getDB()
      .prepare(
        `INSERT INTO feature_usage_daily (day, event, count) VALUES (?, ?, 1)
         ON CONFLICT(day, event) DO UPDATE SET count = count + 1`,
      )
      .bind(day, event)
      .run();
  } catch {
    /* a számláló sosem törhet meg semmit */
  }
}

export interface UsageRow {
  event: string;
  count: number;
}
export interface FeatureUsageStats {
  days: number;
  rows: UsageRow[];
  total: number;
}

export interface GuideFeedbackRow {
  slug: string;
  up: number;
  down: number;
}

/**
 * A Tudásbázis „Hasznos volt?" szavazatainak cikk-szintű aggregálása (az
 * `action:gfb-up-<slug>` / `gfb-dn-<slug>` usage-eseményekből) — a nyers
 * esemény-lista 81 cikknél olvashatatlan, ez a tartalom-roadmap nézet.
 */
export async function getGuideFeedbackStats(days = 30): Promise<GuideFeedbackRow[]> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  try {
    const { results } = await getDB()
      .prepare(
        `SELECT event, SUM(count) AS count FROM feature_usage_daily
         WHERE day >= ? AND event LIKE 'action:gfb-%' GROUP BY event`,
      )
      .bind(since)
      .all<UsageRow>();
    const bySlug = new Map<string, GuideFeedbackRow>();
    for (const r of results ?? []) {
      const m = /^action:gfb-(up|dn)-([a-z0-9_-]+)$/.exec(r.event);
      if (!m) continue;
      const row = bySlug.get(m[2]) ?? { slug: m[2], up: 0, down: 0 };
      if (m[1] === "up") row.up += r.count ?? 0;
      else row.down += r.count ?? 0;
      bySlug.set(m[2], row);
    }
    return [...bySlug.values()].sort((a, b) => b.up + b.down - (a.up + a.down));
  } catch {
    return []; // tábla még nincs (0079 migráció előtt)
  }
}

export interface CoverageGapRow {
  country: string; // CH/AT/DE/NL
  categoryId: string;
  count: number;
}

/**
 * Lefedettségi rések: a Szaknévsor NULLA-találatos kategória-keresései
 * (`action:zero-<cc>-<kategória>` usage-eseményekből) ország+kategória szerint —
 * megmutatja, HOL van kereslet kínálat nélkül (seed-prioritás az operátornak).
 */
export async function getCoverageGapStats(days = 30): Promise<CoverageGapRow[]> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  try {
    const { results } = await getDB()
      .prepare(
        `SELECT event, SUM(count) AS count FROM feature_usage_daily
         WHERE day >= ? AND event LIKE 'action:zero-%' GROUP BY event`,
      )
      .bind(since)
      .all<UsageRow>();
    const out: CoverageGapRow[] = [];
    for (const r of results ?? []) {
      const m = /^action:zero-([a-z]{2})-([a-z0-9_-]+)$/.exec(r.event);
      if (!m) continue;
      out.push({ country: m[1].toUpperCase(), categoryId: m[2], count: r.count ?? 0 });
    }
    return out.sort((a, b) => b.count - a.count);
  } catch {
    return []; // tábla még nincs (0079 migráció előtt)
  }
}

// --- Heti operátori jelentés (weekly-report) ---------------------------------

export interface WeeklyOpsCounts {
  leads7: number;
  lockedLeads7: number;
  cv7: number;
  quizPlays7: number;
  jobApps7: number;
  b2bNew7: number;
  pushSubsTotal: number;
  newsletterSubsTotal: number;
  /** Moderációra váró Keresek-hirdetés (a jóváhagyás indítja a lead-routingot!). */
  pendingRequests: number;
  /** Moderációra váró élettörténet. */
  pendingStories: number;
  /** Új albérlet-hirdetés a héten (beküldött, státusztól függetlenül). */
  housingNew7: number;
  /** Élő (jóváhagyott, aktív, le nem járt) albérlet-hirdetés — állomány. */
  housingLive: number;
  /** Moderációra váró albérlet-hirdetés (időérzékeny!). */
  pendingHousing: number;
  /** Kritikus szaknévsor adat-integritási hiba (rossz pin / idegen-országbeli
   *  vagy hiányzó tartomány / bbox-on kívüli koord). 0 = egészséges. Ld.
   *  `npm run db:health` a részletes, sor-szintű ellenőrzéshez. */
  dataHealthIssues: number;
}

/** A négy ország geokód-fallback középpontja (prepare-business-import.mjs). */
const HEALTH_CENTERS: Record<string, [number, number]> = {
  CH: [46.8, 8.23], AT: [47.6, 14.5], DE: [51.1, 10.4], NL: [52.13, 5.29],
};
/** Ország-bbox [latMin, latMax, lngMin, lngMax] (prepare-business-import.mjs). */
const HEALTH_BBOX: Record<string, [number, number, number, number]> = {
  CH: [45.8, 47.9, 5.9, 10.6], AT: [46.3, 49.1, 9.4, 17.2],
  DE: [47.2, 55.1, 5.8, 15.1], NL: [50.7, 53.6, 3.3, 7.3],
};
/** Érvényes tartomány-kódok országonként (regions.ts / cantons.ts tükre). */
const HEALTH_CANTONS: Record<string, string[]> = {
  AT: ["W", "NOE", "OOE", "STM", "TIR", "KTN", "SBG", "VBG", "BGL"],
  DE: ["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"],
  NL: ["NH", "ZH", "UT", "NB", "GE", "OV", "LI", "FR", "GR", "DR", "FL", "ZE"],
  CH: ["ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR", "SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG", "TI", "VD", "VS", "NE", "GE", "JU"],
};

/**
 * A látható szaknévsor KRITIKUS adat-integritási hibáinak száma egyetlen
 * lekérdezésben — a `scripts/db-health.mjs` CLI edge-kompatibilis, aggregált
 * párja (a heti operátori emailhez). Ugyanaz a három kritikus feltétel:
 * ország-közép/hiányzó pin, idegen-országbeli vagy hiányzó tartomány,
 * bbox-on kívüli koordináta. Best-effort: hibánál 0 (a riportot sose töri).
 */
export async function getDataHealthCount(): Promise<number> {
  const conds: string[] = [];
  // 1) Ország-közép vagy hiányzó pin.
  conds.push("lat IS NULL OR lat = 0");
  for (const [, [lat, lng]] of Object.entries(HEALTH_CENTERS)) {
    conds.push(`(lat BETWEEN ${(lat - 0.01).toFixed(2)} AND ${(lat + 0.01).toFixed(2)} AND lng BETWEEN ${(lng - 0.01).toFixed(2)} AND ${(lng + 0.01).toFixed(2)})`);
  }
  // 2) Hiányzó VAGY idegen-országbeli (a saját ország érvényes halmazán kívüli) tartomány.
  conds.push("canton_code IS NULL OR canton_code = ''");
  for (const [cc, codes] of Object.entries(HEALTH_CANTONS)) {
    const inList = codes.map((c) => `'${c}'`).join(",");
    conds.push(`(country_code = '${cc}' AND canton_code NOT IN (${inList}))`);
  }
  // 3) Ország bbox-án kívüli koordináta.
  for (const [cc, [latMin, latMax, lngMin, lngMax]] of Object.entries(HEALTH_BBOX)) {
    conds.push(`(country_code = '${cc}' AND lat IS NOT NULL AND lat != 0 AND (lat < ${latMin} OR lat > ${latMax} OR lng < ${lngMin} OR lng > ${lngMax}))`);
  }
  try {
    const row = await getDB()
      .prepare(`SELECT COUNT(*) AS n FROM businesses WHERE COALESCE(hidden,0)=0 AND (${conds.join(" OR ")})`)
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

/**
 * A hétfői operátori pulzus-email számai egyetlen lekérdezésben (skalár
 * al-selectek). 7-napos ablakok + két állomány-jellegű összlétszám.
 * b2b_projects.created_at EPOCH MS (integer!) — a többi datetime-szöveg.
 */
export async function getWeeklyOpsCounts(): Promise<WeeklyOpsCounts> {
  try {
    const row = await getDB()
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM business_leads WHERE created_at >= datetime('now','-7 days')) AS leads7,
           (SELECT COUNT(*) FROM business_leads WHERE created_at >= datetime('now','-7 days') AND COALESCE(locked,0)=1) AS locked7,
           (SELECT COUNT(*) FROM cv_submissions WHERE created_at >= datetime('now','-7 days')) AS cv7,
           (SELECT COALESCE(SUM(count),0) FROM quiz_daily_stats WHERE day >= date('now','-6 days')) AS quiz7,
           (SELECT COUNT(*) FROM job_applications WHERE submitted_at >= datetime('now','-7 days')) AS apps7,
           (SELECT COUNT(*) FROM b2b_projects WHERE created_at >= (strftime('%s','now') - 604800) * 1000) AS b2b7,
           (SELECT COUNT(*) FROM push_subscriptions) AS push_total,
           (SELECT COUNT(*) FROM newsletter_subscribers) AS nl_total,
           (SELECT COUNT(*) FROM service_requests WHERE moderation_status = 0) AS pending_req,
           (SELECT COUNT(*) FROM stories WHERE moderation_status = 0) AS pending_story,
           (SELECT COUNT(*) FROM kinti_housing_listings WHERE created_at >= unixepoch('now','-7 days')) AS housing7,
           (SELECT COUNT(*) FROM kinti_housing_listings WHERE is_active = 1 AND moderation_status = 1 AND created_at > unixepoch('now','-60 days')) AS housing_live,
           (SELECT COUNT(*) FROM kinti_housing_listings WHERE moderation_status = 0) AS pending_housing`,
      )
      .first<{
        leads7: number; locked7: number; cv7: number; quiz7: number;
        apps7: number; b2b7: number; push_total: number; nl_total: number;
        pending_req: number; pending_story: number;
        housing7: number; housing_live: number; pending_housing: number;
      }>();
    // Adat-integritási pulzus — KÜLÖN best-effort, hogy egy health-query hiba
    // ne nullázza az egész pulzus-riportot.
    const dataHealthIssues = await getDataHealthCount();
    return {
      leads7: row?.leads7 ?? 0,
      lockedLeads7: row?.locked7 ?? 0,
      cv7: row?.cv7 ?? 0,
      quizPlays7: row?.quiz7 ?? 0,
      jobApps7: row?.apps7 ?? 0,
      b2bNew7: row?.b2b7 ?? 0,
      pushSubsTotal: row?.push_total ?? 0,
      newsletterSubsTotal: row?.nl_total ?? 0,
      pendingRequests: row?.pending_req ?? 0,
      pendingStories: row?.pending_story ?? 0,
      housingNew7: row?.housing7 ?? 0,
      housingLive: row?.housing_live ?? 0,
      pendingHousing: row?.pending_housing ?? 0,
      dataHealthIssues,
    };
  } catch {
    return {
      leads7: 0, lockedLeads7: 0, cv7: 0, quizPlays7: 0, jobApps7: 0, b2bNew7: 0,
      pushSubsTotal: 0, newsletterSubsTotal: 0, pendingRequests: 0, pendingStories: 0,
      housingNew7: 0, housingLive: 0, pendingHousing: 0, dataHealthIssues: 0,
    };
  }
}

/** Az elmúlt N nap eseményei darabszám szerint csökkenőben (admin nézet). */
export async function getFeatureUsageStats(days = 7): Promise<FeatureUsageStats> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  try {
    const { results } = await getDB()
      .prepare(
        `SELECT event, SUM(count) AS count FROM feature_usage_daily
         WHERE day >= ? GROUP BY event ORDER BY count DESC`,
      )
      .bind(since)
      .all<UsageRow>();
    const rows = results ?? [];
    return { days, rows, total: rows.reduce((s, r) => s + (r.count ?? 0), 0) };
  } catch {
    return { days, rows: [], total: 0 }; // tábla még nincs (0079 migráció előtt)
  }
}

// --- Admin Trends (14 napos napi bontás) -------------------------------------

export interface AdminTrends {
  /** 14 nap ISO-dátum címkéi (UTC, régitől újig). */
  days: string[];
  /** Napi új vállalkozás-regisztrációk. */
  businessRegistrations: number[];
  /** Napi benchmark-beküldések (bér + lakbér együtt). */
  benchmarkSubmissions: number[];
  /** Napi aktív beküldők — egyedi ip_hash a fő közreműködési táblákból (DAU-proxy). */
  activeContributors: number[];
  /** Összegzések az utolsó 7 napra. */
  newBusinesses7d: number;
  newBenchmark7d: number;
  /** Egyedi beküldő (ip_hash) az utolsó 7 napban — NEM a napi értékek összege. */
  activeContributors7d: number;
}

const TREND_DAYS = 14;

/** Az utolsó n nap ISO-dátumai (UTC), régitől újig. */
function lastNDatesUtc(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getAdminTrends(): Promise<AdminTrends> {
  const db = getDB();
  // TREND_DAYS egész-szám konstans; a Math.trunc injektálás-biztossá teszi akkor is,
  // ha valaha dinamikussá tennék. FONTOS: bemenet-alapú értéket SOHA ne interpolálj
  // SQL-be — azt mindig `.bind()`-eld.
  const trendDays = Math.max(1, Math.trunc(Number(TREND_DAYS) || 14));
  const since = `datetime('now', '-${trendDays} days')`;

  // Napi bontású lekérdezések (UTC dátumkulcs). A hiányzó napokat JS-ben 0-zzuk.
  const dailyBusiness = db
    .prepare(`SELECT strftime('%Y-%m-%d', created_at) AS d, COUNT(*) AS n
              FROM businesses WHERE created_at >= ${since} GROUP BY d`)
    .all<{ d: string; n: number }>();

  const dailyBenchmark = db
    .prepare(`SELECT strftime('%Y-%m-%d', created_at) AS d, COUNT(*) AS n FROM (
                SELECT created_at FROM salary_benchmarks WHERE created_at >= ${since}
                UNION ALL
                SELECT created_at FROM rent_benchmarks   WHERE created_at >= ${since}
              ) GROUP BY d`)
    .all<{ d: string; n: number }>();

  // DAU-proxy: egyedi ip_hash/nap a fő közreműködési táblákból. Account nincs,
  // így ez "aktív beküldőt" mér (nem passzív olvasót) — adatvédelem-barát.
  const activitySubquery = `
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM salary_benchmarks   WHERE created_at >= ${since} AND ip_hash IS NOT NULL
    UNION ALL
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM rent_benchmarks     WHERE created_at >= ${since} AND ip_hash IS NOT NULL
    UNION ALL
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM business_submissions WHERE created_at >= ${since} AND ip_hash IS NOT NULL
    UNION ALL
    SELECT strftime('%Y-%m-%d', published_at) AS d, ip_hash FROM reviews           WHERE published_at >= ${since} AND ip_hash IS NOT NULL`;

  const dailyActive = db
    .prepare(`SELECT d, COUNT(DISTINCT ip_hash) AS n FROM (${activitySubquery}) GROUP BY d`)
    .all<{ d: string; n: number }>();

  // 7 napos egyedi beküldő (a napi distinct-ek összege félrevezetne).
  const active7d = db
    .prepare(`SELECT COUNT(DISTINCT ip_hash) AS n FROM (${activitySubquery.replace(
      new RegExp(`datetime\\('now', '-${TREND_DAYS} days'\\)`, "g"),
      "datetime('now', '-7 days')",
    )})`)
    .first<{ n: number }>();

  const [biz, bench, active, a7] = await Promise.all([dailyBusiness, dailyBenchmark, dailyActive, active7d]);

  const days = lastNDatesUtc(TREND_DAYS);
  const toSeries = (rows: { d: string; n: number }[]): number[] => {
    const map = new Map(rows.map((r) => [r.d, r.n]));
    return days.map((d) => map.get(d) ?? 0);
  };

  const businessRegistrations = toSeries(biz.results);
  const benchmarkSubmissions = toSeries(bench.results);
  const activeContributors = toSeries(active.results);
  const sumLast7 = (arr: number[]) => arr.slice(-7).reduce((s, n) => s + n, 0);

  return {
    days,
    businessRegistrations,
    benchmarkSubmissions,
    activeContributors,
    newBusinesses7d: sumLast7(businessRegistrations),
    newBenchmark7d: sumLast7(benchmarkSubmissions),
    activeContributors7d: a7?.n ?? 0,
  };
}

// --- Radars ------------------------------------------------------------------

export interface KintiRadar { id: string; pushEndpoint: string; radarType: 'exchange_rate' | 'job_alert'; parameters: string; active: number; createdAt: string; }

export async function saveRadar(data: { id: string; pushEndpoint: string; radarType: string; parameters: string; email?: string | null }) {
  await getDB().prepare('INSERT INTO kinti_radars (id, push_endpoint, radar_type, parameters, email) VALUES (?, ?, ?, ?, ?)').bind(data.id, data.pushEndpoint, data.radarType, data.parameters, data.email ?? null).run();
}

export async function listRadarsByEndpoint(endpoint: string): Promise<KintiRadar[]> {
  const { results } = await getDB().prepare('SELECT * FROM kinti_radars WHERE push_endpoint = ? ORDER BY created_at DESC').bind(endpoint).all<{
    id: string; push_endpoint: string; radar_type: string; parameters: string; active: number; created_at: string;
  }>();
  return (results ?? []).map((r) => ({ id: String(r.id), pushEndpoint: String(r.push_endpoint), radarType: String(r.radar_type) as KintiRadar["radarType"], parameters: String(r.parameters), active: Number(r.active), createdAt: String(r.created_at) }));
}

export async function deleteRadar(id: string, endpoint: string): Promise<boolean> {
  const res = await getDB().prepare('DELETE FROM kinti_radars WHERE id = ? AND push_endpoint = ?').bind(id, endpoint).run();
  return (res.meta.changes ?? 0) > 0;
}

/** Radar törlése CSAK id alapján — az email-leiratkozó linkhez (a radar id egy
 *  kitalálhatatlan UUID, így alacsony tét mellett elég azonosító). */
export async function deleteRadarById(id: string): Promise<boolean> {
  const res = await getDB().prepare('DELETE FROM kinti_radars WHERE id = ?').bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getActiveRadarsByType(radarType: string): Promise<{id: string, pushEndpoint: string, parameters: string, email: string | null, lastFiredAt: string | null}[]> {
  const { results } = await getDB().prepare('SELECT id, push_endpoint, parameters, email, last_fired_at FROM kinti_radars WHERE radar_type = ? AND active = 1').bind(radarType).all<{ id: string; push_endpoint: string; parameters: string; email: string | null; last_fired_at: string | null }>();
  return (results ?? []).map(r => ({ id: String(r.id), pushEndpoint: String(r.push_endpoint), parameters: String(r.parameters), email: r.email ? String(r.email) : null, lastFiredAt: r.last_fired_at ? String(r.last_fired_at) : null }));
}

/** A radar „azonnali küldés" idejének frissítése (a napi első találat után). */
export async function markRadarFired(radarId: string): Promise<void> {
  await getDB().prepare("UPDATE kinti_radars SET last_fired_at = datetime('now') WHERE id = ?").bind(radarId).run();
}

/** Email-cím felvétele a suppression-listára (Resend bounce/complaint webhook). */
export async function suppressEmail(email: string, reason: string): Promise<void> {
  await getDB()
    .prepare("INSERT INTO email_suppressions (email, reason) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET reason = excluded.reason")
    .bind(email.toLowerCase(), reason)
    .run();
}

/** Le van-e tiltva a cím? FAIL-OPEN: hiba (pl. hiányzó tábla) esetén false → küldhető. */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  try {
    const row = await getDB()
      .prepare("SELECT 1 AS x FROM email_suppressions WHERE email = ? LIMIT 1")
      .bind(email.toLowerCase())
      .first<{ x: number }>();
    return !!row;
  } catch {
    return false;
  }
}

/** Egy email-címhez tartozó összes radar törlése (spam-panasznál). A törölt sorok száma. */
export async function deleteRadarsByEmail(email: string): Promise<number> {
  const res = await getDB().prepare("DELETE FROM kinti_radars WHERE lower(email) = ?").bind(email.toLowerCase()).run();
  return res.meta.changes ?? 0;
}

// --- Határidő-emlékeztetők (push, anonim endpointhoz kötve) ------------------

export interface DeadlineRow {
  id: string; endpoint: string; p256dh: string | null; auth: string | null;
  title: string; due_date: string; sent: string; email: string | null;
}

/**
 * A felhasználó határidőinek szinkronja az endpointjához. Idempotens: a
 * VÁLTOZATLAN tételeket (title+due_date) megőrzi a `sent` állapotukkal együtt
 * (nincs duplikált emlékeztető újra-szinkronkor), az újakat beszúrja, a
 * törölteket eltávolítja, a push-kulcsokat frissíti.
 */
export async function syncDeadlineReminders(
  endpoint: string,
  p256dh: string | null,
  auth: string | null,
  deadlines: { title: string; date: string }[],
  email: string | null = null,
): Promise<void> {
  const db = getDB();
  const { results } = await db
    .prepare("SELECT id, title, due_date FROM deadline_reminders WHERE endpoint = ?")
    .bind(endpoint)
    .all<{ id: string; title: string; due_date: string }>();
  const existing = results ?? [];
  const key = (t: string, d: string) => `${t}\u0000${d}`;
  const existingKeys = new Set(existing.map((r) => key(r.title, r.due_date)));
  const incomingKeys = new Set(deadlines.map((d) => key(d.title, d.date)));

  const stmts = [];
  // Eltávolítjuk a már nem létező tételeket.
  const toDelete = existing.filter((r) => !incomingKeys.has(key(r.title, r.due_date))).map((r) => r.id);
  if (toDelete.length) {
    stmts.push(db.prepare(`DELETE FROM deadline_reminders WHERE id IN (${toDelete.map(() => "?").join(",")})`).bind(...toDelete));
  }
  // Frissítjük a push-kulcsokat (a feliratkozás megújulhatott) + az email-t
  // (opt-in emailes emlékeztető; null = csak-push) + a keep-alive lejáratot (a
  // szinkron CSAK aktív PRO-usertől jöhet → ha lejár a PRO, ~40 nap múlva magától
  // leáll). Minden meglévő sort érint.
  stmts.push(db.prepare("UPDATE deadline_reminders SET p256dh = ?, auth = ?, email = ?, expires_at = datetime('now','+40 days') WHERE endpoint = ?").bind(p256dh, auth, email, endpoint));
  // Beszúrjuk az új tételeket (sent='').
  for (const d of deadlines) {
    if (existingKeys.has(key(d.title, d.date))) continue;
    if (!d.title?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) continue;
    stmts.push(
      db.prepare("INSERT INTO deadline_reminders (id, endpoint, p256dh, auth, title, due_date, sent, email, expires_at) VALUES (?, ?, ?, ?, ?, ?, '', ?, datetime('now','+40 days'))")
        .bind(crypto.randomUUID(), endpoint, p256dh, auth, d.title.trim().slice(0, 120), d.date, email),
    );
  }
  if (stmts.length) await db.batch(stmts);
}

/** Az emlékeztetők kikapcsolása (az endpoint összes határidejének törlése). */
export async function deleteDeadlineReminders(endpoint: string): Promise<void> {
  await getDB().prepare("DELETE FROM deadline_reminders WHERE endpoint = ?").bind(endpoint).run();
}

/** A 14 napon belül esedékes (nem lejárt) határidők — a cron emlékeztetőjéhez. */
export async function getDueDeadlineReminders(): Promise<DeadlineRow[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, endpoint, p256dh, auth, title, due_date, sent, email FROM deadline_reminders
        WHERE due_date >= date('now') AND due_date <= date('now', '+14 days')
          AND (expires_at IS NULL OR expires_at >= datetime('now'))`,
    )
    .all<DeadlineRow>();
  return results ?? [];
}

/** Egy határidő `sent` (elküldött küszöbök) mezőjének frissítése. */
export async function markDeadlineSent(id: string, sent: string): Promise<void> {
  await getDB().prepare("UPDATE deadline_reminders SET sent = ? WHERE id = ?").bind(sent, id).run();
}

/** Egy (radar, job) pár betétele a digest-sorba (a napi összefoglalóhoz). */
export async function enqueueRadarDigest(radarId: string, jobId: string): Promise<void> {
  await getDB().prepare("INSERT INTO radar_digest_queue (id, radar_id, job_id) VALUES (?, ?, ?)").bind(crypto.randomUUID(), radarId, jobId).run();
}

/** A digest-sor (csak AKTÍV radarokhoz), a radar push/email-csatornájával együtt. */
export async function getRadarDigestQueue(): Promise<{ queueId: string; radarId: string; jobId: string; pushEndpoint: string; email: string | null }[]> {
  const { results } = await getDB().prepare(
    `SELECT q.id AS queue_id, q.radar_id, q.job_id, r.push_endpoint, r.email
       FROM radar_digest_queue q JOIN kinti_radars r ON r.id = q.radar_id
      WHERE r.active = 1`,
  ).all<{ queue_id: string; radar_id: string; job_id: string; push_endpoint: string; email: string | null }>();
  return (results ?? []).map(r => ({ queueId: String(r.queue_id), radarId: String(r.radar_id), jobId: String(r.job_id), pushEndpoint: String(r.push_endpoint), email: r.email ? String(r.email) : null }));
}

/** Feldolgozott digest-sorok törlése (id-lista). */
export async function deleteRadarDigestItems(queueIds: string[]): Promise<void> {
  if (queueIds.length === 0) return;
  const placeholders = queueIds.map(() => "?").join(",");
  await getDB().prepare(`DELETE FROM radar_digest_queue WHERE id IN (${placeholders})`).bind(...queueIds).run();
}
