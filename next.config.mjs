// @cloudflare/next-on-pages — helyi fejlesztésben elérhetővé teszi a D1/R2
// bindingeket a `getRequestContext()`-en keresztül (wrangler.toml alapján).
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Build-azonosító: deployonként változik, hogy a service worker frissülni
// tudjon (a kliens `/sw.js?v=<build>`-ként regisztrál, így a böngésző új
// SW-t észlel és felugrik a "Frissítés" prompt). A Cloudflare Pages a
// CF_PAGES_COMMIT_SHA-t adja; lokál fejlesztésben időbélyeg a fallback.
const BUILD_ID =
  process.env.CF_PAGES_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD_ID || String(Date.now());

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Az Edge runtime-on nincs Node-alapú képoptimalizáló; az R2-képeket
  // közvetlenül (vagy Cloudflare Images-szel) szolgáljuk ki.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  async redirects() {
    return [
      {
        source: '/go/revolut',
        destination: 'https://revolut.com/referral/?referral-code=pter9sxrh',
        permanent: false, // Nem állandó, hogy később könnyen cserélhető legyen a kód!
      },
      {
        source: '/go/wise',
        destination: 'https://wise.com/invite/dic/peterp286',
        permanent: false,
      },
    ];
  },
  // Globális biztonsági fejlécek minden válaszra. Tudatosan KÖNNYŰ CSP: csak
  // frame-ancestors / base-uri / object-src — NINCS default-src/script-src, így
  // nem töri a Clerk-et, az inline scripteket, a térkép-csempéket vagy a CF
  // beacont, viszont kivédi a clickjackinget és a <base>-injekciót. A
  // /api/media route ezen felül saját, szigorúbb (sandbox) CSP-t is kap.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
