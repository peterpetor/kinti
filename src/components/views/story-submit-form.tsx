"use client";

import { useRef, useState } from "react";
import { usePreferredCountry } from "@/lib/country-pref";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

/** Ország-illő példa-város a cím-placeholderhez (Svájcban ne Bécs legyen). */
const EXAMPLE_CITY: Record<string, string> = {
  CH: "Zürichben",
  AT: "Bécsben",
  DE: "Münchenben",
  NL: "Amszterdamban",
};

/**
 * StorySubmitForm — „Írd meg a történeted" beküldő (admin-moderált UGC).
 * Egyszerű markdown-részhalmaz (## alcím, **félkövér**, - lista) + opcionális
 * borítókép. Az e-mail PRIVÁT (csak a megjelenés-értesítőhöz).
 */
export function StorySubmitForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const effCountry = country ?? prefCountry ?? DEFAULT_COUNTRY;

  // Formázó-gombok: a kurzornál/kijelölésen dolgoznak (nem kell markdown-t tudni).
  function applyFormat(kind: "h2" | "bold" | "list") {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    let next = value;
    let caret = e;
    if (kind === "bold") {
      const sel = value.slice(s, e) || "fontos rész";
      next = `${value.slice(0, s)}**${sel}**${value.slice(e)}`;
      caret = s + sel.length + 4;
    } else {
      // Sor-eleji jelölés: a kurzor sorának elejére kerül a prefix.
      const lineStart = value.lastIndexOf("\n", Math.max(0, s - 1)) + 1;
      const prefix = kind === "h2" ? "## " : "- ";
      next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      caret = e + prefix.length;
    }
    setBodyMd(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  }

  async function submit() {
    setErr(null);
    if (title.trim().length < 10) { setErr("Adj címet a történetednek (min. 10 karakter)."); return; }
    if (authorName.trim().length < 2) { setErr("Add meg a neved vagy beceneved."); return; }
    if (bodyMd.trim().length < 400) { setErr("Írj kicsit hosszabban (legalább 400 karakter) — a jó történet a részletekben él."); return; }
    if (image && image.size > 2 * 1024 * 1024) { setErr("A kép legfeljebb 2 MB lehet."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("title", title.trim());
      fd.set("authorName", authorName.trim());
      fd.set("country", effCountry);
      fd.set("city", city.trim());
      fd.set("bodyMd", bodyMd);
      fd.set("contactEmail", contactEmail.trim());
      fd.set("turnstileToken", token);
      if (image) fd.set("image", image);
      const res = await fetch("/api/tortenetek", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Nem sikerült a beküldés.");
        turnstileRef.current?.reset();
        setToken("");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setErr("Hálózati hiba.");
    }
    setSubmitting(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]"
      >
        ✍️ Írd meg a saját történeted
      </button>
    );
  }

  if (done) {
    return (
      <div className="space-y-2 rounded-card border border-success/30 bg-success/10 p-5 text-center">
        <p className="text-3xl">🎉</p>
        <p className="text-[14px] font-bold text-ink">Köszönjük! A történeted szerkesztői ellenőrzés után jelenik meg.</p>
        {contactEmail.trim() && <p className="text-[12px] text-ink-muted">E-mailben szólunk, amint kint van.</p>}
      </div>
    );
  }

  const inputCls = "h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink";

  return (
    <div className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-[15.5px] font-extrabold text-ink">✍️ A te történeted</h3>
        <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted">✕</button>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
        placeholder={`Cím — pl. Hogyan lettem autószerelő ${EXAMPLE_CITY[effCountry] ?? EXAMPLE_CITY[DEFAULT_COUNTRY]}`} className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={60}
          placeholder="Neved / beceneved" className={inputCls} />
        <select value={effCountry} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>
      </div>
      <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={60}
        placeholder="Város (opcionális)" className={inputCls} />
      <div>
        {/* Formázó-gombok — nem kell markdown-t ismerni (user-kérés). */}
        <div className="mb-1.5 flex gap-1.5">
          <button type="button" onClick={() => applyFormat("h2")}
            className="rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95">
            Alcím
          </button>
          <button type="button" onClick={() => applyFormat("bold")}
            className="rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-black text-ink transition active:scale-95">
            F <span className="font-bold text-ink-muted">félkövér</span>
          </button>
          <button type="button" onClick={() => applyFormat("list")}
            className="rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95">
            • Lista
          </button>
        </div>
        <textarea ref={bodyRef} value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} maxLength={20000} rows={12}
          placeholder={"Meséld el a saját szavaiddal — hogyan indultál, mi volt nehéz, mi segített…"}
          className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] leading-relaxed text-ink" />
        <p className="mt-1 text-[11px] text-ink-faint">
          {bodyMd.trim().length < 400
            ? `Még ${400 - bodyMd.trim().length} karakter a minimumhoz.`
            : `${bodyMd.length.toLocaleString("hu-HU")} karakter.`}{" "}
          Jelöld ki a szöveget, és koppints a gombokra a formázáshoz.
        </p>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-ink-muted">Borítókép (opcionális, max 2 MB)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-[12.5px] text-ink-muted file:mr-3 file:rounded-pill file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-primary" />
      </div>

      <div>
        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={160}
          placeholder="E-mail (opcionális — szólunk, ha megjelent)" className={inputCls} />
        <p className="mt-1 text-[11px] text-ink-faint">Az e-mail-címed <strong>nem jelenik meg</strong> — csak az értesítéshez használjuk.</p>
      </div>

      {turnstileSiteKey && <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />}
      {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

      <button type="button" onClick={submit} disabled={submitting || !token}
        className="w-full rounded-pill bg-primary py-3 text-[14px] font-black text-white shadow-card disabled:opacity-60">
        {submitting ? "Beküldés…" : "Beküldöm szerkesztői ellenőrzésre"}
      </button>
      <p className="text-[11px] leading-snug text-ink-faint">
        Minden történetet személyesen ellenőrzünk megjelenés előtt. A beküldéssel hozzájárulsz,
        hogy a történeted a kinti.app-on megjelenjen (<a href="/aszf" target="_blank" className="underline underline-offset-2">ÁSZF 3.3</a>),
        és megerősíted, hogy a saját írásod. Adatkezelés: <a href="/adatvedelem" target="_blank" className="underline underline-offset-2">tájékoztató 2.23</a>.
      </p>
    </div>
  );
}
