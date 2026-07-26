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
  // ⚠️ ANGLIA zászlaja a Szent György-kereszt (fehér alap, piros kereszt) —
  // NEM a Union Jack, az az EGYESÜLT KIRÁLYSÁGÉ. A Kinti szándékosan csak
  // Angliát kezeli országként (Skócia/Wales/É-Írország külön jogrend, ld.
  // regions.ts GB_REGIONS), ezért itt az angol zászló a helyes.
  GB: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect x="10.4" y="0" width="3.2" height="16" fill="#CE1124" />
      <rect x="0" y="6.4" width="24" height="3.2" fill="#CE1124" />
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
