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
 * Azonos koordinátán álló vállalkozások szétpöckölése egy kis körre, hogy
 * nagyításkor KÜLÖN-KÜLÖN láthatók / kattinthatók legyenek (ne ragadjanak egy
 * klaszterbe, amit a fitBounds egy pontra nem tud szétnyitni).
 *
 * Pl. az osztrák seed több szervezetet UGYANARRA a város-koordinátára geokódolt
 * → 23 db egy ponton Bécsben, 4 Innsbruckban. A pötty determinisztikus (index a
 * csoportban), így stabil renderek közt. A CH (valós geokód) jellemzően egyedi
 * koordinátájú → csoportméret 1 → érintetlen.
 */
export function spreadColocated(businesses: Business[]): Business[] {
  const groups = new Map<string, Business[]>();
  for (const b of businesses) {
    if (b.lat == null || b.lng == null) continue;
    const key = `${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;
    let g = groups.get(key);
    if (!g) { g = []; groups.set(key, g); }
    g.push(b);
  }
  // Arany szög (phyllotaxis) — a napraforgó-spirál egyenletes pont-eloszlása.
  const GOLDEN = 2.399963229728653;
  return businesses.map((b) => {
    if (b.lat == null || b.lng == null) return b;
    const key = `${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;
    const g = groups.get(key)!;
    if (g.length <= 1) return b;
    const idx = g.indexOf(b);
    // MINDEN azonos város-koordinátán álló csoportot napraforgó-SPIRÁLBA szórunk
    // (r = step·√idx, szög = idx·aranyszög): egyenletes, KOMPAKT eloszlás a
    // városközpont körül (pl. 60 szervezet ~155 m-en belül marad → nem lóg
    // messzire vízbe), és NAGY zoomon külön, kattintható pinek (saját ikonnal).
    // Alacsony zoomon a clusterBusinesses úgyis EGY buborékba vonja őket — így
    // most már KIBONTHATÓ a klaszter (a kattintás rázoomol a spirálra).
    const stepM = 20;
    const r = idx === 0 ? 0 : stepM * Math.sqrt(idx);
    const angle = idx * GOLDEN;
    const dLat = (r / 111320) * Math.cos(angle);
    const dLng = (r / (111320 * Math.cos((b.lat * Math.PI) / 180))) * Math.sin(angle);
    return { ...b, lat: b.lat + dLat, lng: b.lng + dLng };
  });
}

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
