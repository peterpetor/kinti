# OPS — élesítés utáni beállítások

Ezek a Cloudflare-dashboardon kézzel elvégzendő konfigurációk. A kód a
beállítás után **automatikusan** működik — nem kell újabb deploy.

---

## 1) Email Routing (info@kinti.app, abuse@kinti.app)

**Miért kell**: a jogi oldalak (`/impresszum`, `/adatvedelem`, `/aszf`)
ezekre a címekre hivatkoznak — ha nem fogad őket valódi postafiók, NAIH /
DSB vizsgálatkor "nem elérhető üzemeltető" minősítést kapsz, ami bírság
alapja lehet.

**Lépések** — Cloudflare Dashboard → kinti.app domain → **Email** → Email
Routing:

1. Ha még nem volt aktiválva: kattints **Enable Email Routing**-ra. A
   szükséges MX + TXT rekordokat a CF magától hozzáadja a DNS-hez.
2. **Destination addresses** → Add → írd be a saját Gmail / Outlook címed.
   Megérkezik a megerősítő email — kattints rá.
3. **Routing rules** → Create address → vegyél fel egyenként:
   - `info@kinti.app`   →  a megerősített Gmail
   - `abuse@kinti.app`  →  a megerősített Gmail
4. **Catch-all address** (ajánlott): bekapcsolod, így a `barmi@kinti.app`
   is megérkezik — gyakori elgépelést is elfog.

**Tesztelés**: telefonról vagy bárhonnan küldj egy emailt `info@kinti.app`
címre, és nézd meg, megérkezik-e ~30 másodperc alatt.

---

## 2) Cloudflare Web Analytics

**Miért kell**: GDPR-barát, cookie-mentes, ingyenes forgalom-statisztika.
A kód már fel van készítve — csak a tokent kell beállítanod.

**Lépések**:

1. CF Dashboard → **Analytics & Logs** → **Web Analytics** → **Add a site**.
2. Hostname: `kinti.app`. Mentés után megjelenik a `data-cf-beacon`
   tokened — egy ~40 karakteres hex string.
3. CF Dashboard → **Workers & Pages** → **kinti** (Pages projekt) →
   **Settings** → **Environment variables** → **Production**:
   - Variable name: `NEXT_PUBLIC_CF_BEACON_TOKEN`
   - Value: a kapott token
   - Ugyanezt vedd fel a **Preview** környezetbe is, ha akarsz preview-n
     is mérni.
4. **Build environment**: a CF Pages a `NEXT_PUBLIC_*` változókat
   build-időben olvassa, nem futás közben — emiatt egy **újabb deploy
   szükséges** ahhoz, hogy a script ténylegesen aktiválódjon.

```powershell
npm run deploy
```

**Ellenőrzés**: nyisd meg a kinti.app-ot, F12 → Network → ott kell legyen
egy kérés a `static.cloudflareinsights.com/beacon.min.js` felé.

---

## 3) Cron-worker (kinti-cron-purge) — D1 takarítás napi 1×

**Miért kell**: a `review_drafts` / `business_submissions` táblák a 24h-n túl
meg nem erősített piszkozatokat, illetve az `events` tábla a 30 napnál régebbi
rekordokat nem takarítja magától. GDPR adatminimalizálási elv ezt kötelezővé teszi.

**Lépések**:

```powershell
cd workers/cron-purge
npx wrangler deploy
```

**Mikor fut**: `17 3 * * *` — napi 03:17 UTC (azaz 04:17 vagy 05:17
Európában, attól függően, hogy nyári vagy téli idő van).

**Manuális teszt** (deploy után):

```powershell
# Beállítasz egy secret-et a fetch-endpointhoz:
npx wrangler secret put CRON_SECRET
# Majd meghívod:
curl -H "authorization: Bearer <amit_beirtal>" `
     https://kinti-cron-purge.<account>.workers.dev
```

Ha üres a tábla, `{"draftsDeleted":0,"postsDeleted":0,"ranAt":"..."}`
választ kapsz.

**Logok**: CF Dashboard → **Workers & Pages** → kinti-cron-purge →
**Logs**. Itt látszik a `[cron-purge] {"draftsDeleted":3,...}` mintázatú
napi log.

---

## 4) Esemény-szinkron Worker (iCal → D1)

A `workers/cron-events-sync` egy külön Worker, ami naponta egyszer (04:47 UTC)
lehúzza a konfigurált svájci magyar szervezeti naptárakat (Google Calendar /
Outlook .ics formátum) és az `events` táblába frissíti őket. Forrásonkénti
`source` mező → újra-szinkronnál a régi sorok automatikusan törlődnek
(stale-cleanup). A kézi/seed eseményeket NEM érinti (`source IS NULL`).

**Deploy**:

```powershell
cd workers\cron-events-sync
npx wrangler deploy
```

**Naptárak felvétele** — most már **admin felületről**, NEM env-változóval:

1. A Pages projektben állítsd be a `ADMIN_EMAILS` env-változót (a Te Clerk
   email-címed, kisbetűsen): Settings → Environment variables → Production →
   `ADMIN_EMAILS = peterpetor1987@gmail.com` (vesszővel elválasztva több is)
2. Deploy újra (`npm run deploy`), hogy az env beégjen.
3. Belépve menj a `https://kinti.app/admin/feeds` oldalra.
4. Add hozzá az iCal URL-eket (Google Calendar / Outlook publikus .ics linkek).
5. A worker a következő futáskor (vagy a manuális trigger után) húzza őket.

**Hol kérek naptár-azonosítót**: Magyar Egyesület / Magyar Misszió / Magyar
Iskola / Cserkészek → a Google Calendar publikus iCal linkje (Settings →
„Public address in iCal format").

**Manuális teszt** (azonnali sync):

```powershell
# Egyszer beállítod a Bearer secret-et:
cd workers\cron-events-sync
npx wrangler secret put CRON_SECRET

# Aztán bármikor lefuttatható:
curl -H "authorization: Bearer <amit_beirtal>" `
     https://kinti-cron-events-sync.<account>.workers.dev
```

A válasz JSON: feedenként hány eseményt írt be / mi volt a hiba.

**Logok**: CF Dashboard → Workers → kinti-cron-events-sync → Logs.
Mintázat: `[cron-events-sync] {"feeds":[...], "totalInserted":12, ...}`

**Adatbázis migráció** (egyszer, ha még nem futott):
```powershell
npm run db:migrate:remote
```
(felveszi a `source` oszlopot az `events` táblába).

---

## 5) DSB / NAIH adatkezelői nyilvántartás (opcionális, de ajánlott)

GDPR Art. 30 szerint **kevesebb mint 250 alkalmazott + nem szisztematikus
megfigyelés = nem kötelező** adatkezelői nyilvántartást vezetni. A magán-
személy üzemeltető emiatt mentesül.

**Mégis ajánlom**: csinálj egy `docs/PRIVACY_REGISTER.md`-t, amibe
beleírod milyen adatot, miért, meddig — ez perben / vizsgálatban
bizonyítja az "elszámoltathatóság" elvét (Art. 5(2)). Sablont kérhetsz
külön.

---

## Élesítés-előtti checklist

- [ ] `npm run db:migrate:remote` lefutott a 0003 migrációval
- [ ] `npm run deploy` deployolt a friss kóddal
- [ ] `workers/cron-purge` deployolva (`npx wrangler deploy`)
- [ ] Email Routing aktív, `info@` / `abuse@` postaládát fogadtad
- [ ] Web Analytics token az env-ben, újrabuildelve
- [ ] Spam-teszt: küldj be egy eseményt a `/kozosseg` oldalról valódi
      emailedről — érkezik a megerősítő, kattintásra megjelenik a listán,
      a kezelő-linkkel törölhető
