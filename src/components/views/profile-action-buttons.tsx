"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface ProfileActionButtonsProps {
  businessId: string;
  businessName: string;
}

export function ProfileHeaderActions({ businessId, businessName }: ProfileActionButtonsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Kedvenc állapot betöltése localStorage-ból
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
      setIsFavorite(favs.includes(businessId));
    } catch {
      // Ignoráljuk a hibákat ha a localStorage le van tiltva
    }
  }, [businessId]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const toggleFavorite = () => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
      let nextFavs: string[];
      if (favs.includes(businessId)) {
        nextFavs = favs.filter((id) => id !== businessId);
        setIsFavorite(false);
        showToast("Eltávolítva a kedvencek közül");
      } else {
        nextFavs = [...favs, businessId];
        setIsFavorite(true);
        showToast("Kedvencekhez adva");
      }
      localStorage.setItem("kinti_favorites", JSON.stringify(nextFavs));
    } catch {
      showToast("A kedvencek funkcióhoz engedélyezd a sütiket!");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${businessName} · Kinti`,
      text: `Találd meg a magyar szakembert Svájcban: ${businessName}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Sikeresen megosztva!");
      } catch (err) {
        // Ha a felhasználó megszakította a megosztást, nem mutatunk hibát
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link másolva a vágólapra!");
      } catch {
        showToast("Nem sikerült másolni a linket.");
      }
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Megosztás"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/95 text-ink shadow-card backdrop-blur-md transition hover:bg-white active:scale-95"
        >
          <Icon name="share" size={17} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Eltávolítás a kedvencek közül" : "Kedvencekhez adás"}
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/95 text-accent shadow-card backdrop-blur-md transition hover:bg-white active:scale-95"
        >
          <Icon
            name="heart"
            size={17}
            strokeWidth={2.2}
            filled={isFavorite}
            className={cn("transition-all duration-200", isFavorite && "scale-110 text-accent")}
          />
        </button>
      </div>

      {/* Gyönyörű premium lebegő toast visszajelzés */}
      {toastMessage && (
        <div className="fixed inset-x-5 bottom-8 z-[9999] flex justify-center pointer-events-none animate-fade-up">
          <div className="glass pointer-events-auto rounded-pill px-4 py-2.5 text-[13px] font-bold text-white bg-primary/90 shadow-pop flex items-center gap-2 border border-white/10">
            <Icon name="check" size={14} strokeWidth={3} className="text-success-soft" />
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}


