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
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.kinti.app https://*.paddle.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://*.paddle.com",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join("; ");
}

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
    const emails = user.emailAddresses.map((e) => e.emailAddress.toLowerCase());
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

  if (isProtectedPage(req)) {
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
    res.headers.set("Content-Security-Policy-Report-Only", csp);
    return res;
  }
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
