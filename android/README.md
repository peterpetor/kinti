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

## Play Billing Library 8 frissítés (Google-figyelmeztetés, határidő 2026-08-31)

A Google Play Console figyelmeztet: **2026. aug. 31. után** minden app-frissítésnek
a **Google Play Billing Library 8.0.0+** (ajánlott: 9) verziót kell használnia.
Kérhető hosszabbítás **2026. nov. 1-ig**.

**Miért nem elég „csak átírni a verziószámot":** a TWA a Play Billinget a
`com.google.androidbrowserhelper:billing` (ABH) függőségen át használja
(`app/build.gradle`). Ez egy **harmadik féltől származó SDK**, ami maga csomagolja a
`com.android.billingclient:billing`-et.

**Bytecode-szinten ellenőrzött tények (2026-07-22):**
- Az ABH legfrissebb KIADOTT verziója a Google Maven-en még **`billing:1.1.0`**, ami
  a `billingclient:7.1.1`-re épül, és a `PlayBillingWrapper` a **`querySkuDetailsAsync`**
  metódust hívja.
- A `billingclient:8.0.0` AAR-jából a `querySkuDetailsAsync` **teljesen hiányzik**
  (a `queryProductDetailsAsync` váltja). A `SkuDetails` adat-osztály még megvan, de a
  lekérdező metódus nincs.
- ⚠️ Ezért a neten ajánlott „gyorsjavítás" — `resolutionStrategy { force
  'com.android.billingclient:billing:8.x' }` a `billing:1.1.0` fölé — **RUNTIME-ban
  eltöri a fizetést** (`NoSuchMethodError` a vásárlás product-details lépésénél). NE
  ezt csináld.

**A két valós út:**

1. **(AJÁNLOTT) Várd meg a hivatalos ABH Billing-8 kiadást.** A GoogleChrome/
   android-browser-helper repóban NYITOTT, aktív PR-ek dolgoznak rajta (2026-07 közepe:
   „Upgrade play billing library to v8.3.0", „Use queryProductDetailsAsync instead of
   querySkuDetailsAsync"). Amint megjelenik a Google Maven-en (>1.1.0), a frissítés:
   ```powershell
   npm update -g @bubblewrap/cli   # legfrissebb Bubblewrap
   cd android
   npx @bubblewrap/cli update       # behúzza az új ABH-t
   # twa-manifest.json: appVersionCode +1 (most 7 → 8), appVersionName emelése
   npx @bubblewrap/cli build
   ```
   Ellenőrzés az új AAB-ben (unzip után): a `billing` transitív függősége már 8.x.
   Utána **kötelező eszköz-teszt** Play license-test fiókkal (7. pont), CSAK utána a
   Play-feltöltés. Ez a tesztelt, hivatalosan támogatott út; a nov. 1-i hosszabbított
   határidőig bőven van idő.

2. **(Ha korábban kell) Vendorold be és migráld az ABH playbilling forrását.** Másold
   az `androidbrowserhelper` playbilling Java-csomagját az `android/app`-ba, cseréld a
   `billing:1.1.0` függőséget közvetlen `com.android.billingclient:billing:8.x`-re, és
   migráld a `PlayBillingWrapper`-t `querySkuDetailsAsync` → `queryProductDetailsAsync`
   (`SkuDetails` → `ProductDetails`, `BillingFlowParams.setSkuDetails` →
   `setProductDetailsParamsList` + offer-token). Ez KÉZZEL írt fizetési kód → csak
   alapos eszköz-teszt után adható ki. (Lényegében ugyanaz, amit a Google fenti PR-jei
   csinálnak — ezért 1. az alapértelmezés.)

A verify/RTDN szerver-oldal (`/api/payments/play/verify`, `/api/webhooks/play`) a
Play Developer API-t hívja, NEM függ a kliens billing-verziótól → ott nincs teendő.

## Hibaelhárítás

- **Címsor látszik az appban** → assetlinks hiányos/rossz fingerprint (3. pont).
- **„A Google Play fizetés itt nem érhető el"** → a build nem tartalmazza a
  Play Billing delegációt (a `twa-manifest.json` `features.playBilling.enabled`
  + `alphaDependencies.enabled` legyen `true`, majd új build), VAGY nem a
  Play-ből telepített példány fut.
- **Verify 503** → az 5. pont env-változói hiányoznak a Cloudflare-en.
