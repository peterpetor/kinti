import { clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Védett oldalak (RSC-barát redirect): nem `auth.protect()`-tel, hanem manuális
 * `auth() + NextResponse.redirect()`-tel kezeljük — különben a Clerk edge runtime
 * alatt az RSC fetch-eket API-ként kezeli és 404-et dob redirect helyett,
 * megakasztva a kliensoldali soft navigációt a login után.
 */
const isProtectedPage = createRouteMatcher([
  "/profil(.*)",
  "/feltoltes(.*)",
  "/admin(.*)",
]);

const isProtectedApi = createRouteMatcher([
  "/api/owner(.*)", // tulajdonosi írási műveletek (pl. vállalkozás igénylése)
  "/api/admin(.*)", // admin API (pl. event_feeds CRUD)
]);

/**
 * A /profil alatt él, de PUBLIKUS: a Kinti Pass kedvezménykártya. Teljesen
 * kliensoldali (név/kód localStorage), fiók nélkül működik — login-fal nélkül
 * kell elérnie minden felhasználónak.
 */
const isPublicProfilPage = createRouteMatcher(["/profil/kinti-pass"]);

/**
 * Karbantartási mód — jelenleg csak admin éri el a teljes oldalt. Ezek a
 * route-ok mindenki számára elérhetők maradnak (különben nem tud belépni
 * az admin, és nem érkezik be webhook).
 *
 * Ha élesedik a publikus launch: a maintenance-blokk törlésével vagy a
 * MAINTENANCE_MODE env-flag bevezetésével kapcsolható ki.
 */
const isMaintenanceExempt = createRouteMatcher([
  "/keszul",
  "/belepes(.*)",
  "/regisztracio(.*)",
  "/api/webhooks(.*)",
]);

/**
 * Szigorú, nonce-alapú CSP — egyelőre REPORT-ONLY módban (nem blokkol, csak
 * jelent a böngésző-konzolba), hogy élesben kockázat nélkül kiderüljön, mit
 * kell engedélyezni. A nonce minden kéréshez új; a Next 14 a request-header
 * `Content-Security-Policy`-ból olvassa ki és teszi rá a saját scriptjeire, a
 * `'strict-dynamic'` pedig a nonce-olt bootstrap által betöltött további
 * scripteket (Clerk, Turnstile, CF beacon, MapLibre) is megbízhatóvá teszi.
 * A `https: 'unsafe-inline'` csak a strict-dynamic-et NEM támogató régi
 * böngészők fallbackje (azokat az újak figyelmen kívül hagyják).
 *
 * Élesítés: a response-fejléc nevét `Content-Security-Policy`-ra cserélve
 * (a `-Report-Only` levételével) válik kötelezővé — a konzol-jelentések tiszta
 * állapota után.
 */
function buildStrictCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.frankfurter.app https://challenges.cloudflare.com https://cloudflareinsights.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.kinti.app https://api.maptiler.com https://tiles.openfreemap.org https://*.basemaps.cartocdn.com https://*.paddle.com",
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.kinti.app https://*.paddle.com https://www.youtube-nocookie.com https://www.youtube.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://*.paddle.com",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join("; ");
}

/**
 * Biztonsági fejlécek a DINAMIKUS (SSR/edge) válaszokra.
 *
 * ⚠️ MIÉRT ITT: a `public/_headers` fájl a Cloudflare Pages-en KIZÁRÓLAG a
 * statikusan kiszolgált fájlokra érvényes — a Pages Function (a Next edge
 * worker) által generált válaszokra NEM. Mivel az app minden oldala
 * `runtime="edge"` + `force-dynamic`, a `_headers`-ben definiált védelem a
 * TELJES HTML-felületen hatástalan volt (élesben mérve: statikus fájlon 5
 * fejléc, /szaknevsor-on 0). Ezért a middleware-ben is ki kell tenni őket.
 *
 * Eltérések a `_headers`-hez képest, szándékosan:
 *  • `payment=()` NINCS a Permissions-Policyban — az blokkolná a Payment
 *    Request API-t, amit a Paddle-fizetés használ (a statikus fájloknál ez
 *    sosem számított, itt viszont eltörné a checkoutot).
 *  • `X-Frame-Options: SAMEORIGIN` (a statikus DENY helyett) — így összhangban
 *    van a CSP `frame-ancestors 'self'`-fel, és nem tör el semmilyen
 *    saját-eredetű beágyazást. A kattintás-eltérítés ellen ugyanúgy véd.
 */
function setSecurityHeaders(res: NextResponse, pathname: string): void {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), usb=(), interest-cohort=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // A token-alapú kezelő-oldalak URL-je TITKOT tartalmaz — kifelé mutató link
  // esetén a Referer fejléc kiszivárogtatná. Ezeken az oldalakon nincs referrer.
  // (Ez a szabály a _headers-ben is szerepelt, de ott — dinamikus route lévén —
  // sosem érvényesült.)
  const isTokenPage =
    pathname.startsWith("/szaknevsor/kezeles/") ||
    pathname.startsWith("/velemeny-kezeles/") ||
    pathname.startsWith("/leiratkozas/");
  res.headers.set("Referrer-Policy", isTokenPage ? "no-referrer" : "strict-origin-when-cross-origin");
}

/**
 * ÉRVÉNYESÍTETT (nem Report-Only) CSP — CSAK azok a direktívák, amelyek NEM a
 * scriptekről szólnak, ezért nem tudják eltörni a beágyazott boot-szkripteket
 * (ország-kapu, jogi kapu, téma, Android-detektálás) sem a statikus oldalakat.
 *
 * Miért külön a `buildStrictCsp`-től: a teljes szabályzat élesítése `script-src`
 * miatt nonce/hash-bevezetést és oldalankénti tesztelést igényelne. Ez a szűk
 * halmaz viszont AZONNAL, kockázat nélkül élesíthető, és pont az XSS UTÁNI
 * „adat-kiszivárgás" lépést zárja:
 *
 *  • frame-ancestors — kattintás-eltérítés (az X-Frame-Options modern párja)
 *  • object-src      — plugin-alapú beszúrás (nincs <object>/<embed> az appban)
 *  • base-uri        — <base>-eltérítés: enélkül egy beszúrt <base> MINDEN
 *                      relatív linket/kérést idegen szerverre irányíthatna
 *  • form-action     — beszúrt űrlap ne tudjon adatot idegen szerverre POST-olni
 *
 * A form-action allowlistán a fizetés (Paddle) és a bejelentkezés (Clerk) is
 * rajta van, hogy egyik folyamat se sérüljön.
 */
const ENFORCED_CSP = [
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.paddle.com https://*.clerk.com https://clerk.kinti.app https://*.clerk.accounts.dev",
].join("; ");

/** Edge-kompatibilis base64 nonce (16 random bájt). */
function makeNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const cfEnv = (getRequestContext().env || {}) as { ADMIN_EMAILS?: string };
    const envString = cfEnv.ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
    
    const allowed = envString
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
      
    if (!allowed.length) {
      return false;
    }

    const user = await currentUser();
    if (!user) return false;
    // Csak IGAZOLT (verified) e-mail számít — különben egy támadó a saját
    // fiókjához hozzáadhatna egy nem-igazolt admin-címet, és megkerülné a
    // karbantartási kaput. (Ugyanaz a szabály, mint a lib/admin.ts-ben; ez a
    // másolat korábban lemaradt róla.)
    const emails = user.emailAddresses
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress.toLowerCase());
    return emails.some((e) => allowed.includes(e));
  } catch (err) {
    console.error("[middleware] isCurrentUserAdmin error:", err);
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedApi(req)) {
    await auth.protect();
    return;
  }

  if (isProtectedPage(req) && !isPublicProfilPage(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/belepes", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Karbantartási mód: ha a MAINTENANCE_MODE be van kapcsolva, csak admin láthatja.
  // Egyébként a teljes oldal publikusan elérhető.
  // Cloudflare Pages edge: a vars/secrets a binding-on (getRequestContext().env)
  // jönnek, a process.env nem feltétlenül tartalmazza — előbb onnan olvassuk
  // (mint az ADMIN_EMAILS-nél), process.env csak fallback (dev).
  let maintenanceFlag: string | undefined;
  try {
    maintenanceFlag = (getRequestContext().env as { MAINTENANCE_MODE?: string } | undefined)?.MAINTENANCE_MODE;
  } catch {
    /* nincs request-kontextus → marad a process.env */
  }
  const isMaintenanceMode = (maintenanceFlag ?? process.env.MAINTENANCE_MODE) === "true";
  
  if (isMaintenanceMode && !isMaintenanceExempt(req)) {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.redirect(new URL("/keszul", req.url));
    }
  }

  // Szigorú nonce-alapú CSP CSAK HTML-oldalakra (az API-válaszokban nincs script,
  // ott felesleges). REPORT-ONLY: nem blokkol, csak a konzolba jelent. A request-
  // header `Content-Security-Policy`-t a Next a saját scriptjei nonce-olásához
  // olvassa (a böngészőhöz nem jut el); a kliens csak a Report-Only fejlécet kapja.
  if (!req.nextUrl.pathname.startsWith("/api")) {
    const nonce = makeNonce();
    const csp = buildStrictCsp(nonce);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    // A TELJES szigorú szabályzat továbbra is csak jelent (script-src élesítése
    // nonce/hash-bevezetést igényelne — ld. ENFORCED_CSP kommentje).
    res.headers.set("Content-Security-Policy-Report-Only", csp);
    // A script-független direktívák viszont ÉRVÉNYESEK (kockázatmentes réteg).
    res.headers.set("Content-Security-Policy", ENFORCED_CSP);

    // ── Anonim HTML edge-cache ────────────────────────────────────────────────
    // A kezdőlap és a szaknévsor SSR-je FELHASZNÁLÓ-FÜGGETLEN (nincs auth()/
    // cookies() a render-útvonalukban; a személyre szabás kliens-oldali — lásd a
    // privacy-elvet: a szerver nem köt per-user azonosítót). A HTML így a CDN-en
    // cache-elhető: s-maxage=60 + stale-while-revalidate=300 → meleg TTFB ~50 ms,
    // és a worker-hidegindítást sosem látja felhasználó. A nonce-os CSP-fejléc a
    // HTML-lel EGYÜTT cache-elődik (konzisztens marad). MIDDLEWARE-ben (nem a
    // next.config headers()-ben), mert a force-dynamic oldalak Next-féle
    // Cache-Control-ját csak itt lehet megbízhatóan felülírni ezen a stacken.
    // ⚠️ Éles hatáshoz a kinti.app zónán Cache Rule kell (HTML alapból nem
    // cache-elhető a Cloudflare-nél): "/" és "/szaknevsor" → Eligible for cache,
    // origin TTL tisztelete. A szabály nélkül a fejléc hatástalan (ártalmatlan).
    const cachePath = req.nextUrl.pathname;
    if (cachePath === "/" || cachePath === "/szaknevsor") {
      res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    }
    setSecurityHeaders(res, cachePath);
    return res;
  }

  // API-válaszok: a MIME-sniffing elleni védelem a JSON-végpontokon is számít
  // (a többi fejléc — framing/referrer — HTML nélkül értelmetlen).
  const apiRes = NextResponse.next();
  apiRes.headers.set("X-Content-Type-Options", "nosniff");
  return apiRes;
});

export const config = {
  matcher: [
    // Minden útvonal, kivéve a Next belső fájljait és a statikus assetokat.
    // A /belepes és /regisztracio is IDE TARTOZIK, mert az oldalukon szerveroldali
    // `auth()` hívás van — anélkül hogy a clerkMiddleware lefutna itt, az auth() crash-el.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Az API-kat és trpc-t mindig futtassa.
    "/(api|trpc)(.*)",
  ],
};
