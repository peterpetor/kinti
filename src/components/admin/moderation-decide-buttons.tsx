"use client";

import { useState } from "react";
import type { ModerationTable } from "@/lib/repo";

/**
 * Approve / Reject gomb az admin moderation queue-ra. POST-ol az
 * /api/admin/moderation/decide-re, sikeres válasz után újratölti a page-et.
 *
 * "Ban IP" / "Ban email" checkbox-okkal: ha a Reject pillanatában aktívak,
 * az adott IP-hash és/vagy email-cím automatikusan a tiltólistára kerül.
 *
 * `askRejectReason` (történeteknél): elutasítás előtt indok-mező nyílik —
 * az indokot a szerző emailben megkapja (DSA Art. 17 indokolás-közlés),
 * ha a beküldéskor megadta a címét. Üresen hagyható → általános indok megy.
 */
export function ModerationDecideButtons({
  table,
  id,
  current,
  submitterIpHash,
  submitterEmail,
  askRejectReason = false,
}: {
  table: ModerationTable;
  id: string;
  /** 0=pending, 1=approved, 2=rejected — az aktuális állapot. */
  current: number;
  submitterIpHash: string | null;
  submitterEmail: string | null;
  askRejectReason?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [banIp, setBanIp] = useState(false);
  const [banEmail, setBanEmail] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function decide(decision: "approved" | "rejected") {
    // Történet-elutasításnál előbb az indok-mező nyílik (egyszeri kapu).
    if (decision === "rejected" && askRejectReason && !reasonOpen) {
      setReasonOpen(true);
      return;
    }
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { table, id, decision };
      if (decision === "rejected") {
        if (banIp && submitterIpHash) payload.banIpHash = submitterIpHash;
        if (banEmail && submitterEmail) payload.banEmail = submitterEmail;
        if (askRejectReason && reason.trim()) payload.reason = reason.trim();
      }
      const res = await fetch("/api/admin/moderation/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (typeof window !== "undefined") window.location.reload();
      } else {
        alert("Nem sikerült a döntés mentése.");
        setBusy(false);
      }
    } catch {
      alert("Hálózati hiba.");
      setBusy(false);
    }
  }

  const canBanIp = !!submitterIpHash;
  const canBanEmail = !!submitterEmail;
  const anyBanChecked = banIp || banEmail;

  return (
    <div className="flex flex-col items-end gap-1.5">
      {/* Ban checkbox-ok: csak akkor látszanak, ha van mit ban-olni
          ÉS a tétel még nem rejected. */}
      {current !== 2 && (canBanIp || canBanEmail) && (
        <div className="flex flex-wrap items-center justify-end gap-2 text-[11.5px] text-ink-muted">
          {canBanIp && (
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={banIp}
                onChange={(e) => setBanIp(e.target.checked)}
                disabled={busy}
                className="h-3 w-3 accent-accent"
              />
              <span>+ Ban IP</span>
            </label>
          )}
          {canBanEmail && (
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={banEmail}
                onChange={(e) => setBanEmail(e.target.checked)}
                disabled={busy}
                className="h-3 w-3 accent-accent"
              />
              <span>+ Ban email</span>
            </label>
          )}
        </div>
      )}

      {/* Elutasítás-indok (DSA Art. 17): a szerző emailben kapja, ha adott címet. */}
      {reasonOpen && current !== 2 && (
        <div className="w-full max-w-xs space-y-1">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Elutasítás indoka (a szerző emailben megkapja) — üresen hagyva általános indok megy"
            className="w-full rounded-[10px] border border-line bg-surface-alt px-2.5 py-1.5 text-[11.5px] text-ink"
          />
        </div>
      )}

      <div className="flex gap-1.5">
        {current !== 1 && (
          <button
            type="button"
            onClick={() => decide("approved")}
            disabled={busy}
            className="rounded-pill bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-card active:scale-95 disabled:opacity-50"
          >
            ✅ Jóváhagy
          </button>
        )}
        {current !== 2 && (
          <button
            type="button"
            onClick={() => decide("rejected")}
            disabled={busy}
            title={
              anyBanChecked
                ? "Elutasítás + a beküldő tiltólistára kerül"
                : "Elutasítás"
            }
            className="rounded-pill bg-accent px-3 py-1 text-[11px] font-bold text-white shadow-card active:scale-95 disabled:opacity-50"
          >
            {reasonOpen ? "❌ Elutasítás küldése" : anyBanChecked ? "🚫 Elutasít + Ban" : "❌ Elutasít"}
          </button>
        )}
      </div>
    </div>
  );
}
