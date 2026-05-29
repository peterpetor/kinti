import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { huHU } from "@clerk/localizations";
import { jakarta, jetbrains } from "@/lib/fonts";
import { SWRegister } from "@/components/sw-register";
import { LegalGatekeeper } from "@/components/legal-gatekeeper";
import "./globals.css";

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
    startupImage: ["/icons/apple-touch-icon.png"],
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
    <html lang="hu" data-theme="warm" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
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
