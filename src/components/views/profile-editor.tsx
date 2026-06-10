"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { isSwissAddress } from "@/lib/cantons";
import {
  type WorkingHours,
  type DayHours,
  parseWorkingHours,
  calculateBusinessHoursStatus,
  HUNGARIAN_DAY_NAMES,
} from "@/lib/hours";

export interface ProfileEditorProps {
  businessId: string;
  initialName: string;
  initialPhone: string | null;
  initialBlurb: string | null;
  initialAddress: string | null;
  initialCategoryLabel: string | null;
  initialOpenText: string | null;
  initialWorkingHours: string | null;
  initialSocialLinks: string | null;
  initialYearsHere?: number | null;
  initialLanguages?: string[] | null;
}

type Phase = "idle" | "saving" | "success" | "error";

export function ProfileEditor({
  initialName,
  initialPhone,
  initialBlurb,
  initialAddress,
  initialCategoryLabel,
  initialOpenText,
  initialWorkingHours,
  initialSocialLinks,
  initialYearsHere,
  initialLanguages,
}: ProfileEditorProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [blurb, setBlurb] = useState(initialBlurb ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");
  const [categoryLabel, setCategoryLabel] = useState(initialCategoryLabel ?? "");
  const [openText, setOpenText] = useState(initialOpenText ?? "");
  const [yearsHere, setYearsHere] = useState(initialYearsHere != null ? String(initialYearsHere) : "");
  const [languages, setLanguages] = useState<string[]>(initialLanguages ?? ["Magyar"]);

  const availableLanguages = ["Magyar", "Deutsch", "English", "Français", "Italiano"];

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  // Nyitvatartás napokra lebontva
  const [workingHours, setWorkingHours] = useState<WorkingHours>(() =>
    parseWorkingHours(initialWorkingHours)
  );

  // Közösségi linkek
  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      const parsed = initialSocialLinks ? JSON.parse(initialSocialLinks) : {};
      return {
        facebook: parsed.facebook ?? "",
        instagram: parsed.instagram ?? "",
        linkedin: parsed.linkedin ?? "",
        booking: parsed.booking ?? "",
      };
    } catch {
      return { facebook: "", instagram: "", linkedin: "", booking: "" };
    }
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  // Élő státusz számítás kliens oldalon
  const [previewStatus, setPreviewStatus] = useState(() =>
    calculateBusinessHoursStatus(workingHours)
  );

  useEffect(() => {
    setPreviewStatus(calculateBusinessHoursStatus(workingHours));
  }, [workingHours]);

  const handleHoursChange = (day: keyof WorkingHours, field: keyof DayHours, value: string | boolean) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSocialChange = (key: string, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // A kinti svájci szolgáltatás → csak svájci cím engedélyezett (ha van megadva).
  const addressInvalid = address.trim().length > 0 && !isSwissAddress(address);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (addressInvalid) {
      setError(
        "Csak svájci cím adható meg. Tüntesd fel a svájci várost és irányítószámot (pl. Bahnhofstrasse 10, 8001 Zürich).",
      );
      setPhase("error");
      return;
    }

    setPhase("saving");
    setError(null);

    try {
      const res = await fetch("/api/owner/update-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          blurb,
          address,
          categoryLabel,
          openText,
          workingHours: JSON.stringify(workingHours),
          socialLinks: JSON.stringify(socialLinks),
          yearsHere: yearsHere ? parseInt(yearsHere) : null,
          languages,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Mentés hiba.");
      }

      setPhase("success");
      setTimeout(() => setPhase("idle"), 4000);
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba történt.";
      setError(message);
      setPhase("error");
    }
  }

  const daysOrder: (keyof WorkingHours)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-start">
      {/* Bal oldali Szerkesztő Form (7 oszlop) */}
      <form onSubmit={handleSave} className="space-y-4 md:col-span-7">
        <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-1">
            <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted flex items-center gap-1.5">
              <Icon name="sliders" size={12} strokeWidth={2.4} className="text-primary" /> Profil Szerkesztése
            </h3>
          </div>

          {/* Vállalkozás adatai */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                Név <strong className="text-accent">*</strong>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pl. Kovács Anna Fodrászat"
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  Telefonszám
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Pl. +41 79 123 45 67"
                  className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  Cím <span className="text-ink-faint normal-case font-medium">(csak svájci 🇨🇭)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Pl. Bahnhofstrasse 10, 8001 Zürich"
                  aria-invalid={addressInvalid}
                  className={cn(
                    "w-full rounded-[12px] border bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 transition-all",
                    addressInvalid
                      ? "border-accent/60 focus:ring-accent/30"
                      : "border-line focus:ring-primary/30",
                  )}
                />
                {addressInvalid && (
                  <p className="flex items-start gap-1 text-[11px] font-semibold text-accent">
                    <Icon name="close" size={12} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                    Csak svájci cím adható meg — tüntesd fel a svájci várost és
                    irányítószámot (pl. 8001 Zürich).
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  Egyedi kategória felirat
                </label>
                <input
                  type="text"
                  value={categoryLabel}
                  onChange={(e) => setCategoryLabel(e.target.value)}
                  placeholder="Pl. Női Fodrász, Burkoló"
                  className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Alternatív nyitvatartás szöveg</span>
                  <span className="text-[9px] text-ink-faint font-medium">ha nem nap alapú</span>
                </label>
                <input
                  type="text"
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  placeholder="Pl. Bejelentkezés alapján"
                  className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  Mióta élsz kint Svájcban? (év)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={yearsHere}
                  onChange={(e) => setYearsHere(e.target.value)}
                  placeholder="Pl. 6"
                  className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                  Beszélt nyelvek
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableLanguages.map((lang) => {
                    const active = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer active:scale-95",
                          active
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-surface-alt border-line text-ink-muted"
                        )}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                Leírás
              </label>
              <textarea
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="Mutasd be pár mondatban a szolgáltatásodat..."
                rows={3}
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Nyitvatartás napokra lebontva szekció */}
        <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-1">
            <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted flex items-center gap-1.5">
              <Icon name="clock" size={12} strokeWidth={2.4} className="text-primary" /> Heti Nyitvatartás
            </h3>
          </div>

          <div className="space-y-2">
            {daysOrder.map((day) => {
              const hours = workingHours[day];
              return (
                <div
                  key={day}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-alt p-2.5 border border-line/40"
                >
                  <span className="w-18 text-[13px] font-bold text-ink">
                    {HUNGARIAN_DAY_NAMES[day]}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Zárva checkbox */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleHoursChange(day, "closed", e.target.checked)}
                        className="rounded border-line text-primary focus:ring-primary/30 h-4 w-4"
                      />
                      <span className="text-[12px] font-bold text-ink-muted">Zárva</span>
                    </label>

                    {/* Időpont választók */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        disabled={hours.closed}
                        value={hours.open}
                        onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                        placeholder="08:00"
                        className="w-14 rounded-lg border border-line bg-surface px-1.5 py-1 text-center text-[12px] font-bold text-ink disabled:opacity-40 disabled:bg-surface-alt transition-all"
                      />
                      <span className="text-ink-faint text-xs font-semibold">-</span>
                      <input
                        type="text"
                        disabled={hours.closed}
                        value={hours.close}
                        onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                        placeholder="18:00"
                        className="w-14 rounded-lg border border-line bg-surface px-1.5 py-1 text-center text-[12px] font-bold text-ink disabled:opacity-40 disabled:bg-surface-alt transition-all"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Közösségi és foglalási linkek szekció */}
        <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-1">
            <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted flex items-center gap-1.5">
              <Icon name="globe" size={12} strokeWidth={2.4} className="text-primary" /> Közösségi Linkek
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                <span className="text-[#1877F2]"><Icon name="facebook" size={13} /></span> Facebook URL
              </label>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                placeholder="https://facebook.com/oldalad"
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                <span className="text-[#E4405F]"><Icon name="instagram" size={13} /></span> Instagram URL
              </label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
                placeholder="https://instagram.com/profilod"
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                <span className="text-[#0A66C2]"><Icon name="linkedin" size={13} /></span> LinkedIn URL
              </label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/profilod"
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                <span className="text-primary"><Icon name="calendar" size={13} /></span> Foglalási rendszer (pl. Calendly)
              </label>
              <input
                type="url"
                value={socialLinks.booking}
                onChange={(e) => handleSocialChange("booking", e.target.value)}
                placeholder="https://calendly.com/fiókod"
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Mentés visszajelzés */}
        {phase === "success" && (
          <div className="rounded-[12px] border border-success/30 bg-success-soft px-3 py-2.5 text-[12px] font-bold text-success flex items-center gap-1.5 animate-fade-in">
            <Icon name="check" size={13} strokeWidth={2.4} /> A profil adatai sikeresen frissítve!
          </div>
        )}
        {error && (
          <div className="rounded-[12px] border border-accent/30 bg-accent-soft px-3 py-2.5 text-[12px] font-bold text-accent flex items-center gap-1.5 animate-shake">
            <Icon name="close" size={13} strokeWidth={2.4} /> {error}
          </div>
        )}

        {/* Mentés gomb */}
        <button
          type="submit"
          disabled={phase === "saving" || addressInvalid}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99] border-none",
            (phase === "saving" || addressInvalid) && "cursor-not-allowed opacity-50"
          )}
        >
          {phase === "saving" ? "Mentés…" : "Módosítások mentése"}
          {phase !== "saving" && <Icon name="arrowRight" size={14} strokeWidth={2.4} />}
        </button>
      </form>

      {/* Jobb oldali Live Preview Mobil Mockup Device (5 oszlop) */}
      <div className="hidden md:block md:col-span-5 md:sticky md:top-20">
        <div className="text-center mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-faint bg-surface border border-line px-2.5 py-1 rounded-full shadow-sm">
            ✨ Élő Mobil Előnézet
          </span>
        </div>

        {/* Gyönyörű Mobil Mockup Váz */}
        <div className="relative mx-auto w-[290px] h-[580px] rounded-[38px] border-[7px] border-ink/90 bg-bg shadow-2xl overflow-hidden flex flex-col transition-all">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3.5 rounded-full bg-ink/90 z-20" />

          {/* Telefon képernyő tartalom */}
          <div className="flex-1 overflow-y-auto scrollbar-none pb-4 text-left">
            {/* Borítókép mockup */}
            <div className="relative h-[150px] bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden">
              <span className="text-ink-muted/30"><Icon name="globe" size={36} /></span>
              {/* Kis vissza nyíl és megosztók a telefonon */}
              <div className="absolute inset-x-0 top-6 flex gap-1.5 px-3">
                <span className="grid h-[24px] w-[24px] place-items-center rounded-lg bg-white/90 text-ink text-[10px]">
                  <Icon name="arrowLeft" size={12} />
                </span>
                <span className="flex-1" />
                <div className="flex gap-1">
                  <span className="grid h-[24px] w-[24px] place-items-center rounded-lg bg-white/90 text-ink">
                    <Icon name="share" size={11} />
                  </span>
                  <span className="grid h-[24px] w-[24px] place-items-center rounded-lg bg-white/90 text-accent">
                    <Icon name="heart" size={11} />
                  </span>
                </div>
              </div>
            </div>

            {/* Profil tartalom a telefonon */}
            <div className="relative -mt-4 rounded-t-2xl bg-bg px-3.5 pt-3.5 space-y-3.5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-primary mb-0.5">
                  {categoryLabel || "Kategória"}
                </p>
                <h4 className="text-[17px] font-extrabold leading-tight text-ink truncate">
                  {name || "Vállalkozásod neve"}
                </h4>
              </div>

              {/* Meta sor */}
              <div className="flex items-center gap-3 border-y border-line/30 py-2 text-[10.px]">
                <div className="flex-1">
                  <div className="flex items-center gap-0.5 font-bold text-ink">
                    <Icon name="star" size={10} filled className="text-star" />
                    <span>5.0</span>
                  </div>
                  <div className="text-[9px] text-ink-muted">12 vélemény</div>
                </div>
                <span className="h-6 w-px bg-line/40" />
                <div className="flex-1">
                  <div className="font-bold text-ink">2.4 km</div>
                  <div className="text-[9px] text-ink-muted">Zürich</div>
                </div>
                <span className="h-6 w-px bg-line/40" />
                <div className="flex-1">
                  {/* ÉLŐ STÁTUSZ KIJELZÉS A MOBIL MOCKUPON */}
                  <div
                    className={cn(
                      "font-bold flex items-center gap-1 text-[11px]",
                      previewStatus.isOpen ? "text-success" : "text-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        previewStatus.isOpen ? "bg-success animate-pulse" : "bg-accent"
                      )}
                    />
                    {previewStatus.isOpen ? "Nyitva" : "Zárva"}
                  </div>
                  <div className="text-[9px] text-ink-muted truncate capitalize">
                    {previewStatus.detailText}
                  </div>
                </div>
              </div>

              {/* Akció gombok */}
              <div className="flex gap-1.5">
                <span className="flex-1 flex h-8 items-center justify-center gap-1 rounded-lg bg-primary text-white text-[11px] font-bold shadow-sm opacity-90">
                  <Icon name="phone" size={11} /> Hívás
                </span>
                <span className="flex-1 flex h-8 items-center justify-center gap-1 rounded-lg bg-surface text-ink text-[11px] font-bold border border-line shadow-sm">
                  <Icon name="nav" size={11} /> Útvonal
                </span>
              </div>

              {/* Közösségi linkek a telefonon */}
              {(socialLinks.facebook || socialLinks.instagram || socialLinks.linkedin || socialLinks.booking) && (
                <div className="flex items-center gap-1.5 rounded-xl bg-surface px-2.5 py-1.5 border border-line">
                  <span className="text-[8px] font-extrabold uppercase tracking-wide text-ink-muted">
                    Közösség:
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {socialLinks.facebook && (
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-alt text-[#1877F2] border border-line/40">
                        <Icon name="facebook" size={12} />
                      </span>
                    )}
                    {socialLinks.instagram && (
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-alt text-[#E4405F] border border-line/40">
                        <Icon name="instagram" size={12} />
                      </span>
                    )}
                    {socialLinks.linkedin && (
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-alt text-[#0A66C2] border border-line/40">
                        <Icon name="linkedin" size={12} />
                      </span>
                    )}
                    {socialLinks.booking && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-primary text-white text-[8px] font-bold">
                        <Icon name="calendar" size={9} /> Foglalás
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Leírás */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Erről a helyről
                </span>
                <p className="text-[11.5px] leading-relaxed text-ink/90 line-clamp-4">
                  {blurb || "Ide kerül a vállalkozásod rövid, csalogató bemutató szövege..."}
                </p>
              </div>

              {/* Chips mockup */}
              <div className="flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[9px] font-bold text-ink">
                  <Icon name="clock" size={9} className="text-primary" />
                  {openText || `${previewStatus.statusText} · ${previewStatus.detailText}`}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[9px] font-bold text-ink">
                  <Icon name="globe" size={9} className="text-primary" /> Magyar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
