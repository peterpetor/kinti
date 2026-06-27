"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getMyInviteCode, inviteUrl } from "@/lib/referral-client";

const TIERS = [
  { n: 1, icon: "🤝", label: "Küldtem egy magyart" },
  { n: 3, icon: "🧲", label: "Összekötő" },
  { n: 5, icon: "🎗️", label: "Nagykövet" },
];

/**
 * ReferralHub — „Küldj egy magyart". A felhasználó anonim meghívó-linkje, megosztás,
 * és az élő (puha) konverziószám + a presztízs-kitűzők haladása. Nulla account.
 */
export function ReferralHub() {
  const [code, setCode] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const c = getMyInviteCode();
    setCode(c);
    if (!c) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/referral?code=${c}`);
        const data = (await res.json()) as { count?: number };
        if (active) setCount(data.count ?? 0);
      } catch { if (active) setCount(0); }
    })();
    return () => { active = false; };
  }, []);

  if (!code) return null;
  const url = inviteUrl(code);
  const shareText = "Szia! Én a Kintit használom kint élő magyarként (szakember-kereső, állások, ügyintézés, közösség — anonim, ingyenes). Neked is hasznos lehet, csatlakozz:";

  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Küldj egy magyart — Kinti", text: shareText, url }).catch(() => {});
    } else {
      copy();
    }
  }
  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  const c = count ?? 0;

  return (
    <section className="rounded-card border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-surface p-5 shadow-pop space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-xl">🤝</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-extrabold tracking-tight text-ink">Küldj egy magyart</h2>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            Ismersz mást, aki szintén kint él? Hívd meg — a „Küldtem egy magyart" a legritkább kitűző.
          </p>
        </div>
      </div>

      {/* Élő szám */}
      <div className="rounded-card border border-line bg-surface px-4 py-3 text-center">
        <p className="text-[26px] font-black leading-none text-accent">{count === null ? "…" : c}</p>
        <p className="mt-1 text-[12px] font-bold text-ink-muted">behívott magyar eddig</p>
      </div>

      {/* Kitűző-fokozatok */}
      <div className="flex items-center justify-between gap-2">
        {TIERS.map((t) => {
          const earned = c >= t.n;
          return (
            <div key={t.n} className={cn("flex flex-1 flex-col items-center gap-1 rounded-xl border p-2 text-center transition", earned ? "border-accent/40 bg-accent/5" : "border-line bg-surface opacity-60")}>
              <span className={cn("text-xl", !earned && "grayscale")}>{t.icon}</span>
              <span className="text-[10.5px] font-bold leading-tight text-ink">{t.label}</span>
              <span className="text-[10px] font-bold text-ink-faint">{earned ? "megvan ✓" : `${t.n} kell`}</span>
            </div>
          );
        })}
      </div>

      {/* Link + megosztás */}
      <div className="space-y-2">
        <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-pill border border-line bg-surface-alt px-3 py-2.5 text-left">
          <Icon name="globe" size={14} className="shrink-0 text-ink-muted" />
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">{url.replace("https://", "")}</span>
          <span className="shrink-0 text-[11px] font-bold text-primary">{copied ? "Másolva ✓" : "Másol"}</span>
        </button>
        <button type="button" onClick={share} className="w-full rounded-pill bg-accent py-3 text-[14px] font-black text-white shadow-card transition active:scale-[0.98]">
          🔗 Megosztom egy magyarral
        </button>
      </div>

      <p className="text-[11px] leading-snug text-ink-faint">
        Anonim: nincs fiók, nincs email. A link egy véletlen kód, az IP-t nem tároljuk — csak a visszaélés ellen dedupolunk. A számláló „puha".
      </p>
    </section>
  );
}
