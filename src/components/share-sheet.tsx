"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@/components/ui";
import { BottomSheet, SheetRow } from "./bottom-sheet";
import { renderBusinessCard, shareOrDownloadCard, type ShareCardData } from "@/lib/share-card";
import {
  whatsappShareUrl,
  viberShareUrl,
  telegramShareUrl,
  facebookShareUrl,
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
  card,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  text?: string;
  /** Ha megadva: branded képkártya (név+kategória+cím+QR) is megosztható. */
  card?: Omit<ShareCardData, "url">;
}) {
  const [copied, setCopied] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [cardState, setCardState] = useState<"idle" | "busy" | "done">("idle");
  const msg = text ?? title;

  const shareCard = async () => {
    if (!card || cardState === "busy") return;
    setCardState("busy");
    try {
      const dataUrl = await renderBusinessCard({ ...card, url });
      const safeName = card.name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").slice(0, 40);
      await shareOrDownloadCard(dataUrl, `kinti_${safeName}.png`, title);
      setCardState("done");
      setTimeout(() => { setCardState("idle"); onClose(); }, 1200);
    } catch {
      setCardState("idle");
    }
  };

  const downloadQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        color: { dark: "#1d4434", light: "#ffffff" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
      a.download = `QR_Kinti_${safeTitle}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setQrDownloaded(true);
      setTimeout(() => {
        setQrDownloaded(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("QR generálási hiba:", err);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Megosztás">
      <div className="space-y-2">
        {card && (
          <SheetRow
            onClick={shareCard}
            badgeColor="#c8392e"
            icon={<Icon name={cardState === "done" ? "check" : "qrCode"} size={16} strokeWidth={2.2} />}
            label={
              cardState === "busy"
                ? "Kártya készítése…"
                : cardState === "done"
                  ? "Kész! ✓"
                  : "Képkártya megosztása (név + QR)"
            }
          />
        )}
        <SheetRow
          href={whatsappShareUrl(url, msg)}
          onClick={onClose}
          badgeColor="#25D366"
          icon={<Icon name="send" size={16} strokeWidth={2.4} />}
          label="WhatsApp"
        />
        <SheetRow
          href={telegramShareUrl(url, msg)}
          onClick={onClose}
          badgeColor="#229ED9"
          icon={<Icon name="send" size={16} strokeWidth={2.4} />}
          label="Telegram"
        />
        <SheetRow
          href={facebookShareUrl(url)}
          onClick={onClose}
          badgeColor="#1877F2"
          icon={<Icon name="facebook" size={16} strokeWidth={2.4} />}
          label="Facebook"
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
        <SheetRow
          onClick={downloadQR}
          badgeColor="#e3a233"
          icon={<Icon name={qrDownloaded ? "check" : "qrCode"} size={16} strokeWidth={2.2} />}
          label={qrDownloaded ? "Sikeres letöltés! ✓" : "QR Kód letöltése nyomtatáshoz"}
        />
      </div>
    </BottomSheet>
  );
}
