/**
 * exchange-providers.ts — utalási szolgáltatók (közös a kalkulátor és az
 * Utalás-asszisztens között). A spreadek/díjak BECSÜLTEK (publikált átlag), nem
 * real-time — a számláló „becsült megtakarítás", a banki utaláshoz viszonyítva.
 */
export interface XProvider {
  name: string;
  /** Spread (markup) a középárfolyamhoz képest, decimal (0.005 = 0.5%). */
  spread: number;
  /** Hétvégi spread, ha eltér (pl. Revolut standard fiók pótfelára). */
  weekendSpread?: number;
  /** Fix díj a bázis-pénznemben (amount-tól független). */
  fixedFee: number;
  speed: string;
  note: string;
  color: string;
  /** Referál/affiliate link — ha van, a kártya kattinthatóvá válik. */
  url?: string;
}

export const X_PROVIDERS: XProvider[] = [
  {
    name: "Wise",
    spread: 0.005,
    fixedFee: 0.5,
    speed: "néhány óra",
    note: "Mid-market rate + transparens díj.",
    color: "#00b9ff",
    url: "https://wise.com/invite/dic/peterp286",
  },
  {
    name: "Revolut",
    spread: 0.005,
    weekendSpread: 0.015, // standard fiók hétvégi pótfelára a devizaváltásra
    fixedFee: 0,
    speed: "azonnali",
    note: "Standard fiók — hétvégén magasabb spread (~1.5%).",
    color: "#0075eb",
    url: "https://revolut.com/referral/?referral-code=pter9sxrh",
  },
  {
    name: "PaySend",
    spread: 0.009,
    fixedFee: 1.5,
    speed: "perceken belül",
    note: "Kártyára utalás, alacsony fix díj.",
    color: "#cc0066",
  },
  {
    name: "Remitly",
    spread: 0.012,
    fixedFee: 0,
    speed: "perctől órákig",
    note: "Első utalásra gyakran kedvezőbb promo-árfolyam.",
    color: "#1c7d5a",
  },
  {
    name: "Western Union",
    spread: 0.017,
    fixedFee: 0,
    speed: "perctől 1 napig",
    note: "Készpénzfelvétel is — szélesebb árfolyam-rés.",
    color: "#b8860b",
  },
  {
    name: "Bank SEPA",
    spread: 0.015,
    fixedFee: 5,
    speed: "1-2 munkanap",
    note: "Tipikus banki utalás — drágább, de közvetlen.",
    color: "#7f8c8d",
  },
];

/** A „referencia" banki utalás (ehhez viszonyítjuk a megtakarítást). */
export const X_BANK: XProvider = X_PROVIDERS.find((p) => p.name === "Bank SEPA")!;

/** A ténylegesen alkalmazandó spread — hétvégén a `weekendSpread`, ha van. */
export function effectiveSpread(p: XProvider, weekend = false): number {
  return weekend && p.weekendSpread != null ? p.weekendSpread : p.spread;
}

/** Egy szolgáltatónál érkező összeg (bázis-pénznem → cél, baseToTarget középárfolyamon). */
export function receivedAmount(amount: number, baseToTarget: number, p: XProvider, weekend = false): number {
  if (!(amount > 0) || !(baseToTarget > 0)) return 0;
  const rate = baseToTarget * (1 - effectiveSpread(p, weekend));
  return Math.max(0, amount - p.fixedFee) * rate;
}

/** A legtöbbet adó szolgáltató a megadott összegre (érkező összeg szerint). */
export function bestProvider(amount: number, baseToTarget: number, weekend = false): XProvider {
  return X_PROVIDERS.reduce((best, p) =>
    receivedAmount(amount, baseToTarget, p, weekend) > receivedAmount(amount, baseToTarget, best, weekend) ? p : best,
  );
}

/**
 * A NEM-banki szolgáltatók a legtöbbet-adótól a legkevesebbig (érkező összeg
 * szerint) — az összehasonlító listához. A banki utalás a referencia, nem
 * szerepel a listában (ahhoz viszonyítjuk a megtakarítást).
 */
export function rankedProviders(amount: number, baseToTarget: number, weekend = false): XProvider[] {
  return X_PROVIDERS
    .filter((p) => p !== X_BANK)
    .slice()
    .sort((a, b) => receivedAmount(amount, baseToTarget, b, weekend) - receivedAmount(amount, baseToTarget, a, weekend));
}

/** Becsült megtakarítás a banki utaláshoz képest (cél-pénznemben), ha `p`-vel utalsz. */
export function savingsVsBank(amount: number, baseToTarget: number, p: XProvider, weekend = false): number {
  return Math.max(0, receivedAmount(amount, baseToTarget, p, weekend) - receivedAmount(amount, baseToTarget, X_BANK, weekend));
}
