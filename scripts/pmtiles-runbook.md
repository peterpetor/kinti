# PMTiles @ R2 — saját térkép-csempe aktiválási runbook

**Állapot: ELŐKÉSZÍTVE, KIKAPCSOLVA.** A kód kész, de amíg az alábbi flageket nem
állítod be, MINDEN a régiben marad (Leaflet + CARTO + Esri-fallback). Ez a doksi
írja le, hogyan kapcsold be a saját, ingyenes (R2-egress-mentes) csempe-kiszolgálást.

A bekapcsolás 3 dolog: (1) PMTiles-fájl build + R2-feltöltés, (2) stílus+assetek
R2-re, (3) a `NEXT_PUBLIC_*` flagek beállítása + újra-deploy.

---

## 1. PMTiles-kivágat build (Közép-Európa: CH/AT/DE/NL + HU)

A `pmtiles` CLI a Protomaps napi planet-buildjéből egy bounding-boxot vág ki
(range-kérésekkel — NEM tölti le az egész planetet):

```bash
# pmtiles CLI: https://github.com/protomaps/go-pmtiles/releases  (egy binary)
pmtiles extract https://build.protomaps.com/<YYYYMMDD>.pmtiles kinti-eu.pmtiles \
  --bbox=2.5,45.5,17.5,55.5 --maxzoom=14
```
- A bbox a 4 ország + HU környékét fedi; finomítható.
- `--maxzoom=14` utcaszintig elég (kisebb fájl); a vektor-stílus interpolálja feljebb.
- Eredmény jellemzően pár GB.

(Alternatíva teljes kontrollra: `planetiler` egy Geofabrik DACH+NL+HU OSM-kivonatból.)

## 2. Feltöltés R2-re

```bash
npx wrangler r2 object put kinti-media/maps/kinti-eu.pmtiles --file=kinti-eu.pmtiles
```
- Az R2-nek **nincs egress-díja** → a kiszolgálás ingyenes, akármennyi a DAU.
- Tegyél elé **custom domaint** (pl. `tiles.kinti.app`) vagy egy kis Workert
  `Cache-Control: public, max-age=31536000, immutable` + CORS fejléccel — így a
  Cloudflare-edge cache-eli a range-darabkákat (az R2-t is alig olvassa).

## 3. Stílus + glyph + sprite (mind statikus, R2-re)

- **Stílus-JSON:** a Protomaps `basemaps` ingyenes (MIT) stílusából, a forrást a
  saját PMTiles-re állítva: `"url": "pmtiles://https://tiles.kinti.app/maps/kinti-eu.pmtiles"`.
  Generálható a `protomaps-themes-base` csomaggal, vagy kézzel. Töltsd R2-re:
  `wrangler r2 object put kinti-media/maps/style.json --file=style.json`
- **Glyph (betűk) + sprite (ikonok):** ingyenes, statikus készletek (OpenMapTiles
  fonts / Protomaps assets) → szintén R2-re, és a style.json `glyphs`/`sprite`
  mezője ezekre mutasson.
- **Attribúció (kötelező):** „© OpenStreetMap, © Protomaps" a térkép sarkában.

## 4. Flagek bekapcsolása (Cloudflare Pages → Production env), majd ÚJRA-deploy

```
NEXT_PUBLIC_MAP_ENGINE   = maplibre
NEXT_PUBLIC_PMTILES_URL  = https://tiles.kinti.app/maps/kinti-eu.pmtiles
NEXT_PUBLIC_MAP_STYLE_URL= https://tiles.kinti.app/maps/style.json
```
- A `NEXT_PUBLIC_*` build-időbe ég → **kell utána egy újra-deploy**.
- Ezután a fő térkép (szaknévsor / `business-map`) **MapLibre + saját PMTiles**-re vált.
- Visszakapcsolás: töröld a flageket + deploy → vissza Leaflet+CARTO.

## 5. Hátralévő migráció (a fő térkép után, opcionális)

A többi 5 Leaflet-nézet (kanton-buborék, események, magyar bolt, akciók,
location-picker) **továbbra is Leaflet+CARTO+Esri-fallback** marad — ezek kisebb
forgalmúak, és a fallback megvédi őket. Amikor mind a 6-ot MapLibre-re vinnéd:
- minden nézet markerei/popupjai/klaszterei MapLibre-re átírva (a `business-map`
  MapLibre-engine a minta), majd a Leaflet (`react-leaflet`, `leaflet`,
  `leaflet.markercluster`) **kivezethető a package.json-ból**.
- Ezt érdemes AKKOR, amikor a PMTiles már él, hogy a tényleges csempékkel tesztelhető.

## Ellenőrző lista aktiváláskor
- [ ] `kinti-eu.pmtiles` fent az R2-n, custom domainnel + cache-headerrel
- [ ] `style.json` + glyph + sprite fent, a style a PMTiles-re mutat
- [ ] 3 `NEXT_PUBLIC_*` flag beállítva + újra-deploy
- [ ] `?engine=maplibre` nélkül is MapLibre jön a szaknévsor-térképen
- [ ] attribúció látszik
- [ ] kapcsold ki a netet a böngészőben 1 betöltés után → a PMTiles-darabok cache-ből jönnek (opcionális)
