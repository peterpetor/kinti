/**
 * map-config.ts — térkép-engine + csempe-forrás konfiguráció.
 *
 * ELŐKÉSZÍTVE, de ALAPÉRTELMEZETTEN KIKAPCSOLVA. Amíg a `NEXT_PUBLIC_*` flageket
 * nem állítod be, MINDEN a régiben marad: Leaflet engine + CARTO csempe (a
 * FallbackTileLayer Esri-tartalékkal). A self-hosted PMTiles@R2 + MapLibre út
 * AKTIVÁLÁSÁHOZ lásd: scripts/pmtiles-runbook.md.
 *
 * Aktiváló flagek (Cloudflare Pages → Production env, majd újra-deploy):
 *   NEXT_PUBLIC_MAP_ENGINE = "maplibre"        → a fő térkép (business-map) MapLibre-re vált
 *   NEXT_PUBLIC_PMTILES_URL = "https://tiles.kinti.app/eu.pmtiles"  → a self-hosted PMTiles
 *   NEXT_PUBLIC_MAP_STYLE_URL = "https://tiles.kinti.app/style.json" → a PMTiles-re mutató stílus
 */
export type MapEngine = "leaflet" | "maplibre";

/** A fő térkép-engine.
 *  AKTIVÁLVA (2026-06-30): a MapLibre az ALAPÉRTELMEZETT (vektor-look). A csempe
 *  egyelőre OpenFreeMap (a self-hosted PMTiles@R2 a következő lépés — lásd runbook).
 *  Vissza Leafletre: `NEXT_PUBLIC_MAP_ENGINE="leaflet"`, vagy e sor visszaállítása. */
export function mapEngine(): MapEngine {
  return process.env.NEXT_PUBLIC_MAP_ENGINE === "leaflet" ? "leaflet" : "maplibre";
}

/** A self-hosted PMTiles fájl publikus URL-je (R2 / custom domain). Üres = inaktív. */
export function pmtilesUrl(): string {
  return process.env.NEXT_PUBLIC_PMTILES_URL ?? "";
}

/** A self-hosted MapLibre stílus-JSON URL-je (a `pmtiles://` forrásra mutat).
 *  Üres = marad a beépített MapTiler/OpenFreeMap stílus (azaz NEM self-hosted). */
export function mapStyleUrl(): string {
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "";
}
