"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * /leiratkozas/[token] — hírlevél-leiratkozás MEGERŐSÍTŐ oldala.
 *
 * A leiratkozó email-link ide mutat (nem a törlő API-ra), így a prefetcherek /
 * szkennerek nem iratkoztatnak le senkit véletlenül. A tényleges törlés a
 * „Leiratkozom" gombbal, POST-tal történik.
 */
export default function UnsubscribePage({ params }: { params: { token: string } }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function confirm() {
    setPhase("loading");
    try {
      const res = await fetch(`/api/newsletter/unsubscribe/${encodeURIComponent(params.token)}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      setPhase(res.ok && data.ok ? "done" : "error");
    } catch {
      setPhase("error");
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      {phase === "done" ? (
        <>
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-2xl text-success">✓</div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Leiratkoztál</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            Többé nem küldünk hírlevelet erre a címre. Bármikor visszatérhetsz.
          </p>
          <Link href="/hirlevel" className="mt-5 inline-flex h-11 items-center rounded-pill bg-primary px-5 text-[14px] font-extrabold text-white shadow-card">
            Mégis feliratkozom
          </Link>
        </>
      ) : (
        <>
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-alt text-2xl">✉️</div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Biztosan leiratkozol?</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            Ezután nem kapsz több Kinti hírlevelet erre a címre.
          </p>

          {phase === "error" && (
            <p className="mt-4 rounded-[10px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent">
              Nem sikerült — lehet, hogy a link lejárt, vagy már leiratkoztál.
            </p>
          )}

          <button
            type="button"
            onClick={confirm}
            disabled={phase === "loading"}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-pill bg-accent px-5 text-[15px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98] disabled:opacity-60"
          >
            {phase === "loading" ? "Leiratkozás…" : "Leiratkozom"}
          </button>
          <Link href="/" className="mt-3 text-[13px] font-bold text-ink-muted hover:text-ink">
            Mégsem, maradok
          </Link>
        </>
      )}
    </main>
  );
}
