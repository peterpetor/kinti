import type { Business } from "@/lib/types";

export interface ClusterGroup {
  type: "cluster";
  id: string;
  lat: number;
  lng: number;
  count: number;
  itemIds: string[];
}

export interface SinglePoint {
  type: "single";
  business: Business;
}

export type MapPoint = ClusterGroup | SinglePoint;

/**
 * Greedy geo-klaszterezés — zoom-szinthez igazított sugárral, külső csomag nélkül.
 *
 * threshold = clusterPx × (360 / (256 × 2^zoom))
 * ahol 256 × 2^zoom = a Mercator-vetület pixelszélessége az adott zoom-szinten.
 *
 * Algoritmus: greedy scan — az első szabad pontból klasztert nyitunk, majd
 * felvesszük a `threshold` fokos sugarú körbe eső összes szabad pontot.
 */
export function clusterBusinesses(
  businesses: Business[],
  zoom: number,
  clusterPx = 56,
): MapPoint[] {
  const degPerPx = 360 / (256 * Math.pow(2, Math.round(zoom)));
  const threshold = clusterPx * degPerPx;

  const result: MapPoint[] = [];
  const used = new Set<string>();

  for (const b of businesses) {
    if (used.has(b.id)) continue;
    used.add(b.id);

    const near = businesses.filter(
      (o) =>
        !used.has(o.id) &&
        Math.abs((o.lat ?? 0) - (b.lat ?? 0)) < threshold &&
        Math.abs((o.lng ?? 0) - (b.lng ?? 0)) < threshold,
    );

    if (near.length === 0) {
      result.push({ type: "single", business: b });
    } else {
      near.forEach((x) => used.add(x.id));
      const all = [b, ...near];
      const lat = all.reduce((s, x) => s + (x.lat ?? 0), 0) / all.length;
      const lng = all.reduce((s, x) => s + (x.lng ?? 0), 0) / all.length;
      result.push({
        type: "cluster",
        id: `cl-${b.id}`,
        lat,
        lng,
        count: all.length,
        itemIds: all.map((x) => x.id),
      });
    }
  }

  return result;
}

/** Klaszter befoglaló téglalapja — Leaflet fitBounds / MapLibre fitBounds-hoz. */
export function clusterBounds(
  businesses: Business[],
  itemIds: string[],
): [[number, number], [number, number]] {
  const pts = businesses.filter((b) => itemIds.includes(b.id));
  const lats = pts.map((b) => b.lat!);
  const lngs = pts.map((b) => b.lng!);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

/** Klaszter méretosztálya (CSS modifier-hez). */
export function clusterSize(count: number): "sm" | "md" | "lg" {
  if (count >= 10) return "lg";
  if (count >= 5) return "md";
  return "sm";
}
