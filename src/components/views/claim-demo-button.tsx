"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/**
 * ClaimDemoButton — a védett /api/owner/claim-et hívja, majd frissíti az
 * oldalt (router.refresh), így a /profil már a most birtokolt vállalkozás
 * valós D1-statisztikáit mutatja. Demonstrálja a Clerk user_id ↔ D1 kötést.
 */
export function ClaimDemoButton({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        data.error === "already_claimed"
          ? "Ezt a demó vállalkozást már igényelték."
          : "Hiba történt, próbáld újra.",
      );
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={claim} disabled={loading} fullWidth>
        {loading ? "Folyamatban…" : "Demó vállalkozás igénylése"}
      </Button>
      {error && <p className="text-center text-xs font-medium text-accent">{error}</p>}
    </div>
  );
}
