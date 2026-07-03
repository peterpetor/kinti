# EU AI Act — belső klasszifikációs feljegyzés (Kinti / Feedback Jobs S.R.L.)

Utoljára frissítve: **2026-07-03**. Ez a feljegyzés dokumentálja, hogy a Kinti
AI-funkciói az EU AI-rendelet (Regulation (EU) 2024/1689) mely kockázati sávjába
tartoznak, és milyen intézkedések élnek. NEM jogi tanácsadás — a magas kockázatú
besorolás-közeli kérdésekben (lásd 3. pont) jogász bevonása szükséges.

## Releváns határidők

| Dátum | Kötelezettség |
|---|---|
| 2025-02-02 | Tiltott gyakorlatok (5. cikk) + AI-jártasság (4. cikk) |
| 2025-08-02 | GPAI-modell kötelezettségek (modell-szolgáltatókra — minket mint alkalmazót közvetve érint) |
| **2026-08-02** | **Annex III magas kockázatú rendszerek kötelezettségei** |

## 1. Korlátozott kockázat — átláthatósági kötelezettség (50. cikk)

Ezek a funkciók a felhasználót segítik, döntést róla nem hoznak. Kötelezettség:
az AI-interakció/AI-tartalom jelölése — **teljesítve** (UI-jelölések + /ai-atlathatosag oldal).

| Funkció | Modell | Intézkedések |
|---|---|---|
| AI Interjú-szimulátor (PRO) | Llama 3.1 8B | Az oldal + a chat állandó „AI-generált, hibázhat" jelölése; LegalDisclaimer; prompt-szintű fairness-szabályok (védett tulajdonságok alapján tilos ítélni/kérdezni; érzelmi állapot minősítése tilos — 5. cikk-kompatibilitás); a visszajelzés gyakorlási segédlet, valós felvételi döntésre nincs hatása |
| AI-kereső (parse-search) | Llama 3.1 8B | Csak szűrőket állít, tartalmat nem generál a usernek; kézzel felülbírálható |
| Szemantikus keresés | bge-m3 (embedding) | Csak rangsorol; fallback kulcsszavasra |
| CV-audit (PRO) | Llama + toMarkdown | Javaslat-jellegű, jelölt AI-kimenet; a user dönt |
| Hivatali szótár | Llama 3.1 8B | KURÁLT-ELŐSZÖR; AI csak „becslés" jelöléssel |
| Spam-előszűrés | Llama 3.1 8B | Csak előszűr; a publikálásról EMBERI moderátor dönt |
| Napi szó TTS | beszédszintézis | Nem személyre vonatkozó tartalom |

Indoklás (interjú-szimulátor): az Annex III 4. pont a munkáltatói oldali
toborzás/kiválasztás rendszereit sorolja magas kockázatba (jelöltek szűrése,
értékelése, döntéstámogatás). A szimulátor a jelölt ÖNKÉNTES, saját célú
felkészülő-eszköze; kimenete munkáltatóhoz nem jut el, valós kiválasztási
folyamatban nem vesz részt → nem Annex III. Az 50. cikk átláthatósági
kötelezettségei érvényesek és teljesítve vannak.

## 2. Tiltott gyakorlatok (5. cikk) — nem alkalmazunk

- Munkahelyi/oktatási **érzelem-felismerés**: NINCS (a szimulátor promptja
  explicit tiltja az érzelmi állapot minősítését).
- Social scoring, manipulatív/kihasználó technikák, valós idejű biometria: NINCS.

## 3. ⚠️ Magas kockázat-közeli terület — recruiter-oldali AI (admin /kozvetites)

A Feedback Jobs belső közvetítő-konzolján az AI: (a) CV-ből kulcsszó/összegzés,
(b) hirdetés↔jelölt **illeszkedés-pont**, (c) megkereső-levél piszkozat. Mivel ez
VALÓS kiválasztási folyamatban, jelöltek értékelésére használható, az Annex III
4. pont hatókörébe eshet (határidő: **2026-08-02**).

**Jelenlegi kockázatcsökkentés (bevezetve 2026-07-03):**
- Minden AI-kimenet a konzolon „🤖 AI-javaslat — a döntés a tiéd" jelölést kap;
  a pontszám tooltipje: „csak rendezési segédlet, nem döntés".
- A folyamatban MINDEN érdemi lépés emberi: a recruiter választja ki a jelöltet,
  ellenőrzi/átírja a levelet, és ő dönt a megkeresésről (human-in-the-loop).
- A jelölt kifejezett hozzájárulással (layer3_opt_in) kerül a poolba; opt-out él.

**Nyitott döntés (jogásszal egyeztetendő 2026-08-02 ELŐTT):**
1. **A-út**: az illeszkedés-% eltávolítása / tisztán szöveges összegzésre
   szűkítés → a rendszer érvelhetően nem „jelölt-értékelő", hanem
   szöveg-asszisztens (alacsonyabb kockázati profil), VAGY
2. **B-út**: a magas kockázatú megfelelés felvállalása (kockázatkezelési
   rendszer, műszaki dokumentáció, naplózás, regisztráció) — egyszemélyes
   működésnél aránytalan teher.

## 4. AI-jártasság (4. cikk)

Az üzemeltető (egyszemélyes) maga fejleszti és felügyeli az AI-funkciókat; a
funkciók működése, korlátai és a modellek e feljegyzésben + a /ai-atlathatosag
oldalon dokumentáltak. Új munkatárs belépésekor ez a két dokumentum a kötelező
belépő-anyag.

## 5. Kapcsolódó felületek

- Publikus tájékoztató: `kinti.app/ai-atlathatosag`
- Adatkezelés: Adatkezelési Tájékoztató 2.9 (Workers AI, jogalap, tárolás)
- AI-fogyás monitoring: admin „AI-használat" fül (`ai_usage_daily`)
- Hibajelzés: info@kinti.app + tartalom-bejelentő gombok
