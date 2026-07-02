"use client";

import { useEffect, useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";

type OwnerStatus = { kintiPro?: boolean; businessPro?: boolean };

export default function ProPage() {
  const { startCheckout, isLoading } = useCheckout();
  const { user } = useUser();
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  // Melyik csomag AKTÍV már nálad? (átláthatóság — a kártyák „Aktív” jelzést kapnak)
  const [status, setStatus] = useState<OwnerStatus | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetch("/api/owner/status")
      .then((r) => (r.ok ? (r.json() as Promise<OwnerStatus>) : null))
      .then((d) => { if (!cancelled && d) setStatus(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);
  const kintiProActive = !!status?.kintiPro;
  const businessProActive = !!status?.businessPro;
  // A Kinti PRO MIND A 4 országra szól (EGY előfizetés) — ezért a marketing-lista
  // ország-SEMLEGES, nem írja ki egy ország nevét (különben Ausztria-specifikusnak
  // tűnne, pedig nem az). A funkciók in-app úgyis a választott országhoz igazodnak
  // (interjú, nyelvkurzus, állampolgárság-szimulátor). A szakmai szótár CH-only
  // valódi tartalom, ezért az marad CH-feltételes.
  const proFeatures = [
    "Utalás-asszisztens — mérhető havi spórolás a hazautaláson",
    "Határidő-asszisztens — soha ne maradj le (engedély, biztosítás, adó)",
    "Állás-találat (% match) — melyik állás illik a profilodhoz + becsült nettó bér a régiódban",
    "AI Interjú Szimulátor — országod cégeihez (CH/AT/DE/NL)",
    "AI CV-audit — önéletrajz-elemzés és tippek",
    "Nyelvkurzus — svájci, osztrák, német és holland",
    "Állampolgársági teszt-szimulátor — mind a 4 országra",
    ...(country === "CH" ? ["Szakmai szótár — 500+ svájci kifejezés"] : []),
  ];

  const handleCheckout = (product: "kinti_pro_monthly" | "business_pro_monthly" | "job_featured") => {
    // PRO előfizetés a Clerk userId-hez kötődik — bejelentkezés nélkül nincs
    // értelme (a webhook nem tudná kihez kötni). Ezért előbb beléptetünk.
    if (!user?.id) {
      window.location.href = "/belepes?redirect_url=/pro";
      return;
    }

    let customType = "";
    if (product === "kinti_pro_monthly") customType = "user_pro";
    else if (product === "business_pro_monthly") customType = "business_pro";
    else if (product === "job_featured") customType = "job_featured";

    startCheckout({
      product,
      customerEmail: user?.emailAddresses?.[0]?.emailAddress,
      customData: {
        type: customType,
        userId: user.id,
      }
    });
  };

  return (
    <div className="relative mx-auto max-w-md px-5 pb-24 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* "..." menü a jobb felső sarokban */}
      <div className="absolute right-5 top-[calc(env(safe-area-inset-top)+2rem)] z-10">
        <DropdownMenu />
      </div>

      {/* Header */}
      <header className="mb-10 text-center flex flex-col items-center">
        <Link href="/" className="mb-6 inline-block active:scale-95 transition-transform">
          <KintiLogo size={42} />
        </Link>
        <h1 className="text-[28px] font-black text-ink tracking-tight mb-4">
          Lépj szintet a <span className="text-primary">Kinti PRO</span>-val
        </h1>
        <p className="text-[15px] text-ink-muted text-balance">
          {countryLocative(country)} élő magyaroknak, szakembereknek és munkáltatóknak fejlesztett exkluzív csomagok, melyekkel maximalizálhatod a platform lehetőségeit.
        </p>
      </header>

      {/* Orientáció: HÁROM külön csomag, HÁROM célra — szín-kód, hogy egyértelmű
          legyen, melyik kinek szól és hogy nem kell mind. */}
      <div className="mb-8 rounded-3xl border-2 border-line bg-surface p-5">
        <p className="mb-3 text-[13.5px] font-black text-ink">Melyik csomag kell nekem?</p>
        <p className="mb-3 text-[12px] text-ink-muted leading-snug">
          Három külön dolog, három célra — <strong>nem kell mind</strong>. A színek végigkísérnek lent is:
        </p>
        <div className="space-y-2.5 text-[12.5px] leading-snug">
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />
            <span className="text-ink"><strong className="text-primary">Kinti PRO</strong> — ha <strong>te magad</strong> élsz kint (álláskeresés %-match, AI-eszközök, kalkulátorok).</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-pro" />
            <span className="text-ink"><strong className="text-pro">Szaknévsor PRO</strong> — ha <strong>vállalkozásod</strong> van, és ügyfeleket szereznél.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-accent" />
            <span className="text-ink"><strong className="text-accent">Kiemelt Állás</strong> — ha <strong>munkáltatóként</strong> állást hirdetsz.</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Kinti PRO (Users) */}
        <div className="flex flex-col rounded-[32px] border-2 border-line bg-surface p-6 shadow-card hover:border-primary/30 transition-colors relative">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 w-14 h-14 text-primary text-2xl">
            🎓
          </div>
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-pill bg-primary/10 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-primary">
            🧑 Neked · magánszemély
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-black text-ink">Kinti PRO</h2>
            {kintiProActive && <ActiveBadge />}
          </div>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">
            Magánszemélyeknek. AI-asszisztens, prémium modulok és kalkulátorok — egy havidíjért,
            mind a 4 országra 🇨🇭 🇦🇹 🇩🇪 🇳🇱.
          </p>

          <div className="mb-6">
            <span className="text-3xl font-black text-ink">19 €</span>
            <span className="text-[14px] font-bold text-ink-muted"> / hó</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {proFeatures.map((t) => (
              <FeatureItem key={t} text={t} />
            ))}
          </ul>

          {kintiProActive ? (
            <div className="w-full rounded-pill bg-primary/10 py-3.5 text-center text-[15px] font-black text-primary">
              ✓ Aktív — előfizetve
            </div>
          ) : (
            <button
              onClick={() => handleCheckout("kinti_pro_monthly")}
              disabled={isLoading}
              className={cn(
                "w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              Válts Kinti PRO-ba
            </button>
          )}
        </div>

        {/* Szaknévsor PRO (Businesses) */}
        <div className="flex flex-col rounded-[32px] border-2 border-pro bg-surface p-6 shadow-pop relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pro/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          {/* „Legnépszerűbb” tényállítás volt (bizonyíthatónak kellene lennie) —
              szubjektív ajánlás megengedett, szuperlatívusz-tényállítás nem. */}
          <div className="absolute top-4 right-4 bg-pro text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-pill shadow-sm">
            Ajánlott
          </div>
          
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-pro/10 w-14 h-14 text-pro text-2xl">
            🚀
          </div>
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-pill bg-pro/10 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-pro">
            🏪 A vállalkozásodnak
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-black text-pro">Szaknévsor PRO</h2>
            {businessProActive && <ActiveBadge />}
          </div>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">
            Vállalkozóknak és szakembereknek. Szerezz több ügyfelet prémium láthatósággal.
          </p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-ink">19 €</span>
            <span className="text-[14px] font-bold text-ink-muted"> / hó</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <FeatureItem text="Sárga PRO kiemelés a találati listákban" />
            <FeatureItem text="A lista elején jelensz meg a kategóriádban (a kiemelt cégek között)" />
            <FeatureItem text="Egyedi profil borítókép és arculat-szín" />
            <FeatureItem text="Analytics: profil-megtekintések, CTR, keresőszavak" />
            <FeatureItem text="Időpontfoglalás widget (Calendly-beágyazás)" />
            <FeatureItem text="Ajánlatkérő postafiók (lead-kezelő)" />
            <FeatureItem text="Bővített referenciagaléria" />
            <FeatureItem text="Konkurencia kizárása a profilodról" />
          </ul>

          {businessProActive ? (
            <>
              <div className="block w-full rounded-pill bg-pro/10 py-3.5 text-center text-[15px] font-black text-pro">
                ✓ Aktív — a céged PRO
              </div>
              <p className="mt-2 text-center text-[11px] text-ink-faint">
                A vállalkozásod a Szaknévsorban kiemelten jelenik meg. Kezelés: „…” menü → Vállalkozásom.
              </p>
            </>
          ) : (
            <>
              <Link
                href="/profil?pro=1"
                className="block w-full rounded-pill bg-pro py-3.5 text-center text-[15px] font-black text-white shadow-[0_4px_0_0_#cc7700] transition active:translate-y-1 active:shadow-none hover:bg-[#e68600]"
              >
                Kiemelés Vásárlása
              </Link>
              <p className="mt-2 text-center text-[11px] text-ink-faint">
                A vállalkozásod kezelőjében véglegesíted. Ha még nincs Szaknévsor-listázásod, ott 1 perc alatt létrehozod — utána fizethetsz elő.
              </p>
            </>
          )}
        </div>

        {/* Kiemelt Állás (Employers) */}
        <div className="flex flex-col rounded-[32px] border-2 border-line bg-surface p-6 shadow-card hover:border-accent/30 transition-colors relative">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-accent/10 w-14 h-14 text-accent text-2xl">
            💼
          </div>
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-pill bg-accent/10 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-accent">
            💼 Munkáltatóként
          </span>
          <h2 className="text-[22px] font-black text-ink">Kiemelt Állás</h2>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">
            Munkáltatóknak. Találj gyorsabban megbízható magyar munkaerőt.
          </p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-ink">49 €</span>
            <span className="text-[14px] font-bold text-ink-muted"> / hirdetés</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <FeatureItem text="30 napos piros kiemelés a Job Boardon" />
            <FeatureItem text="Rögzített hely a lista legelején" />
            <FeatureItem text="Egyedi céges arculat megjelenítése" />
            <FeatureItem text="Azonnali értesítés a releváns jelölteknek" />
          </ul>

          <Link
            href="/munkaltato"
            className="block w-full rounded-pill border-2 border-ink py-3.5 text-center text-[15px] font-black text-ink shadow-card transition hover:bg-ink hover:text-surface active:scale-[0.98]"
          >
            Hirdetés Kiemelése
          </Link>
          <p className="mt-2 text-center text-[11px] text-ink-faint">A hirdetésednél, a munkáltató kezelőben véglegesíted.</p>
        </div>

      </div>

      {/* FAQ / Trust section */}
      <div className="mt-16 text-center">
        <p className="text-[13px] font-semibold text-ink-muted">
          A fizetéseket a biztonságos <strong className="text-ink">Paddle</strong> (Merchant of
          Record) dolgozza fel. Bármikor lemondható.
        </p>
        <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-ink-faint">
          A vásárlással kéred a PRO <strong>azonnali aktiválását</strong>, és tudomásul veszed, hogy a
          teljesítéssel elveszíted a 14 napos elállási jogod (EU/EGT fogyasztók — lásd{" "}
          <Link href="/aszf" target="_blank" className="underline">ÁSZF 1.1</Link>).
        </p>
      </div>
    </div>
  );
}

/** „Aktív” jelvény — a már megvett csomagon (átláthatóság). */
function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-success/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-success">
      <Icon name="check" size={11} strokeWidth={3.5} /> Aktív
    </span>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <div className="mt-0.5 grid shrink-0 h-4 w-4 place-items-center rounded-full bg-success/20 text-success">
        <Icon name="check" size={10} strokeWidth={4} />
      </div>
      <span className="text-[13.5px] font-semibold text-ink/80 leading-snug">{text}</span>
    </li>
  );
}
