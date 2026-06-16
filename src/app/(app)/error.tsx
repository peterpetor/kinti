"use client";

import { RouteError } from "@/components/route-error";

/**
 * Catch-all hiba-határ az egész app-szekcióra. Az egyes oldalak (Szaknévsor,
 * Állások, Közösség, esemény stb.) renderelési/fetch-hibáit elkapja, és a nyers
 * Next error-oldal helyett barátságos, újrapróbálható kártyát mutat.
 */
export default function AppError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} />;
}
