"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useIsPro } from "@/lib/use-is-pro";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";
import { readyRegistration } from "@/lib/push-client";

interface Deadline {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  emoji: string;
}

interface Preset {
  title: string;
  emoji: string;
  /** ha fix éves dátum (MM-DD), kiszámoljuk a következő előfordulást; különben üres = a user adja meg. */
  annual?: string;
}

/** Ország-tudatos sablonok a leggyakoribb bevándorló-határidőkre. */
const PRESETS: Record<string, Preset[]> = {
  CH: [
    { title: "Krankenkasse-váltás határideje", emoji: "🏥", annual: "11-30" },
    { title: "Adóbevallás (Steuererklärung)", emoji: "🧾", annual: "03-31" },
    { title: "Tartózkodási engedély megújítása (B/L)", emoji: "🪪" },
    { title: "Autó-biztosítás / vignetta", emoji: "🚗", annual: "01-31" },
  ],
  AT: [
    { title: "Arbeitnehmerveranlagung (adó)", emoji: "🧾", annual: "06-30" },
    { title: "Aufenthaltstitel megújítása", emoji: "🪪" },
    { title: "e-card / ÖGK ügyek", emoji: "🏥" },
    { title: "Pickerl (műszaki) / KFZ-biztosítás", emoji: "🚗" },
  ],
  DE: [
    { title: "Steuererklärung (adóbevallás)", emoji: "🧾", annual: "07-31" },
    { title: "Aufenthaltstitel megújítása", emoji: "🪪" },
    { title: "Krankenkasse ügyek", emoji: "🏥" },
    { title: "TÜV (műszaki) / KFZ-biztosítás", emoji: "🚗" },
  ],
  NL: [
    { title: "Belastingaangifte (adóbevallás)", emoji: "🧾", annual: "05-01" },
    { title: "Verblijfsvergunning megújítása", emoji: "🪪" },
    { title: "Zorgverzekering (egészségbiztosítás)", emoji: "🏥" },
    { title: "APK (műszaki) / autó-biztosítás", emoji: "🚗" },
  ],
};
const COMMON: Preset[] = [
  { title: "Útlevél / személyi megújítása", emoji: "📘" },
  { title: "Iskolai / óvodai beiratkozás", emoji: "🎒" },
  { title: "Lakásbérlet felmondási határidő", emoji: "🏠" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Egy MM-DD éves dátum következő előfordulása (ma vagy utána). */
function nextAnnual(mmdd: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const cand = `${y}-${mmdd}`;
  return cand >= todayISO() ? cand : `${y + 1}-${mmdd}`;
}

function daysUntil(dateISO: string): number {
  const d = new Date(dateISO + "T00:00:00");
  const t = new Date(todayISO() + "T00:00:00");
  return Math.round((d.getTime() - t.getTime()) / 86_400_000);
}

/**
 * Határidő-asszisztens (PRO) — „soha ne maradj le egy határidőről": a személyes
 * határidőidet (tartózkodási engedély, biztosítás, adó, iskola…) követi,
 * sürgősség szerint, ország-tudatos sablonokkal + a /hivatalos linkjeivel.
 * Privacy-tiszta: minden a böngésződben (localStorage), semmi nem megy a szerverre.
 */
export function HataridoAssistant() {
  const isPro = useIsPro();
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;

  const [items, setItems] = usePersistedState<Deadline[]>("kinti_deadlines", []);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.date.localeCompare(b.date)),
    [items],
  );

  function add(t: string, d: string, emoji: string) {
    const tt = t.trim();
    if (!tt || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    setItems((arr) => [...arr, { id: crypto.randomUUID(), title: tt, date: d, emoji }]);
  }
  function addManual() {
    add(title, date, "🗓️");
    setTitle("");
    setDate("");
  }
  function addPreset(p: Preset) {
    add(p.title, p.annual ? nextAnnual(p.annual) : todayISO(), p.emoji);
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((x) => x.id !== id));
  }

  // — Push-emlékeztető (a határidőket az ANONIM push-endpointhoz kötjük; nincs
  // user-azonosító — privacy-tiszta, mint a radarok). 14/7/1 nappal előtte szól. —
  const [remindersOn, setRemindersOn] = usePersistedState<boolean>("kinti_deadlines_reminders", false);
  const [subJson, setSubJson] = usePersistedState<PushSubscriptionJSON | null>("kinti_deadlines_sub", null);
  const [busy, setBusy] = useState(false);
  const [pushErr, setPushErr] = useState<string | null>(null);

  async function getSub(): Promise<PushSubscriptionJSON | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return null;
    if (Notification.permission === "denied") return null;
    if ((await Notification.requestPermission()) !== "granted") return null;
    const reg = await readyRegistration(); // hang-biztos (nem fagy be, ha nincs aktív SW)
    if (!reg) return null;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }
    return sub.toJSON();
  }

  async function syncTo(sub: PushSubscriptionJSON, enabled: boolean, list: Deadline[]) {
    await fetch("/api/deadlines/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription: sub, enabled, deadlines: list.map((d) => ({ title: d.title, date: d.date })) }),
    });
  }

  async function enableReminders() {
    setBusy(true);
    setPushErr(null);
    try {
      const sub = await getSub();
      if (!sub) { setPushErr("Engedélyezd az értesítéseket a böngészőben / appban."); return; }
      setSubJson(sub);
      await syncTo(sub, true, items);
      setRemindersOn(true);
    } catch {
      setPushErr("Nem sikerült bekapcsolni — próbáld újra.");
    } finally {
      setBusy(false);
    }
  }

  async function disableReminders() {
    setBusy(true);
    try { if (subJson) await syncTo(subJson, false, []); } catch { /* best-effort */ }
    setRemindersOn(false);
    setBusy(false);
  }

  // Bekapcsolt emlékeztetőnél a határidők változásakor újraszinkronizálunk (debounce).
  useEffect(() => {
    if (!remindersOn || !subJson) return;
    const t = setTimeout(() => { syncTo(subJson, true, items).catch(() => {}); }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, remindersOn, subJson]);

  if (isPro === null) {
    return <div className="rounded-card border border-line bg-surface p-6 text-center text-[13px] text-ink-muted">Betöltés…</div>;
  }
  if (isPro === false) {
    return (
      <div className="rounded-card border-2 border-star/30 bg-star/5 p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[14px] bg-star text-white">
          <Icon name="lock" size={22} strokeWidth={2.4} />
        </div>
        <p className="text-[15px] font-extrabold text-ink">Határidő-asszisztens — PRO funkció</p>
        <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-muted">
          Soha ne maradj le egy fontos határidőről (tartózkodási engedély, biztosítás, adó, iskola) —
          az asszisztens számon tartja és figyelmeztet.
        </p>
        <Link href="/pro" className="mt-4 inline-flex items-center justify-center rounded-pill bg-star px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]">
          Kinti PRO feloldása
        </Link>
      </div>
    );
  }

  const presets = [...(PRESETS[country] ?? PRESETS.CH), ...COMMON];

  return (
    <div className="space-y-4">
      {/* Aktív határidők */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="bell" size={15} strokeWidth={2.2} className="text-primary" />
          <h2 className="text-[14px] font-extrabold text-ink">A határidőid</h2>
        </div>

        {sorted.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-line bg-surface-alt px-3 py-4 text-center text-[12.5px] text-ink-muted">
            Még nincs határidőd — add hozzá lent egy sablonnal vagy kézzel.
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((d) => {
              const n = daysUntil(d.date);
              const tone =
                n < 0 ? "border-accent/40 bg-accent/5 text-accent"
                : n <= 7 ? "border-accent/30 bg-accent/5"
                : n <= 30 ? "border-pro/30 bg-pro/5"
                : "border-line bg-surface";
              const label =
                n < 0 ? `${Math.abs(n)} napja lejárt`
                : n === 0 ? "MA!"
                : n === 1 ? "holnap"
                : `${n} nap múlva`;
              return (
                <div key={d.id} className={cn("flex items-center gap-3 rounded-[12px] border px-3 py-2.5", tone)}>
                  <span className="text-xl shrink-0">{d.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-ink truncate">{d.title}</div>
                    <div className="text-[11.5px] text-ink-muted">
                      {new Date(d.date + "T00:00:00").toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  </div>
                  <span className={cn("shrink-0 text-[12px] font-extrabold", n <= 7 ? "text-accent" : n <= 30 ? "text-pro" : "text-ink-muted")}>
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    aria-label="Törlés"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-alt active:scale-90"
                  >
                    <Icon name="close" size={13} strokeWidth={2.4} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Push-emlékeztető — a „működik, ha nem is nyitod meg" érték */}
      <section className={cn("rounded-card border p-4 shadow-card", remindersOn ? "border-primary/40 bg-primary-soft/30" : "border-line bg-surface")}>
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">{remindersOn ? "🔔" : "🔕"}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-extrabold text-ink">
              {remindersOn ? "Emlékeztető bekapcsolva" : "Push-emlékeztető"}
            </div>
            <p className="text-[11.5px] leading-snug text-ink-muted">
              {remindersOn
                ? "14, 7 és 1 nappal a határidő előtt szólunk — akkor is, ha nem nyitod meg az appot."
                : "Kapj értesítést a határidők előtt, app-megnyitás nélkül is."}
            </p>
          </div>
          <button
            type="button"
            onClick={remindersOn ? disableReminders : enableReminders}
            disabled={busy}
            className={cn(
              "shrink-0 rounded-pill px-3.5 py-1.5 text-[12.5px] font-extrabold transition active:scale-95",
              busy ? "bg-surface-alt text-ink-muted"
              : remindersOn ? "border border-line bg-surface text-ink"
              : "bg-primary text-white shadow-card",
            )}
          >
            {busy ? "…" : remindersOn ? "Kikapcsolás" : "Bekapcsolom"}
          </button>
        </div>
        {pushErr && <p className="mt-2 text-[11.5px] font-bold text-accent">{pushErr}</p>}
      </section>

      {/* Gyors hozzáadás — sablonok */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">Gyors hozzáadás</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => addPreset(p)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink transition hover:bg-surface active:scale-95"
            >
              <span>{p.emoji}</span> {p.title}
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-snug text-ink-faint">
          A sablon hozzáadja a tételt (a fix éves dátumokat — pl. adó, Krankenkasse — kitölti);
          a dátumot bármikor módosíthatod, ha törlöd és kézzel adod meg a sajátodat.
        </p>
      </section>

      {/* Kézi hozzáadás */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">Saját határidő</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pl. Tartózkodási engedély megújítása"
          className="h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] font-medium text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 flex-1 rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] font-medium text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={addManual}
            disabled={!title.trim() || !date}
            className={cn(
              "rounded-[12px] px-4 text-[13.5px] font-extrabold transition active:scale-95",
              title.trim() && date ? "bg-primary text-white shadow-card" : "bg-surface-alt text-ink-muted cursor-not-allowed",
            )}
          >
            Hozzáadom
          </button>
        </div>
      </section>

      {/* Hivatalos linkek */}
      <Link
        href="/hivatalos"
        className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition hover:border-primary/30 active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary text-lg">🏛️</span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-extrabold text-ink">Hol intézheted?</div>
          <p className="text-[11.5px] text-ink-muted">Hivatalos linkek és időpontfoglalás országonként.</p>
        </div>
        <Icon name="chevR" size={15} className="shrink-0 text-ink-muted" />
      </Link>

      <p className="px-1 text-[10.5px] leading-snug text-ink-faint">
        A határidőid CSAK a böngésződben tárolódnak (semmi nem megy a szerverre). A dátumok tájékoztató
        jellegűek — a pontos határidőt mindig a hivatalos forrásnál ellenőrizd.
      </p>
    </div>
  );
}
