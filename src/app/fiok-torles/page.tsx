import { LegalPage } from "@/components/legal-page";

export const dynamic = "force-static";

export const metadata = {
  title: "Fiók és adatok törlése",
  description:
    "Így kérheted a Kinti (kinti.app) fiókod és a hozzá kapcsolódó adatok végleges törlését.",
};

/**
 * Fióktörlési oldal — a Google Play áruházi adatlap „Fióktörlési URL"
 * követelményéhez (is). Kötelező tartalma: az app nevére hivatkozás, a törlés
 * lépéseinek jól látható leírása, valamint a törölt/megőrzött adattípusok és a
 * megőrzési időszakok. A tartalom az adatvédelmi tájékoztató 5.1 pontjával
 * konzisztens — ha ott változik a törlési folyamat, itt is frissítsd.
 */
export default function FiokTorlesPage() {
  return (
    <LegalPage title="Fiók és adatok törlése" updatedAt="2026-07-13">
      <p>
        Ez az oldal a <strong>Kinti — Találj magyart a közeledben</strong>{" "}
        alkalmazásra és a <strong>kinti.app</strong> webhelyre vonatkozik
        (üzemeltető: <strong>Feedback Jobs S.R.L.</strong>, Románia). Itt
        találod, hogyan kérheted a fiókod és a hozzá kapcsolódó adatok{" "}
        <strong>végleges és visszaállíthatatlan törlését</strong>.
      </p>

      <h2>1. Hogyan kérheted a fiókod törlését? (lépések)</h2>
      <ol>
        <li>
          Írj e-mailt az{" "}
          <a href="mailto:info@kinti.app?subject=Fi%C3%B3kt%C3%B6rl%C3%A9s">
            info@kinti.app
          </a>{" "}
          címre <strong>„Fióktörlés" tárggyal</strong>, arról az e-mail-címről,
          amellyel a fiókodat regisztráltad (így tudjuk azonosítani, hogy a
          kérés tőled érkezik — más adatot nem kérünk).
        </li>
        <li>
          A kérés beérkezését követően <strong>legfeljebb 5 munkanapon
          belül</strong> véglegesen töröljük a fiókodat és a hozzá kapcsolódó
          adatokat, majd e-mailben visszaigazoljuk a törlést.
        </li>
      </ol>
      <p>
        Fiók nélküli tartalmaidat (pl. vélemény, szaknévsoros vállalkozói
        profil) önkiszolgáló módon, azonnal is törölheted a beküldéskor kapott
        egyedi <em>kezelő-linkkel</em> — részletek az{" "}
        <a href="/adatvedelem">adatvédelmi tájékoztató</a> 5.1 pontjában.
      </p>

      <h2>2. Mely adatok törlődnek?</h2>
      <ul>
        <li>
          <strong>Bejelentkezési fiók</strong> (Clerk): e-mail-cím, név,
          belépési azonosítók — a fiók törlésekor; a biztonsági (audit) naplók
          legfeljebb <strong>30 nap</strong> után törlődnek.
        </li>
        <li>
          <strong>Vállalkozói / szaknévsoros profil</strong> és a hozzá
          feltöltött képek, valamint az ajánlatkérő-postafiók (leadek) —
          a törléssel együtt véglegesen törlődnek.
        </li>
        <li>
          <strong>PRO-előfizetéshez kötött jogosultságok</strong> — a fiókkal
          együtt törlődnek (a előfizetés lemondásáról lásd a 4. pontot).
        </li>
        <li>
          <strong>Álláskeresői / jelentkezői adatok</strong> (pl. feltöltött
          önéletrajz, mentett profil) — a fiókkal együtt törlődnek.
        </li>
      </ul>

      <h2>3. Mely adatokat őrizzük meg, és meddig?</h2>
      <ul>
        <li>
          <strong>Fizetési / számviteli bizonylatok</strong> (a Paddle, illetve
          a Google Play által kiállított bizonylatok adatai): a számviteli és
          adójogi <strong>jogszabályi megőrzési kötelezettség</strong> idejéig
          — jellemzően legfeljebb <strong>10 év</strong>. Ezeket kizárólag a
          jogi kötelezettség teljesítésére használjuk.
        </li>
        <li>
          <strong>Jogi igények érvényesítéséhez szükséges minimális adatok</strong>{" "}
          (pl. visszaélés-bejelentések, moderációs döntések): az igény
          elévüléséig, kizárólag e célból.
        </li>
        <li>
          Minden más adat a törléskor <strong>fizikailag és véglegesen</strong>{" "}
          törlődik — a törlés nem visszaállítható.
        </li>
      </ul>

      <h2>4. Fontos: az előfizetés lemondása</h2>
      <p>
        A fiók törlése <strong>nem mondja le automatikusan</strong> a futó
        előfizetést — azt a fizetés helyén kell lemondani:
      </p>
      <ul>
        <li>
          <strong>Google Play-vásárlás esetén:</strong> Play Áruház →
          Előfizetések menüpont.
        </li>
        <li>
          <strong>Webes (Paddle) vásárlás esetén:</strong> a vásárlási
          visszaigazoló e-mailben kapott lemondó link, vagy írj az{" "}
          <a href="mailto:info@kinti.app">info@kinti.app</a> címre.
        </li>
      </ul>
      <p>
        Javasoljuk, hogy a fióktörlés kérése <strong>előtt</strong> mondd le az
        előfizetést, hogy ne keletkezzen további díjterhelés.
      </p>

      <h2>5. Account deletion (English summary)</h2>
      <p style={{ fontStyle: "italic" }}>
        This page applies to the app{" "}
        <strong>„Kinti — Találj magyart a közeledben"</strong> (kinti.app). To
        request the permanent deletion of your account and associated data,
        e-mail{" "}
        <a href="mailto:info@kinti.app?subject=Account%20deletion">
          info@kinti.app
        </a>{" "}
        with the subject <strong>“Account deletion”</strong> from the e-mail
        address you registered with. We delete the account (login credentials,
        name, e-mail), business profile, uploaded images and CV data within{" "}
        <strong>5 business days</strong> and confirm by e-mail; security logs
        are kept for up to 30 days. Payment/accounting records are retained
        only as long as legally required (up to 10 years). Deleting the
        account does <strong>not</strong> cancel an active subscription —
        cancel it in Google Play (Subscriptions) or via the Paddle
        confirmation e-mail first.
      </p>

      <h2>6. Kapcsolat</h2>
      <p>
        Adatvédelmi kérdések és törlési kérelmek:{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a>. Részletes
        tájékoztató: <a href="/adatvedelem">Adatvédelmi tájékoztató</a>.
      </p>
    </LegalPage>
  );
}
