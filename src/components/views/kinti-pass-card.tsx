"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Icon, KintiLogo } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * KintiPassCard — a felhasználó digitális kedvezménykártyája (Apple Wallet-stílus).
 *
 * PRIVACY: a szerver nem köt per-user azonosítót (lásd a projekt privacy-elvét),
 * ezért a név és a kártya-azonosító is KLIENSOLDALI (localStorage) — a felmutatás
 * fizikai aktus, szerver-oldali hitelesítés nem kell hozzá.
 *
 * Képernyőfotó ellen: a kártyán másodperc-pontos ÉLŐ óra + pulzáló pötty fut —
 * az elfogadóhely ránézésre látja, hogy az app él, nem egy állókép.
 *
 * A kártya háttere SZÁNDÉKOSAN téma-független (fix sötétzöld gradiens, mint egy
 * fizikai kártya) → a rajta lévő szövegek FIX világos színek, nem téma-tokenek.
 */

const NAME_KEY = "kinti.pass.name";
const ID_KEY = "kinti.pass.id";

/** Anonim, olvasható kártya-azonosító: KP-XXXX-XXXX (nem PII, nem szerver-kulcs). */
function generatePassId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // nincs 0/O/1/I — felolvasható
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
  return `KP-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

function readLs(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLs(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function KintiPassCard() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [passId, setPassId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  // ELLENŐRZŐ NÉZET: ha a lapot a kártya QR-kódjából nyitották meg (?kod=&n=),
  // akkor NEM a szkennelő saját (localStorage) kártyáját mutatjuk, hanem a
  // felmutató tagét — az URL-ből olvasva. Így az elfogadóhely tényleg a vásárló
  // nevét/kódját látja, nem a sajátját. (Nincs szerver — a név az URL-ben utazik,
  // amit a tag önként mutat fel; a privacy-elv így is teljesül.)
  const [verify, setVerify] = useState<{ id: string; name: string | null } | null>(null);

  // Mount: URL-param (ellenőrző nézet) VAGY saját kártya betöltése.
  useEffect(() => {
    setMounted(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const kod = params.get("kod");
      if (kod) {
        const n = params.get("n");
        setVerify({ id: kod, name: n && n.trim() ? n.trim().slice(0, 40) : null });
        return; // ellenőrző nézet — a saját localStorage-kártyát NE olvassuk
      }
    } catch { /* ignore */ }
    const storedName = readLs(NAME_KEY);
    if (storedName) setName(storedName);
    let id = readLs(ID_KEY);
    if (!id) {
      id = generatePassId();
      writeLs(ID_KEY, id);
    }
    setPassId(id);
  }, []);

  // Élő óra — másodpercenként frissül (képernyőfotó-védelem).
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // QR — az app kártya-oldalára mutat a kártya-kóddal ÉS a névvel: beolvasva az
  // elfogadóhely a felmutató nevét+kódját látja (ellenőrző nézet), nem a sajátját.
  useEffect(() => {
    if (!passId || verify) return; // ellenőrző nézetben nincs saját QR
    const q = name ? `?kod=${passId}&n=${encodeURIComponent(name)}` : `?kod=${passId}`;
    QRCode.toDataURL(`https://kinti.app/profil/kinti-pass${q}`, {
      width: 320,
      margin: 1,
      color: { dark: "#0e1f17", light: "#ffffff" },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [passId, name, verify]);

  const timeText = useMemo(
    () => (now ? now.toLocaleTimeString("hu-HU", { hour12: false }) : "--:--:--"),
    [now],
  );
  const dateText = useMemo(
    () =>
      now
        ? now.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" })
        : "",
    [now],
  );

  function saveName() {
    const n = nameDraft.trim().slice(0, 40);
    if (!n) return;
    writeLs(NAME_KEY, n);
    setName(n);
    setEditingName(false);
  }

  const needsName = mounted && !verify && !name;
  const displayName = verify ? verify.name ?? "Kinti tag" : mounted && name ? name : "Kinti tag";
  const displayId = verify ? verify.id : mounted && passId ? passId : "KP-····-····";

  return (
    <div className="space-y-4">
      {/* Ellenőrző nézet fejléce (a kártya QR-jából megnyitva) */}
      {verify && (
        <div className="flex items-start gap-2.5 rounded-card border border-success/40 bg-success/10 px-4 py-3">
          <Icon name="check" size={18} strokeWidth={2.6} className="mt-0.5 shrink-0 text-success" />
          <div className="text-[12.5px] leading-snug text-ink">
            <strong className="text-ink">Kinti Pass ellenőrzés.</strong> Egy Kinti-tag kártyáját nézed
            — az alábbi név és kód az övé. Add meg neki a saját kedvezményedet. (A Kinti nem hitelesít
            szerveroldalon — bizalmi alapú felmutatás.)
          </div>
        </div>
      )}

      {/* --- A kártya --- */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1d4434] via-[#173a2c] to-[#0e2a1f] p-5 text-white shadow-pop">
        {/* dekor: lágy fény-körök, mint a Wallet-kártyákon */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/[0.04]" />

        {/* fejléc: logó + élő/ellenőrzött jelzés */}
        <div className="relative flex items-center gap-2.5">
          <KintiLogo size={26} />
          <span className="text-[17px] font-extrabold tracking-tight">Kinti</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider">
            {verify ? (
              <>✓ Felmutatott kártya</>
            ) : (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7be3a5]" aria-hidden />
                Élő kártya
              </>
            )}
          </span>
        </div>

        <div className="relative mt-5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/60">
          Kinti Pass · kedvezménykártya
        </div>

        {/* név + kártya-szám */}
        <div className="relative mt-1 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[22px] font-extrabold tracking-tight">
              {displayName}
            </div>
            <div className="mt-0.5 font-mono text-[12px] tracking-[0.08em] text-white/70">
              {displayId}
            </div>
          </div>

          {/* QR — csak a SAJÁT kártyán (a felmutatandó kód); ellenőrző nézetben ✓ */}
          <div className="grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-white p-1">
            {verify ? (
              <Icon name="check" size={34} strokeWidth={2.6} className="text-[#1d4434]" />
            ) : qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="Kinti Pass QR-kód" className="h-full w-full" />
            ) : (
              <span className="text-[9px] font-bold text-[#0e2a1f]">QR</span>
            )}
          </div>
        </div>

        {/* élő óra sor — csak a saját kártyán (a képernyőfotó-védelemhez) */}
        {!verify && (
          <div className="relative mt-4 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-[11px] font-semibold text-white/60">{dateText}</span>
            <span
              className="font-mono text-[17px] font-bold tabular-nums tracking-[0.06em]"
              aria-label="Élő óra"
            >
              {timeText}
            </span>
          </div>
        )}
      </div>

      {/* Ellenőrző nézet: vissza a saját kártyához */}
      {verify ? (
        <Link
          href="/profil/kinti-pass"
          className="mx-auto flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink active:scale-95"
        >
          🎟️ A saját Kinti Pass kártyám
        </Link>
      ) : (
        <p className="px-1 text-center text-[11.5px] leading-snug text-ink-faint">
          A futó másodperc-óra igazolja az elfogadóhelynek, hogy élő appot látsz — nem képernyőfotót.
        </p>
      )}

      {/* --- Név megadása / szerkesztése (csak a saját kártyán) --- */}
      {!verify && (needsName || editingName) && (
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Név a kártyán
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Pl. Kovács Anna"
              maxLength={40}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={saveName}
              disabled={!nameDraft.trim()}
              className={cn(
                "shrink-0 rounded-pill bg-primary px-4 py-2 text-[13px] font-extrabold text-white active:scale-95",
                !nameDraft.trim() && "opacity-50",
              )}
            >
              Mentés
            </button>
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">
            A neved csak ezen a készüléken tárolódik — a Kinti szervereire nem kerül fel.
          </p>
        </div>
      )}

      {!verify && mounted && name && !editingName && (
        <button
          type="button"
          onClick={() => {
            setNameDraft(name);
            setEditingName(true);
          }}
          className="mx-auto flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink active:scale-95"
        >
          ✏️ Név szerkesztése
        </button>
      )}

      {/* --- Elfogadóhelyek (csak a saját kártyán) --- */}
      {!verify && (
        <>
          <Link
            href="/szaknevsor?pass=1"
            className="flex items-center gap-3 rounded-card border border-star/40 bg-star/10 px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-star/20 text-[18px]">
              🎟️
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
                Hol váltható be? — Kinti Pass elfogadóhelyek
              </span>
              <span className="block text-[11.5px] text-ink-muted">
                A Szaknévsorban a „Kinti Pass" szűrővel látod az összes helyet és az ajánlatukat.
              </span>
            </span>
            <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-muted" />
          </Link>

          <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
            A kedvezményt mindig az elfogadóhely adja és váltja be — a pontos feltételekről (mire,
            meddig érvényes) az adott vállalkozás dönt. A Kinti a kártyát és az elfogadóhelyek
            listáját biztosítja.
          </p>
        </>
      )}
    </div>
  );
}
