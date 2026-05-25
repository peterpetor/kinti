# Interaktív térkép (Leaflet + OpenStreetMap)

A `/szaknevsor` oldalon egy Liquid Glass szegmentált váltóval kapcsolható
**Lista ↔ Térkép** nézet. A térkép Leaflet-tel, ingyenes OpenStreetMap-csempékkel
megy — nincs API-kulcs, nincs külön havidíj.

## Mit kapunk

- [src/components/views/business-map.tsx](src/components/views/business-map.tsx) — kliens-komponens, `next/dynamic({ ssr: false })`-szel lazy-loadolva.
- Kinti-stílusú `divIcon` markerek (zöld könnycsepp, kiemelt vállalkozás piros + pulzáló halo).
- React-rendelt popup (név, kategória, csillag, cím, „Profil megnyitása” Next.js `<Link>`).
- Auto-`fitBounds` a látható markerekhez, **lokáció gomb**, zoom +/−.
- Reszponzív magasság: `h-[62dvh] sm:h-[68dvh]`.

## Telepítés

```bash
npm install   # új deps: leaflet, react-leaflet, @types/leaflet
```

## D1 migráció (lat/lng)

A 0000-es init nem tartalmazott valós koordinátákat (a régi `pin_x/pin_y` 0–100-as
százalék volt a prototípus mockupjához). Az új migráció hozzáadja a `lat`/`lng`
oszlopokat és index-eli:

```bash
npm run db:migrate:local
npm run db:seed:local

npm run db:migrate:remote
npm run db:seed:remote
```

A seed valós Zürichi Kreis 3/4/5 koordinátákkal töltődik fel (Birmensdorferstrasse,
Albisriederplatz, Bahnhofstrasse, Hardturmstrasse…). OpenStreetMap-en ellenőrizhető.

## Architektúra dióhéjban

```
/szaknevsor (server, edge)
  └─ ExploreView (client)
       ├─ SearchBar + CategoryPills (client)
       ├─ ViewSwitch  (Lista / Térkép)
       ├─ Lista nézet  → BusinessCard kártyák
       └─ Térkép nézet → next/dynamic(BusinessMap, { ssr: false })
                            └─ MapContainer
                               ├─ TileLayer (OSM)
                               ├─ Marker[] (kinti-pin divIcon)
                               │    └─ Popup (Next.js <Link>)
                               ├─ FitToMarkers (useMap → fitBounds)
                               └─ MapControls (locate / zoom)
```

## Miért divIcon és nem default Leaflet PNG?

A Leaflet alap marker-ikonok PNG-k, amiket webpack/Next.js nem talál meg a build
során (jól ismert „broken icon”-bug). Ha PNG-t használnánk, a Leaflet
`L.Icon.Default` URL-jeit manuálisan kéne újrahangolni a `next/image` `.src`
mintájával. A `divIcon` ezt megkerüli, ráadásul:

- a Tailwind tokenek (`rgb(var(--primary))`) téma-reaktívak — a meleg/modern
  paletta váltása a pinekre is automatikusan átfut,
- a kiemelt markerek külön CSS-osztályt (`--featured`) kapnak, és van rajtuk
  egy diszkrét pulzáló halo,
- a markert mobilon is nagyobb hit-targettel kezeli (36px).

A CSS a [src/app/globals.css](src/app/globals.css) `.kinti-pin` / `.kinti-pin--featured`
szekcióiban van — onnan lehet hangolni.

## Lokáció gomb

A „Saját helyem” gomb a böngésző `navigator.geolocation`-t hívja. Ha a felhasználó
engedélyezi, a térkép a tényleges pozícióra repül; ha nem, semmi nem történik
(silent failure). A koordinátát **nem küldjük el** semmilyen szervernek —
kizárólag a Leaflet `flyTo` paramétere. Tipikus jövőbeli bővítés:
GPS-alapú „közelben” sort a listához.

## Offline-on?

Az OSM csempék külső originról (`tile.openstreetmap.org`) jönnek, így a Kinti
Service Worker NEM cache-eli őket (a fetch-handlerünk az idegen origineket
átengedi). Offline-on tehát a térképi alap szürke marad, de a divIcon-pinek
és a popup-kártyák megjelennek — érdemi információt mutat akkor is, ha a
csempék épp nem érhetők el.

> Ha később mégis cache-elnénk a csempéket, az OSM Tile Usage Policy-t
> figyelembe kell venni (heavy caching tilos, attribution kötelező). Önálló
> tile-szerver / saját CDN (pl. MapTiler vagy Stadia Maps) jó kompromisszum
> lenne — még mindig ingyenes-szintű, de a saját origin-en cache-elhető.

## Telepítés ellenőrzése

```bash
npm install
npm run db:migrate:local && npm run db:seed:local
npm run dev
# Nyisd meg: http://localhost:3000/szaknevsor → klikk a „Térkép” chipre
```

A 7 Kinti vállalkozás pinjeinek meg kell jelenniük Zürich környékén; a kiemelt
három (Kovács Anna, Dr. Szabó, …) körül pulzáló piros halo.
