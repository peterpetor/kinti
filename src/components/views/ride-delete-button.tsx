"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";

/** Saját fuvar törlése (csak a feladónak jelenik meg). */
export function RideDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!window.confirm("Biztosan törlöd ezt a fuvart? Ez végleges.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/rides/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1 text-[11.5px] font-bold text-ink-faint transition-colors hover:text-accent disabled:opacity-50"
    >
      <Icon name="close" size={12} strokeWidth={2.4} /> {busy ? "Törlés…" : "Törlés"}
    </button>
  );
}
