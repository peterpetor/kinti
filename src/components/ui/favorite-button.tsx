"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { cacheOfflinePaths, removeOfflinePath } from "@/lib/offline-cache";

const LS_KEY = "kinti_favorites";
/** Az esemény, amivel a lista-nézet (explore-view) szinkronban marad. */
export const FAVORITES_CHANGED_EVENT = "kinti-favorites-changed";

function readFavorites(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * Szív-toggle a vállalkozás-kártyán. A kedvenceket localStorage-ban tartja
 * (kinti_favorites), és a `kinti-favorites-changed` eseménnyel értesíti a
 * lista-nézetet. Link-en belül is használható: a kattintás NEM navigál.
 */
export function FavoriteButton({ businessId, className }: { businessId: string; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [fav, setFav] = useState(false);
  // „Pop" animáció re-triggere: a kulcs változása újra-mountolja az ikont.
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    setFav(readFavorites().includes(businessId));
    // Más helyen történt változás (pl. másik kártya, detail-oldal) → frissítünk.
    const onChange = () => setFav(readFavorites().includes(businessId));
    window.addEventListener(FAVORITES_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, onChange);
  }, [businessId]);

  function toggle(e: React.MouseEvent) {
    // Ne navigáljon a kártyát körülölelő Link.
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs = readFavorites();
      const isAdding = !favs.includes(businessId);
      const next = isAdding
        ? [...favs, businessId]
        : favs.filter((id) => id !== businessId);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      setFav(next.includes(businessId));
      if (isAdding) setPopKey((k) => k + 1);
      haptic("tap");
      window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT));
      // Kedvenc = offline is elérhető: a szakember profil-oldalának cache-elése
      // (best-effort). Eltávolításnál töröljük a cache-ből.
      const path = `/szaknevsor/${businessId}`;
      if (isAdding) void cacheOfflinePaths([path]);
      else void removeOfflinePath(path);
    } catch {
      /* localStorage letiltva — csendben elnyeljük */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={fav ? "Eltávolítás a kedvencekből" : "Hozzáadás a kedvencekhez"}
      aria-pressed={fav}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border bg-surface shadow-sm transition active:scale-90",
        fav ? "border-accent/40 text-accent" : "border-line text-ink-muted hover:text-accent hover:border-accent/40",
        className,
      )}
    >
      {/* mounted-guard: szerver-render mindig üres szív → nincs hidratációs eltérés */}
      <Icon key={popKey} name="heart" size={16} strokeWidth={2.2} filled={mounted && fav} className={cn(popKey > 0 && "kinti-pop")} />
    </button>
  );
}
