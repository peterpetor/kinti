# Kinti Platform — Teljes Audit Jelentés
*Készült: 2026. május 30.*
*Verzió: 1.0.0*

> [!NOTE]
> Ez az audit a **Kinti** projekt teljes kódállományának, biztonsági architektúrájának, adatbázis-sémájának, Edge-kompatibilitásának, PWA konfigurációjának és üzemeltetési lépéseinek mélyreható elemzése. A platform Cloudflare Pages + Next.js (Edge Runtime) + D1 SQL + R2 tárolási technológiákra épül.

---

## Elemzési Összegzés

| Kategória | Minősítés | Állapot / Leírás |
| :--- | :---: | :--- |
| **Biztonság és Adatvédelem** | 🟢 **Kiváló** | Parameterizált D1 lekérdezések (SQLi védelem), AI-alapú szöveg és kép moderáció, eldobható email szűrés, Turnstile és IP-alapú rate limit. |
| **Kódminőség és Architektúra** | 🟢 **Kiváló** | Tiszta TypeScript típusok, explicit mappelési logikák a DB és a tartományi modellek között, kiváló modularizáció a `src/lib`-ben. |
| **Adatbázis és Migrációk** | 🟡 **Jó** | 52 db migrációs fájl, helyes indexelések. Egyetlen kisebb észrevétel a számozási ütközések a migrációs fájloknál (pl. dupla `0044_` és `0042_`), ami nem okoz futási hibát, de orvosolható. |
| **PWA és Mobil Integráció** | 🟢 **Kiváló** | Teljesen szabványos webmanifest, maszkolható ikonok, TWA (Google Play Store) integrációs paraméterek konfigurálva. |
| **Teljesítmény és Build** | 🟡 **Jó** | A Next.js build sikeresen lefut és optimalizálódik, de 17 oldalon figyelmeztetést ad a `runtime = 'edge'` és a `dynamic = 'force-static'` együttes használata miatt. |

---

## 1. Biztonsági Audit (Security & Data Protection)

### 1.1 SQL Injection elleni védelem
A platform adatelérési rétege a `src/lib/repo.ts` fájlban helyezkedik el. Az összes SQL lekérdezés a Cloudflare D1 `.prepare()` metódusát és a `.bind(...binds)` paraméterezést használja.
* **Audit Eredmény**: **100%-ban biztonságos**. Nincsenek közvetlen string összefűzéses (string interpolation) SQL lekérdezések. Az SQL Injection támadási felület teljesen le van zárva.

### 1.2 Beviteli Validáció és Spam-védelem
Az adatfeladási API végpontok (események, vélemények, vállalkozás-beküldés) kiemelkedő biztonsági szűrőkkel rendelkeznek:
* **Honeypot és Form Validáció**: A `validateEventInput` és a vállalkozás-/vélemény-validátorok szigorúan ellenőrzik a típusokat, hosszakat és a mezőket.
* **Eldobható e-mailek szűrése**: Az `isDisposableEmail` modul kiszűri az ideiglenes (disposable) e-mail címeket, megakadályozva a spammerek gyors profilgenerálását.
* **Turnstile CAPTCHA**: Minden publikus POST kérésnél Turnstile ellenőrzés fut (`verifyTurnstile`), amely a robotok automatikus beküldéseit blokkolja.
* **IP és Email Rate Limit**: A `countRecentEventSubmits` és társai segítségével a rendszer napi pár feladásra korlátozza az azonos IP-ről vagy e-mailről indított kéréseket. Az IP-címeket SHA-256-tal hashelve tárolja (`hashIp`), ami megfelel a GDPR adatminimalizálási elvének (nem tárolunk nyers PII-t az adatbázisban).

### 1.3 AI és Képmoderáció
* **Szövegmoderáció**: A `moderateText` a Cloudflare Workers AI-t használja a feltöltött címek és leírások valós idejű moderációjához (profanity, rágalmazás, tiltott tartalmak szűrése).
* **Képmoderáció**: A `moderateImage` modul a feltöltött képeket elemzi (Workers AI segítségével). Ha a kép nem biztonságos, a rendszer automatikusan törli azt a Cloudflare R2 bucketből és hibaüzenetet ad vissza.

### 1.4 Hozzáférés-vezérlés (Access Control)
* **Middleware**: A `src/middleware.ts` fájlban a Clerk authentication middleware a védett oldalakat (`/profil`, `/feltoltes`, `/admin`) és az admin API-kat (`/api/admin/*`, `/api/owner/*`) biztonságosan védi.
* **Adminisztrációs jogosultságok**: A `src/lib/admin.ts` a bejelentkezett Clerk-felhasználó e-mailjeit egyezteti a környezeti változókban megadott `ADMIN_EMAILS` listával (`emails.some(e => allowed.includes(e))`). Minden adminisztrátori végpont és nézet szigorúan ellenőrzi ezt (`getAdminUserId`).

### 1.5 DSA & Notice & Takedown megfelelőség
A bejelentő végpont (`/api/report/route.ts`) lehetővé teszi a felhasználóknak a sértő vagy jogellenes tartalmak jelentését:
* A jelentett tartalom (vélemény, szakember, SOS) **azonnal elrejtésre kerül** a nyilvánosság elől (`hidden = 1`), miközben az adminisztrátor e-mailben kap egy egyedi `moderateToken`-t a végleges törléshez vagy visszaállításhoz. Ez teljes mértékben megfelel az európai Digital Services Act (DSA) és a svájci jogi szabályozásoknak.

---

## 2. Kódminőség és Architektúra Audit

### 2.1 TypeScript és Típusbiztonság
* A codebase szigorú TypeScript beállításokat használ. A D1 relációs adatbázis sorai (`interface BusinessRow`, `interface EventRow`) explicit mappelőkön (`toBusiness`, `toEvent`) keresztül alakulnak át az alkalmazásban használt tartományi típusokká.
* Ez biztosítja, hogy ha a DB séma megváltozik, a típusellenőrző azonnal jelzi a hibát a kód többi részében.

### 2.2 Edge Runtime Kompatibilitás
* A Next.js API-k és oldalak jelentős része explicit módon az `export const runtime = "edge"` beállítást használja.
* Mivel a Cloudflare Pages kizárólag Edge környezetben fut, ez a beállítás elengedhetetlen. A kód nem használ nem-edge kompatibilis Node.js API-kat (pl. `fs`, `child_process` a futási időben).

### 2.3 PWA és TWA megfelelőség
A `public/manifest.webmanifest` fájl tökéletesen konfigurált:
* Tartalmazza a `theme_color` (#1d4434) és `background_color` (#f4ede0) értékeket, a maszkolható (maskable) ikonokat, a gyorslinkeket (shortcuts: Szaknévsor, Közösség, Profilom).
* Megfelelően hivatkozik a Google Play Áruházban lévő Androidos Trusted Web Activity (TWA) csomagra (`app.kinti.android`), ezzel biztosítva a zökkenőmentes natív alkalmazásszerű élményt.

---

## 3. Adatbázis és Migrációk Audit

### 3.1 Migrációs sémák vizsgálata
A `db/migrations` mappában lévő 52 SQL migrációs fájl lefedi a platform teljes evolúcióját.
* Az indexelések és a relációs idegen kulcsok (foreign keys) helyesen vannak definiálva.
* Az `event_rsvps` tábla összetett elsődleges kulcsot használ (`PRIMARY KEY(event_id, ip_hash)`), ami garantálja, hogy egy felhasználó (IP alapján) csak egyszer jelentkezhet be egy eseményre, megvédve a számlálót a duplikációktól.

> [!WARNING]
> **Migrációs Fájlok Számozása**:
> Két esetben van névütközés az index-előtagokban:
> * `0042_ai_review_summary.sql` és `0042_kinti_radars.sql`
> * `0044_admin_moderation.sql` és `0044_business_license_number.sql`
> * `0045_blocklist.sql` és `0045_business_hidden.sql`
>
> Bár a Cloudflare Wrangler ábécérendben hajtja végre őket és nem okoz ütközést a telepítés során, a jövőbeli sémakezelés átláthatósága érdekében javasolt egyedi számozást alkalmazni (pl. a legközelebbi migráció legyen a `0047_...`).

---

## 4. Build és Teljesítmény Audit (Figyelmeztetések Feloldása)

Az `npm run build` során a Next.js a következő figyelmeztetéseket (warnings) dobja 17 oldallal kapcsolatban:

```text
⚠ Page "/allampolgarsag" is using runtime = 'edge' which is currently incompatible with dynamic = 'force-static'. Please remove either "runtime" or "force-static" for correct behavior
```

### 4.1 A hiba oka
Az érintett oldalakon egyszerre van beállítva a `runtime = 'edge'` és a `dynamic = 'force-static'`. A Next.js statikus oldalgenerátora az Edge futtatókörnyezetben nem tudja teljesen statikusan előre renderelni az oldalt build időben, ha az Edge specifikus környezeti változókra vagy bindingekre támaszkodik.

### 4.2 Javasolt Megoldás
Azokon a teljesen statikus tájékoztató oldalakon (pl. `/impresszum`, `/adatvedelem`, `/aszf`, `/allampolgarsag`, `/segitseg`), amelyek nem igényelnek adatbázis kapcsolatot vagy Cloudflare Edge bindingeket futásidőben:
1. **Távolítsd el** az `export const dynamic = "force-static"` sort, ha az Edge runtime szükséges.
2. VAGY **Távolítsd el** az `export const runtime = "edge"` sort, így a Next.js alapértelmezett Node statikus generátorával build időben lefut a teljes HTML exportálás, ami Cloudflare Pages-en rendkívül gyors statikus kiszolgálást eredményez.

---

## 5. Adatvédelmi és Üzemeltetési Audit (Operations & Maintenance)

Adatvédelmi és üzemeltetési szempontból a platform az alábbi háttérfolyamatokra támaszkodik:

* **Cron Purge Worker (`workers/cron-purge`)**:
  * Napi egyszer lefutó tisztító folyamat, amely kitörli a megerősítetlen, elavult vélemény-piszkozatokat és vállalkozás-beküldéseket a 24 órás TTL lejárta után, valamint a 30 napnál régebbi eseményeket. Ez biztosítja a **GDPR kompatibilitást** (adatminimalizálás) és megvédi a D1-et a szükségtelen méretnövekedéstől.
* **Esemény Szinkronizáló Worker (`workers/cron-events-sync`)**:
  * Svájci magyar szervezetek iCal (.ics) naptárjait szinkronizálja a D1 `events` táblájába, automatikusan kitakarítva az elavult szinkronizált rekordokat, anélkül, hogy érintené a manuálisan felvitt eseményeket.
* **Email Routing**:
  * Az `info@kinti.app` és `abuse@kinti.app` címek a Cloudflare Email Routing segítségével zökkenőmentesen továbbítódnanak a megadott adminisztrátori postafiókra, teljesítve a fogyasztóvédelmi és adatvédelmi elérhetőségi előírásokat.

---

## Összegző Javaslatok a Fejlesztéshez

1. **Migrációs Névütközések**: A jövőben kerülni kell az azonos sorszámú SQL fájlok létrehozását a `db/migrations` mappában.
2. **Build Figyelmeztetések Törlése**: A statikus leíró oldalakon érdemes letisztítani a felesleges `runtime` / `dynamic` konfigurációkat az optimalizáció érdekében.
3. **Logok és Monitorozás**: A `safeLogError` hibakezelő használata dicséretes, érdemes lehet egy Sentry vagy hasonló Edge-kompatibilis monitoring eszközt bekötni a kritikus tranzakciókhoz.
