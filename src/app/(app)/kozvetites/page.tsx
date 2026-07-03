import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { PlacementInquiryForm } from "@/components/views/placement-inquiry-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Magyar munkaerő közvetítés — Ausztria, Németország, Hollandia",
  description:
    "Előszűrt, motivált magyar jelöltek Ausztriában, Németországban és Hollandiában — a Feedback Jobs közvetítésével. A jelöltnek ingyenes; a munkáltatónak sikerdíjas. Kérj ajánlatot kötelezettség nélkül.",
};

/**
 * /kozvetites — nyilvános B2B oldal: a Feedback Jobs munkaerő-közvetítés
 * szolgáltatás-pitch-e munkáltatóknak + megkeresés-űrlap. A Kinti a
 * jelölt-csatorna (layer3 opt-in pool), a bevétel a közvetítésből jön.
 * CH szándékosan kimarad (SECO-engedélyköteles).
 */
export default function KozvetitesPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const steps: { emoji: string; title: string; body: string }[] = [
    {
      emoji: "📋",
      title: "Elmondod, kit keresel",
      body: "Pozíció, helyszín, feltételek — az űrlapon 2 perc, kötelezettség nélkül.",
    },
    {
      emoji: "🎯",
      title: "Előszűrt jelölteket kapsz",
      body: "A Kinti közösségéből azok közül válogatunk, akik kifejezetten hozzájárultak az aktív közvetítéshez — CV-vel, elvárásokkal, elérhetőséggel.",
    },
    {
      emoji: "🤝",
      title: "Csak sikeres felvételnél fizetsz",
      body: "Nincs előleg, nincs hirdetési díj — a díjazás megállapodás szerinti sikerdíj. A jelöltnek a szolgáltatás ingyenes.",
    },
  ];

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Munkaerő-közvetítés
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
          Munkáltatóknak · AT / DE / NL
        </p>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          Megbízható magyar munkaerőt keresel?
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">
          A Kinti a kint élő magyarok mindennapi appja — álláskeresőink maguk kérik,
          hogy aktívan közvetítsük őket. Ausztriában, Németországban és Hollandiában
          közvetítünk: szakmunkától a vendéglátáson át az egészségügyig.
        </p>
      </section>

      {/* Hogyan működik */}
      <section className="space-y-2.5">
        {steps.map((s, i) => (
          <div key={s.title} className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-lg">
              {s.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
                {i + 1}. {s.title}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Miért a Kinti-pool */}
      <section className="rounded-card border border-primary/25 bg-primary-soft p-4 shadow-card">
        <p className="text-[13.5px] font-extrabold text-ink">Miért tőlünk?</p>
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
          <li>• A jelöltjeink <strong className="text-ink">már kint élnek vagy indulásra készek</strong> — nem hideg adatbázisból dolgozunk.</li>
          <li>• Minden jelölt <strong className="text-ink">kifejezett hozzájárulással</strong> kerül a poolba (GDPR-tiszta folyamat).</li>
          <li>• Magyarul és németül/hollandul is kommunikálunk — <strong className="text-ink">a nyelvi szűrést mi elvégezzük</strong>.</li>
        </ul>
      </section>

      {/* Űrlap */}
      <section className="space-y-3">
        <h2 className="text-[16px] font-extrabold tracking-tight text-ink">
          Kérj ajánlatot — 24–48 órán belül jelentkezünk
        </h2>
        <PlacementInquiryForm turnstileSiteKey={turnstileSiteKey} />
      </section>

      <p className="text-[11px] leading-snug text-ink-faint">
        A szolgáltatást a Feedback Jobs S.R.L. nyújtja (részletek:{" "}
        <Link href="/impresszum" className="underline">Impresszum</Link>). Svájcba
        jelenleg nem közvetítünk. Állást keresel? A közvetítés neked{" "}
        <Link href="/allasok/profil" className="underline">ingyenes — jelentkezz itt</Link>.
      </p>
    </div>
  );
}
