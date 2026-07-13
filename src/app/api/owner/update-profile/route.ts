import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, updateBusinessProfile, logModerationStrike } from "@/lib/repo";
import { moderateText } from "@/lib/text-moderation";
import { hashIp } from "@/lib/security";
import { isSwissAddress } from "@/lib/cantons";
import { validateSocialLinks, type SocialLinks } from "@/lib/social-url";
import { isValidAccentColor } from "@/lib/business-branding";
import { BUSINESS_LIMITS, isInCountryCoord } from "@/lib/business";
import { isValidCountry } from "@/lib/countries";
import { regionCodeFromLocation } from "@/lib/region-resolve";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/update-profile  — védett (Clerk).
 *
 * Cél: Vállalkozói profil adatainak frissítése.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  const business = await getBusinessByOwner(userId);
  if (!business) {
    return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // Validációk
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const blurb = typeof body.blurb === "string" ? body.blurb.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const categoryLabel = typeof body.categoryLabel === "string" ? body.categoryLabel.trim() : "";
  const openText = typeof body.openText === "string" ? body.openText.trim() : "";
  const workingHours = typeof body.workingHours === "string" ? body.workingHours.trim() : "";
  const socialLinks = typeof body.socialLinks === "string" ? body.socialLinks.trim() : "";
  
  const yearsHereRaw = body.yearsHere;
  const yearsHereParsed = typeof yearsHereRaw === "number" ? yearsHereRaw : yearsHereRaw ? parseInt(String(yearsHereRaw), 10) : null;
  // NaN-guard: a parseInt("abc") NaN-t ad, ami NEM null → bementene a DB-be és
  // „NaN éve kint"-et mutatna. Csak véges szám mehet tovább, különben null.
  const yearsHere = yearsHereParsed != null && Number.isFinite(yearsHereParsed) ? yearsHereParsed : null;
  
  const languagesRaw = body.languages;
  const languages = Array.isArray(languagesRaw) ? languagesRaw.map(l => String(l).trim()).filter(Boolean) : null;

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: "A név legalább 2 és legfeljebb 100 karakter hosszú legyen." },
      { status: 400 },
    );
  }

  if (phone.length > 30) {
    return NextResponse.json({ error: "A telefonszám legfeljebb 30 karakter lehet." }, { status: 400 });
  }

  if (blurb.length > 500) {
    return NextResponse.json({ error: "A leírás legfeljebb 500 karakter lehet." }, { status: 400 });
  }

  if (address.length > 200) {
    return NextResponse.json({ error: "A cím legfeljebb 200 karakter lehet." }, { status: 400 });
  }

  // A vállalkozás országa — a tulaj módosíthatja (pl. rossz országgal jött létre).
  // Csak érvényes (enabled) országot fogadunk el; hiányzó/érvénytelen → marad a
  // jelenlegi. Ország-váltáskor a canton_code érvénytelenné válik (más ország
  // régió-kódjai ütköznek), ezért null-ra állítjuk — a régiót a következő
  // geokódolás/felvitel tölti újra.
  const countryRaw = typeof body.country === "string" ? body.country : null;
  const newCountry = isValidCountry(countryRaw) ? countryRaw : business.country;
  const countryChanged = newCountry !== business.country;
  // Régió-öngyógyítás (audit #14 folyománya): ország-váltáskor a régi kód
  // érvénytelen, ÉS a régió-hiányos (legacy) sorok is gyógyulnak — a KURÁLT
  // cím-feloldó (regionCodeFromLocation) a cím/név szövegéből vezeti le a
  // régiót; ha nem ismeri fel, marad null (nem tippelünk). E nélkül a cég
  // kimarad a régió-szűrőből / SEO-régióoldalakból / Keresek-egyezésből.
  const cantonCode = countryChanged
    ? regionCodeFromLocation(newCountry, address, [name])
    : business.canton ?? regionCodeFromLocation(newCountry, address, [name]);

  // Térkép-pin koordináta a strukturált cím-keresőből. A kliens CSAK akkor küld
  // lat/lng-t, ha a tulaj a felkínált találatból választott (pontos hely) —
  // kézi gépelésnél nem, hogy a meglévő pin-t ne írjuk némán felül. Ha érkezik
  // pár, ellenőrizzük, hogy a kiválasztott országon belül van (a kereső
  // ország-szűrt, ez csak védelem a manipulált kérés ellen). Egyébként a
  // meglévő koordinátát tartjuk meg.
  const latRaw = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : null;
  const lngRaw = typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : null;
  let newLat = business.lat;
  let newLng = business.lng;
  if (latRaw != null && lngRaw != null) {
    if (!isInCountryCoord(newCountry, latRaw, lngRaw)) {
      return NextResponse.json(
        {
          error:
            "A kiválasztott hely nem a megadott országban van. Válassz a felkínált címtalálatok közül.",
        },
        { status: 400 },
      );
    }
    newLat = latRaw;
    newLng = lngRaw;
  }

  // A szigorú svájci cím-formátum csak CH-ban REGISZTRÁLT cégnél kötelező; AT/DE/NL
  // szabad szöveg. Az ÚJ (épp mentett) országot nézzük, nem a régit — különben
  // CH→DE váltáskor tévesen svájci címet követelnénk.
  if (newCountry === "CH" && address && !isSwissAddress(address)) {
    return NextResponse.json(
      {
        error:
          "Svájci vállalkozásnál svájci cím adható meg. Tüntesd fel a svájci várost és irányítószámot (pl. Bahnhofstrasse 10, 8001 Zürich).",
      },
      { status: 400 },
    );
  }

  if (categoryLabel.length > 50) {
    return NextResponse.json(
      { error: "A kategória felülírás legfeljebb 50 karakter lehet." },
      { status: 400 },
    );
  }

  if (openText.length > 100) {
    return NextResponse.json(
      { error: "A nyitvatartás leírása legfeljebb 100 karakter lehet." },
      { status: 400 },
    );
  }

  if (workingHours.length > 2000) {
    return NextResponse.json(
      { error: "A nyitvatartási adatok túl hosszúak." },
      { status: 400 },
    );
  }

  if (socialLinks.length > 2000) {
    return NextResponse.json(
      { error: "A közösségi linkek túl hosszúak." },
      { status: 400 },
    );
  }

  // Social URL-ek mély-validációja: csak https + ismert domain (facebook.com,
  // instagram.com, linkedin.com, booking.com/airbnb/calendly). Megakadályozza
  // a `javascript:` / `data:` / phishing-URL-ek mentését.
  let sanitizedSocialLinks: string | null = socialLinks || null;
  if (socialLinks) {
    try {
      const parsed = JSON.parse(socialLinks) as Partial<SocialLinks>;
      const cleaned = validateSocialLinks(parsed);
      sanitizedSocialLinks = cleaned ? JSON.stringify(cleaned) : null;
    } catch {
      return NextResponse.json(
        { error: "Érvénytelen közösségi linkek formátum." },
        { status: 400 },
      );
    }
  }

  // Custom branding accent szín — csak PRO (featured), és csak az előre
  // definiált preset-hexekből (nincs tetszőleges CSS). FONTOS: csak akkor
  // írjuk felül, ha a payload EXPLICIT tartalmazza az `accentColor` mezőt;
  // ha hiányzik (pl. csak a telefonszám módosul), megőrizzük a korábbi színt,
  // hogy ne töröljük némán (silent data loss).
  let accentColor: string | null;
  if (body.accentColor === undefined) {
    accentColor = business.accentColor ?? null; // mező hiányzik → megőrzés
  } else if (business.featured && isValidAccentColor(body.accentColor)) {
    accentColor = body.accentColor; // PRO + érvényes preset → beállít
  } else {
    accentColor = null; // explicit törlés / nem-PRO / érvénytelen
  }

  // Kinti Pass elfogadóhely — CSAK Szaknévsor PRO (business.featured) állíthatja be,
  // ugyanaz a szerver-oldali gate, mint a manage-token route-on (business-manage-form.tsx
  // párja). Ha a mező hiányzik a payloadból, megőrizzük a korábbi értéket (ne törölje
  // némán egy olyan mentés, ami csak pl. a telefonszámot módosítja).
  let kintiPassActive: boolean;
  let kintiPassOffer: string | null;
  if (body.kintiPassActive === undefined) {
    kintiPassActive = business.kintiPassActive ?? false;
    kintiPassOffer = business.kintiPassOffer ?? null;
  } else if (business.featured) {
    kintiPassActive = body.kintiPassActive === true;
    const offerRaw = typeof body.kintiPassOffer === "string" ? body.kintiPassOffer.trim() : "";
    if (offerRaw.length > BUSINESS_LIMITS.passOfferMax) {
      return NextResponse.json(
        { error: `A Kinti Pass ajánlat legfeljebb ${BUSINESS_LIMITS.passOfferMax} karakter lehet.` },
        { status: 400 },
      );
    }
    kintiPassOffer = kintiPassActive ? offerRaw || null : null;
  } else {
    kintiPassActive = false; // nem-PRO → nem állítható be
    kintiPassOffer = null;
  }

  // AI szöveg-moderáció a VÁLTOZOTT tartalom-érzékeny mezőkön (a manage-token
  // route párja — eddig ez az út moderálatlan volt, audit-lelet #7). Csak a
  // ténylegesen módosult szöveget küldjük az AI-nak (kvóta-kímélés); blokknál
  // strike-log + 400. Változás esetén az admin „ellenőrzött" jelvény is
  // visszavonásra kerül (resetVerified) — a manage-út `verified = 0` párja.
  const changedTextParts: string[] = [];
  if (name !== business.name) changedTextParts.push(name);
  if (blurb && (blurb || null) !== (business.blurb ?? null)) changedTextParts.push(blurb);
  if (categoryLabel && (categoryLabel || null) !== (business.categoryLabel ?? null)) changedTextParts.push(categoryLabel);
  if (address && (address || null) !== (business.address ?? null)) changedTextParts.push(address);
  if (kintiPassOffer && kintiPassOffer !== (business.kintiPassOffer ?? null)) changedTextParts.push(kintiPassOffer);
  if (changedTextParts.length > 0) {
    const textMod = await moderateText(changedTextParts.join("\n"));
    if (textMod.action === "block") {
      const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
      await logModerationStrike(ipHash, "Business owner-edit text moderation failed: " + textMod.reason);
      return NextResponse.json(
        { error: textMod.reason || "A módosított szöveg nem felel meg a közösségi irányelveknek." },
        { status: 400 },
      );
    }
  }
  const contentChanged =
    name !== business.name ||
    (blurb || null) !== (business.blurb ?? null) ||
    (categoryLabel || null) !== (business.categoryLabel ?? null) ||
    (address || null) !== (business.address ?? null);

  const ok = await updateBusinessProfile(business.id, userId, {
    name,
    phone: phone || null,
    blurb: blurb || null,
    address: address || null,
    categoryLabel: categoryLabel || null,
    openText: openText || null,
    workingHours: workingHours || null,
    socialLinks: sanitizedSocialLinks,
    yearsHere,
    languages,
    accentColor,
    country: newCountry,
    cantonCode,
    lat: newLat,
    lng: newLng,
    kintiPassActive,
    kintiPassOffer,
    resetVerified: contentChanged,
  });

  if (!ok) {
    return NextResponse.json({ error: "Nem sikerült frissíteni a profilt." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
