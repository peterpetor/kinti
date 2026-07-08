# Kinti Szaknévsor — Scraping Elleni Védelem (megvalósítás)

Ez a dokumentum a `anti_scraping_strategy.md` stratégia **kódban megvalósított**
rétegeit írja le, és a **Cloudflare-vezérlőpulton** elvégzendő (kódból nem
megtehető) manuális lépéseket.

Vezérelv: **defense in depth** + a valódi értéket (telefonszám) leválasztani a
tömeges/HTML-válaszokból, úgy, hogy **az SEO ne sérüljön** (a cégoldalak
Google-indexeltek maradnak).

---

## 1. Kódban MEGVALÓSÍTVA ✅

### A. Telefonszám leválasztása (a legfontosabb réteg)
- A **bulk lista** (`/api/businesses/list`) és a `/api/businesses`,
  `/api/businesses/[id]` **NEM ad ki nyers telefonszámot**. A lista-vetület
  (`ListBusiness`) a `phone` helyett csak `hasPhone: boolean`-t tartalmaz.
- A cégoldal (`/szaknevsor/[id]`) **nem rendereli a számot a HTML-be**, és a
  **JSON-LD-ből is kimaradt a `telephone`** (különben strukturált adatból
  kiolvasható lenne).
- A számot a **`PhoneReveal`** gomb kéri le kattintásra a
  **`GET /api/businesses/[id]?contact=1`** végpontról, amely:
  - **rate-limitelt** (`biz-contact`: 40/óra/IP) → nincs tömeges szám-leszedés,
  - **elhomályosított** választ ad (`contact-obfuscate.ts`: megfordítás + Base64)
    → a nyers `+41 79 …` mintát regexszel fésülő botok nem találják meg,
  - a kliens dekódolja, majd rendes `tel:` linkké alakul (a hívás az analitikába
    és a vélemény-kérőbe is beszámít, mint eddig).

### B. Honeypot (mézesbödön) + IP-tiltólista (a MEGLÉVŐ blocklistra kötve)
- A szaknévsor oldalba beágyazott, **CSS-sel elrejtett** link
  (`/api/businesses/honeypot-trigger`). Valódi user sose kattint rá; a HTML-t
  linkről linkre fésülő scraper igen.
- A csapdába lépő **IP-hashe** a **közös `blocklist` táblába** kerül (ugyanaz,
  amit az admin ban-rendszer használ — **PII-mentes**, csak hash). A védett
  végpontok (`/list`, `/businesses`, `/[id]`) ezután **403**-at adnak neki.
  Így a honeypot-tiltások **megjelennek az admin felületen** (`/admin/blocklist`),
  és **1 kattintással feloldhatók** (a meglévő „ban feloldása" gomb).
- **TTL (biztonsági szelep):** a honeypot auto-tiltása **7 nap** múlva lejár
  (`expires_at`, 0122 migráció) — így egy megosztott IP (céges/CGNAT-proxy)
  mögötti valódi user nem ragad örökre 403-ban. A **kézi admin-tiltás VÉGLEGES**
  marad (`expires_at = NULL`); a honeypot újra-triggerelése csúszóablakként
  hosszabbít, de egy kézi permabant sose downgrade-el. A lejárt sorokat a napi
  cron (`send-lead-digests`) törli; a read-oldali szűrő addig is ignorálja őket.
- **SEO-védelem:** a jó keresőrobotok NEM eshetnek csapdába — (1) a `robots.txt`
  tiltja a teljes `/api/`-t (a jó bot le se kéri), (2) a honeypot-handler
  **User-Agent fehérlistája** (Googlebot, Bingbot, közösségi preview-botok…)
  soha nem tiltja őket.

### C. Anti-hammer rate-limit a bulk listán
- `/api/businesses/list`: `biz-list` (60/óra/IP). A böngésző-cache (120s) miatt
  valódi user ritkán üti; NAT-tűrő, de a bulk dump ismételt letöltését fékezi.

---

## 2. Cloudflare-VEZÉRLŐPULTON elvégzendő (kódból NEM megtehető) ⚙️

Ezeket a Cloudflare dashboardon kell beállítani (Pages/DNS zóna: `kinti.app`):

1. **Bot Fight Mode** (Security → Bots): bekapcsolni. Automatikusan kihívás elé
   állítja a gyanús UA-kat és ismert scraper-hálózatokat.
2. **Rate Limiting Rule** (Security → WAF → Rate limiting rules):
   - Ha egy IP `> 3` kérést küld `/api/businesses/list`-re **1 perc** alatt →
     **Block 1 órára** (vagy Managed Challenge). A kódbeli óra-limit ezt kiegészíti,
     de a perc-granularitást a WAF adja.
3. **Adatközponti IP-k tiltása/kihívása** (WAF Custom Rule): AS-alapú szabály
   (AWS, Google Cloud, Azure, DigitalOcean, Hetzner, OVH) → Managed Challenge.
   Valódi expat user szinte sosem böngészik adatközponti IP-ről.

> A WAF/Bot Fight kulcs-előnye: a fenti #2–#3 kódmódosítás nélkül, hálózati
> szinten szűr, mielőtt a kérés a Workerhez érne.

---

## 3. SZÁNDÉKOSAN HALASZTVA / megfontolandó ⏸️

- **Turnstile a `/api/businesses/list`-en (a stratégia B. pontja).** A bulk lista
  minden böngészéskor lekérdeződik → minden usernek Turnstile-tokent kellene
  szereznie a fő böngészés előtt (widget + token-életciklus + látencia a
  flagship funkción). **Ráadásul a telefonszám leválasztása után** a lista már
  csak nem-érzékeny adatot ad (név/kategória/cím/koordináta), ami az SSR-oldalon
  és a Google-indexben úgyis publikus → a Turnstile marginális haszonért kérne
  érezhető UX-árat. Ha mégis kell (pl. a nem-telefon adat tömeges átvétele ellen),
  **láthatatlan (managed) Turnstile**-ként érdemes, az SSR-oldalak érintése nélkül.
- **E-mail lazy-load/obfuscation.** A jelenlegi kör a telefonra fókuszál (a doc
  konkrét lépései is). A cégoldal Email-gombja `mailto:`-t használ (a cím a
  HTML-ben van). Ha kell, a telefonnal azonos reveal-minta ráhúzható.

---

## Érintett fájlok (kód)

| Réteg | Fájl |
| :-- | :-- |
| Obfuscation (pure) | `src/lib/contact-obfuscate.ts` |
| Blocklist (közös) + TTL | `src/lib/repo-spam.ts` (`isBlocked`/`addToBlocklist` ttlDays/`purgeExpiredBlocklist`; `0122` migráció) |
| Blocklist admin UI | `src/app/admin/blocklist/page.tsx` (lista + 1-kattintásos feloldás + lejárat) |
| Reveal komponens | `src/components/business-analytics-tracker.tsx` (`PhoneReveal`) |
| Kontakt + strip | `src/app/api/businesses/[id]/route.ts` |
| Bulk lista védelem | `src/app/api/businesses/list/route.ts`, `.../businesses/route.ts` |
| Honeypot | `src/app/api/businesses/honeypot-trigger/route.ts` + rejtett link az `explore-view`-ban |
| Vetület (`hasPhone`) | `src/lib/types.ts`, `src/lib/repo-business.ts`, `src/lib/address.ts` |
| Rate-limit bucketek | `src/lib/ai.ts` (`biz-list`, `biz-contact`) |
