// @cloudflare/next-on-pages — helyi fejlesztésben elérhetővé teszi a D1/R2
// bindingeket a `getRequestContext()`-en keresztül (wrangler.toml alapján).
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Az Edge runtime-on nincs Node-alapú képoptimalizáló; az R2-képeket
  // közvetlenül (vagy Cloudflare Images-szel) szolgáljuk ki.
  images: { unoptimized: true },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
