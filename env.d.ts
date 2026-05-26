// Cloudflare bindingek típusai (wrangler.toml ↔ getRequestContext().env).
// A `npm run cf-typegen` ezt automatikusan frissíti, de kézzel is karbantartható.

interface CloudflareEnv {
  // D1 relációs adatbázis
  DB: D1Database;
  // R2 média-tároló (logók, hirdetés-képek)
  MEDIA: R2Bucket;

  // Build-időben NEM titkos változók (wrangler.toml [vars])
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_R2_PUBLIC_URL: string;

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

  // Cloudflare Turnstile (CAPTCHA a hirdetés-űrlapon).
  // Dashboard → Turnstile → Add site. A site key publikus, a secret titok.
  // Fejlesztéshez van "always-pass" test key: 1x00000000000000000000AA / 1x0000000000000000000000000000000AA
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET: string;

  // Resend (tranzakciós email — bulletin megerősítő link).
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
}
