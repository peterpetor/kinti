# PWA — manifest, ikonok, Service Worker, telepítés

## Mit kapunk?

- **Manifest** (`/manifest.webmanifest`) — telepíthető standalone app + 3 shortcut (Szaknévsor, Közösség, Profil).
- **Service Worker** (`/sw.js`) — custom, **edge-független** (a böngészőben fut), 4 cache-réteggel.
- **Offline fallback** (`/offline`) — statikusan prerenderelt, a SW az `install` lépésben becache-eli.
- **„Telepítés a kezdőképernyőre” gomb** — `beforeinstallprompt` (Chromium/Edge/Samsung) + külön iOS Safari tipp.
- **Frissítés-prompt** — Liquid Glass értesítés, ha új SW vár az aktiválásra.

## Ikon-generálás

A márkajel SVG forrásai a [public/icons/](public/icons/) alatt vannak:

- [public/icons/kinti.svg](public/icons/kinti.svg) — sima ikon (`purpose: "any"`, lekerekített sarkok)
- [public/icons/kinti-maskable.svg](public/icons/kinti-maskable.svg) — Android adaptive icon, a látható tartalom a középső 80%-ban

PNG méreteket a `sharp`-os szkript adja:

```bash
npm install            # sharp már devDependency
npm run gen:icons
```

A szkript a következő fájlokat írja a `public/icons/` alá: `icon-192.png`, `icon-256.png`, `icon-384.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180×180), `favicon-16.png`, `favicon-32.png`, plus a gyökérbe `favicon.ico`.

> Ha nem akarsz `sharp`-ot, bármilyen SVG→PNG eszközzel kirenderelheted ugyanezeket a méreteket (Figma export, Inkscape, `realfavicongenerator.net`). A szkriptben felsorolt méretek és nevek a fontosak.

## Service Worker stratégiák

| Útvonal | Stratégia | Cache neve |
|---|---|---|
| `/_next/static/*`, `/icons/*` | **cache-first** (immutable) | `kinti-v1-static` |
| `/api/media/*` | **cache-first** (R2 immutable URL) | `kinti-v1-media` |
| `/api/*` (egyéb) | **bypass** (mindig hálózat — D1/Clerk élő) | — |
| navigáció (HTML) | **network-first** → offline fallback | `kinti-v1-pages` |
| egyéb GET | **stale-while-revalidate** | `kinti-v1-runtime` |

A `VERSION` konstans növelésével az összes régi cache törlésre kerül az `activate` lépésben.

Az `install` lépésben előmelegített fájlok:
- `/offline` — offline fallback oldal (ha ez hiányzik, kapunk csak böngésző-default offline hibát)
- `/manifest.webmanifest`
- `/icons/kinti.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

## Frissítés-flow

1. Új deploy → következő látogatáskor a SW `updatefound`-ot tüzel.
2. Az új SW `installed` állapotban várakozik (`waiting`).
3. A [src/components/sw-register.tsx](src/components/sw-register.tsx) felismeri, megjelenít egy Liquid Glass értesítést: **„Új verzió érhető el — Frissítés / Később”**.
4. Klikk → `postMessage({ type: "SKIP_WAITING" })` → a SW aktiválódik → `controllerchange` → `location.reload()`.

Mellette óránként háttér-`update()` is fut, hogy a hosszan nyitva hagyott PWA se essen le.

## Telepítés-UI

A [src/components/install-prompt.tsx](src/components/install-prompt.tsx) három ágat kezel:

- **Chromium / Edge / Samsung** — elfogja a `beforeinstallprompt`-ot, és a gombra kattintásra `prompt()`-ot hív.
- **iOS Safari** — `beforeinstallprompt` ott nincs; helyette ikonos tipp: _„Megosztás → Hozzáadás a főképernyőhöz”_.
- **Már telepítve / standalone** — semmit nem mutat (`display-mode: standalone` vagy `navigator.standalone`).

Munkamenetre szóló elutasítás: `sessionStorage["kinti:install:dismissed"]`. Más munkamenetben újra megjelenik.

## Cloudflare Pages-specifikus tudnivalók

- A `public/sw.js` automatikusan a `/sw.js` útvonalra kerül — a Pages közvetlenül szolgálja, helyes MIME-mel.
- A `public/manifest.webmanifest`-et szintén közvetlenül szolgálja; nem kell külön Headers szabály.
- A **scope** `/` — a `sw.js` a gyökérben él, így mindenre rálát.

### Cache-control fejlécek

A Pages alapból cache-eli a `public/*`-ot, de a `/sw.js`-t **soha** ne cache-eljük hosszan, máskülönben a régi SW „beragad”. Adjunk egy `_headers` szabályt (Cloudflare Pages konvenció):

```
/sw.js
  Cache-Control: public, max-age=0, must-revalidate
  Service-Worker-Allowed: /

/manifest.webmanifest
  Cache-Control: public, max-age=300
  Content-Type: application/manifest+json
```

> A repo-ban a [public/_headers](public/_headers) fájlt is létrehozzuk (lásd alább); ha már létezik, csak egészítsd ki.

## Lokál teszt

```bash
# 1) ikonok generálása
npm install
npm run gen:icons

# 2) production build, valós SW-vel
npm run pages:build
npm run preview        # wrangler pages dev

# 3) Chrome DevTools → Application → Service Workers → ellenőrizd, hogy "activated"
#    DevTools → Network → Offline → próbálj navigálni → /offline jelenik meg
#    DevTools → Application → Manifest → "Installability" zöld
```

`next dev` alatt a SW **szándékosan nem regisztrálódik** (`process.env.NODE_ENV === "production"` check), mert a Next.js HMR és a SW gyorsítótár konfliktusban van.
