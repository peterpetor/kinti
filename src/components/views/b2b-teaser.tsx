import Link from "next/link";
import { Icon } from "@/components/ui";
import type { B2bTeaserMatch } from "@/lib/repo-b2b";

/**
 * B2bTeaser — „híd" a cég-műszerfalról a B2B Hub felé. Nem-PRO cégnek a SAJÁT
 * szakmájára/országára illő nyitott projekteket teasereli (a getB2bTeaserMatch
 * szűkülő körei): darabszám + keresett-szakma + város + kor VALÓS adat, a
 * projekt címe viszont a kliensre SEM megy le — a homályosított sor tisztán
 * CSS-placeholder (a tartalom a Szaknévsor PRO szerver-gate mögött marad, a
 * blur nem „elrejtett", hanem nem-létező adat).
 *
 * „Ne reklámozd az ürességet": 0 projektnél SOSE mutatunk csupasz „0"-t, hanem
 * koncepció-szöveget — így a belépő mindig ott van a cég-műszerfalon.
 */

/** Kor-szöveg epoch-ms-ből (szerveren fut, a /profil dinamikus oldal). */
function ageText(createdAt: number): string {
  const days = Math.floor((Date.now() - createdAt) / 86_400_000);
  if (days <= 0) return "ma";
  if (days === 1) return "tegnap";
  return `${days} napja`;
}

/** A homályosított „cím"-sáv szélessége soronként (determinisztikus, adat nélkül). */
const BLUR_WIDTHS = ["w-4/5", "w-3/5", "w-2/3"];

export function B2bTeaser({ match, isPro }: { match: B2bTeaserMatch; isPro: boolean }) {
  const { scope, count, items } = match;

  // PRO cég: rövid belépő-kártya — neki a /b2b nyitva áll, teaserre nincs szükség.
  // 0 projekt (globálisan sincs): koncepció-szöveg, szám nélkül.
  if (isPro || count === 0 || items.length === 0) {
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

  // Nem-PRO cég, van illő projekt: erős, ŐSZINTE fejléc + homályosított sorok.
  const headline =
    scope === "category" ? (
      <>
        <span className="text-star">{count} nyitott projekt</span> keres pont a te szakmádban
        alvállalkozót
      </>
    ) : (
      <>
        <span className="text-star">{count} nyitott projekt</span> vár a B2B Hubban a te
        országodban
      </>
    );

  return (
    <Link
      href="/b2b"
      className="block rounded-card border border-star/30 bg-gradient-to-br from-star/10 to-primary-soft/40 p-4 shadow-card transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-star text-white">
          <Icon name="briefcase" size={19} strokeWidth={2.3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold leading-snug text-ink">{headline}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            Magyar cégek kiírásai — a részleteket a Szaknévsor PRO nyitja meg.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-surface/70 px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              {/* Placeholder „cím"-sáv: nincs mögötte adat, a blur csak vizuális. */}
              <div
                aria-hidden="true"
                className={`h-3 ${BLUR_WIDTHS[i % BLUR_WIDTHS.length]} rounded-full bg-ink/25 blur-[2.5px]`}
              />
              <p className="mt-1.5 truncate text-[11.5px] font-semibold text-ink-muted">
                {[
                  it.neededLabel ? `🔍 ${it.neededLabel}` : null,
                  it.targetCity ? `📍 ${it.targetCity}` : null,
                  ageText(it.createdAt),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Icon name="lock" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[12.5px] font-extrabold text-star">
        Válts Szaknévsor PRO-ra, és jelentkezz rájuk →
      </p>
    </Link>
  );
}
