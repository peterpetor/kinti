"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KintiLogo, Icon } from "@/components/ui";
import { setReferredBy, getMyInviteCode, isValidInviteCode } from "@/lib/referral-client";

/**
 * InviteLanding — a meghívó-link fogadóoldala. Eltárolja, hogy ki hívott (első nyer),
 * és rögzít egy anonim konverziót a meghívó kódjához (self-guard + ipHash-dedup a
 * szerveren). Nulla account; csak egy üdvözlő + belépő-gomb.
 */
export function InviteLanding({ code }: { code: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isValidInviteCode(code)) { setDone(true); return; }
    setReferredBy(code);
    let active = true;
    (async () => {
      try {
        await fetch("/api/referral", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, self: getMyInviteCode() }),
        });
      } catch { /* hálózati hiba → a referred_by attól még megvan */ }
      if (active) setDone(true);
    })();
    return () => { active = false; };
  }, [code]);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <KintiLogo size={56} />
      <div className="text-5xl" aria-hidden>🇭🇺🤝</div>
      <div>
        <h1 className="text-[26px] font-black tracking-tight text-ink">Egy magyar meghívott a Kintire!</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          A Kinti a kint élő magyaroké: szakember-kereső, állások, ügyintézés-segéd, közösség és
          „ki költözött melléd?" térkép — <strong className="text-ink">ingyen, fiók nélkül, anonim</strong>.
        </p>
      </div>

      <ul className="w-full space-y-2 text-left">
        {[
          ["list", "Találj magyar szakembert a közeledben"],
          ["briefcase", "Magyar állások és munkaközvetítés"],
          ["document", "Ügyintézés-segéd (Anmeldung, biztosítás, adó)"],
          ["pin", "Nézd meg, hányan vagyunk magyarok a környékeden"],
        ].map(([icon, text]) => (
          <li key={text} className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary">
              <Icon name={icon as "list"} size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[13px] font-semibold text-ink">{text}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]"
      >
        Fedezd fel a Kintit →
      </Link>
      <p className="text-[11px] text-ink-faint">{done ? "Üdv a közösségben! 🎉" : "Betöltés…"}</p>
    </div>
  );
}
