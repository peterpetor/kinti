"use client";

import { useEffect, useState } from "react";

/**
 * GuideFeedback — anonim „Hasznos volt?" szavazás a Tudásbázis cikkein.
 *
 * A MEGLÉVŐ privacy-first usage-analytics csatornára épül (/api/track,
 * `action:` esemény, aggregált, azonosító nélkül — nulla új tábla): az admin
 * funkció-használat listáján `gfb-up-<slug>` / `gfb-dn-<slug>` néven jelenik
 * meg → végre van jel, MELYIK cikk ér valamit az olvasónak (tartalom-roadmap
 * adat). Eszközönként egy szavazat (localStorage), a szavazat után köszönő
 * állapot marad. A prefix rövid, mert az esemény-formátum 40 karakteres
 * (a leghosszabb slug + `gfb-up-` = 38).
 */
export function GuideFeedback({ slug }: { slug: string }) {
  // Hidratálás-biztos: mount után olvassuk a korábbi szavazatot.
  const [voted, setVoted] = useState<"up" | "dn" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const v = localStorage.getItem(`kinti.guideFb.${slug}`);
      if (v === "up" || v === "dn") setVoted(v);
    } catch {
      /* private mode */
    }
  }, [slug]);

  function vote(dir: "up" | "dn") {
    setVoted(dir);
    try {
      localStorage.setItem(`kinti.guideFb.${slug}`, dir);
    } catch {
      /* private mode — a szavazat akkor is elmegy */
    }
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: `action:gfb-${dir}-${slug}` }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* fire-and-forget */
    }
  }

  if (!mounted) return null;

  if (voted) {
    return (
      <p className="px-1 text-center text-[12px] font-semibold text-ink-muted">
        {voted === "up" ? "Köszönjük a visszajelzést! 💚" : "Köszönjük — igyekszünk jobbá tenni ezt a cikket."}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 rounded-card border border-line bg-surface-alt/50 px-4 py-3">
      <span className="text-[12.5px] font-bold text-ink">Hasznos volt ez az útmutató?</span>
      <button
        type="button"
        onClick={() => vote("up")}
        className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[13px] transition active:scale-95"
        aria-label="Hasznos volt"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => vote("dn")}
        className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[13px] transition active:scale-95"
        aria-label="Nem volt hasznos"
      >
        👎
      </button>
    </div>
  );
}
