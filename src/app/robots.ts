import type { MetadataRoute } from "next";

export const runtime = "edge";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Az API-végpontokat és a tokenes / belső linkeket nem kell indexelni.
      disallow: [
        "/api/",
        "/admin/",
        "/hirdetes-kezeles/",
        "/velemeny-kezeles/",
        "/vallalkozas-megerositve",
        "/hirdetes-megerositve",
      ],
    },
    sitemap: "https://kinti.app/sitemap.xml",
    host: "https://kinti.app",
  };
}
