"use client";

import { useState } from "react";

/**
 * Új ban-bejegyzés feladása (admin-only). POST-ol az /api/admin/blocklist-re.
 * Sikeres válasz után újratölti az oldalt.
 */
export function BlocklistForm() {
  const [kind, setKind] = useState<"ip_hash" | "email_hash">("ip_hash");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Adj meg egy IP-címet vagy email-címet.");
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, string> = { kind };
      // Ha 64 karakteres hex → valószínűleg már hash, közvetlen érték
      if (/^[a-f0-9]{64}$/i.test(trimmed)) {
        body.valueHash = trimmed.toLowerCase();
      } else if (kind === "ip_hash") {
        body.ip = trimmed;
      } else {
        body.email = trimmed;
      }
      if (reason.trim()) body.reason = reason.trim();

      const res = await fetch("/api/admin/blocklist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (typeof window !== "undefined") window.location.reload();
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || "Nem sikerült menteni.");
        setBusy(false);
      }
    } catch {
      setError("Hálózati hiba.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3"
    >
      <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
        Új tiltás felvétele
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as "ip_hash" | "email_hash")}
          className="rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[12.5px] font-bold text-ink"
        >
          <option value="ip_hash">IP-cím</option>
          <option value="email_hash">Email-cím</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            kind === "ip_hash"
              ? "1.2.3.4 vagy SHA-256 hash"
              : "spam@example.com vagy SHA-256 hash"
          }
          className="min-w-[180px] flex-1 rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[12.5px] text-ink"
        />
      </div>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Indok (opcionális, csak admin látja)"
        maxLength={200}
        className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[12.5px] text-ink"
      />
      {error && <p className="text-[11.5px] font-bold text-accent">{error}</p>}
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-[12.5px] font-extrabold text-white shadow-card active:scale-95 disabled:opacity-50"
      >
        🚫 {busy ? "Mentés…" : "Hozzáadás a tiltólistához"}
      </button>
      <p className="text-[10.5px] text-ink-faint">
        Az IP-t és emailt a szerver SHA-256-tal hash-eli mentés előtt. Az IPv6
        címeket /64 prefix-re normalizáljuk (egy ISP-blokk = egy ban).
      </p>
    </form>
  );
}
