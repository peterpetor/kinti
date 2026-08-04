/**
 * quota-guard-runtime.ts — a keret-őr futásidejű fele (D1-írás + riasztás).
 *
 * ⚠️ KÜLÖN FÁJL a `quota-guard.ts`-től: az tiszta, mellékhatás nélküli számítás
 * (tesztelhető), ez pedig ír az adatbázisba és webhookot hív. Így a logika
 * unit-tesztelhető marad anélkül, hogy a tesztek D1-et vagy hálózatot
 * igényelnének.
 *
 * ⚠️ NEM CRONHOZ KÖTÖTT. Az ellenőrzés magához a cache-kihagyáshoz kapcsolódik:
 * ha a keret fogy, a kihagyások úgyis sűrűn jönnek. A cron-alapú megoldás
 * elbukna, ha a `CRON_SECRET` elcsúszik (2026-08-04-én pont ez volt a helyzet) —
 * a riasztás pedig épp akkor nem szólalhat meg, amikor a legnagyobb szükség van rá.
 */

import { getDB } from "./cloudflare";
import { recordUsage } from "./repo-misc";
import { forwardError } from "./monitoring";
import {
  kvotaAllapot, kvotaEsemeny, kvotaUzenet, RIASZTAS_JELZO, SOR_KOLTSEG,
} from "./quota-guard";

/**
 * Hányadik kihagyásonként nézzük meg a napi állást.
 *
 * ⚠️ Az ellenőrzés maga is D1-olvasás. Minden kihagyásnál futtatva a mérés
 * terhelné azt, amit mér. A lista-lekérdezés kihagyása amúgy is ritka
 * (30 perces TTL mellett ~48/nap/POP), ezért minden 5. elég sűrű ahhoz, hogy
 * a 70%-os küszöböt még jóval a keret elfogyása előtt elkapjuk.
 */
const ELLENORZES_SURUSEG = 5;

let szamlalo = 0;

/**
 * Egy drága lekérdezés VALÓDI D1-találatának rögzítése, és időnként a napi
 * keret ellenőrzése. Sosem dob és sosem lassítja a hívót (tűz-és-felejtsd).
 */
export function ellenorizKvota(kulcs: string): void {
  if (!SOR_KOLTSEG[kulcs]) return;
  void recordUsage(kvotaEsemeny(kulcs));

  szamlalo += 1;
  if (szamlalo % ELLENORZES_SURUSEG !== 0) return;
  void futtatEllenorzest();
}

async function futtatEllenorzest(): Promise<void> {
  try {
    const nap = new Date().toISOString().slice(0, 10);
    const { results } = await getDB()
      .prepare(`SELECT event, count FROM feature_usage_daily WHERE day = ? AND event LIKE 'quota:%'`)
      .bind(nap)
      .all<{ event: string; count: number }>();
    const sorok = results ?? [];

    const allapot = kvotaAllapot(sorok);
    if (!allapot.riasztando) return;

    // ⚠️ Naponta EGYSZER szólunk. Enélkül a küszöb átlépése után minden
    // ellenőrzés újra riasztana, és a webhook-zaj miatt pont a fontos üzenet
    // veszne el.
    const marSzoltunk = sorok.some((s) => s.event === RIASZTAS_JELZO);
    if (marSzoltunk) return;
    await recordUsage(RIASZTAS_JELZO);

    forwardError({
      source: "server",
      prefix: "[kvóta-őr] a D1 napi keret fogytán",
      status: `${Math.round(allapot.arany * 100)}%`,
      message: kvotaUzenet(allapot),
    });
  } catch {
    /* a keret-őr sosem törhet meg egy oldalbetöltést */
  }
}
