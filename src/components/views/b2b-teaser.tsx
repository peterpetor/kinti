import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * B2bTeaser — marketing-fogás a cég-műszerfalon: a nyitott B2B-projektek SZÁMÁT
 * mutatja (részleteket sose), hogy PRO-ra váltásra ösztönözzön. A projektek
 * tartalma zárt marad — csak a darabszám a csali.
 *
 * „Ne reklámozd az ürességet": 0 projektnél SOSE mutatunk csupasz „0"-t, hanem
 * koncepció-szöveget („legyél te az első" / „PRO-val nyílik") — így a belépő
 * mindig ott van a cég-műszerfalon (a modul enélkül gyakorlatilag láthatatlan).
 */
export function B2bTeaser({ count, isPro }: { count: number; isPro: boolean }) {
  return (
    <Link
      href="/b2b"
      className="flex items-center gap-3 rounded-card border border-star/30 bg-gradient-to-br from-star/10 to-primary-soft/40 p-4 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-star text-white">
        <Icon name="briefcase" size={19} strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-extrabold text-ink">
          {count > 0 ? (
            <>Jelenleg <span className="text-star">{count} nyitott projekt</span> vár a B2B Hubban</>
          ) : (
            <>Legyél te az első a B2B Hubban</>
          )}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
          {isPro
            ? "Zárt projektpiac PRO cégeknek — nézd meg vagy írj ki munkát."
            : "Alvállalkozói munkák magyar cégektől. PRO-val nyílik meg."}
        </p>
      </div>
      <Icon name="chevR" size={16} className="shrink-0 text-ink-muted" />
    </Link>
  );
}
