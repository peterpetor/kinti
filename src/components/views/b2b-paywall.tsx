import Link from "next/link";
import { Icon } from "@/components/ui";
import { BoostCheckoutButton } from "@/components/views/boost-checkout-button";

/**
 * B2bPaywall — a zárt B2B Hub „előnézet + fizetőfal" kapuja a nem-PRO cégeknek.
 * A ProLockOverlay mintáját követi (elmosott valódi feed + elöl a CTA-kártya),
 * de a checkout a CÉG-szintű Szaknévsor PRO (`business_pro_monthly`) — mert a
 * B2B Hubot a `businesses.featured=1` oldja fel, nem a user-szintű Kinti PRO.
 *
 * Két eset:
 *  • van cége (featured=0) → közvetlen Paddle checkout a cég businessId-jével;
 *  • nincs cége → előbb regisztrálnia kell a Szaknévsorba (/profil).
 */
const SAMPLE = [
  { c: "🇦🇹", who: "Bécsi Építő Kft.", title: "2 festőt keresek jövő heti bécsi munkára", cat: "Festő • Bécs" },
  { c: "🇩🇪", who: "München Bau GmbH", title: "Villanyszerelő alvállalkozó, 3 hetes projekt", cat: "Villanyszerelő • München" },
  { c: "🇨🇭", who: "Zürich Renova AG", title: "Burkoló csapatot keresünk társasházi felújításra", cat: "Burkoló • Zürich" },
];

export function B2bPaywall({ businessId }: { businessId: string | null }) {
  return (
    <div className="px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-white">
          <Icon name="briefcase" size={16} strokeWidth={2.4} />
        </span>
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">B2B Hub</h1>
        <Link
          href="/profil"
          aria-label="Vissza"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
        </Link>
      </header>

      <div className="relative">
        {/* Előnézet: minta-feed, elmosva és kattinthatatlanul. */}
        <div className="pointer-events-none min-h-[420px] select-none space-y-3 blur-[3px] saturate-[.85] opacity-70" aria-hidden="true">
          {SAMPLE.map((s, i) => (
            <div key={i} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-[13px] font-extrabold text-white">
                  {s.who.slice(0, 1)}
                </span>
                <span className="text-[13px] font-bold text-ink">{s.who}</span>
                <Icon name="check" size={14} strokeWidth={2.8} className="text-primary" />
              </div>
              <p className="text-[14px] font-extrabold text-ink">{s.title}</p>
              <p className="mt-1 text-[12px] text-ink-muted">{s.c} {s.cat}</p>
            </div>
          ))}
        </div>

        {/* Fizetőfal — a feed fölé simuló CTA-kártya. */}
        <div className="absolute inset-0 flex items-start justify-center overflow-hidden rounded-card bg-gradient-to-b from-bg/10 via-bg/60 to-bg/95 p-4">
          <div className="mt-4 w-full max-w-sm rounded-card border-2 border-star/40 bg-surface p-5 text-center shadow-pop">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-[15px] bg-star text-white">
              <Icon name="briefcase" size={22} strokeWidth={2.4} />
            </div>
            <p className="text-[16px] font-extrabold leading-tight text-ink">
              🚀 Kinti B2B Hub — Zárt Körű Projektpiac
            </p>
            <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] leading-snug text-ink-muted">
              Ez a funkció csak Szaknévsor PRO cégeknek érhető el.
            </p>

            <ul className="mx-auto mt-3 max-w-xs space-y-1.5 text-left">
              {[
                "Találj megbízható magyar alvállalkozókat",
                "Szerezz azonnali projekteket más magyar cégektől",
                "Nincs jutalék, csak tiszta üzlet",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-[12.5px] font-semibold text-ink">
                  <Icon name="check" size={14} strokeWidth={2.8} className="mt-0.5 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              {businessId ? (
                <BoostCheckoutButton
                  product="business_pro_monthly"
                  customData={{ type: "business_pro", businessId }}
                  label="Váltás PRO csomagra"
                  className="w-full bg-star text-white hover:bg-[#d68f20]"
                />
              ) : (
                <>
                  <Link
                    href="/profil"
                    className="inline-flex w-full items-center justify-center rounded-pill bg-star px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]"
                  >
                    Előbb regisztráld a vállalkozásod
                  </Link>
                  <p className="mt-2 text-[11px] text-ink-faint">
                    A B2B Hubhoz először vedd fel a céged a Szaknévsorba, majd válts PRO-ra.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
