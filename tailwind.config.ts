import type { Config } from "tailwindcss";

/**
 * Kinti dizájnrendszer — a prototípus `kinti-tokens.jsx` fájljából átemelve.
 *
 * A színek NEM közvetlen hexkódok: minden szemantikus token CSS-változóra
 * mutat (`globals.css`), így a `warm` (Meleg) és `modern` paletta futásidőben
 * váltható a <html data-theme="..."> attribútumon keresztül. Az `rgb(... /
 * <alpha-value>)` minta megőrzi a Tailwind opacity-módosítóit (pl. bg-primary/30,
 * text-ink-muted/60), amire a "Liquid Glass" hatásokhoz szükségünk van.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Felületek
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          alt: "rgb(var(--surface-alt) / <alpha-value>)",
        },
        // Márka
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",   // mély fenyőzöld
          soft: "rgb(var(--primary-soft) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",    // paprikapiros
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        // Szöveg (ink — hogy ne ütközzön a Tailwind `text-*` segédosztályaival)
        ink: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
          faint: "rgb(var(--text-faint) / <alpha-value>)",
        },
        // Keret/elválasztó vonalak
        line: {
          DEFAULT: "rgb(var(--border-channel) / var(--border-alpha))",
          strong: "rgb(var(--border-channel) / var(--border-strong-alpha))",
        },
        // Stilizált térkép rétegei (kinti-map.jsx)
        map: {
          land: "rgb(var(--map-land) / <alpha-value>)",
          water: "rgb(var(--map-water) / <alpha-value>)",
          green: "rgb(var(--map-green) / <alpha-value>)",
          road: "rgb(var(--map-road) / <alpha-value>)",
          line: "rgb(var(--map-road-line) / var(--map-road-line-alpha))",
        },
        // Állapot-jelzők
        success: "rgb(29 106 60 / <alpha-value>)",   // #1d6a3c — "Nyitva"
        star: "rgb(240 162 58 / <alpha-value>)",     // #f0a23a — értékelés / arany kiemelés
        pro: "rgb(255 150 0 / <alpha-value>)",       // #ff9600 — Szaknévsor PRO / kiemelt állás
        // Domain-árnyalatok az ikon-chipekhez (kezdőlap-rács) — a star túl világos
        // vonalas ikonnak, ezért a "pénz" chip a sötétebb gold-ot kapja.
        gold: "rgb(180 106 14 / <alpha-value>)",     // #b46a0e — pénz-domain (olvasható borostyán)
        info: "rgb(66 103 156 / <alpha-value>)",     // #42679c — közösség/utazás-domain (nyugodt acélkék)
      },
      borderColor: {
        DEFAULT: "rgb(var(--border-channel) / var(--border-alpha))",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        pop: "var(--shadow-pop)",
        pin: "var(--shadow-pin)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        pill: "9999px",
        card: "20px",
        sheet: "24px",
      },
      keyframes: {
        // "you are here" pulzáló pötty (kinti-icons.jsx → kintiPulse)
        "pulse-ring": {
          "0%": { transform: "scale(0.6)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "fade-up": "fade-up 0.25s ease-out both",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
