import { NextResponse, type NextRequest } from "next/server";
import { getServiceRequests, createServiceRequest, countServiceRequestByIp } from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { containsProfanity } from "@/lib/profanity";
import { isValidCountry } from "@/lib/countries";
import { isValidServiceCategory } from "@/lib/service-categories";
import { findPresenceCity } from "@/lib/presence-cities";
import { getRegion } from "@/lib/regions";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { getCloudflareCtx } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DAILY_IP_LIMIT = 3;

/** GET /api/keresek?country=CH&category=villanyszerelo — jóváhagyott, nem lejárt igények. */
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : "CH";
  const category = req.nextUrl.searchParams.get("category");
  const list = await getServiceRequests(country, category && category !== "all" ? category : null);
  return NextResponse.json({ requests: list }, { headers: { "cache-control": "no-store" } });
}

/**
 * POST /api/keresek — új „Keresek" hirdetés (admin-moderált).
 * Body: { country, category, title, description?, city?, whenText?, contact, turnstileToken }.
 * A `contact` a kérő által választott, publikus elérhetőség (moderáció után jelenik meg).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }

  const country = typeof body.country === "string" ? body.country : "";
  const category = typeof body.category === "string" ? body.category : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 600) : null;
  const cityName = typeof body.city === "string" ? body.city.trim().slice(0, 60) : "";
  const rawRegion = typeof body.regionCode === "string" ? body.regionCode.trim().slice(0, 8) : "";
  const whenText = typeof body.whenText === "string" ? body.whenText.trim().slice(0, 60) : null;
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 120) : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!isValidCountry(country)) return NextResponse.json({ error: "Ismeretlen ország." }, { status: 400 });
  if (!isValidServiceCategory(category)) return NextResponse.json({ error: "Válassz kategóriát." }, { status: 400 });
  if (title.length < 5) return NextResponse.json({ error: "Írd le, mit keresel (min. 5 karakter)." }, { status: 400 });
  if (contact.length < 3) return NextResponse.json({ error: "Adj meg egy elérhetőséget (telefon, WhatsApp, e-mail…)." }, { status: 400 });
  // Település SZABAD SZÖVEG (falu/kisváros is — user-visszajelzés); a régió-kód
  // a kliens régió-választójából jön (validálva), a régió-célzott szaki-push és a
  // lead-routing régió-egyezés ezen múlik. Ha nincs explicit régió, a nagyváros-
  // listáról még levezetjük (visszafelé kompatibilis út).
  const city = cityName ? findPresenceCity(country, cityName) : null;
  const regionCode = getRegion(country, rawRegion)?.code ?? city?.region ?? null;
  for (const t of [title, description ?? "", contact, whenText ?? "", cityName]) {
    if (t && containsProfanity(t).hit) return NextResponse.json({ error: "Nem megfelelő szöveg." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  if ((await countServiceRequestByIp(ipHash)) >= DAILY_IP_LIMIT) {
    return NextResponse.json({ error: "Ma már több hirdetést adtál fel. Próbáld holnap." }, { status: 429 });
  }

  await createServiceRequest({
    country, regionCode, category, title, description,
    city: city?.name ?? (cityName || null), whenText, contact,
    ipHash: ipHash ?? "unknown-ip",
  });

  // Azonnali admin-értesítő (best-effort): a Keresek-jóváhagyás bevétel-kritikus
  // (az indítja a lead-routingot), ne a napi benézésen múljon az átfutás.
  const notify = notifyAdminContentPending({
    contentType: "keresés",
    title,
    preview: [description, city?.name ?? cityName, whenText].filter(Boolean).join(" · ") || title,
    submitterEmail: null,
  });
  const ctx = getCloudflareCtx();
  if (ctx) ctx.waitUntil(notify); else await notify;

  return NextResponse.json({ ok: true, message: "Köszönjük! A hirdetést jóváhagyás után tesszük közzé." });
}
