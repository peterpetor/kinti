import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
