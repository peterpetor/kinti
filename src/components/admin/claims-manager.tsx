"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BusinessClaim } from "@/lib/repo-claims";

export function ClaimsManager({ initialClaims }: { initialClaims: BusinessClaim[] }) {
  const router = useRouter();
  const [claims, setClaims] = useState(initialClaims);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusy(id);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/claims/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; manageUrl?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Hiba a döntésnél.");
        return;
      }
      setClaims((cur) => cur.filter((c) => c.id !== id));
      setMsg(decision === "approved" ? "Jóváhagyva — a kezelő-link e-mailben ment." : "Elutasítva.");
      router.refresh();
    } catch {
      setMsg("Hálózati hiba.");
    } finally {
      setBusy(null);
    }
  }

  if (claims.length === 0) {
    return (
      <div className="mt-6 rounded-card border border-dashed border-line bg-surface-alt px-4 py-8 text-center text-[13px] text-ink-muted">
        Nincs függőben lévő claim-igénylés.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {msg && (
        <div className="rounded-card border border-primary/30 bg-primary-soft/40 px-4 py-2.5 text-[12.5px] font-semibold text-primary">
          {msg}
        </div>
      )}
      {claims.map((c) => (
        <div key={c.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/szaknevsor/${c.businessId}`} target="_blank" className="text-[14.5px] font-extrabold text-ink hover:text-primary">
                {c.businessName ?? c.businessId}
              </Link>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                {c.claimantName ?? "—"} · <a href={`mailto:${c.claimantEmail}`} className="underline">{c.claimantEmail}</a>
                {c.claimantPhone ? ` · ${c.claimantPhone}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-ink-faint">{c.createdAt.slice(0, 10)}</span>
          </div>
          {c.message && <p className="mt-2 rounded-[10px] bg-surface-alt px-3 py-2 text-[12.5px] text-ink">{c.message}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => decide(c.id, "approved")}
              disabled={busy === c.id}
              className="flex-1 rounded-pill bg-success py-2.5 text-[13px] font-extrabold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy === c.id ? "…" : "Jóváhagyás"}
            </button>
            <button
              type="button"
              onClick={() => decide(c.id, "rejected")}
              disabled={busy === c.id}
              className="flex-1 rounded-pill border border-line bg-surface py-2.5 text-[13px] font-bold text-ink-muted transition active:scale-[0.98] disabled:opacity-60"
            >
              Elutasítás
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
