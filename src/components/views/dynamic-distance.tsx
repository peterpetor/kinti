"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui";

interface DynamicDistanceProps {
  lat: number | null;
  lng: number | null;
  address: string | null;
}

/** Haversine formula két GPS koordináta távolságának kiszámítására méterben */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Föld sugara méterben
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/** Városnév kinyerése a svájci címből (pl. "Birmensdorferstrasse 142, 8003 Zürich" -> "Zürich") */
function getCityFromAddress(address: string | null): string {
  if (!address) return "Svájc";
  const parts = address.split(",");
  const lastPart = parts[parts.length - 1].trim();
  const match = lastPart.match(/\d{4}\s+(.+)/);
  return match ? match[1].trim() : lastPart;
}

export function DynamicDistance({ lat, lng, address }: DynamicDistanceProps) {
  const city = getCityFromAddress(address);
  const [distanceText, setDistanceText] = useState<string>(city);
  const [subText, setSubText] = useState<string>("Helyi vállalkozás");
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    if (!lat || !lng || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const meters = calculateDistance(userLat, userLng, lat, lng);

        setHasLocation(true);
        if (meters < 1000) {
          const mins = Math.max(1, Math.round(meters / 80)); // gyalog: ~80m/perc
          setDistanceText(`${mins} perc`);
          setSubText(`${Math.round(meters)} m`);
        } else {
          const kms = (meters / 1000).toFixed(1);
          const mins = Math.max(1, Math.round(meters / 833)); // autó: ~50km/h = 833m/perc
          setDistanceText(`${mins} perc autóval`);
          setSubText(`${kms} km (${city})`);
        }
      },
      () => {
        // Helymeghatározás elutasítva vagy hiba -> marad a város név
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, [lat, lng, city]);

  return (
    <div>
      <div className="text-[15px] font-bold text-ink flex items-center gap-1">
        {hasLocation && <Icon name="nav" size={13} strokeWidth={2.2} className="text-primary" />}
        {distanceText}
      </div>
      <div className="text-[11px] font-medium text-ink-muted">{subText}</div>
    </div>
  );
}
