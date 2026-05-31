/**
 * Hivatalos svájci nyilvántartás-linkek a vállalkozói profil „fél-automatikus"
 * ellenőrzéséhez. A profilon a licenc-szám mellett megjelenik egy link a
 * megfelelő hatósági regiszterre, ahol a felhasználó maga ellenőrizheti a
 * vállalkozót / szakembert. (Az üzemeltető NEM igazol — csak elvezet a forráshoz.)
 */

export interface RegistryLink {
  /** Rövid, emberi felirat (pl. "MedReg – orvosi nyilvántartás"). */
  label: string;
  /** A regiszter kereső-oldala (lehetőség szerint névre szűrve). */
  url: string;
}

/** Zefix — svájci központi cégnyilvántartás (bármely bejegyzett cégre). */
function zefix(name?: string | null): RegistryLink {
  const q = name ? `?name=${encodeURIComponent(name.trim())}` : "";
  return {
    label: "Zefix – svájci cégnyilvántartás",
    url: `https://www.zefix.ch/hu/search/entity/list${q}`,
  };
}

// Kategória-id → szakmai regiszter. A kulcsok a Szaknévsor kategória-id-jei
// (lásd business-form LICENSED_CATEGORY_IDS); a nem-listázott kategóriák a
// Zefix általános cégnyilvántartásra esnek vissza.
const HEALTH_MEDREG = new Set([
  "orvos", "fogorvos", "gyogyszeresz", "nogyogyasz", "gyermekorvos",
  "borgyogyasz", "ortopedus", "pszichiater", "urologus", "belgyogyasz",
  "kardiologus", "sebesz", "szemesz", "ful-orr-gege", "radiologus",
  "neurologist", "fizioterapia",
]);
const PSY = new Set(["pszichologus"]);
const LEGAL = new Set(["ugyvéd", "ugyved", "kozjegyzo"]);
const BUILDING = new Set(["epitesz", "statikus", "energetikai-tanusite"]);

/**
 * Visszaadja az adott kategóriához tartozó hivatalos regiszter-linket (névvel
 * előszűrve, ahol a regiszter támogatja), vagy `null`, ha nincs értelmes link.
 */
export function registryForCategory(
  categoryId: string | null | undefined,
  name?: string | null,
): RegistryLink | null {
  const id = (categoryId ?? "").toLowerCase();

  if (HEALTH_MEDREG.has(id)) {
    return {
      label: "MedReg – egészségügyi szakszemélyzet nyilvántartása",
      url: "https://www.medregom.admin.ch/",
    };
  }
  if (PSY.has(id)) {
    return {
      label: "PsyReg – pszichológusok nyilvántartása",
      url: "https://www.psyreg.admin.ch/",
    };
  }
  if (LEGAL.has(id)) {
    return {
      label: "SAV/FSA – ügyvédkereső",
      url: "https://www.sav-fsa.ch/de/anwaltssuche",
    };
  }
  if (BUILDING.has(id)) {
    return {
      label: "REG – építész/mérnök regiszter",
      url: "https://www.reg.ch/",
    };
  }

  // Általános visszaesés: minden bejegyzett cég a Zefix-ben kereshető.
  return zefix(name);
}
