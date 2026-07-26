# ONS egyedi adatkérés — magyar születésű népesség Anglia helyhatóságai szerint

**Státusz:** elküldésre kész, a levelet NEKED kell elküldened (a válasz a te e-mail-címedre érkezik).
**Címzett:** `Census.Commissiontables@ons.gov.uk`
**Miért kell:** a „Merre él a legtöbb magyar?" (`/hol-elnek-a-magyarok`) funkció Angliára azért üres,
mert az ONS **nyilvános** kiadványai nem bontják külön Magyarországot.

## Miért nem elég a nyilvános adat (amit már kizártunk)

| Forrás | Miért nem jó |
|---|---|
| Census 2021 **TS012** „Country of birth (detailed)" (NOMIS `NM_2032_1`) | A legrészletesebb nyilvános tábla, 84 kategória — Magyarország **nincs külön**, az „Other EU countries" gyűjtőbe esik (Csehország, Szlovákia, Bulgária, baltiak együtt). Proxyként félrevezető. |
| TS004A / RM011 (`C2021_COB_8`, `C2021_COB_12`) | Még durvább, 8–12 kategóriás bontás. |
| ONS beta Census API (`RM010`, `atc-ts-demmig-*`) | Csak `country_of_birth_12a` (12 kategória). |
| „Population of the UK by country of birth and nationality: individual country data" | Bontaná Magyarországot, de a sorozat **2021 júniusa után megszűnt**, és a regionális bontásban Magyarország az EU8-csoportban van. |
| ONS ad-hoc/CT táblák (pl. `adhocs/14354ct210001`) | Helyhatóság-szintű országbontás létezik, de a publikált kiadások **Ukrajnára/Afganisztánra** szólnak. |

Az országos szám ismert (Census 2021: kb. **93 000 magyar születésű Angliában**), de a funkció
rangsorolt régió-listát mutat — ahhoz helyhatóság- vagy régió-szintű bontás kell.

---

## A levél szövege (másold ki)

**Tárgy:** Census 2021 custom table request — usual residents born in Hungary by local authority (England)

> Dear Census Customer Services,
>
> I would like to request a custom table from Census 2021 for England.
>
> **Requested table**
>
> - **Population base:** all usual residents
> - **Variable 1:** Country of birth — detailed classification, showing **Hungary** as a separate category
> - **Variable 2:** Geography — **lower tier local authorities in England** (or, if that is not
>   possible at this level of detail, **ITL1 / former Government Office Regions**, i.e. the nine
>   English regions)
> - **Measure:** count of usual residents
> - **Reference date:** Census Day, 21 March 2021
>
> I understand that the standard published table TS012 ("Country of birth (detailed)") groups
> Hungary within "Other EU countries", which is why I am requesting a custom table.
>
> **Purpose of the request**
>
> The data would be used in a free, non-commercial information service for Hungarian nationals
> living in the UK, to show where Hungarian communities are concentrated in England. The figures
> would be published with a clear attribution to the Office for National Statistics and a link to
> the source, alongside equivalent official statistics from the Swiss, Austrian, German and Dutch
> statistical offices.
>
> Please let me know:
> 1. whether such a table can be produced (and at which geography level),
> 2. the expected turnaround time,
> 3. whether any charge applies, and
> 4. the licence terms for republishing the figures (I assume the Open Government Licence, but
>    please confirm).
>
> Thank you very much for your help.
>
> Kind regards,
> *[neved]*
> *[szervezet / kinti.app]*
> *[e-mail-cím]*

---

## Ha megjön az adat — mi a teendő

1. Az ONS jellemzően **xlsx**-ben küldi. Tedd a fájlt a `db/seed-data/` mappába.
2. Írj hozzá egy `scripts/harvest-hun-population-gb.mjs`-t a meglévők mintájára
   (`harvest-hun-population-{ch,at,de,nl}.mjs`). ⚠️ **Ne telepíts xlsx/ODS npm-csomagot** — a
   SheetJS sebezhetőségei miatt a többi szkript `unzip` + célzott regex párossal olvassa a fájlt
   (az xlsx valójában ZIP); kövesd ugyanazt a mintát.
3. A kimenet `db/seed-hun-pop-gb.sql`, amit kézzel kell élesíteni:
   `wrangler d1 execute kinti-db --remote --file=./db/seed-hun-pop-gb.sql`
4. A `hungarian_population_stats` tábla mezői: `country_code='GB'`, `region_code` (ONS-kód, pl.
   `E09000007`), `region_name`, `region_level` (`'ltla'` vagy `'region'`), `hungarian_count`,
   `year=2021`, `source='ONS Census 2021'`, `source_url`.
5. ⚠️ **A `region_level` országonként MÁS, ÁTFEDŐ szintet jelöl** — ha egyszerre viszel fel
   helyhatóság- és régió-szintet, SOHA ne összegezz `region_level`-szűrés nélkül (a hollandnál
   ez élesben háromszoros összeget adott).
6. A megjelenítő oldal (`/hol-elnek-a-magyarok`) és az API automatikusan felveszi az új országot —
   a `HunPopulationBoard` ország-tudatos, addig pedig a jelenlegi, tisztességes üres állapotot
   mutatja („Angliára egyelőre nincs hivatalos statisztikánk").

## Amit SOHA ne csinálj helyette

- **Ne oszd szét** az országos ~93 000-et régiókra népesség-arány szerint. Az kitalált eloszlás
  lenne hivatalos statisztikaként tálalva — pontosan az ellentéte annak, amiért ez a funkció a
  korábbi, app-saját adatra épülő hőtérkép helyett készült.
- **Ne használd** az „Other EU countries" számot magyar adatként — abban Csehország, Szlovákia,
  Bulgária és a baltiak is benne vannak.
