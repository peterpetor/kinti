"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/** localStorage kulcs — a feladás után írjuk be a saját fuvar(jaink)at. */
const STORAGE_KEY = "kinti.myRides";

interface MyRideEntry {
  id: string;
  manageToken: string;
}

/**
 * MyRideActions — Módosítás + Törlés gombok a RideCard alján.
 * CSAK akkor jelenik meg, ha a böngésző localStorage-jában szerepel a fuvar id-je
 * a feladáskor mentett `manage_token` mellett.
 *
 * Privátabb: a manage_token NEM mehet ki publikus HTML-be, a kliens csak a saját
 * tokenét ismeri (a fuvar feladásakor mentette le).
 */
export function MyRideActions({ rideId }: { rideId: string }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list: MyRideEntry[] = raw ? JSON.parse(raw) : [];
      const found = list.find((r) => r.id === rideId);
      if (found?.manageToken) setToken(found.manageToken);
    } catch {
      /* localStorage hibák némán nyeljük */
    }
  }, [rideId]);

  if (!token) return null;

  async function onDelete() {
    if (!confirm("Biztosan törlöd a fuvart? Ez nem visszavonható.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ride/manage/${token}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Törlés sikertelen — próbáld a Módosítás oldalon.");
        setDeleting(false);
        return;
      }
      // Töröljük az entry-t a localStorage-ból is
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const list: MyRideEntry[] = raw ? JSON.parse(raw) : [];
        const next = list.filter((r) => r.id !== rideId);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      router.refresh();
    } catch {
      alert("Hálózati hiba a törlés közben.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-2 border-t border-line/30 pt-3">
      <Link
        href={`/telekocsi-kezeles/${token}`}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink active:scale-[0.98] transition"
      >
        <Icon name="sliders" size={12} strokeWidth={2.4} /> Módosítás
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-pill border border-accent/40 bg-accent/10 px-3 py-2 text-[12px] font-bold text-accent active:scale-[0.98] transition hover:bg-accent hover:text-white",
          deleting && "cursor-not-allowed opacity-60",
        )}
      >
        🗑 {deleting ? "Törlés…" : "Törlés"}
      </button>
    </div>
  );
}

// --- helper a RideForm-nak: feladás után meghívni --------------------------
export function rememberMyRide(id: string, manageToken: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: MyRideEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((r) => r.id !== id);
    filtered.push({ id, manageToken });
    // Csak az utolsó 20-at tartjuk (lejárt fuvarok cleanup-ját nem mi csináljuk)
    const trimmed = filtered.slice(-20);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}
