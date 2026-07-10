/**
 * newsletter-draft.ts — heti hírlevél-VÁZLAT generátor (0 AI, valós adatból).
 *
 * Az admin composer „Draft generálása" gombja hívja: az adott ország friss
 * D1-adataiból (új szaknévsor-cégek, friss állások) + a statikus tudásbázisból
 * (determinisztikus heti cikk-forgatás) összeállít egy sima-szöveg vázlatot,
 * amit az admin ÁTNÉZ és kézzel küld el (a küldés emberi döntés marad — nincs
 * automata spam). A leiratkozó-linket a küldő-route fűzi hozzá címzettenként,
 * ezért itt NEM szerepel.
 *
 * Ez a modul TISZTA (nincs D1/cloudflare import) → unit-tesztelhető; a D1-es
 * adatgyűjtés a route-ban él (api/admin/newsletter/draft) — a quiz-percentile
 * mintája szerint.
 */
import { getGuides, type Guide } from "./guides";

/** ISO-8601 hét sorszáma (determinisztikus heti forgatáshoz). */
export function isoWeek(d: Date = new Date()): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // hétfő=1 … vasárnap=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // a hét csütörtökje dönti az évet
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

/** Determinisztikus heti cikk-válogatás: hétről hétre MÁS `count` cikk (körben forog). */
export function pickWeeklyGuides(country: string, seed: number, count = 2): Guide[] {
  const pool = getGuides(country);
  if (pool.length === 0) return [];
  const n = Math.min(count, pool.length);
  const start = ((seed % pool.length) + pool.length) % pool.length;
  const out: Guide[] = [];
  for (let i = 0; i < n; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}

export interface NewsletterDraftData {
  countryCode: string;
  countryName: string;
  weekLabel: string; // pl. "2026/28. hét"
  newBusinesses: { name: string; categoryLabel: string | null }[];
  newBusinessTotal: number;
  newJobs: { title: string; location: string }[];
  guides: { title: string; slug: string }[];
}

/** A vázlat-szöveg összeállítása (tiszta függvény — unit-tesztelhető). */
export function buildNewsletterText(d: NewsletterDraftData): { subject: string; body: string } {
  const bits: string[] = [];
  if (d.newBusinessTotal > 0) bits.push(`${d.newBusinessTotal} új vállalkozás`);
  if (d.newJobs.length > 0) bits.push(`${d.newJobs.length} friss állás`);
  const subject =
    bits.length > 0
      ? `Kinti hírek — ${d.countryName}: ${bits.join(", ")}`
      : `Kinti hírek — ${d.countryName}: a hét útmutatói`;

  const parts: string[] = [`Szia! 👋`, ``, `Ez történt a Kintin az elmúlt két hétben (${d.countryName}):`];

  if (d.newBusinessTotal > 0) {
    parts.push(``, `🏪 ÚJ A SZAKNÉVSORBAN (${d.newBusinessTotal} új)`);
    for (const b of d.newBusinesses) {
      parts.push(`• ${b.name}${b.categoryLabel ? ` — ${b.categoryLabel}` : ""}`);
    }
    parts.push(`Böngészd mind: https://kinti.app/szaknevsor`);
  }

  if (d.newJobs.length > 0) {
    parts.push(``, `💼 FRISS ÁLLÁSOK`);
    for (const j of d.newJobs) {
      parts.push(`• ${j.title}${j.location ? ` — ${j.location}` : ""}`);
    }
    parts.push(`Összes állás: https://kinti.app/allasok`);
  }

  if (d.guides.length > 0) {
    parts.push(``, `📚 A HÉT ÚTMUTATÓI (${d.weekLabel})`);
    for (const g of d.guides) {
      parts.push(`• ${g.title}: https://kinti.app/tudasbazis/${g.slug}`);
    }
  }

  parts.push(
    ``,
    `💡 Tudtad? Német önéletrajzot 2 perc alatt, ingyen készíthetsz: https://kinti.app/nemet-oneletrajz`,
    ``,
    `Üdv,`,
    `a Kinti csapata`,
  );

  return { subject, body: parts.join("\n") };
}

