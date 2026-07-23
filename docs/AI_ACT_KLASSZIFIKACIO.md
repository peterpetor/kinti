# EU AI Act — belső klasszifikációs feljegyzés (Kinti / Feedback Jobs S.R.L.)

Utoljára frissítve: **2026-07-23**. Ez a feljegyzés dokumentálja, hogy a Kinti
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
| AI-kereső (parse-search) | Llama 3.1 8B | Csak szűrőket állít, tartalmat nem generál a usernek; kézzel felülbírálható |
| Szemantikus keresés | bge-m3 (embedding) | Csak rangsorol; fallback kulcsszavasra |
| CV-audit (PRO) | Llama + toMarkdown | Javaslat-jellegű, jelölt AI-kimenet; a user dönt |
| Hivatali szótár | Llama 3.1 8B | KURÁLT-ELŐSZÖR; AI csak „becslés" jelöléssel |
| Spam-előszűrés | Llama 3.1 8B | Csak előszűr; a publikálásról EMBERI moderátor dönt |
| Napi szó TTS | beszédszintézis | Nem személyre vonatkozó tartalom |

Megjegyzés (2026-07-23): a korábbi AI Interjú-szimulátor (PRO) funkciót
kivezettük — a kód, az útvonalak és a felhasználói felületek eltávolítva. Az
alábbi tiltott-gyakorlat szakasz így a megmaradt AI-funkciókra vonatkozik.

## 2. Tiltott gyakorlatok (5. cikk) — nem alkalmazunk

- Munkahelyi/oktatási **érzelem-felismerés**: NINCS.
- Social scoring, manipulatív/kihasználó technikák, valós idejű biometria: NINCS.

## 3. Recruiter-oldali AI (admin /kozvetites) — **A-ÚT VÉGREHAJTVA (2026-07-03)**

A korábbi kockázat: az AI hirdetés↔jelölt **illeszkedés-pontot** (0–100%) adott —
jelöltek AI általi értékelése valós kiválasztási folyamatban = az Annex III 4.
pont (magas kockázatú toborzási rendszerek) triggere, 2026-08-02-i határidővel.

**Elvégzett átalakítás (A-út):** az AI jelölt-értékelő kimenete MEGSZŰNT.
- A `/api/admin/recruiter/match` NEM ad pontot és indoklást — kizárólag
  megkereső-levél PISZKOZATOT generál; a prompt explicit tiltja a jelölt
  értékelését/pontozását/rangsorolását („te kizárólag szövegező asszisztens vagy").
- A konzol nem jelenít meg semmilyen AI-pontszámot (a régi, mentett shortlist
  match-% is elrejtve); a hirdetés-lista rendezése determinisztikus, kézzel írt
  kulcsszó-átfedésen alapul (nem AI-rendszer, nem következtető komponens).
- A CV-elemzés (cv-parse) TÉNYBELI összegzést ad (kulcsszó, skillek, nyelvek) —
  nem minősít; a levél-piszkozat alatt explicit felirat: az AI nem értékel,
  az alkalmasságról és a küldésről az ember dönt.
- A jelölt kifejezett hozzájárulással (layer3_opt_in) kerül a poolba; opt-out él.

**Maradék besorolás:** a rendszer AI-komponensei szövegező/összegző asszisztensek
(50. cikk szerinti átláthatóság: teljesítve, jelölésekkel); a jelölt-értékelés és
-rangsorolás kizárólag emberi. Jogász-megerősítés továbbra is AJÁNLOTT a
2026-08-02-es dátum előtt, de az Annex III-trigger (AI általi jelölt-értékelés)
technikailag megszüntetve. Ha a jövőben bárki pontozást/rangsorolást akarna
visszaépíteni: az a magas kockázatú sávba lépés — előtte ezt a dokumentumot és
jogászt kell elővenni.

## 3/b. Hatókörön KÍVÜLI funkció — felhasználói „% match" (/allasok, PRO)

A PRO állás-match (`lib/job-match.ts`) **nem AI-rendszer**: determinisztikus,
kézzel írt szabály-alapú függvény (szakma + kanton + bér-elvárás egyezés,
LLM/ML nélkül) → kívül esik az AI Act AI-rendszer definícióján. Iránya is
fordított, mint az Annex III 4. ponté: az ÁLLÁSKERESŐ rangsorol állásokat
SAJÁT magának; munkáltató nem látja, jelölt-értékelés nem történik. A /pro
oldal copy-ja korrekt (a %-match-et nem nevezi AI-nak); a /ai-atlathatosag
oldalon explicit „ami nem AI" bekezdés tisztázza.

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
