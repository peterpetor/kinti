import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Segítség — kinti",
  description:
    "Hogyan használd a kinti-t — gyakori kérdések, magyarázatok egyszerűen.",
};

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const QUICK_LINKS: { href: string; label: string; emoji: string }[] = [
  { href: "/szaknevsor", label: "Szakembereket keresek", emoji: "🔍" },
  { href: "/kozosseg", label: "Eseményt / hirdetést nézek", emoji: "📢" },
  { href: "/piac", label: "Piac / Hirdetések", emoji: "🛒" },
  { href: "/sajatjaim", label: "Saját posztjaim", emoji: "📌" },
];

const FAQS: FaqItem[] = [
  {
    q: "Kell-e regisztrálni vagy email-cím?",
    a: (
      <>
        <strong>Nem.</strong> A kinti egyik fő ígérete, hogy nincs fiók és nincs
        email-kérés. Csak nyisd meg, és használd. Amikor feladsz valamit (hirdetést,
        eseményt), a böngésződ automatikusan megjegyzi a posztodat —
        és bármikor megnyithatod a <Link href="/sajatjaim" className="text-primary underline font-bold">Saját posztjaim</Link> oldalon.
      </>
    ),
  },
  {
    q: "Hogyan tudom szerkeszteni vagy törölni a posztomat?",
    a: (
      <>
        Két út van:
        <ol className="ml-4 mt-1 list-decimal space-y-0.5">
          <li>
            Nyisd meg a <Link href="/sajatjaim" className="text-primary underline font-bold">Saját posztjaim</Link> oldalt — ott találsz egy listát.
          </li>
          <li>
            Vagy nyisd meg a <strong>kezelő-linket</strong>, amit beküldés után
            kaptál — közvetlenül a szerkesztő oldalra visz.
          </li>
        </ol>
      </>
    ),
  },
  {
    q: "Mi az a kezelő-link?",
    a: (
      <>
        Egy hosszú URL, ami a posztodhoz tartozik. <strong>Olyan, mint egy
        kulcs:</strong> aki megnyitja, az tudja szerkeszteni vagy törölni a posztot.
        Ezért ne oszd meg senkivel — a kinti-n senki nem lát „felhasználói fiókokat”,
        a kezelő-link a te egyetlen hozzáférésed.
      </>
    ),
  },
  {
    q: "Mi van, ha kitisztítom a böngészőm cache-ét vagy másik telefonon nyitnám meg?",
    a: (
      <>
        Ha csak a böngészőben tárolt listát nézed, az eltűnhet. <strong>De a posztod
        nem!</strong> Két dolgot tehetsz:
        <ul className="ml-4 mt-1 list-disc space-y-0.5">
          <li>
            <strong>Mentsd el a kezelő-linket</strong> (Ctrl+D / ⭐ a böngésződben).
            Ezzel mindig vissza tudsz térni.
          </li>
          <li>
            <strong>Töltsd le a backup-ot</strong> JSON-fájlként a Saját posztjaim
            oldalon. Másik eszközön egyszerűen importálod.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "Hogyan tudok kapcsolatba lépni egy hirdetés feladójával?",
    a: (
      <>
        A hirdetésen megjelenik a feladó által megadott{" "}
        <strong>telefonszám / WhatsApp</strong> (ha megadott egyet). A kinti{" "}
        <strong>nem közvetít üzeneteket</strong> — nincs belső chat. Így biztosított,
        hogy mi nem látjuk a beszélgetéseket, ti pedig közvetlenül egyeztettek.
      </>
    ),
  },
  {
    q: "Hogyan tudom telefonomra tenni az alkalmazást?",
    a: (
      <>
        A kinti egy <strong>PWA</strong> (telepíthető webalkalmazás):
        <ul className="ml-4 mt-1 list-disc space-y-0.5">
          <li>
            <strong>iPhone (Safari):</strong> Megosztás ▸ „Hozzáadás a Főképernyőhöz"
          </li>
          <li>
            <strong>Android (Chrome):</strong> Menü ▸ „Hozzáadás a kezdőképernyőhöz"
          </li>
        </ul>
        Utána ikonként megjelenik a telefonodon, és úgy nyílik, mint egy app.
      </>
    ),
  },
  {
    q: "Miért hív a posztom feladónevet úgy, hogy VidámPék_42?",
    a: (
      <>
        Adatvédelmi okokból nem tárolunk teljes neveket. Ha üresen hagytál egy
        feladó-név mezőt, a rendszer automatikusan generál egy „Reddit-stílusú"
        becenevet — szórakoztató és anonim. Persze ha megadsz egy nevet (pl.{" "}
        <em>Tímea</em>), az fog megjelenni.
      </>
    ),
  },
  {
    q: "Milyen adataimat tárolja a kinti?",
    a: (
      <>
        Csak amit te magad megadsz a posztodban (cím, leírás, telefon ha
        megadod). Email-címet nem kérünk, IP-címed csak{" "}
        spam-védelemhez kerül átmeneti hash-be (24 órán belül törlődik). A
        részletek: <Link href="/adatvedelem" className="text-primary underline font-bold">Adatkezelési Tájékoztató</Link>.
      </>
    ),
  },
  {
    q: "Mit tegyek, ha valami problémát észlelek?",
    a: (
      <>
        Minden poszton található <strong>„Jelentem"</strong> gomb — egy kattintás,
        és az admin értesül. Sürgős esetben írj az{" "}
        <a href="mailto:abuse@kinti.app" className="text-primary underline font-bold">
          abuse@kinti.app
        </a>{" "}
        címre. Egyéb kérdés:{" "}
        <a href="mailto:info@kinti.app" className="text-primary underline font-bold">
          info@kinti.app
        </a>
        .
      </>
    ),
  },
  {
    q: "Miért nem tudok véleményt írni anélkül, hogy igazoltam volna magam?",
    a: (
      <>
        A vélemény-rendszer valódi tapasztalatra épít: így nem lehet random
        értékelni egy vállalkozást ismeretlenül. Megnyitod a vállalkozás oldalát,
        és lent találod a „Vélemény írása" gombot — ott megerősítő kérdéseket teszünk
        fel a spam-szűréshez.
      </>
    ),
  },
];

export default function SegitsegPage() {
  return (
    <div className="space-y-6 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-2.5">
        <KintiLogo size={28} />
        <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
        <span className="text-[16px] font-extrabold text-ink-muted">·</span>
        <span className="text-[16px] font-extrabold text-ink-muted">segítség</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      {/* Hero */}
      <section className="rounded-card border border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            🤝
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
              Hogyan használd a kinti-t?
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-ink-muted">
              Gyors válaszok a leggyakoribb kérdésekre. Egyszerűen.
            </p>
          </div>
        </div>
      </section>

      {/* Gyors linkek */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Indulj el itt
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2.5 text-[13px] font-bold text-ink shadow-card transition active:scale-[0.98]"
            >
              <span className="text-[18px]">{l.emoji}</span>
              <span className="min-w-0 flex-1 truncate">{l.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* GYIK */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Gyakori kérdések
        </h2>
        <div className="space-y-2">
          {FAQS.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-card border border-line bg-surface px-4 py-3 shadow-card transition open:bg-surface-alt"
            >
              <summary className="flex cursor-pointer items-start gap-2 text-[13.5px] font-extrabold text-ink list-none">
                <span className="mt-0.5 text-primary text-[14px] transition group-open:rotate-90">▶</span>
                <span className="min-w-0 flex-1">{item.q}</span>
              </summary>
              <div className="mt-2 pl-5 text-[12.5px] leading-relaxed text-ink-muted">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Kapcsolat-CTA */}
      <section className="rounded-card border border-line bg-surface px-4 py-4 shadow-card text-center">
        <p className="text-[13px] font-bold text-ink">Nem kaptál választ?</p>
        <p className="mt-1 text-[12px] text-ink-muted">
          Írj nekünk:{" "}
          <a href="mailto:info@kinti.app" className="text-primary underline font-bold">
            info@kinti.app
          </a>
        </p>
      </section>

      {/* Jogi link-ek */}
      <nav className="flex flex-wrap gap-3 text-[11.5px] font-semibold text-ink-muted">
        <Link href="/adatvedelem" className="underline">Adatkezelési Tájékoztató</Link>
        <Link href="/aszf" className="underline">Felhasználási Feltételek</Link>
        <Link href="/impresszum" className="underline">Impresszum</Link>
      </nav>
    </div>
  );
}
