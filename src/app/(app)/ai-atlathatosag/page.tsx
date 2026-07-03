import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

// Tiszta statikus tartalom → force-static, runtime NÉLKÜL (nem fogyaszt
// edge-route-ot — lásd deploy-edge-route-plafon tanulság).
export const dynamic = "force-static";

export const metadata = {
  title: "AI-átláthatóság — hogyan használunk mesterséges intelligenciát",
  description:
    "A Kinti AI-funkcióinak átlátható leírása: mit csinálnak, milyen modellekkel, mik a korlátaik, és hogyan felügyeljük őket. EU AI Act megfelelési tájékoztató.",
};

interface AiFeature {
  emoji: string;
  name: string;
  what: string;
  model: string;
  limits: string;
}

const FEATURES: AiFeature[] = [
  {
    emoji: "🔎",
    name: "AI-kereső (Szaknévsor „AI-mód”)",
    what: "A természetes nyelvű keresésedet (pl. „villanyszerelő Bécsben”) szűrőkké alakítja. A találati lista maga NEM AI — a valódi adatbázisból jön.",
    model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
    limits: "Félreértheti a keresést — a szűrők kézzel mindig felülbírálhatók.",
  },
  {
    emoji: "🧭",
    name: "Szemantikus keresés",
    what: "A kereséseket és a szaknévsor-bejegyzéseket jelentés-vektorokká alakítja, hogy rokon értelmű találatokat is megtaláljon. Ha nem elérhető, sima kulcsszavas keresésre vált.",
    model: "BAAI bge-m3 beágyazó-modell (Cloudflare Vectorize)",
    limits: "Csak a találatok SORRENDJÉT befolyásolja; tartalmat nem hoz létre.",
  },
  {
    emoji: "🤖",
    name: "AI Interjú-szimulátor (PRO)",
    what: "Szerepjáték: az AI HR-menedzserként kérdez a választott nyelven, a végén magyar nyelvű gyakorlási visszajelzést ad.",
    model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
    limits: "Minden kérdés és visszajelzés AI-generált — hibázhat, torzíthat. Gyakorlási segédlet: valós felvételi döntésre nincs hatása. A prompt tiltja a származás, akcentus, kor, nem, családi állapot alapján való ítélkezést és az érzelmi állapot minősítését.",
  },
  {
    emoji: "📄",
    name: "CV-audit (PRO)",
    what: "A feltöltött önéletrajzhoz javítási javaslatokat ad (szerkezet, megfogalmazás, helyi elvárások).",
    model: "Meta Llama modellek + PDF-szövegkinyerés (Cloudflare Workers AI)",
    limits: "Javaslat, nem szabály — a CV-dről te döntesz. A feltöltött CV-t védett tárolóban tartjuk.",
  },
  {
    emoji: "📖",
    name: "Hivatali szótár",
    what: "Hivatali kifejezések magyarázata. ELSŐDLEGESEN kézzel ellenőrzött, kurált szócikkekből dolgozik; AI-magyarázat csak ott jelenik meg, ahol nincs kurált tartalom — és ilyenkor „becslés” jelölést kap.",
    model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
    limits: "Az AI-jelölésű magyarázat tévedhet — hivatalos ügyben mindig az eredeti dokumentum és a hatóság az irányadó.",
  },
  {
    emoji: "🛡️",
    name: "Beküldés-előszűrés (spam)",
    what: "Az új beküldéseket (vállalkozás, ajánlás) előszűri nyilvánvaló spam/reklám ellen.",
    model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
    limits: "Az AI csak ELŐSZŰR — a megjelenésről minden esetben emberi moderátor dönt. Téves elutasításnál írj nekünk.",
  },
  {
    emoji: "🔊",
    name: "Napi szó — kiejtés",
    what: "A napi szó meghallgatható kiejtését beszédszintézis állítja elő.",
    model: "Beszédszintézis-modell (Cloudflare Workers AI)",
    limits: "A gépi kiejtés közelítő — az anyanyelvi kiejtés eltérhet.",
  },
];

export default function AiAtlathatosagPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          AI-átláthatóság
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
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
          Hogyan használunk mesterséges intelligenciát?
        </h1>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          A Kinti több funkciója mesterséges intelligenciát használ. Itt átláthatóan
          leírjuk: melyik funkció mit csinál, milyen modellel, és mik a korlátai.
          Utoljára frissítve: 2026. július 3.
        </p>
      </section>

      {/* Alapelvek */}
      <section className="rounded-card border border-primary/25 bg-primary-soft p-4 shadow-card">
        <p className="text-[13.5px] font-extrabold text-ink">Alapelveink</p>
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
          <li>• <strong className="text-ink">Jelölés:</strong> ahol AI-generált tartalmat látsz, azt jelöljük (🤖 / „becslés”).</li>
          <li>• <strong className="text-ink">Kurált-először:</strong> ahol lehet, kézzel ellenőrzött tartalom az elsődleges, az AI csak kiegészít.</li>
          <li>• <strong className="text-ink">Ember dönt:</strong> AI önállóan soha nem hoz rád nézve döntést — a moderáció emberi, az AI-visszajelzés gyakorlási segédlet.</li>
          <li>• <strong className="text-ink">Nincs tiltott gyakorlat:</strong> nem használunk érzelem-felismerést, social scoringot vagy manipulatív technikát.</li>
          <li>• <strong className="text-ink">Adataid:</strong> az AI-hívásokat a Cloudflare Workers AI futtatja; a beküldött szöveget nem használjuk fel modellek tanítására, és nem adjuk át harmadik félnek hirdetési célra.</li>
        </ul>
      </section>

      {/* Funkció-lista */}
      <section className="space-y-2.5">
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">AI-funkcióink</h2>
        {FEATURES.map((f) => (
          <div key={f.name} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <p className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
              {f.emoji} {f.name}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{f.what}</p>
            <p className="mt-1.5 text-[11.5px] text-ink-faint">
              <strong className="text-ink-muted">Modell:</strong> {f.model}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">
              <strong className="text-ink-muted">Korlátok:</strong> {f.limits}
            </p>
          </div>
        ))}
      </section>

      {/* EU AI Act */}
      <section className="space-y-2">
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">EU AI-rendelet (AI Act)</h2>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          AI-funkcióink a felhasználót segítő, átláthatósági kötelezettség alá eső
          eszközök: mindig jelezzük, ha AI-jal beszélsz vagy AI-generált tartalmat
          látsz. Az interjú-szimulátor a te önkéntes felkészülő-eszközöd — valós
          felvételi vagy munkáltatói döntést nem hoz és nem támogat. Tiltott
          AI-gyakorlatot (érzelem-felismerés, social scoring, manipuláció) nem
          alkalmazunk.
        </p>
      </section>

      {/* Hibajelzés */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-[13.5px] font-extrabold text-ink">Hibás vagy problémás AI-választ kaptál?</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          Írd meg nekünk az <a href="mailto:info@kinti.app" className="font-bold text-primary underline">info@kinti.app</a> címre
          (mit kérdeztél, mit válaszolt az AI) — minden jelzést átnézünk, és ha kell,
          javítjuk a szabályokat. A tartalom-bejelentő gombok is működnek minden
          felhasználói tartalomnál.
        </p>
      </section>

      <p className="text-[11px] leading-snug text-ink-faint">
        Kapcsolódó: <Link href="/adatvedelem" className="underline">Adatkezelési Tájékoztató</Link> ·{" "}
        <Link href="/impresszum" className="underline">Impresszum</Link>
      </p>
    </div>
  );
}
