"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { BottomSheet, SheetRow } from "./bottom-sheet";
import {
  whatsappShareUrl,
  viberShareUrl,
  copyLink,
  nativeShare,
  canNativeShare,
} from "@/lib/share";

/**
 * Megosztás alsó lap — célzott WhatsApp / Viber gombok (amiket a kint élő
 * magyarok használnak), plusz natív megosztás + link-másolás. Vezérelt
 * (open/onClose), így bárhol újrahasználható egy saját megosztás-gomb mögött.
 */
export function ShareSheet({
  open,
  onClose,
  url,
  title,
  text,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);
  const msg = text ?? title;

  return (
    <BottomSheet open={open} onClose={onClose} title="Megosztás">
      <div className="space-y-2">
        <SheetRow
          href={whatsappShareUrl(url, msg)}
          onClick={onClose}
          badgeColor="#25D366"
          icon={<Icon name="send" size={16} strokeWidth={2.4} />}
          label="WhatsApp"
        />
        <SheetRow
          href={viberShareUrl(url, msg)}
          onClick={onClose}
          badgeColor="#7360F2"
          icon={<Icon name="send" size={16} strokeWidth={2.4} />}
          label="Viber"
        />
        {canNativeShare() && (
          <SheetRow
            onClick={async () => {
              await nativeShare({ url, title, text });
              onClose();
            }}
            badgeColor="#1d4434"
            icon={<Icon name="share" size={16} strokeWidth={2.2} />}
            label="Több lehetőség…"
          />
        )}
        <SheetRow
          onClick={async () => {
            const ok = await copyLink(url);
            setCopied(ok);
            if (ok) setTimeout(onClose, 900);
          }}
          badgeColor="#5c6d63"
          icon={<Icon name={copied ? "check" : "globe"} size={16} strokeWidth={2.2} />}
          label={copied ? "Link másolva ✓" : "Link másolása"}
        />
      </div>
    </BottomSheet>
  );
}
