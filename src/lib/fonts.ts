import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

/**
 * A prototípus FONT_STACK / MONO_STACK értékei, most a next/font/google-on át
 * öntárolva (nincs külső <link>, nincs layout-shift). A `latin-ext` subset
 * KÖTELEZŐ a magyar ékezetekhez (ő, ű, Á, …).
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
