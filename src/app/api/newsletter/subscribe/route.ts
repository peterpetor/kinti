import { NextResponse } from "next/server";
import { isValidCountry } from "@/lib/countries";
import { createNewsletterSubscriber } from "@/lib/repo-newsletter";
import { sendNewsletterConfirmationEmail } from "@/lib/email";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { safeLogError } from "@/lib/safe-log";
import { hashIp } from "@/lib/security";
import { countRecentSpamLog, logSpamSubmit } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";

/** Megerősítő-email spam (email-bomba) elleni IP-limit: óránként max. ennyi. */
const SUBSCRIBE_PER_HOUR = 5;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, country } = (await req.json()) as { email?: string; country?: string };

    if (!email || !country) {
      return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });
    }

    // Csak érvényes ország-KÓD (CH/AT/DE/NL) — egységes a többi felülettel.
    if (!isValidCountry(country)) {
      return NextResponse.json({ error: "Érvénytelen ország." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Érvénytelen e-mail cím." }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Kérlek ne használj eldobható e-mail címet." },
        { status: 400 }
      );
    }

    // IP-rate-limit: a double-opt-in megvédi az előfizetést, de nem a megerősítő-
    // email spamet (egy áldozat címére ismételt POST). Óránkénti IP-korlát ellene.
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    if ((await countRecentSpamLog("newsletter-subscribe", ipHash, 60)) >= SUBSCRIBE_PER_HOUR) {
      return NextResponse.json(
        { error: "Túl sok feliratkozási kísérlet. Próbáld újra később." },
        { status: 429 }
      );
    }

    const confirmToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const manageToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

    await createNewsletterSubscriber({
      email: email.toLowerCase(),
      country,
      confirmToken,
      manageToken,
    });

    // Bázis-URL a megerősítő linkhez. SOHA ne a kliens által küldött `Origin`
    // headerből — azt egy támadó hamisíthatja, és a kinti nevében küldött
    // megerősítő-email linkje az ő doménjére mutatna (token-szivárgás / phishing).
    // A kanonikus minta: konfigurált PUBLIC_BASE_URL, fallback a valódi
    // kérés-origin (req.url — a CF a zónához validált hosztot adja).
    const baseUrl =
      getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
    const confirmUrl = `${baseUrl}/api/newsletter/confirm/${confirmToken}`;

    await sendNewsletterConfirmationEmail({
      to: email,
      country,
      confirmUrl,
    });

    await logSpamSubmit("newsletter-subscribe", ipHash);
    return NextResponse.json({ success: true });
  } catch (err) {
    safeLogError("[newsletter/subscribe]", err);
    return NextResponse.json(
      { error: "Belső szerverhiba történt." },
      { status: 500 }
    );
  }
}
