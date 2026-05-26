import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Védett útvonalak: ide nem jut be bejelentkezés nélkül — az `auth.protect()`
 * a NEXT_PUBLIC_CLERK_SIGN_IN_URL-re (/belepes) irányít. A nyilvános nézetek
 * (Feed, Szaknévsor, Közösség, vállalkozói profilok) szabadon böngészhetők.
 */
const isProtected = createRouteMatcher([
  "/profil(.*)", // saját dashboard
  "/feltoltes(.*)", // leendő logó/hirdetés feltöltő űrlapok (B lépés)
  "/admin(.*)", // admin felület (pl. iCal feedek)
  "/api/owner(.*)", // tulajdonosi írási műveletek (pl. vállalkozás igénylése)
  "/api/admin(.*)", // admin API (pl. event_feeds CRUD)
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Minden útvonal, kivéve a Next belső fájljait és a statikus assetokat.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Az API-kat és trpc-t mindig futtassa.
    "/(api|trpc)(.*)",
  ],
};
