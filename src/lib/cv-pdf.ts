/**
 * cv-pdf.ts — DIN-5008 igazodású, tabellarischer Lebenslauf generálása jsPDF-fel.
 *
 * TELJESEN a böngészőben fut (0 API-költség, 0 szerver): a jsPDF-et CSAK a
 * `generateCvPdf` hívásakor, DINAMIKUSAN importáljuk — így nincs a build/SSR
 * gráfban, és nem terheli az oldal kezdő bundle-jét. mm-egység + A4 → a DIN-5008
 * margók (bal 25 / jobb 20 / fent-lent 20 mm) pontosan méretezhetők. A Helvetica
 * WinAnsi kódolása fedi a német umlautokat (ä ö ü ß).
 */

export interface CvExperience {
  role: string;
  employer: string;
  from: string;
  to: string;
  desc: string;
}
export interface CvEducation {
  school: string;
  qualification: string;
  from: string;
  to: string;
}
export interface CvLanguage {
  name: string;
  level: string;
}
export interface CvData {
  fullName: string;
  /** Feloldott német szakma-megnevezés (a szótárból vagy egyedi). */
  professionDe: string;
  birthYear: string;
  city: string;
  phone: string;
  email: string;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  languages: CvLanguage[];
  skills: string;
  /** Opcionális fejléc-fotó (data URL, JPEG). CSAK a PDF-be kerül — a szerverre/D1-be
   *  SOHA nem töltjük fel (a wizard a mentés-payloadból kihagyja). */
  photo?: string;
  /** Kiemelőszín hex-ben (pl. "#1d4434") — szakaszcím-jelölők, fejléc-vonal, szakma-sor.
   *  Visszafogott, nyomtatásbarát; érvénytelen/hiányzó érték → antracit alapszín. */
  accent?: string;
}

// DIN-5008 A4 margók (mm)
const PAGE_W = 210;
const PAGE_H = 297;
const M_LEFT = 25;
const M_RIGHT = 20;
const M_TOP = 20;
const M_BOTTOM = 20;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT; // 165 mm
const DATE_COL_W = 38; // a bal oldali „von–bis" oszlop
const BODY_X = M_LEFT + DATE_COL_W + 4;
const BODY_W = CONTENT_W - DATE_COL_W - 4;

// Színek (professzionális sötét-pala; nem harsány)
const INK: [number, number, number] = [33, 43, 54];
const MUTED: [number, number, number] = [110, 120, 130];
const RULE: [number, number, number] = [200, 206, 212];

function hexToRgb(hex: string | undefined): [number, number, number] | null {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function todayDe(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function dateRange(from: string, to: string): string {
  const f = from.trim();
  const t = to.trim();
  if (f && t) return `${f} – ${t}`;
  return f || t || "";
}

/** Egy önéletrajz PDF letöltése. Csak kliensen hívható (dinamikus jsPDF-import). */
export async function generateCvPdf(data: CvData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = M_TOP;

  // Kiemelőszín: a felhasználó választása, vagy visszafogott antracit alapérték.
  const ACCENT: [number, number, number] = hexToRgb(data.accent) ?? INK;

  const setInk = () => doc.setTextColor(INK[0], INK[1], INK[2]);
  const setMuted = () => doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const setAccent = () => doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);

  /** Oldaltörés, ha a következő blokknak nincs elég hely. */
  function ensure(need: number) {
    if (y + need > PAGE_H - M_BOTTOM) {
      doc.addPage();
      y = M_TOP;
    }
  }

  /** Szakasz-cím accent-jelölő sávval + alatta vékony vonal. */
  function sectionTitle(title: string) {
    ensure(12);
    y += 3;
    doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.rect(M_LEFT, y - 3.2, 1.4, 4.3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setInk();
    doc.text(title.toUpperCase(), M_LEFT + 3.8, y);
    y += 1.8;
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.3);
    doc.line(M_LEFT, y, M_LEFT + CONTENT_W, y);
    y += 4.5;
  }

  // ── Fejléc: név + szakma (+ opcionális igazolványkép jobbra fent) ────────
  // pt → mm sortávolság (jsPDF alap lineHeightFactor 1.15).
  const lh = (pt: number) => pt * 1.15 * 0.3528;
  const PHOTO_W = 35; // DIN-igazodású Bewerbungsfoto (35×45 mm)
  const PHOTO_H = 45;
  const hasPhoto = typeof data.photo === "string" && data.photo.startsWith("data:image");
  const photoX = M_LEFT + CONTENT_W - PHOTO_W;
  const headerTop = y;
  const textMaxW = hasPhoto ? photoX - M_LEFT - 6 : CONTENT_W;

  if (hasPhoto) {
    try {
      doc.addImage(data.photo as string, "JPEG", photoX, headerTop, PHOTO_W, PHOTO_H);
      doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
      doc.setLineWidth(0.3);
      doc.rect(photoX, headerTop, PHOTO_W, PHOTO_H);
    } catch {
      /* hibás kép → kihagyjuk, a CV így is elkészül */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  setInk();
  const nameLines = doc.splitTextToSize(data.fullName || "Vor- und Nachname", textMaxW) as string[];
  doc.text(nameLines, M_LEFT, y + 6);
  y += 6 + (nameLines.length - 1) * lh(23) + 3.5;
  if (data.professionDe) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setAccent();
    const profLines = doc.splitTextToSize(data.professionDe, textMaxW) as string[];
    doc.text(profLines, M_LEFT, y + 2);
    y += 2 + (profLines.length - 1) * lh(12) + 3.5;
  }
  // Kompakt kontakt-sor a név alatt (modern német CV-fejléc) — a Wohnort/
  // Geburtsjahr a Persönliche Daten blokkban marad (nincs duplikáció).
  const contact = [data.phone.trim(), data.email.trim()].filter(Boolean).join("   ·   ");
  if (contact) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setMuted();
    const cLines = doc.splitTextToSize(contact, textMaxW) as string[];
    doc.text(cLines, M_LEFT, y + 1.5);
    y += 1.5 + (cLines.length - 1) * lh(9.5) + 3;
  }
  // A fejléc alja a szöveg VAGY a fotó alja közül a lejjebbi.
  if (hasPhoto) y = Math.max(y, headerTop + PHOTO_H);
  y += 2.5;
  doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
  doc.setLineWidth(0.9);
  doc.line(M_LEFT, y, M_LEFT + CONTENT_W, y);
  y += 2;

  // ── Persönliche Daten (a kontakt már a fejlécben — itt a stabil törzsadatok) ──
  const personal: [string, string][] = [];
  if (data.birthYear) personal.push(["Geburtsjahr", data.birthYear]);
  if (data.city) personal.push(["Wohnort", data.city]);
  if (personal.length) {
    sectionTitle("Persönliche Daten");
    doc.setFontSize(10.5);
    for (const [label, value] of personal) {
      ensure(6);
      doc.setFont("helvetica", "normal");
      setMuted();
      doc.text(label, M_LEFT, y);
      doc.setFont("helvetica", "normal");
      setInk();
      doc.text(value, BODY_X, y);
      y += 5.5;
    }
  }

  // ── Kurzprofil (opcionális) ─────────────────────────────────────────────
  if (data.summary.trim()) {
    sectionTitle("Kurzprofil");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    setInk();
    const lines = doc.splitTextToSize(data.summary.trim(), CONTENT_W) as string[];
    for (const line of lines) {
      ensure(5);
      doc.text(line, M_LEFT, y);
      y += 5;
    }
  }

  // ── Berufserfahrung ─────────────────────────────────────────────────────
  const exp = data.experience.filter((e) => e.role.trim() || e.employer.trim());
  if (exp.length) {
    sectionTitle("Berufserfahrung");
    for (const e of exp) {
      ensure(10);
      // dátum-oszlop
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setMuted();
      doc.text(dateRange(e.from, e.to), M_LEFT, y);
      // szerep + munkáltató
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk();
      const roleLine = e.employer.trim() ? `${e.role.trim()}, ${e.employer.trim()}` : e.role.trim();
      const roleLines = doc.splitTextToSize(roleLine, BODY_W) as string[];
      doc.text(roleLines, BODY_X, y);
      y += roleLines.length * 5;
      // leírás
      if (e.desc.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        setInk();
        const descLines = doc.splitTextToSize(e.desc.trim(), BODY_W) as string[];
        for (const line of descLines) {
          ensure(4.6);
          doc.text(line, BODY_X, y);
          y += 4.6;
        }
      }
      y += 3;
    }
  }

  // ── Ausbildung ──────────────────────────────────────────────────────────
  const edu = data.education.filter((e) => e.school.trim() || e.qualification.trim());
  if (edu.length) {
    sectionTitle("Ausbildung");
    for (const e of edu) {
      ensure(9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setMuted();
      doc.text(dateRange(e.from, e.to), M_LEFT, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk();
      const qLines = doc.splitTextToSize(e.qualification.trim() || e.school.trim(), BODY_W) as string[];
      doc.text(qLines, BODY_X, y);
      y += qLines.length * 5;
      if (e.qualification.trim() && e.school.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        setInk();
        const sLines = doc.splitTextToSize(e.school.trim(), BODY_W) as string[];
        for (const line of sLines) {
          ensure(4.6);
          doc.text(line, BODY_X, y);
          y += 4.6;
        }
      }
      y += 3;
    }
  }

  // ── Kenntnisse (Sprachen + weitere) ─────────────────────────────────────
  const langs = data.languages.filter((l) => l.name.trim());
  const hasSkills = data.skills.trim().length > 0;
  if (langs.length || hasSkills) {
    sectionTitle("Kenntnisse");
    if (langs.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      for (const l of langs) {
        ensure(5.5);
        setMuted();
        doc.text("Sprache", M_LEFT, y);
        setInk();
        const val = l.level.trim() ? `${l.name.trim()} — ${l.level.trim()}` : l.name.trim();
        doc.text(val, BODY_X, y);
        y += 5.5;
      }
    }
    if (hasSkills) {
      ensure(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      setMuted();
      doc.text("Weitere", M_LEFT, y);
      setInk();
      const skillLines = doc.splitTextToSize(data.skills.trim(), BODY_W) as string[];
      doc.text(skillLines, BODY_X, y);
      y += skillLines.length * 5.5;
    }
  }

  // ── Ort, Datum + Unterschrift ───────────────────────────────────────────
  ensure(24);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  setInk();
  const place = data.city.trim() ? data.city.trim() : "Ort";
  doc.text(`${place}, den ${todayDe()}`, M_LEFT, y);
  y += 12;
  doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
  doc.setLineWidth(0.3);
  doc.line(M_LEFT, y, M_LEFT + 60, y);
  y += 4;
  setMuted();
  doc.setFontSize(9);
  doc.text("Unterschrift", M_LEFT, y);

  // ── Diszkrét lábléc minden oldalon ──────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text("Lebenslauf", M_LEFT, PAGE_H - 10);
    doc.text(`Seite ${i}/${pages}`, PAGE_W - M_RIGHT, PAGE_H - 10, { align: "right" });
  }

  const safeName = (data.fullName || "Lebenslauf").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
  doc.save(`Lebenslauf_${safeName || "Kinti"}.pdf`);
}
