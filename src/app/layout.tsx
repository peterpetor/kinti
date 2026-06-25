import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { huHU } from "@clerk/localizations";
import { jakarta, jetbrains } from "@/lib/fonts";
import { SWRegister } from "@/components/sw-register";
import { LegalGatekeeper } from "@/components/legal-gatekeeper";
import { CountryRevealer } from "@/components/country-revealer";
import "./globals.css";

/**
 * Ország-feloldó boot-gate fej-szkript: még az első festés ELŐTT lefut. Ha a
 * böngészőben tárolt ország nem a CH-alapértelmezett (amivel a statikus HTML
 * renderelődik), beállítja a `data-country-pending`-et a <html>-re — a CSS addig
 * rejti a body-t, amíg a kliens (CountryRevealer) a helyes országra nem vált.
 * Biztonsági időzítő 1500 ms után mindenképp feloldja (ha a JS-hidratálás elmarad).
 */
const COUNTRY_GATE_SCRIPT = `(function(){try{var c=localStorage.getItem('kinti.country');if(c&&c!=='CH'){var d=document.documentElement;d.setAttribute('data-country-pending','');setTimeout(function(){d.removeAttribute('data-country-pending');},1500);}}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "kinti — Találj magyart a közeledben",
    template: "%s · kinti",
  },
  description:
    "GPS-alapú magyar szakemberkereső. Fodrász, autószerelő, orvos, ügyvéd, pék — bármi. Egy térkép. Anyanyelven.",
  applicationName: "kinti",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://kinti.app"),
  openGraph: {
    title: "kinti — Találj magyart a közeledben",
    description: "GPS-alapú magyar szakemberkereső Svájcban. Fodrász, autószerelő, orvos, ügyvéd — bármi. Egy térkép. Anyanyelven.",
    url: "https://kinti.app",
    siteName: "kinti",
    type: "website",
    locale: "hu_HU",
    images: [{ url: "/icons/og-default.png", width: 1200, height: 630, alt: "kinti — Találj magyart a közeledben" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "kinti — Találj magyart a közeledben",
    description: "GPS-alapú magyar szakemberkereső Svájcban.",
    images: ["/icons/og-default.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "kinti",
    // iOS PWA indító-képernyők (scripts/gen-splash.mjs) — nincs fehér villanás.
    startupImage: [
      { url: "/icons/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/icons/splash/splash-1242x2208.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/kinti.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d4434" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4434" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Cloudflare Web Analytics — cookie-mentes, GDPR-barát, nem igényel consentet.
  // Akkor töltődik be, ha az env-be van állítva token (lásd README).
  const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

  return (
    <html lang="hu" data-theme="warm" suppressHydrationWarning className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        {/* Ország-feloldó boot-gate — még a tartalom festése előtt fusson. */}
        <script dangerouslySetInnerHTML={{ __html: COUNTRY_GATE_SCRIPT }} />
        <ClerkProvider
          localization={{
            ...huHU,
            formFieldInputPlaceholder__firstName: "Keresztnév",
            formFieldInputPlaceholder__lastName: "Vezetéknév",
            formFieldInputPlaceholder__emailAddress: "Email cím",
            formFieldInputPlaceholder__password: "Jelszó megadása",

            signUp: {
              ...huHU.signUp,
              legalConsent: {
                continue: {
                  title: "Jogi nyilatkozat",
                  subtitle: "Kérlek olvasd el és fogadd el a feltételeket a folytatáshoz.",
                },
                checkbox: {
                  label__termsOfServiceAndPrivacyPolicy:
                    'Elfogadom az {{ termsOfServiceLink || link("Általános Szerződési Feltételeket") }} és az {{ privacyPolicyLink || link("Adatvédelmi Tájékoztatót") }}.',
                  label__onlyPrivacyPolicy:
                    'Elfogadom az {{ privacyPolicyLink || link("Adatvédelmi Tájékoztatót") }}.',
                  label__onlyTermsOfService:
                    'Elfogadom az {{ termsOfServiceLink || link("Általános Szerződési Feltételeket") }}.',
                },
              },
              start: {
                title: "Regisztráció",
                subtitle: "Üdv! Kérlek add meg adataidat a fiók létrehozásához.",
                actionText: "Van már fiókod?",
                actionLink: "Bejelentkezés",
              },
            },
            signIn: {
              ...huHU.signIn,
              forgotPassword: {
                title: "Elfelejtett jelszó",
                formTitle: "Jelszó visszaállítása",
                subtitle_email: "Küldünk egy kódot az email címedre a jelszó visszaállításához.",
                resendButton: "Kód újraküldése",
              },
              start: {
                title: "Bejelentkezés",
                subtitle: "Üdv újra! Jelentkezz be a folytatáshoz.",
                actionText: "Nincs fiókod?",
                actionLink: "Regisztráció",
              },
            },
          }}
          appearance={{ variables: { colorPrimary: "#1d4434", borderRadius: "0.75rem" } }}
        >
          {children}
        </ClerkProvider>
        {/* PWA — Service Worker regisztráció + frissítés-prompt (prod-only) */}
        <SWRegister />
        <LegalGatekeeper />
        <CountryRevealer />
        {cfBeaconToken && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${cfBeaconToken}"}`}
          />
        )}
      </body>
    </html>
  );
}
