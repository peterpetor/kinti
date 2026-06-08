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

async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const env = getRequestContext().env as { ADMIN_EMAILS?: string };
    const allowed = (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!allowed.length) return false;

    const user = await currentUser();
    if (!user) return false;
    const emails = user.emailAddresses.map((e) => e.emailAddress.toLowerCase());
    return emails.some((e) => allowed.includes(e));
  } catch {
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

  // Karbantartási mód: csak admin láthatja az oldalt. Mindenki más a
  // /keszul "Hamarosan érkezünk" oldalra kerül.
  if (!isMaintenanceExempt(req)) {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.redirect(new URL("/keszul", req.url));
    }
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
