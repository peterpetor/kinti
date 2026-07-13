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

```bash
# EBBEN a mappában (android/ — itt van a twa-manifest.json), NE a repo gyökerében!
# (A gyökérben futtatva a generált app/ mappa kiütné a Next.js src/app routerét,
#  és az egész weboldal eltűnne a buildből.)
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

## Hibaelhárítás

- **Címsor látszik az appban** → assetlinks hiányos/rossz fingerprint (3. pont).
- **„A Google Play fizetés itt nem érhető el"** → a build nem tartalmazza a
  Play Billing delegációt (a `twa-manifest.json` `features.playBilling.enabled`
  + `alphaDependencies.enabled` legyen `true`, majd új build), VAGY nem a
  Play-ből telepített példány fut.
- **Verify 503** → az 5. pont env-változói hiányoznak a Cloudflare-en.
