"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { addMyPost, loadMyPosts, exportBackup, type MyPostEntry, type PostType } from "@/lib/my-posts";
import { computeGamification, gamificationGain, type GamificationGain } from "@/lib/gamification";

/**
 * PostSavePrompt — sikeres beküldés után megjelenő pozitív megerősítő doboz.
 *
 * Hangsúly: a poszt MÁR fent van + a böngésződ MÁR megjegyezte. A link csak
 * pluszbiztosíték másik eszközre vagy ha kitisztítod a cache-t.
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
  const [canShare, setCanShare] = useState(false);
  const [gain, setGain] = useState<GamificationGain | null>(null);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${manageUrl}`
    : manageUrl;

  useEffect(() => {
    const entry: Omit<MyPostEntry, "createdAt"> = {
      type, id, manageToken, title, manageUrl,
    };
    // Gamifikáció: a beküldés ELŐTTI és UTÁNI állapot különbsége adja az
    // XP/szint/kitűző-visszajelzést. Duplikált beküldésnél (addMyPost dedupol)
    // a különbség 0 → nem villantunk fel hamis "+XP"-t.
    const before = computeGamification(loadMyPosts());
    addMyPost(entry);
    setGain(gamificationGain(before, computeGamification(loadMyPosts())));

    // Push-prompt timing: jelezzük, hogy a usernek már volt sikeres beküldése
    try {
      window.localStorage.setItem("kinti.hasSubmitted", "1");
    } catch {
      /* private mode → ok */
    }

    setCanShare(
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function",
    );

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

  async function nativeShare() {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
    try {
      await navigator.share({
        title: `kinti — ${title}`,
        text: "Kezelő-link a posztomhoz (kinti.app):",
        url: fullUrl,
      });
    } catch {
      /* user megszakította vagy nem támogatott */
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
    <div className="rounded-card border-2 border-success/40 bg-success/10 p-4 shadow-card">
      {/* Sikerélmény + biztatás */}
      <div className="flex items-start gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-success text-white text-xl">
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">
            Sikerült! A posztod fent van. 🎉
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            <strong className="text-ink">A böngésződ már megjegyezte</strong> — bármikor
            megtalálod a <a href="/sajatjaim" className="text-primary font-bold underline">Saját posztjaim</a> oldalon.
          </p>
        </div>
      </div>

      {/* Gamifikáció: XP / szint / kitűző visszajelzés (csak ha tényleg nőtt) */}
      {gain && gain.xpGained > 0 && (
        <a
          href="/sajatjaim"
          className="mt-3 flex flex-wrap items-center gap-2 rounded-[12px] border border-primary/25 bg-primary/10 px-3 py-2.5 transition active:scale-[0.99]"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white text-[13px] font-black">
            +{gain.xpGained}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-extrabold tracking-[-0.01em] text-primary">
              +{gain.xpGained} XP a hozzájárulásodért! 🎉
            </span>
            {gain.leveledUp && (
              <span className="block text-[11.5px] font-bold text-ink">
                Új szint elérve: {gain.newLevel}. szint 👑
              </span>
            )}
            {gain.unlockedBadges.length > 0 && (
              <span className="block text-[11.5px] font-semibold text-ink-muted">
                Új kitűző:{" "}
                {gain.unlockedBadges.map((b) => `${b.icon} ${b.label}`).join(", ")}
              </span>
            )}
          </span>
          <span className="shrink-0 text-primary text-[13px] font-bold">›</span>
        </a>
      )}

      {/* Tipp box */}
      <div className="mt-3 rounded-[12px] border border-line bg-surface p-3">
        <p className="text-[12px] font-bold text-ink flex items-center gap-1.5">
          <span className="text-[14px]">💡</span> Pluszbiztonság: mentsd el a linket
        </p>
        <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">
          Ha másik telefonon is szerkeszteni szeretnéd, vagy ha véletlenül kitisztítod a böngésződ
          cache-ét, ezzel a linkkel mindig visszatérhetsz a posztodhoz:
        </p>

        {/* Másolható URL */}
        <div className="mt-2 flex items-stretch gap-2">
          <div className="flex-1 rounded-[10px] border border-line bg-surface-alt px-3 py-2 font-mono text-[10.5px] text-ink truncate">
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

        {/* Action buttons: Share / Bookmark hint */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {canShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary text-white py-1.5 px-3 text-[11.5px] font-bold active:scale-95"
            >
              📤 Megosztom magamnak
            </button>
          )}
          <span
            title="Nyomd meg a Ctrl+D-t (Windows) vagy ⌘+D-t (Mac), és add hozzá a könyvjelzőkhöz"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface py-1.5 px-3 text-[11.5px] font-bold text-ink-muted"
          >
            ⭐ Tipp: Ctrl+D = könyvjelző
          </span>
        </div>
      </div>

      {/* QR + JSON backup — kevésbé hangsúlyos, lent kis méretben */}
      <details className="mt-3 group">
        <summary className="cursor-pointer text-[11.5px] font-bold text-ink-muted hover:text-ink list-none flex items-center gap-1.5">
          <span className="transition group-open:rotate-90">▶</span>
          Profi opciók: QR-kód, mentés fájlba
        </summary>
        <div className="mt-2 grid grid-cols-[auto,1fr] gap-3 rounded-[12px] border border-line bg-surface p-3">
          <div className="rounded-[10px] border border-line bg-surface-alt p-2 flex items-center justify-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Manage URL QR-kódja" className="h-[80px] w-[80px]" />
            ) : (
              <div className="grid h-[80px] w-[80px] place-items-center text-[10px] text-ink-faint">
                QR…
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 justify-center">
            <p className="text-[10.5px] leading-snug text-ink-muted">
              QR-kód másik telefonra. Vagy mentsd a teljes listát fájlba:
            </p>
            <button
              type="button"
              onClick={downloadBackup}
              className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-surface-alt border border-line py-1.5 px-3 text-[11px] font-bold text-ink active:scale-95"
            >
              <Icon name="arrowUp" size={11} strokeWidth={2.4} className="rotate-180" />
              JSON mentés
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
