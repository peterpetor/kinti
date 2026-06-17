"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BusinessCard, Icon } from "@/components/ui";
import { haversineKm } from "@/lib/distance";
import type { Business } from "@/lib/types";

/**
 * „A közeledben" — a felhasználó GPS-helyéhez legközelebbi 3 vállalkozás, valódi
 * km-távolsággal. Helymeghatározás nélkül (vagy amíg az betölt) a kiemelt/első 3
 * jelenik meg km nélkül, így a szekció sosem üres. A teljes lista a szülőtől jön
 * (csak a koordinátával rendelkezők), a legközelebbieket kliensoldalon válogatjuk.
 */
export function NearbyBusinesses({ businesses }: { businesses: Business[] }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocating(false);
      return;
    }
    let done = false;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (done) return;
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => {
        if (!done) setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
    return () => {
      done = true;
    };
  }, []);

  const items = useMemo(() => {
    if (pos) {
      // Valódi legközelebbi 3, távolsággal.
      return businesses
        .map((b) => ({ b, dist: haversineKm(pos.lat, pos.lng, b.lat as number, b.lng as number) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);
    }
    // Fallback: kiemelt elöl, aztán a többi — km nélkül.
    return [...businesses]
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, 3)
      .map((b) => ({ b, dist: null as number | null }));
  }, [businesses, pos]);

  if (businesses.length === 0) {
    return (
      <Link
        href="/szaknevsor/uj"
        className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary">
          <Icon name="pin" size={17} strokeWidth={2.6} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-extrabold text-ink">Még nincs vállalkozás a térképen</span>
          <span className="block text-[11.5px] text-ink-muted">Légy te az első — vidd fel a vállalkozásod 30 mp alatt.</span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
      </Link>
    );
  }

  return (
    <div className="grid gap-2.5">
      {locating && !pos && (
        <p className="flex items-center gap-1.5 px-1 text-[11.5px] font-semibold text-ink-muted">
          <Icon name="pin" size={12} strokeWidth={2.4} className="animate-pulse text-primary" />
          Helymeghatározás a legközelebbiekhez…
        </p>
      )}
      {items.map(({ b, dist }) => (
        <BusinessCard key={b.id} business={b} href={`/szaknevsor/${b.id}`} distanceKm={dist} />
      ))}
    </div>
  );
}
