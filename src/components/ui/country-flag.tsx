import { cn } from "@/lib/cn";

/**
 * CountryFlag — valódi, platform-független SVG-zászló (a zászló-emoji Windows-on
 * csak betűpárként, pl. „AT" jelenik meg, mert nincs hozzá glyph). Egyszerűsített,
 * de felismerhető zászlók a Kinti-országokhoz.
 *
 * ⚠️ Ismeretlen kód → SEMLEGES szürke, NEM svájci. Korábban a fallback a
 * svájcira esett, ezért az újonnan felvett Anglia (GB) svájci zászlót kapott,
 * amíg a GB be nem került ide. Új ország felvételekor MINDIG vedd fel ide is a
 * zászlót — a semleges fallback most már láthatóvá teszi, ha kimaradt.
 */
const FLAGS: Record<string, React.ReactNode> = {
  CH: (
    <>
      <rect width="24" height="16" fill="#D52B1E" />
      <rect x="10.5" y="3.5" width="3" height="9" fill="#fff" />
      <rect x="7.5" y="6.5" width="9" height="3" fill="#fff" />
    </>
  ),
  AT: (
    <>
      <rect width="24" height="16" fill="#ED2939" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
    </>
  ),
  DE: (
    <>
      <rect width="24" height="16" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#D00" />
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
    </>
  ),
  NL: (
    <>
      <rect width="24" height="16" fill="#AE1C28" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
      <rect y="10.67" width="24" height="5.33" fill="#21468B" />
    </>
  ),
  DK: (
    <>
      <rect width="24" height="16" fill="#C8102E" />
      <rect x="7" width="3" height="16" fill="#fff" />
      <rect y="6.5" width="24" height="3" fill="#fff" />
    </>
  ),
  SE: (
    <>
      <rect width="24" height="16" fill="#006AA7" />
      <rect x="7" width="3" height="16" fill="#FECC00" />
      <rect y="6.5" width="24" height="3" fill="#FECC00" />
    </>
  ),
  // Anglia — a Union Jack egyszerűsített, de felismerhető változata.
  GB: (
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3.4" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.8" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5.4" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="3.2" />
    </>
  ),
};

/** Ismeretlen kód → SEMLEGES szürke (NEM svájci!). */
const UNKNOWN_FLAG = (
  <>
    <rect width="24" height="16" fill="#d8dcd9" />
    <rect y="7" width="24" height="2" fill="#b6bcb8" />
  </>
);

export function CountryFlag({
  code,
  className = "h-[18px] w-[26px]",
}: {
  code: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10", className)}>
      <svg viewBox="0 0 24 16" className="h-full w-full" role="img" aria-hidden="true" preserveAspectRatio="none">
        {FLAGS[code] ?? UNKNOWN_FLAG}
      </svg>
    </span>
  );
}
