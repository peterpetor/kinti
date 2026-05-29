"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { removeMyPost } from "@/lib/my-posts";

export function SpontaneousManageActions({ token, id }: { token: string; id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Biztos törlöd ezt a spontán meetup-ot? Ez nem visszavonható.")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/spontaneous/manage/${token}`, { method: "DELETE" });
      if (!res.ok) {
        setErr("Nem sikerült törölni.");
        return;
      }
      removeMyPost("spontan", id);
      router.push("/kozosseg");
      router.refresh();
    } catch {
      setErr("Hálózati hiba.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-pill bg-accent py-3 text-[13.5px] font-extrabold text-white shadow-card active:scale-95 disabled:opacity-60"
      >
        <Icon name="close" size={13} strokeWidth={2.4} />
        {busy ? "Törlés…" : "Spontán meetup törlése"}
      </button>
      {err && <p className="text-[12px] font-bold text-accent">{err}</p>}
    </div>
  );
}
