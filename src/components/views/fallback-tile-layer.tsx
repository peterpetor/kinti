"use client";

import { useRef, useState } from "react";
import { TileLayer } from "react-leaflet";

/**
 * FallbackTileLayer — a Leaflet alaptérkép-réteg automatikus tartalék-forrással.
 *
 * Az elsődleges forrás a CARTO (ingyenes CDN). Ha az kimarad/blokkol (sok csempe
 * nem tölt be), MÁS infrastruktúrára (Esri World Street Map, kulcs nélkül) váltunk,
 * hogy SOHA ne legyen „mindenki szürke" térkép. A tartalék csak BURST-hibára lép be
 * (sikeres betöltés nullázza a számlálót → átmeneti hálózati hiba nem vált).
 *
 * NEM helyettesíti a saját csempe-hostingot (PMTiles@R2) nagy skálán — ez olcsó
 * életbiztosítás a harmadik-fél-CDN kiesése ellen.
 */
const FALLBACK_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const FALLBACK_ATTR = '© <a href="https://www.esri.com/">Esri</a> · © OpenStreetMap';
const ERROR_THRESHOLD = 6;

interface Props {
  url: string;
  attribution?: string;
  subdomains?: string;
  maxZoom?: number;
}

export function FallbackTileLayer({ url, attribution, subdomains = "abc", maxZoom }: Props) {
  // FONTOS: a CARTO alap-URL `{s}` alrész-helyőrzőt tartalmaz, ezért a Leafletnek
  // KELL egy `subdomains` érték. Ha a hívó nem ad meg (undefined), az FELÜLÍRNÁ a
  // Leaflet beépített 'abc' alapértékét → `_getSubdomain` az undefined.length-en
  // elhasal (fehér „Hoppá" hiba-kártya). Ezért itt „abc"-re esik vissza.
  const [active, setActive] = useState<{ url: string; attribution?: string }>({ url, attribution });
  const errors = useRef(0);
  const switched = useRef(false);

  return (
    <TileLayer
      key={active.url}
      url={active.url}
      attribution={active.attribution}
      subdomains={subdomains}
      maxZoom={maxZoom}
      eventHandlers={{
        tileload: () => {
          // Sikeres betöltés → a forrás él, a számláló nullázódik (csak tartós
          // kimaradás — egymás utáni hibák betöltés nélkül — váltson).
          if (!switched.current) errors.current = 0;
        },
        tileerror: () => {
          if (switched.current) return;
          errors.current += 1;
          if (errors.current >= ERROR_THRESHOLD) {
            switched.current = true;
            setActive({ url: FALLBACK_URL, attribution: FALLBACK_ATTR });
          }
        },
      }}
    />
  );
}
