"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { isBookmarked, toggleBookmark, type Bookmark } from "@/lib/bookmarks";

/**
 * 1-kattintásos mentés a Saját Gyűjteménybe (/sajatjaim).
 *
 * ⚠️ HIDRATÁLÁS-BIZTOS: a szerver és az első kliens-render is „nem mentett"
 * állapotot rajzol, a valódi állapotot csak mount UTÁN olvassuk be. Enélkül a
 * localStorage-ból jövő érték eltérne az SSR-kimenettől → React hydration hiba.
 *
 * ⚠️ A `title`/`subtitle` PILLANATKÉPKÉNT mentődik. Szándékos: a gyűjtemény
 * kliensoldali, nincs mögötte szerver, ami a nevet később frissíthetné. Ha egy
 * cég átnevezi magát, a mentett cím a régi marad — a link viszont az élő
 * adatlapra visz, tehát a user a friss adatot látja, amint rákattint.
 */
export function BookmarkButton({
  kind,
  id,
  title,
  subtitle,
  href,
  variant = "icon",
  className,
}: Omit<Bookmark, "savedAt"> & {
  /** `icon` = kerek gomb (adatlap-fejléc), `full` = feliratos sáv (cikk alja). */
  variant?: "icon" | "full";
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isBookmarked(kind, id));
    // Ha egy másik komponens (pl. a /sajatjaim listája) törli, kövessük.
    const frissit = () => setSaved(isBookmarked(kind, id));
    window.addEventListener("kinti:bookmarks", frissit);
    return () => window.removeEventListener("kinti:bookmarks", frissit);
  }, [kind, id]);

  function kattint() {
    setSaved(toggleBookmark({ kind, id, title, subtitle, href }));
  }

  const aktiv = mounted && saved;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={kattint}
        aria-pressed={aktiv}
        aria-label={aktiv ? "Eltávolítás a gyűjteményből" : "Mentés a gyűjteménybe"}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border transition active:scale-95",
          aktiv ? "border-primary/40 bg-primary/10 text-primary" : "border-line bg-surface text-ink-muted",
          className,
        )}
      >
        <Icon name={aktiv ? "check" : "bookmark"} size={16} strokeWidth={2.4} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={kattint}
      aria-pressed={aktiv}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-card border px-4 py-3 text-[13px] font-extrabold tracking-tight transition active:scale-[0.99]",
        aktiv ? "border-primary/40 bg-primary/10 text-primary" : "border-line bg-surface text-ink",
        className,
      )}
    >
      <Icon name={aktiv ? "check" : "bookmark"} size={16} strokeWidth={2.4} />
      {aktiv ? "Elmentve a gyűjteményedbe" : "Mentés a gyűjteménybe"}
    </button>
  );
}
