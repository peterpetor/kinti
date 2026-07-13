// Cloudflare bindingek típusai (wrangler.toml ↔ getRequestContext().env).
// A `npm run cf-typegen` ezt automatikusan frissíti, de kézzel is karbantartható.

interface CloudflareEnv {
  // D1 relációs adatbázis
  DB: D1Database;
  // R2 média-tároló (logók, esemény-képek)
  MEDIA: R2Bucket;
  // Cloudflare Workers AI binding
  AI: any;
  // Cloudflare Vectorize index (szemantikus keresés) — OPCIONÁLIS.
  // Amíg a wrangler.toml [[vectorize]] blokk kommentben van, ez undefined,
  // és a keresés a kulcsszavas fallbackra esik vissza (lib/vector-search.ts).
  VECTORIZE?: unknown;


  // Build-időben NEM titkos változók (wrangler.toml [vars])
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_R2_PUBLIC_URL: string;
  /** "1"|"true" → Cloudflare Image Resizing (/cdn-cgi/image, AVIF/WebP). Opt-in. */
  NEXT_PUBLIC_IMAGE_RESIZE: string;

  // Clerk (.env.local `next dev`-hez / .dev.vars + wrangler pages secret éleshez)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: string;

  // R2 S3-kompatibilis hozzáférés (presigned URL aláíráshoz)
  // Cloudflare dashboard → R2 → Manage R2 API Tokens → "Object Read & Write"
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  /** Opcionális — alapértelmezés: "kinti-media" (wrangler.toml binding). */
  R2_BUCKET?: string;

  // Cloudflare Turnstile (CAPTCHA a beküldő űrlapokon).
  // Dashboard → Turnstile → Add site. A site key publikus, a secret titok.
  // Fejlesztéshez van "always-pass" test key: 1x00000000000000000000AA / 1x0000000000000000000000000000000AA
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET: string;

  // Resend (tranzakciós email — megerősítő linkek, admin értesítők).
  // https://resend.com → API Keys.  Sender domaint Resend dashboardban verifikálni
  // kell éles használathoz; fejlesztéshez az `onboarding@resend.dev` mehet.
  RESEND_API_KEY: string;
  /** Pl. "Kinti <info@kinti.app>" — Resend-en verifikált küldő. */
  EMAIL_FROM: string;
  /** A megerősítő linkek bázisa (pl. https://kinti.app). Dev: http://localhost:3000 */
  PUBLIC_BASE_URL: string;

  /**
   * Admin felhasználók (vesszővel elválasztott email-lista, kisbetűsen
   * összehasonlítva). Csak ezek érik el az `/admin/*` útvonalakat (pl.
   * iCal-feedek kezelése).
   */
  ADMIN_EMAILS?: string;

  /**
   * Hiba-monitoring ingest-végpont (opcionális, alapból OFF). Vendor-agnosztikus
   * JSON-webhook: Logflare HTTP, Baselime events, Sentry-relay vagy Slack/Discord.
   * Ha üres → a redaktált hibák csak a Workers logba mennek (jelenlegi viselkedés).
   */
  ERROR_WEBHOOK_URL?: string;

  /**
   * Telegram-bot (BotFather-től kapott) API-token. Ha üres → a
   * /api/telegram/webhook 503-at ad (a bot nincs beüzemelve).
   */
  TELEGRAM_BOT_TOKEN?: string;

  /**
   * A setWebhook-nál megadott secret_token — a Telegram minden webhook-hívásban
   * visszaküldi (X-Telegram-Bot-Api-Secret-Token fejléc), ezzel hitelesítjük,
   * hogy a kérés tényleg a Telegramtól jön. A token mellé KÖTELEZŐ beállítani.
   */
  TELEGRAM_WEBHOOK_SECRET?: string;

  /**
   * Az az email-cím, ahova az esemény-jóváhagyási értesítők mennek.
   * Ha nincs megadva, a ADMIN_EMAILS első eleme, vagy info@kinti.app.
   */
  ADMIN_EVENT_EMAIL?: string;

  /**
   * VAPID PRIVÁT kulcs a Web Push aláírásához (ES256). TITOK — Cloudflare
   * Pages secret: `wrangler pages secret put VAPID_PRIVATE_KEY`. A publikus
   * párja a kódban van (src/lib/push-keys.ts).
   */
  VAPID_PRIVATE_KEY?: string;

  /**
   * Cron jobok és belső trigger végpontok hitelesítésére használt titok.
   */
  CRON_SECRET?: string;

  /**
   * PRO-zárolás kapcsoló. Amíg !== "true", a PRO funkciók mindenkinek
   * elérhetők (a Paddle beüzemeléséig). "true" → aktív paywall.
   */
  PRO_ENFORCED?: string;

  /**
   * Paddle (Billing) szerver API-kulcs — a checkout (transaction) létrehozásához.
   * TITOK — Cloudflare Pages secret.
   */
  PADDLE_API_KEY?: string;

  /**
   * Paddle webhook aláírás-titka (HMAC-SHA256, `Paddle-Signature` fejléc). TITOK —
   * Cloudflare Pages secret. Amíg nincs beállítva, a webhook 401-et ad (inaktív).
   */
  PADDLE_WEBHOOK_SECRET?: string;

  // Google Play Billing (az Android-app fizetései — lásd android/README.md).
  // Amíg nincsenek beállítva, a /api/payments/play/verify 503-at ad (inaktív);
  // a webes Paddle-fizetést nem érinti.
  /** Az Android-app package neve (pl. app.kinti.twa). */
  GOOGLE_PLAY_PACKAGE_NAME?: string;
  /** Play Console service account email. TITOK — Cloudflare Pages secret. */
  GOOGLE_PLAY_SA_EMAIL?: string;
  /** Service account privát kulcs (PKCS8 PEM, a JSON "private_key" mezője). TITOK. */
  GOOGLE_PLAY_SA_KEY?: string;
  /** RTDN (Pub/Sub push) webhook titok — a /api/webhooks/play?key= értéke. TITOK. */
  PLAY_RTDN_SECRET?: string;
}
