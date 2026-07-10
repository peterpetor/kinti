"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { JobCategoryOptions } from "@/components/views/job-category-options";
import { CvJobMatch } from "@/components/views/cv-job-match";
import { cvProfessionDe, CV_LANGUAGE_LEVELS } from "@/lib/cv-professions";
import { generateCvPdf, type CvData, type CvExperience, type CvEducation, type CvLanguage } from "@/lib/cv-pdf";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-primary";
const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  birthYear: string;
  categoryId: string;
  customProfession: string;
  yearsExperience: string;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  languages: CvLanguage[];
  skills: string;
  /** Igazolványkép data URL-ként (35:45 arányra vágva) — CSAK a PDF-be, sehová fel nem töltjük. */
  photo: string;
  /** A PDF kiemelőszíne (hex) — szakaszjelölők, fejléc-vonal, szakma-sor. */
  accent: string;
}

/**
 * Böngészőben feldolgozott igazolványkép: 35:45 (portré) arányra vág (crop-to-fill),
 * JPEG-re tömörít. A fájl SOHA nem hagyja el az eszközt — csak a kész data URL kerül
 * (a PDF-be). Hibánál üres stringgel/„error"-ral tér vissza.
 */
function processPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const targetRatio = 35 / 45;
        const srcRatio = img.width / img.height;
        let sw = img.width, sh = img.height, sx = 0, sy = 0;
        if (srcRatio > targetRatio) { sw = img.height * targetRatio; sx = (img.width - sw) / 2; }
        else { sh = img.width / targetRatio; sy = (img.height - sh) / 2; }
        const canvas = document.createElement("canvas");
        canvas.width = 350; canvas.height = 450; // ~254 dpi @ 35×45 mm
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 350, 450);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const emptyExp: CvExperience = { role: "", employer: "", from: "", to: "", desc: "" };
const emptyEdu: CvEducation = { school: "", qualification: "", from: "", to: "" };

const STEPS = ["Adatok", "Szakma", "Tapasztalat", "Végzettség", "Nyelvek & PDF"];

/** PDF-kiemelőszínek — visszafogott, nyomtatásbarát árnyalatok (német HR-konform). */
const ACCENTS: { hex: string; label: string }[] = [
  { hex: "#1d4434", label: "Zöld (klasszikus)" },
  { hex: "#212b36", label: "Antracit" },
  { hex: "#1e4f7a", label: "Kék" },
  { hex: "#6b2233", label: "Bordó" },
];

export function CvWizard() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<FormState>({
    fullName: "", email: "", phone: "", city: "", birthYear: "",
    categoryId: "", customProfession: "", yearsExperience: "", summary: "",
    experience: [{ ...emptyExp }],
    education: [{ ...emptyEdu }],
    languages: [
      { name: "Ungarisch", level: "Muttersprache" },
      { name: "Deutsch", level: "B1 (Fortgeschritten)" },
    ],
    skills: "",
    photo: "",
    accent: ACCENTS[0].hex,
  });
  const [busy, setBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  // Az első sikeres PDF-letöltés élesíti az állásajánlót (CvJobMatch).
  const [pdfDone, setPdfDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const professionDe = useMemo(
    () => f.customProfession.trim() || cvProfessionDe(f.categoryId) || "",
    [f.customProfession, f.categoryId],
  );

  function toCvData(): CvData {
    return {
      fullName: f.fullName.trim(),
      professionDe,
      birthYear: f.birthYear.trim(),
      city: f.city.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      summary: f.summary.trim(),
      experience: f.experience,
      education: f.education,
      languages: f.languages,
      skills: f.skills.trim(),
      accent: f.accent,
    };
  }

  async function downloadPdf() {
    setPdfError(null);
    if (f.fullName.trim().length < 2) { setPdfError("A PDF-hez add meg a neved (1. lépés)."); return; }
    setBusy(true);
    try {
      // A fotó CSAK itt, a PDF-be kerül — a mentés-payload (toCvData) nem tartalmazza.
      await generateCvPdf({ ...toCvData(), photo: f.photo || undefined });
      setPdfDone(true);
    } catch {
      setPdfError("Nem sikerült a PDF készítése. Próbáld újra.");
    } finally {
      setBusy(false);
    }
  }

  async function onPhotoFile(file: File | null) {
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith("image/")) { setPhotoError("Csak képfájl tölthető fel (JPG/PNG)."); return; }
    if (file.size > 12 * 1024 * 1024) { setPhotoError("A kép túl nagy (max. 12 MB)."); return; }
    try {
      set("photo", await processPhoto(file));
    } catch {
      setPhotoError("Nem sikerült feldolgozni a képet. Próbálj másik fájlt.");
    }
  }

  async function saveProfile() {
    if (!consent) return;
    setSaveState("saving"); setSaveError(null);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          fullName: f.fullName, email: f.email, phone: f.phone, city: f.city,
          category: f.categoryId, professionDe, yearsExperience: Number(f.yearsExperience) || 0,
          summary: f.summary, payload: JSON.stringify(toCvData()), _hp: hp,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setSaveError(data.error || "Nem sikerült a mentés."); setSaveState("error"); return; }
      setSaveState("done");
    } catch {
      setSaveError("Hálózati hiba."); setSaveState("error");
    }
  }

  // ── repeatable helpers ────────────────────────────────────────────────
  const updateExp = (i: number, patch: Partial<CvExperience>) =>
    set("experience", f.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const updateEdu = (i: number, patch: Partial<CvEducation>) =>
    set("education", f.education.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const updateLang = (i: number, patch: Partial<CvLanguage>) =>
    set("languages", f.languages.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      {/* Lépés-jelző — a sáv-szegmensek KATTINTHATÓK (szabad oda-vissza ugrás) */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-ink-muted">
          <span>{step + 1}. lépés / {STEPS.length}</span>
          <span className="text-primary">{STEPS[step]}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`${i + 1}. lépés: ${label}`}
              aria-current={i === step ? "step" : undefined}
              className={`h-2 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-surface-alt"} ${i === step ? "" : "opacity-90 hover:opacity-100"}`}
            />
          ))}
        </div>
      </div>

      {/* ── 0: Személyes adatok ── */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Teljes név *</label>
            <input className={inputCls} value={f.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Kovács János" maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Város (Wohnort)</label>
              <input className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="München" maxLength={80} />
            </div>
            <div>
              <label className={labelCls}>Születési év</label>
              <input className={inputCls} inputMode="numeric" value={f.birthYear} onChange={(e) => set("birthYear", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1990" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>E-mail</label>
              <input className={inputCls} inputMode="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="janos@email.com" maxLength={200} />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+49 …" maxLength={40} />
            </div>
          </div>
          {/* Profilkép (Bewerbungsfoto) — opcionális, a böngészőben vágódik 35:45-re */}
          <div>
            <label className={labelCls}>Profilkép (opcionális)</label>
            <div className="flex items-center gap-3">
              <div className="grid h-[60px] w-[47px] shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface-alt">
                {f.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.photo} alt="Profilkép előnézet" className="h-full w-full object-cover" />
                ) : (
                  <Icon name="user" size={20} className="text-ink-faint" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-2 text-[12.5px] font-bold text-ink transition active:scale-[0.98]">
                  <Icon name="upload" size={14} strokeWidth={2.4} />
                  {f.photo ? "Másik kép" : "Kép feltöltése"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { onPhotoFile(e.target.files?.[0] ?? null); e.target.value = ""; }} />
                </label>
                {f.photo && (
                  <button type="button" onClick={() => { set("photo", ""); setPhotoError(null); }} className="ml-2 text-[12px] font-bold text-accent">
                    Eltávolítás
                  </button>
                )}
                {photoError && <p className="mt-1 text-[11.5px] font-semibold text-accent">{photoError}</p>}
              </div>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">
              A kép a böngésződben 35×45 mm-es igazolványkép-arányra vágódik, és <strong>nem töltődik fel sehová</strong> — csak a PDF-be kerül. Sok modern német CV szándékosan fotó nélküli (anonymer Lebenslauf) — nyugodtan kihagyhatod.
            </p>
          </div>
        </div>
      )}

      {/* ── 1: Szakma & profil ── */}
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Szakma (magyarul választd — németre fordítjuk)</label>
            <select className={inputCls} value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Válassz szakmát…</option>
              <JobCategoryOptions />
            </select>
          </div>
          {professionDe && (
            <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-3 py-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Német megnevezés (a CV-ben)</p>
              <p className="text-[15px] font-extrabold text-ink">{professionDe}</p>
            </div>
          )}
          <div>
            <label className={labelCls}>Egyedi megnevezés (opcionális — felülírja a fentit)</label>
            <input className={inputCls} value={f.customProfession} onChange={(e) => set("customProfession", e.target.value)} placeholder="pl. Elektroniker für Betriebstechnik" maxLength={120} />
          </div>
          <div>
            <label className={labelCls}>Tapasztalat (év)</label>
            <input className={inputCls} inputMode="numeric" value={f.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="5" />
          </div>
          <div>
            <label className={labelCls}>Rövid bemutatkozás (Kurzprofil, opcionális)</label>
            <textarea className={`${inputCls} min-h-[80px] resize-y`} value={f.summary} onChange={(e) => set("summary", e.target.value)} placeholder="1-2 mondat magadról, erősségeidről (németül, ha tudsz)." maxLength={600} />
          </div>
        </div>
      )}

      {/* ── 2: Tapasztalat ── */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-[12px] text-ink-muted">A legfrissebb munkahelyed legyen legfelül (a német CV fordított időrendű).</p>
          {f.experience.map((e, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-line bg-surface-alt/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink-muted">{i + 1}. munkahely</span>
                {f.experience.length > 1 && (
                  <button type="button" onClick={() => set("experience", f.experience.filter((_, j) => j !== i))} className="text-[11px] font-bold text-accent">Törlés</button>
                )}
              </div>
              <input className={inputCls} value={e.role} onChange={(ev) => updateExp(i, { role: ev.target.value })} placeholder="Pozíció (pl. Gabelstaplerfahrer)" maxLength={120} />
              <input className={inputCls} value={e.employer} onChange={(ev) => updateExp(i, { employer: ev.target.value })} placeholder="Munkáltató / cég" maxLength={120} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} value={e.from} onChange={(ev) => updateExp(i, { from: ev.target.value })} placeholder="Kezdés (pl. 2020)" maxLength={20} />
                <input className={inputCls} value={e.to} onChange={(ev) => updateExp(i, { to: ev.target.value })} placeholder="Vége (pl. heute)" maxLength={20} />
              </div>
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={e.desc} onChange={(ev) => updateExp(i, { desc: ev.target.value })} placeholder="Feladatok, felelősségek (opcionális)" maxLength={500} />
            </div>
          ))}
          <button type="button" onClick={() => set("experience", [...f.experience, { ...emptyExp }])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-2.5 text-[13px] font-bold text-primary">
            <Icon name="plus" size={15} strokeWidth={2.6} /> Munkahely hozzáadása
          </button>
        </div>
      )}

      {/* ── 3: Végzettség ── */}
      {step === 3 && (
        <div className="space-y-3">
          {f.education.map((e, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-line bg-surface-alt/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink-muted">{i + 1}. végzettség</span>
                {f.education.length > 1 && (
                  <button type="button" onClick={() => set("education", f.education.filter((_, j) => j !== i))} className="text-[11px] font-bold text-accent">Törlés</button>
                )}
              </div>
              <input className={inputCls} value={e.qualification} onChange={(ev) => updateEdu(i, { qualification: ev.target.value })} placeholder="Végzettség / szak (pl. Fachkraft, Abitur)" maxLength={120} />
              <input className={inputCls} value={e.school} onChange={(ev) => updateEdu(i, { school: ev.target.value })} placeholder="Iskola / intézmény neve" maxLength={120} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} value={e.from} onChange={(ev) => updateEdu(i, { from: ev.target.value })} placeholder="Kezdés (pl. 2005)" maxLength={20} />
                <input className={inputCls} value={e.to} onChange={(ev) => updateEdu(i, { to: ev.target.value })} placeholder="Vége (pl. 2009)" maxLength={20} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set("education", [...f.education, { ...emptyEdu }])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-2.5 text-[13px] font-bold text-primary">
            <Icon name="plus" size={15} strokeWidth={2.6} /> Végzettség hozzáadása
          </button>
        </div>
      )}

      {/* ── 4: Nyelvek, készségek, PDF, mentés ── */}
      {step === 4 && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className={labelCls}>Nyelvtudás (Sprachkenntnisse)</label>
            {f.languages.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} flex-1`} value={l.name} onChange={(e) => updateLang(i, { name: e.target.value })} placeholder="Nyelv (pl. Deutsch)" maxLength={40} />
                <select className={`${inputCls} flex-1`} value={l.level} onChange={(e) => updateLang(i, { level: e.target.value })}>
                  <option value="">Szint…</option>
                  {CV_LANGUAGE_LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                </select>
                {f.languages.length > 1 && (
                  <button type="button" onClick={() => set("languages", f.languages.filter((_, j) => j !== i))} aria-label="Törlés" className="shrink-0 rounded-lg px-2 text-accent">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set("languages", [...f.languages, { name: "", level: "" }])} className="text-[12px] font-bold text-primary">+ Nyelv hozzáadása</button>
          </div>
          <div>
            <label className={labelCls}>Egyéb készségek (Weitere Kenntnisse, opcionális)</label>
            <textarea className={`${inputCls} min-h-[60px] resize-y`} value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="pl. Führerschein C+E, Staplerschein, MS Office, EDV-Grundkenntnisse" maxLength={400} />
          </div>

          {/* PDF-megjelenés: kiemelőszín + élő fejléc-előnézet */}
          <div>
            <label className={labelCls}>A PDF kiemelőszíne</label>
            <div className="flex items-center gap-2.5">
              {ACCENTS.map((a) => (
                <button
                  key={a.hex}
                  type="button"
                  onClick={() => set("accent", a.hex)}
                  aria-label={a.label}
                  aria-pressed={f.accent === a.hex}
                  title={a.label}
                  className={`h-8 w-8 rounded-full transition active:scale-95 ${f.accent === a.hex ? "ring-2 ring-primary ring-offset-2 ring-offset-surface scale-110" : "opacity-80 hover:opacity-100"}`}
                  style={{ backgroundColor: a.hex }}
                />
              ))}
            </div>
          </div>
          {/* Papír-előnézet: SZÁNDÉKOSAN fix fehér + fix sötét szöveg (a PDF-lapot
              mutatja) — sötét módban is fehér marad, minden szín hardcode-olt. */}
          <div className="overflow-hidden rounded-xl border border-line bg-white p-4 shadow-card" aria-hidden="true">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#8a939c]">PDF-előnézet (fejléc)</p>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-extrabold leading-tight text-[#212b36]">
                  {f.fullName.trim() || "Vor- und Nachname"}
                </p>
                {professionDe && (
                  <p className="mt-0.5 truncate text-[12.5px] font-bold" style={{ color: f.accent }}>
                    {professionDe}
                  </p>
                )}
                {(f.phone.trim() || f.email.trim()) && (
                  <p className="mt-1 truncate text-[10.5px] text-[#6e7882]">
                    {[f.phone.trim(), f.email.trim()].filter(Boolean).join("   ·   ")}
                  </p>
                )}
              </div>
              {f.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.photo} alt="" className="h-[54px] w-[42px] shrink-0 rounded-[3px] border border-[#c8ced4] object-cover" />
              )}
            </div>
            <div className="mt-3 h-[3px] w-full rounded-full" style={{ backgroundColor: f.accent }} />
          </div>

          {/* PDF letöltés */}
          <button type="button" onClick={downloadPdf} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-4 py-3 text-[15px] font-extrabold text-white transition active:scale-[0.98] disabled:opacity-60">
            <Icon name="document" size={17} strokeWidth={2.4} />
            {busy ? "Készül a PDF…" : "Német önéletrajz letöltése (PDF)"}
          </button>
          {pdfError && <p className="text-[12.5px] font-semibold text-accent">{pdfError}</p>}
          <p className="text-center text-[11px] text-ink-faint">A PDF a böngésződben készül — az adataid nem hagyják el az eszközöd.</p>

          {/* Intelligens állásajánló: a kész CV szakmájára illő aktív hirdetések. */}
          <CvJobMatch categoryId={f.categoryId} armed={pdfDone} />


          {/* Opcionális, hozzájárulás-alapú mentés */}
          {saveState === "done" ? (
            <div className="rounded-xl border border-success/30 bg-success/5 px-3 py-2.5 text-[13px] font-semibold text-success">
              ✓ Profilod mentve — ha megfelelő állás van, magyar munkaközvetítő megkeres. Törlést az info@kinti.app-on kérhetsz.
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-surface-alt/40 p-3">
              <label className="flex items-start gap-2.5 text-[12.5px] leading-snug text-ink">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                <span>
                  <strong>Keressenek meg állással.</strong> Hozzájárulok, hogy a fenti profilomat (név + elérhetőség
                  + szakma) a Kinti tárolja, és magyar munkaközvetítő megkereshessen. Bármikor visszavonható. Részletek:{" "}
                  <a href="/adatvedelem" target="_blank" className="underline">Adatvédelem</a>.
                </span>
              </label>
              {/* Honeypot */}
              <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
              <button type="button" onClick={saveProfile} disabled={!consent || saveState === "saving"} className="mt-2.5 w-full rounded-pill border border-primary/30 bg-primary-soft/40 px-4 py-2 text-[13.5px] font-bold text-primary transition active:scale-[0.98] disabled:opacity-50">
                {saveState === "saving" ? "Mentés…" : "Profil mentése + megkeresés kérése"}
              </button>
              {saveError && <p className="mt-1 text-[12px] font-semibold text-accent">{saveError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Navigáció */}
      <div className="mt-5 flex items-center gap-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-pill border border-line bg-surface px-4 py-2.5 text-[14px] font-bold text-ink-muted transition active:scale-[0.98]">
            Vissza
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="ml-auto rounded-pill bg-primary px-5 py-2.5 text-[14px] font-extrabold text-white transition active:scale-[0.98]">
            Tovább
          </button>
        )}
      </div>
    </div>
  );
}
