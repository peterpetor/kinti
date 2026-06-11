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
        destination: 'https://revolut.com/referral/?referral-code=pter9sxrh!JUN1-26-AR-H2&geo-redirect',
        permanent: false, // Nem állandó, hogy később könnyen cserélhető legyen a kód!
      },
      {
        source: '/go/wise',
        destination: 'https://wise.com/invite/dic/peterp286',
        permanent: false,
      },
    ];
  },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
