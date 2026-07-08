import { hashIp } from "@/lib/security";
import { addToBlocklist } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

/** A honeypot auto-tiltás élettartama napokban (false-positive önjavítás). */
const HONEYPOT_TTL_DAYS = 7;

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/businesses/honeypot-trigger — MÉZESBÖDÖN (honeypot).
 *
 * A szaknévsor oldalba beágyazunk egy erre mutató, felhasználó elől CSS-sel
 * elrejtett linket. Valódi ember sose kattint rá; a HTML-t linkről linkre
 * fésülő scraper-botok viszont igen → az IP-hashüket a tiltólistára tesszük,
 * és a védett végpontok (bulk lista, kontakt) ezután 403-at adnak nekik.
 *
 * SEO-védelem (KRITIKUS): a jóhiszemű keresőrobotok NEM eshetnek csapdába.
 * Két réteg védi őket: (1) a robots.txt tiltja a teljes /api/-t (a jó bot nem
 * kéri le), (2) ha mégis (vagy egy link-preview bot) → a User-Agent fehérlista
 * miatt NEM tiltjuk, csak ártalmatlan 200-at adunk.
 */

// Jóhiszemű crawler/preview botok — ezeket SOSE tiltjuk (a UA hamisítható, de a
// scraperek jellemzően nem adják ki magukat Googlebotnak; a robots.txt az elsődleges).
const GOOD_BOTS = [
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandex",
  "applebot", "petalbot", "facebookexternalhit", "facebot", "twitterbot",
  "linkedinbot", "whatsapp", "telegrambot", "slackbot", "discordbot",
  "pinterest", "google-inspectiontool", "chrome-lighthouse",
];

function isGoodBot(ua: string): boolean {
  const u = ua.toLowerCase();
  return GOOD_BOTS.some((b) => u.includes(b));
}

async function handle(req: Request): Promise<Response> {
  // Ártalmatlan, semmitmondó válasz — ne áruljuk el, hogy ez csapda volt.
  const innocuous = new Response(null, { status: 204 });
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (isGoodBot(ua)) return innocuous;

    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    if (ipHash) {
      // A közös blocklist-be (admin-feloldó UI már van); AUTO-lejárattal, hogy egy
      // megosztott IP mögötti valódi user ne ragadjon örökre 403-ban.
      await addToBlocklist({
        kind: "ip_hash",
        value: ipHash,
        reason: "Auto-ban: honeypot-csapda (scraper-bot rejtett linket követett).",
        adminUserId: "system-auto-ban",
        ttlDays: HONEYPOT_TTL_DAYS,
      });
    }
  } catch (err) {
    safeLogError("honeypot-trigger", err);
  }
  return innocuous;
}

export const GET = handle;
export const HEAD = handle;
