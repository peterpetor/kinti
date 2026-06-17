# E2E tesztek (Playwright)

A kritikus felhasználói flow-k smoke-szintű ellenőrzése valódi böngészőben:
**kezdőlap-navigáció → vállalkozás felvétele → vélemény → regisztráció/profil**.

A `vitest` (unit) a tiszta üzleti logikát fedi; ez a böngésző-szintű flow-kat.

## Egyszeri telepítés

```bash
npm install
npx playwright install --with-deps chromium
```

## Futtatás

A D1/R2/AI bindinges oldalak (kezdőlap, Szaknévsor) **nem futnak** sima
`next dev` alatt — `wrangler pages dev` kell:

```bash
# 1. terminál: app bindingekkel (alapból http://localhost:8788)
npm run preview

# 2. terminál: a tesztek
npm run test:e2e          # headless
npm run test:e2e:ui       # interaktív UI-mód
npm run test:e2e:report   # az utolsó futás HTML riportja
```

Deploy-ra mutatva (nem kell helyi build):

```bash
PLAYWRIGHT_BASE_URL=https://<preview>.pages.dev npm run test:e2e
```

## Hatókör és korlátok

- A beküldések befejezése **Turnstile**-t igényel, a profil **Clerk**-belépést —
  ezeket a tesztek a flow belépési pontjáig + kliens-validációig ellenőrzik
  (renderelés, navigáció, auth-gate), titkok nélkül determinisztikusan.
  Teljes „happy path" beküldéshez Turnstile teszt-kulcs + Clerk teszt-fiók kell
  (külön CI-titokként konfigurálva).
- A vélemény-flow **adatfüggő**: üres Szaknévsornál (seed nélkül) kihagyja magát.
- Ha a célkörnyezetben **MAINTENANCE_MODE=true**, a nem-kivételezett route-ok a
  `/keszul`-re irányítanak — az auth-flow ezt toleranciával kezeli, a többi
  spec ilyenkor módosítást igényelhet.
