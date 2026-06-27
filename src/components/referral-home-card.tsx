"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { getMyInviteCode, inviteUrl } from "@/lib/referral-client";

const TIERS = [
  { n: 1, label: "Küldtem egy magyart" },
  { n: 3, label: "Összekötő" },
  { n: 5, label: "Nagykövet" },
];

/**
 * ReferralHomeCard — főoldali nudge a „Küldj egy magyart" referralhoz. Megosztja
 * az anonim meghívó-linket, és mutatja a behívottak (puha) számát + a következő
 * presztízs-kitűzőt. Hidratálás-biztos: mount előtt nem renderel.
 */
export function ReferralHomeCard() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted]);

  if (!mounted || !code) return null;

  const url = inviteUrl(code);
  const shareText = "Szia! Én a Kintit használom kint élő magyarként — szakember-kereső, állások, ügyintézés, közösség. Anonim, ingyenes. Csatlakozz:";
  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Küldj egy magyart — Kinti", text: shareText, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  const c = count ?? 0;
  const next = TIERS.find((t) => t.n > c);

  return (
    <button
      type="button"
      onClick={share}
      className="flex w-full items-center gap-3 rounded-card border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-surface px-4 py-3 text-left shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-xl">🤝</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Küldj egy magyart</p>
        {c > 0 ? (
          <p className="text-[15px] font-extrabold leading-tight text-ink">
            Már <span className="text-accent">{c.toLocaleString("hu-HU")}</span> magyart hívtál be!
          </p>
        ) : (
          <p className="text-[15px] font-extrabold leading-tight text-ink">A legritkább kitűző vár</p>
        )}
        <p className="text-[11px] text-ink-muted">
          {next ? `Még ${next.n - c} a(z) „${next.label}" kitűzőig — oszd meg →` : "Nagykövet vagy! 🎗️ Köszönjük!"}
        </p>
      </div>
      <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-accent" />
    </button>
  );
}
