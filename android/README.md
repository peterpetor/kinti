# kinti — Android-app (TWA) a Google Play-hez

Az Android-app egy **Trusted Web Activity (TWA)**: a Play-ből telepített app a
https://kinti.app -ot jeleníti meg teljes képernyőn (címsor nélkül), natív
app-ként. A konfiguráció a repo gyökerében lévő `twa-manifest.json`.

**Fizetés az appban:** a Google Play szabályzata szerint az appban digitális
termék KIZÁRÓLAG a Play fizetési rendszerén át árulható. Ezért:
- az app `/?source=twa`-val indul → a web a `data-android-app` kontextusba vált
  (lásd `src/lib/android-app.ts`): a Paddle-checkout és MINDEN Paddle-szöveg
  eltűnik, helyette Google Play-szövegek és Play Billing-vásárlás fut;
- a vásárlás-ellenőrzés a szerveren: `/api/payments/play/verify`;
- megújulás/lemondás szinkron: `/api/webhooks/play` (RTDN).

---

## 1. Az app megépítése (Bubblewrap)

Előfeltétel: Node.js. A Bubblewrap magától letölti a JDK-t és az Android SDK-t.

```powershell
# EBBEN a mappában (android/ — itt van a twa-manifest.json), NE a repo gyökerében!
# (A gyökérben futtatva a generált app/ mappa kiütné a Next.js src/app routerét,
#  és az egész weboldal eltűnne a buildből.)
# PowerShellben KÜLÖN sorban add ki (a && ott nem működik):
cd android
npx @bubblewrap/cli build
```

Első futáskor a Bubblewrap:
- felajánlja a JDK/SDK letöltését → igen;
- aláíró kulcsot (`android.keystore`) generál → **a jelszavakat írd fel** (és a
  kulcsfájlt MENTSD biztonságos helyre — enélkül nem tudsz frissítést kiadni)!
- kimenet: `app-release-bundle.aab` (ezt kell a Play-be feltölteni) +
  `app-release-signed.apk` (helyi tesztre).

⚠️ A keystore SOHA ne kerüljön a gitbe (a .gitignore védi).

Verzió-emelés későbbi kiadásnál: a `twa-manifest.json`-ban `appVersionCode` +1
(és `appVersionName`), majd újra `npx @bubblewrap/cli build`.

### ⚠️⚠️ FRISSÍTÉSKOR A `npm run twa:update`-et HASZNÁLD, NE a nyers `update`-et

```powershell
# a repo GYÖKERÉBŐL:
npm run twa:update
# majd:
cd android
npx @bubblewrap/cli@1.25.0 build
```

Két dolgot csinál egyszerre, és mindkettő KELL:

1. **`bubblewrap update`** — csak ez tölti le újra az ikonokat a
   `twa-manifest.json`-ban megadott URL-ekről. A puszta `build` NEM tölt újra:
   a régi, legenerált erőforrásokat fordítja le. (2026-08-07-i valós hiba: a
   javított ikon két kiadáson át nem jutott ki emiatt.)
2. **`scripts/twa-splash-atlatszo.mjs`** — a natív TWA-betöltőképet átlátszóra
   cseréli. A Bubblewrap minden `update`-nél újragenerálja a `splash.png`-ket az
   ikonból, és a natív splash a STATIKUS logót mutatná az app SAJÁT, animált
   (pulzáló) betöltő-jelzője helyett. Átlátszó splash-sel csak a háttérszín
   látszik, ami megegyezik az app hátterével — a váltás észrevehetetlen.
   ⚠️ Mérve: az első festés melegen ~312 ms, hidegen ~850 ms, tehát a natív
   splash nem hiányzik.

⚠️ Az `android/` mappa gitignore-olt (a `README.md` és a `twa-manifest.json`
kivételével), ezért a generált fájlokba tett javítás NEM kommitolható —
minden `update` felülírja. A tudást csak ez a szkript és ez a leírás őrzi.

## 2. Play Console — app létrehozása

1. https://play.google.com/console → Create app → név: **kinti**, nyelv: magyar,
   típus: App, ingyenes.
2. **Release → Production → Create release** → töltsd fel az `.aab`-t.
   (Első feltöltéskor a Play App Signing-et fogadd el.)
3. Töltsd ki a kötelező adatlapokat (adatvédelmi nyilatkozat URL:
   `https://kinti.app/adatvedelem`, kategória, tartalmi besorolás, adatbiztonsági
   űrlap — fizetési adatot az app nem gyűjt, azt a Google Play kezeli).

## 3. Domain-összekötés (assetlinks) — enélkül címsor látszik!

A `public/.well-known/assetlinks.json`-ban KÉT ujjlenyomatot kell kitölteni:

1. **Feltöltő kulcs** (a helyi keystore-é):
   ```bash
   keytool -list -v -keystore android.keystore -alias android | grep SHA256
   ```
2. **Play App Signing kulcs**: Play Console → Setup → App integrity →
   App signing key certificate → SHA-256.

Írd be mindkettőt a `TODO_..._IDE` helyére, majd push (deploy). Ellenőrzés:
https://kinti.app/.well-known/assetlinks.json

## 4. Termékek létrehozása (Play Billing)

Play Console → **Monetize → Products**. A termék-azonosítók PONTOSAN ezek
(a kód ezekre hivatkozik — `src/lib/payments-config.ts` ProductType):

| Termék-ID | Típus | Megfelelője |
|---|---|---|
| `kinti_pro_monthly` | Előfizetés (havi) | Kinti PRO |
| `business_pro_monthly` | Előfizetés (havi) | Szaknévsor PRO |
| `job_featured` | Egyszeri (in-app product) | Kiemelt Állás |

Árazás: állítsd a Paddle-árakkal egyezőre (19 € / 19 € / 49 €), a Play
országonként lokalizálja.

## 5. Szerver-oldali ellenőrzés (service account)

1. Play Console → Setup → **API access** → Google Cloud projekt összekötése →
   **Create service account** (a Cloud Console-ban) → kulcs létrehozása (JSON).
2. A Play Console-ban a service accountnak jog: **View financial data** +
   **Manage orders**.
3. Cloudflare Pages → Settings → Environment variables (Production, SECRET):
   - `GOOGLE_PLAY_PACKAGE_NAME` = `app.kinti.twa`
   - `GOOGLE_PLAY_SA_EMAIL` = a service account emailje (`...@...iam.gserviceaccount.com`)
   - `GOOGLE_PLAY_SA_KEY` = a JSON kulcsfájl `private_key` mezője (a `\n`-ekkel együtt)
   - `PLAY_RTDN_SECRET` = egy hosszú véletlen string (lásd 6. pont)

Amíg ezek nincsenek beállítva, az appban a vásárlás „nincs bekapcsolva" hibát ad
— a webes Paddle-t ez nem érinti.

## 6. RTDN (megújulás/lemondás értesítések)

1. Google Cloud Console → Pub/Sub → **Create topic** (pl. `play-rtdn`).
2. A topichoz **push subscription**, endpoint:
   `https://kinti.app/api/webhooks/play?key=<PLAY_RTDN_SECRET>`
3. Play Console → Monetize → Monetization setup → **Real-time developer
   notifications** → add meg a topic nevét → Save, majd „Send test notification".

Biztonság: a webhook a push tartalmának nem hisz — minden értesítésnél a Google
API-tól kérdezi le a valós előfizetés-állapotot; a `?key=` csak zajszűrő.

## 7. Tesztelés kiadás előtt

- **Internal testing** sáv a Play Console-ban → adj hozzá teszt-fiókot →
  telepítsd a Play-ből → ellenőrizd:
  - az app címsor NÉLKÜL nyílik (assetlinks OK);
  - a `/pro` oldalon SEHOL nincs Paddle-említés, a lábban „Google Play" szerepel;
  - az ÁSZF / Adatvédelem / Visszatérítés oldalak Google Play-szöveget mutatnak;
  - vásárlás: License testing fiókkal (Play Console → Setup → License testing)
    a vásárlás ingyen tesztelhető.
- Weben (böngészőből) ellenőrizd, hogy MINDEN Paddle-szöveg változatlan.

## Play Billing Library 8 — ✅ ELVÉGEZVE (2026-08-07)

A Google Play Console követelménye (határidő 2026-08-31): minden app-frissítésnek a
**Google Play Billing Library 8.0.0+** verziót kell használnia.

**Az akadály elhárult, a frissítés megtörtént.** A TWA a Play Billinget a
`com.google.androidbrowserhelper:billing` (ABH) függőségen át használja, és 2026-07-22-én
az ABH legfrissebb kiadása még `1.1.0` volt (→ `billingclient:7.1.1`). A `PlayBillingWrapper`
akkor a `querySkuDetailsAsync`-et hívta, ami a `billingclient:8.x`-ből **teljesen hiányzik** —
ezért a neten ajánlott `resolutionStrategy.force` gyorsjavítás RUNTIME-ban eltörte volna a
fizetést (`NoSuchMethodError`). Erre vártunk.

**2026-07-30-án a Google kiadta az `ABH billing:1.2.0`-t**, ami a
`com.android.billingclient:billing:**8.3.0**`-ra épül, és a wrappert átmigrálták
`queryProductDetailsAsync`-re.

**Amit elvégeztünk (2026-08-07):**
```
Bubblewrap CLI 1.24.1 → 1.25.0   (az 1.25.0 sablonja már billing:1.2.0-t ír)
npx @bubblewrap/cli@1.25.0 update --skipVersionUpgrade
twa-manifest.json + build.gradle: appVersionCode 7 → 8, appVersionName 1.4 → 1.5
a splash.png-k visszaállítva átlátszóra (az update fehérre lapította — lásd lent)
```

**Négy lépésben ellenőrizve, nem feltételezve:**
1. `gradlew app:dependencies` → `billing:1.2.0` → `billingclient:**8.3.0**`
2. `compileReleaseJavaWithJavac` hibátlan (a `DelegationService` is fordul)
3. `bundleRelease` SIKERES — beleértve a `minifyReleaseWithR8` lépést, ami a hiányzó
   metódusokat kimutatná
4. A kész `.aab` dex-ében: `querySkuDetailsAsync` **0×**, `queryProductDetailsAsync` **2×**

⚠️ **A gradle-lel épített `.aab` NINCS ALÁÍRVA** (nincs `signingConfig` a build.gradle-ban) —
az csak verifikációs build volt. A Play-be feltölthető, aláírt csomagot a
`bubblewrap build` készíti, ami bekéri a keystore-jelszót.

⚠️ **MINDIG rögzített verzióval futtasd:** `npx @bubblewrap/cli@1.25.0 …`. Egy régebbi
CLI-vel futtatott `update` VISSZAÍRNÁ a `billing:1.1.0`-t a build.gradle-ba, és a
Play újra elutasítaná. (A `build` nem regenerál gradle-t, csak az `update`.)

⚠️ **Az `update` fehérre lapítja a splash.png-ket.** Az `android/app/` gitignore-olt,
tehát ez csak lokálisan él, de minden `update` után újra át kell látszósítani az 5 fájlt
(`drawable-mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi/splash.png`) — lásd a splash-szakaszt.

A verify/RTDN szerver-oldal (`/api/payments/play/verify`, `/api/webhooks/play`) a
Play Developer API-t hívja, NEM függ a kliens billing-verziójától → ott nincs teendő.

## Hibaelhárítás

- **Címsor látszik az appban** → assetlinks hiányos/rossz fingerprint (3. pont).
- **„A Google Play fizetés itt nem érhető el"** → a build nem tartalmazza a
  Play Billing delegációt (a `twa-manifest.json` `features.playBilling.enabled`
  + `alphaDependencies.enabled` legyen `true`, majd új build), VAGY nem a
  Play-ből telepített példány fut.
- **Verify 503** → az 5. pont env-változói hiányoznak a Cloudflare-en.
