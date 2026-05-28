"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * ReviewResponseForm — a vállalkozó válasza egy véleményre (Google-stílusú).
 * Ha van existing response → szerkesztő / törlő. Ha nincs → új válasz írása.
 */
export function ReviewResponseForm({
  reviewId,
  existing,
}: {
  reviewId: string;
  existing: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(existing));
  const [text, setText] = useState(existing ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/owner/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response: text.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Hiba a mentésnél.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setErr("Hálózati hiba. Próbáld újra.");
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Biztosan törlöd a választ?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/owner/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response: "" }),
      });
      if (res.ok) {
        setText("");
        setOpen(false);
        router.refresh();
      } else {
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"
      >
        <Icon name="send" size={12} strokeWidth={2.4} /> Válasz írása
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-[12px] border border-line bg-surface-alt p-2.5 space-y-2">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
        A vállalkozó válasza
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Köszönöm a véleményt…"
        rows={3}
        maxLength={600}
        className="w-full resize-none rounded-[10px] border border-line bg-surface px-2.5 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="flex justify-between text-[10.5px] text-ink-faint">
        <span>Max 600 karakter</span>
        <span>{text.length} / 600</span>
      </div>
      {err && <p className="text-[11.5px] font-semibold text-accent">{err}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy || text.trim().length === 0}
          className={cn(
            "inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-[12px] font-bold text-white active:scale-[0.97]",
            (busy || text.trim().length === 0) && "cursor-not-allowed opacity-50",
          )}
        >
          {busy ? "…" : existing ? "Frissítés" : "Közzététel"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink-muted active:scale-[0.97]"
          >
            Válasz törlése
          </button>
        )}
        {!existing && (
          <button
            type="button"
            onClick={() => { setOpen(false); setText(""); }}
            className="text-[11.5px] font-semibold text-ink-faint"
          >
            Mégse
          </button>
        )}
      </div>
    </div>
  );
}
