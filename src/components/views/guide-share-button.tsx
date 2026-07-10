"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

/**
 * GuideShareButton — natív megosztás a Tudásbázis cikkein (viral kör).
 *
 * Mobilon a Web Share API a rendszer-megosztót nyitja (WhatsApp/Messenger —
 * ahol a diaszpóra-közösségek élnek: egy tap és a cikk egy csoportban landol).
 * Ahol nincs `navigator.share` (asztali böngészők egy része), vágólapra másol
 * és visszajelez. Az URL-t a kliensen olvassuk (SSG-oldalon nincs runtime-adat).
 */
export function GuideShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* a user bezárta a megosztót → nem hiba */
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard-engedély hiánya — csendben elnyeljük */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Cikk megosztása"
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink transition active:scale-95"
    >
      <Icon name="share" size={15} strokeWidth={2.2} />
      {copied && (
        <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-pill bg-ink px-2.5 py-1 text-[10.5px] font-bold text-surface shadow-pop">
          Link másolva ✓
        </span>
      )}
    </button>
  );
}
