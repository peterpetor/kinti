# Kinti Szaknévsor Scraping Elleni Védelmi Stratégia

> Forrás-stratégia (a megrendelő által megadva). A tényleges kódbeli megvalósítás
> és a Cloudflare-dashboard teendők státusza: **`docs/anti-scraping.md`**.

Ez a dokumentum áttekinti a **Kinti** szaknévsor adatbázis tömeges letöltése (scraping / bot adatlopás) elleni védekezési lehetőségeket, a könnyen kijátszható módszerektől az ipari szintű megoldásokig.

---

## 1. A Jelenlegi Biztonsági Kockázat elemzése

Jelenleg a teljes vállalkozási lista (név, kategória, cím, koordináták, értékelések, telefonszámok) egyetlen végponton keresztül érhető el:
*   `GET /api/businesses/list`

Ez a végpont lekéri az összes publikus vállalkozást és JSON formátumban visszaadja. Bár ez a megoldás kiváló felhasználói élményt és gyors kliensoldali szűrést biztosít, biztonsági szempontból **kritikus kockázatot jelent**, mivel egy egyszerű parancssori kéréssel (`curl`) másodpercek alatt lemásolható a teljes adatbázis.

---

## 2. Javasolt Védelmi Vonalak (Defense in Depth)

A leghatékonyabb védekezés a több rétegű biztonság (*defense in depth*), ahol a különböző védelmi vonalak kiegészítik egymást.

### A. API Változtatások és Adat-szétválasztás (Legfontosabb lépés)
A robotok számára a legértékesebb adatok a **telefonszámok** és az **e-mail címek**. A nyilvános cégnév és cím kevésbé kritikus.
1.  **Lazy Loading a telefonszámokhoz:** a `/api/businesses/list` válaszból távolítsuk el a `phone` mezőt; a weboldalon *„Telefonszám mutatása"* gomb; kattintásra `/api/businesses/[id]/contact` (szigorú rate-limit, pl. 10/perc/IP).
2.  **Adatok Obfuscálása:** a telefonszámot ne nyers szövegként küldjük, hanem egyszerű kódolással (karakter-eltolás vagy Base64 + fordított string); a böngésző dekódolja rendereléskor.

### B. Interakció-alapú hitelesítés (Cloudflare Turnstile)
A `/api/businesses/list` hívásakor kötelező, szerveroldalon ellenőrzött Turnstile token; hiányában 403. A botoknak headless böngészőt kellene futtatniuk a kijátszáshoz.

### C. Hálózati Szintű WAF és Bot Management (Cloudflare beállítások)
1.  **Bot Fight Mode** bekapcsolása.
2.  **IP-alapú Rate Limiting:** `> 3` kérés/perc a `/api/businesses/list`-re → 1 óra tiltás.
3.  **Felhő szolgáltatók tiltása:** hoszting/adatközponti IP-tartományok (AWS, Azure, GCP, DigitalOcean, Hetzner) tiltása/kihívása.

### D. Honeypot (Mézesbödön) Technika
1.  **Láthatatlan csapda link** (`display:none` / `opacity:0`), pl. `/api/businesses/honeypot-trigger`.
2.  **Azonnali blokkolás:** a végpont meghívóját a D1 `blocklist` táblába jegyezzük, és minden jövőbeli kérését blokkoljuk.

---

## 3. Összegzés

A legmagasabb biztonságot a **Lazy Loading (telefonszámok leválasztása) + Cloudflare WAF szabályok** kombinációja adja.

| Védelmi réteg | Hatékonyság | Kliens-élmény | Idő |
| :--- | :--- | :--- | :--- |
| 1. Cloudflare WAF bot tiltás | Közepes | Nincs | 5 perc (dashboard) |
| 2. Telefonszám Lazy-loading | **Kiemelkedő** | Minimális | 2 óra (API + frontend) |
| 3. Turnstile Token ellenőrzés | **Kiemelkedő** | Nincs | 1 óra (API middleware) |
| 4. Honeypot csapda | Magas | Nincs | 1 óra (API + blocklist) |
