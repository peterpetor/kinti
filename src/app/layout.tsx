import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { huHU } from "@clerk/localizations";
import { jakarta, jetbrains } from "@/lib/fonts";
import { SWRegister } from "@/components/sw-register";
import { LegalGatekeeper } from "@/components/legal-gatekeeper";
import { CountryRevealer } from "@/components/country-revealer";
import { buildLegalGateScript } from "@/lib/legal-gate";
import "./globals.css";

/**
 * Ország-feloldó boot-gate fej-szkript: még az első festés ELŐTT lefut. Ha a
 * böngészőben tárolt ország nem a CH-alapértelmezett (amivel a statikus HTML
 * renderelődik), beállítja a `data-country-pending`-et a <html>-re — a CSS addig
 * rejti a body-t (és márka-spinnert mutat, lásd globals.css), amíg a kliens
 * (CountryRevealer) a helyes országra nem vált.
 *
 * Biztonsági időzítő: 4500 ms (1500 volt) — mobilon a teljes újratöltés +
 * hidratálás gyakran túllépte az 1,5 mp-et, így a gate KORÁN feloldott, és a
 * svájci tartalom bevillant az osztrák/német/holland váltás előtt (user-bug,
 * 2026-07-10). A normál út továbbra is a CountryRevealer (hidratáláskor azonnal
 * felold); az időzítő csak a törött-JS védőháló.
 */
const COUNTRY_GATE_SCRIPT = `(function(){try{var c=localStorage.getItem('kinti.country');if(c&&c!=='CH'){var d=document.documentElement;d.setAttribute('data-country-pending','');setTimeout(function(){d.removeAttribute('data-country-pending');},4500);}}catch(e){}})();`;

/**
 * Jogi boot-gate fej-szkript: ha a jogi elfogadás hiányzik, a tartalom NEM
 * villanhat be a LegalGatekeeper modal előtt — a body rejtve marad, amíg a
 * modal a DOM-ba nem kerül (lásd lib/legal-gate.ts + globals.css).
 */
const LEGAL_GATE_SCRIPT = buildLegalGateScript();

// A mentett témát (Világos/Sötét) még a festés előtt visszaállítjuk, hogy reload
// után is éljen a választás, villanás (FOUC) nélkül. A régi „modern" mentett
// értéket sötétre migráljuk (a Modern skin helyére a Sötét mód lépett). Lásd ThemeToggle.
// A mentett országot is kitesszük data-country-ba (whitelist!) — így a csak
// CH/AT-ban élő elemek (pl. weather-widget) CSS-ből már az ELSŐ frame-ben
// rejthetők DE/NL-ben, hidratálás-villanás nélkül (a JS-guard marad a döntő).
// + theme-color szinkron: a böngésző-króm (címsor/állapotsor, PWA-címsor) színe
// kövesse az AKTUÁLIS témát — sötét módban is (a data-theme kézi váltó miatt a
// statikus media-query-s meta nem elég). A setThemeColor a meglévő metákat írja
// át, vagy (ha a szkript előbb fut) a head végére tesz egyet (a Chrome az utolsó
// érvényeset használja). Ugyanez fut a ThemeToggle-ból váltáskor (lib/theme-color).
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('kinti-theme');if(t==='modern'){t='dark';localStorage.setItem('kinti-theme','dark');}if(t==='dark'||t==='warm'){document.documentElement.dataset.theme=t;}var col=(t==='dark')?'#101411':'#f4ede0';var ms=document.querySelectorAll('meta[name="theme-color"]');if(ms.length){for(var i=0;i<ms.length;i++){ms[i].setAttribute('content',col);}}else{var m=document.createElement('meta');m.name='theme-color';m.content=col;document.head.appendChild(m);}var c=localStorage.getItem('kinti.country');if(c==='CH'||c==='AT'||c==='DE'||c==='NL'){document.documentElement.dataset.country=c;}}catch(e){}})();`;

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
  // A króm-szín a LAP HÁTTERÉVEL egyezik (natív, „egybefolyó" érzet) — nem a
  // márka-zölddel (az színes sávot rajzolt a krém tartalom fölé). A data-theme
  // kézi váltását a THEME_INIT_SCRIPT + lib/theme-color futásidőben követi.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4ede0" },
    { media: "(prefers-color-scheme: dark)", color: "#101411" },
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
        {/* Jogi boot-gate — a tartalom ne villanjon be a legal-modal előtt. */}
        <script dangerouslySetInnerHTML={{ __html: LEGAL_GATE_SCRIPT }} />
        {/* Mentett téma visszaállítása festés előtt (Világos/Sötét perzisztencia). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
