"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { addMyPost, exportBackup, type MyPostEntry, type PostType } from "@/lib/my-posts";

/**
 * PostSavePrompt — minden sikeres beküldés után megjelenő "tedd el!" doboz.
 *
 * Tartalom:
 *   1) Nagy figyelem-felhívás
 *   2) Másolható manage URL
 *   3) QR-kód (másik eszközre)
 *   4) "Letöltöm a teljes backup-ot" gomb (JSON file)
 *   5) Link a /sajatjaim oldalra
 *
 * Mihelyt mountolódik, ELMENTI a posztot a localStorage-ba (addMyPost),
 * tehát ha a user el is megy az oldalról, a következő látogatáskor a
 * /sajatjaim oldalon megtalálja.
 */
export function PostSavePrompt({
  type,
  id,
  manageToken,
  title,
  manageUrl,
}: {
  type: PostType;
  id: string;
  manageToken: string;
  title: string;
  manageUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${manageUrl}`
    : manageUrl;

  useEffect(() => {
    // 1) Eltároljuk a posztot localStorage-ba
    const entry: Omit<MyPostEntry, "createdAt"> = {
      type, id, manageToken, title, manageUrl,
    };
    addMyPost(entry);

    // 2) QR-kód előállítás (data: URL)
    QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 5,
      color: { dark: "#0e1f17", light: "#fbf7ee" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [type, id, manageToken, title, manageUrl, fullUrl]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* HTTPS-only API, fallback nincs */
    }
  }

  function downloadBackup() {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kinti-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-card border-2 border-primary/40 bg-primary-soft/50 p-4 shadow-card">
      <div className="flex items-start gap-2 mb-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-lg">
          🔑
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
            Tedd el a kezelő-linkedet!
          </p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
            Ezzel a linkkel szerkesztheted vagy törölheted. <strong>Nincs email, nincs fiók — ha elveszíted, elvész.</strong>
          </p>
        </div>
      </div>

      {/* Másolható URL */}
      <div className="mt-3 flex items-stretch gap-2">
        <div className="flex-1 rounded-[10px] border border-line bg-surface px-3 py-2 font-mono text-[11px] text-ink truncate">
          {fullUrl}
        </div>
        <button
          type="button"
          onClick={copyUrl}
          className={cn(
            "shrink-0 rounded-[10px] px-3 py-2 text-[11.5px] font-bold transition active:scale-95",
            copied ? "bg-success text-white" : "bg-primary text-white",
          )}
        >
          {copied ? "✓ Másolva" : "Másol"}
        </button>
      </div>

      {/* QR-kód + akciók */}
      <div className="mt-3 grid grid-cols-[auto,1fr] gap-3">
        <div className="rounded-[10px] border border-line bg-surface p-2 flex items-center justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Manage URL QR-kódja" className="h-[88px] w-[88px]" />
          ) : (
            <div className="grid h-[88px] w-[88px] place-items-center text-[10px] text-ink-faint">
              QR…
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 justify-center">
          <p className="text-[11px] leading-snug text-ink-muted">
            <strong className="text-ink">Másik eszközön</strong>: olvasd be a QR-kódot, vagy:
          </p>
          <button
            type="button"
            onClick={downloadBackup}
            className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-surface border border-line py-1.5 px-3 text-[11.5px] font-bold text-ink shadow-card active:scale-95"
          >
            <Icon name="arrowUp" size={11} strokeWidth={2.4} className="rotate-180" />
            Letöltöm JSON-ként
          </button>
          <a
            href="/sajatjaim"
            className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-primary underline"
          >
            Összes saját posztom →
          </a>
        </div>
      </div>
    </div>
  );
}
