"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { confirmDialog } from "@/lib/confirm";
import { cn } from "@/lib/cn";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";
import { readPreferredCanton } from "@/lib/canton-pref";
import { haptic } from "@/lib/haptics";

type Status = "checking" | "unsupported" | "ios-install" | "denied" | "unsubscribed" | "subscribed";
interface Prefs { notifyBusiness: boolean; notifyJob: boolean; notifyDaily: boolean; notifyKeresek: boolean; notifyHousing: boolean }

export function NotificationSettings() {
  const [status, setStatus] = useState<Status>("checking");
  const [prefs, setPrefs] = useState<Prefs>({ notifyBusiness: true, notifyJob: true, notifyDaily: true, notifyKeresek: true, notifyHousing: true });
  const [busy, setBusy] = useState(false);

  async function loadPrefs(endpoint: string) {
    try {
      const res = await fetch(`/api/push/preferences?endpoint=${encodeURIComponent(endpoint)}`);
      const data = (await res.json().catch(() => ({}))) as { preferences?: Prefs };
      if (data.preferences) setPrefs(data.preferences);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
          const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
          const standalone =
            window.matchMedia?.("(display-mode: standalone)").matches ||
            (navigator as unknown as { standalone?: boolean }).standalone === true;
          setStatus(isIos && !standalone ? "ios-install" : "unsupported");
          return;
        }
        if (Notification.permission === "denied") { setStatus("denied"); return; }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await loadPrefs(sub.endpoint);
          setStatus("subscribed");
        } else {
          setStatus("unsubscribed");
        }
      } catch {
        setStatus("unsupported");
      }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setStatus(perm === "denied" ? "denied" : "unsubscribed"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), cantonCode: readPreferredCanton() }),
      });
      await loadPrefs(sub.endpoint);
      setStatus("subscribed");
    } catch {
      setStatus("unsubscribed");
    } finally {
      setBusy(false);
    }
  }

  async function togglePref(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      await fetch("/api/push/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, ...next }),
      });
    } catch {
      setPrefs(prefs); // visszaállítás hibánál
    }
  }

  async function disableAll() {
    if (!(await confirmDialog({ message: "Biztosan kikapcsolod az összes régió-értesítést?", confirmLabel: "Kikapcsolás" }))) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Kanton-értesítések */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
            <Icon name="bell" size={16} strokeWidth={2.2} />
          </span>
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">Régió-értesítések</h2>
        </div>
        <p className="mb-3 text-[12.5px] leading-snug text-ink-muted">
          Push, ha új tartalom kerül a régiódba. Kategóriánként ki-be kapcsolható.
        </p>

        {status === "checking" && <div className="h-20 animate-pulse rounded-xl bg-surface-alt/50" />}

        {(status === "unsupported" || status === "ios-install" || status === "denied") && (
          <p className="rounded-xl bg-surface-alt px-3 py-2.5 text-[12.5px] text-ink-muted">
            {status === "ios-install"
              ? "iPhone-on előbb tedd ki a kezdőképernyőre (Megosztás → „Főképernyőhöz adás”), utána kapcsolhatod be."
              : status === "denied"
                ? "Az értesítések le vannak tiltva a böngésződben — engedélyezd a kinti.app-hoz a beállításokban."
                : "A böngésződ nem támogatja a push-értesítést."}
          </p>
        )}

        {status === "unsubscribed" && (
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="w-full rounded-pill bg-primary px-4 py-3 text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "…" : "Értesítések bekapcsolása"}
          </button>
        )}

        {status === "subscribed" && (
          <div className="space-y-2.5">
            <ToggleRow
              icon="🏪"
              label="Új magyar vállalkozás"
              hint="Ha jóváhagynak egy új vállalkozást a régiódban."
              on={prefs.notifyBusiness}
              onToggle={() => togglePref("notifyBusiness")}
            />
            <ToggleRow
              icon="💼"
              label="Új állás"
              hint="Ha új álláshirdetést hagynak jóvá a régiódban."
              on={prefs.notifyJob}
              onToggle={() => togglePref("notifyJob")}
            />
            <ToggleRow
              icon="🙋"
              label="Új Keresek-hirdetés"
              hint="Ha valaki szakembert keres a régiódban — hátha épp téged."
              on={prefs.notifyKeresek}
              onToggle={() => togglePref("notifyKeresek")}
            />
            <ToggleRow
              icon="🔑"
              label="Új albérlet-hirdetés"
              hint="Ha új kiadó szobát vagy lakást hagynak jóvá a régiódban."
              on={prefs.notifyHousing}
              onToggle={() => togglePref("notifyHousing")}
            />
            <button
              type="button"
              onClick={disableAll}
              disabled={busy}
              className="mt-1 w-full rounded-pill border border-accent/40 bg-accent/10 px-4 py-2 text-[12.5px] font-bold text-accent"
            >
              Összes régió-értesítés kikapcsolása
            </button>
          </div>
        )}
      </section>

      {/* Napi emlékeztető — a napi szokás triggere (nem régió-függő) */}
      {status === "subscribed" && (
        <section className="rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-star/15 text-star">
              🔥
            </span>
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink">Napi emlékeztető</h2>
          </div>
          <p className="mb-3 text-[12.5px] leading-snug text-ink-muted">
            Egy gyors napi emlékeztető — mai kvíz, nyelvlecke, friss tartalom —, hogy tartsd a sorozatod.
          </p>
          <ToggleRow
            icon="🎯"
            label="Esti emlékeztető"
            hint="Naponta egyszer, este. Bármikor kikapcsolható."
            on={prefs.notifyDaily}
            onToggle={() => togglePref("notifyDaily")}
          />
        </section>
      )}

      {/* Egyéb értesítések — külön opt-inok */}
      <section>
        <h3 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Egyéb értesítések</h3>
        <div className="space-y-2">
          <LinkRow href="/iranytu" icon="📊" title="Béradat-riasztás" desc="Szólunk, ha az iparágad átlagbére ±10%-ot mozdul." />
          <LinkRow href="/allasok" icon="🎯" title="Állás-riasztás (kulcsszó)" desc="Kulcsszó-alapú találat a szakmádban, bárhol — pontosabb, mint a régió-kapcsoló (Kinti Radar)." />
        </div>
      </section>

      <p className="flex items-start gap-1.5 px-1 text-[11px] leading-snug text-ink-faint">
        <Icon name="lock" size={11} strokeWidth={2.2} className="mt-0.5 shrink-0" />
        Az értesítések a böngésződ feliratkozásához kötődnek — nincs hozzá fiók vagy e-mail. Bármikor kikapcsolhatod.
      </p>
    </div>
  );
}

function ToggleRow({ icon, label, hint, on, onToggle }: { icon: string; label: string; hint: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-alt/40 p-3">
      <span className="text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-ink">{label}</p>
        <p className="text-[11.5px] leading-snug text-ink-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => { haptic("selection"); onToggle(); }}
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-ink-faint/30",
        )}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
      </button>
    </div>
  );
}

function LinkRow({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-surface-alt text-lg">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-ink">{title}</p>
        <p className="text-[11.5px] leading-snug text-ink-muted">{desc}</p>
      </div>
      <Icon name="chevR" size={15} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
    </Link>
  );
}
