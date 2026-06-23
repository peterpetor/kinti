import { NextResponse } from "next/server";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { safeLogError } from "@/lib/safe-log";
import { createSuggestedBusiness } from "@/lib/repo";
import { assessSpam } from "@/lib/spam-score";
import { cantonPoint } from "@/lib/cantons";
import { atPoint } from "@/lib/at-points";
import { getRegion } from "@/lib/regions";
import { getCountry } from "@/lib/countries";
import { sendEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "info@kinti.app";

/**
 * POST /api/szaknevsor/ajanlas — közösségi „Ajánlj egy magyar vállalkozást".
 * Moderációval: a beküldés moderation_status=0 → admin jóváhagyja → megjelenik.
 * Body: { name, categoryId, categoryLabel?, cantonCode, city?, phone?, website?, note? }
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("cf-connecting-ip");
    const ipHash = await hashIp(ip ?? null);
    const rl = await checkAiRateLimit("business-suggest", ipHash);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Túl sok ajánlás. Próbáld újra 1 óra múlva." }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Robot-ellenőrzés (Turnstile) — a kiemelt supply-CTA miatt is fontos.
    const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
    const captcha = await verifyTurnstile(turnstileToken, ip);
    if (!captcha.ok) {
      return NextResponse.json({ error: "A robot-ellenőrzés sikertelen. Próbáld újra." }, { status: 403 });
    }

    const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const name = str(body.name, 120);
    const categoryId = str(body.categoryId, 60);
    const categoryLabel = str(body.categoryLabel, 80) || null;
    const cantonCode = str(body.cantonCode, 4);
    const country = typeof body.country === "string" && getCountry(body.country)?.enabled ? body.country : "CH";
    const city = str(body.city, 120) || null;
    const phone = str(body.phone, 40) || null;
    const website = str(body.website, 200) || null;
    const note = str(body.note, 600) || null;

    if (name.length < 2) {
      return NextResponse.json({ error: "Add meg a vállalkozás nevét (min. 2 karakter)." }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Válassz kategóriát." }, { status: 400 });
    }
    if (!getRegion(country, cantonCode)) {
      return NextResponse.json({ error: "Válassz régiót." }, { status: 400 });
    }

    const pt = country === "AT" ? atPoint(cantonCode) : cantonPoint(cantonCode);
    const blurbParts = [note, website ? `Web: ${website}` : null].filter(Boolean);

    // AI-alapú spam-scoring (a website külön, legitim URL-mező → kihagyjuk).
    const spam = await assessSpam([name, note].filter(Boolean).join("\n"));
    if (spam.verdict === "spam") {
      return NextResponse.json(
        { error: "A beküldés reklámnak vagy spamnek tűnik. Hagyd ki a linkeket és a promóciós szöveget." },
        { status: 400 },
      );
    }

    const id = await createSuggestedBusiness({
      name,
      categoryId,
      categoryLabel,
      address: city,
      country,
      phone,
      blurb: blurbParts.length ? blurbParts.join(" · ") : null,
      lat: pt.lat,
      lng: pt.lng,
    });

    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Új vállalkozás-ajánlás: ${name}`,
        html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(categoryLabel ?? categoryId)})</p>
               <p>Kanton: ${escapeHtml(cantonCode)}${city ? " · " + escapeHtml(city) : ""}${phone ? " · " + escapeHtml(phone) : ""}</p>
               ${website ? `<p>Web: ${escapeHtml(website)}</p>` : ""}
               ${note ? `<p>Megjegyzés: ${escapeHtml(note)}</p>` : ""}
               <p>Jóváhagyás: /admin/moderation (Szaknévsor sor). id: ${escapeHtml(id)}</p>`,
        text: `Ajánlás: ${name} (${categoryLabel ?? categoryId}) — ${cantonCode} ${city ?? ""} ${phone ?? ""} ${website ?? ""}\n${note ?? ""}`,
      });
    } catch (e) {
      safeLogError("business-suggest/admin-email", e);
    }

    await logAiRateLimit("business-suggest", ipHash);
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/szaknevsor/ajanlas", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
