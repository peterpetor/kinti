"use client";

import { useEffect, useState } from "react";

/**
 * useMyLocation — a felhasználó pozíciója [lat, lng], ha KORÁBBAN már
 * engedélyezte a helymeghatározást. NEM kér engedélyt magától (nem dob fel
 * promptot): csak akkor indul, ha a Permissions API szerint a jogosultság
 * már 'granted'. Így minden térképen automatikusan megjelenhet a saját
 * pozíció, anélkül hogy bárkit zaklatnánk a prompttal.
 *
 * `watchPosition`-nel frissül, ha a felhasználó mozog.
 */
export function useMyLocation(): [number, number] | null {
  const [pos, setPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let watchId: number | null = null;
    let cancelled = false;

    const start = () => {
      if (watchId !== null) return;
      watchId = navigator.geolocation.watchPosition(
        (p) => {
          if (!cancelled) setPos([p.coords.latitude, p.coords.longitude]);
        },
        () => {
          /* hiba esetén csendben kihagyjuk — a térkép enélkül is működik */
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      );
    };

    // Csak akkor indítunk, ha az engedély MÁR megvan (nem promptolunk).
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          if (status.state === "granted") start();
          // Ha a felhasználó később engedélyezi (pl. a locate gombbal), kapcsoljon be.
          status.onchange = () => {
            if (status.state === "granted") start();
          };
        })
        .catch(() => {
          /* Permissions API nem elérhető → kihagyjuk az auto-indítást */
        });
    }

    return () => {
      cancelled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return pos;
}
