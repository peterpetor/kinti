"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";
import { CANTONS } from "@/lib/cantons";

type State =
  | "checking"
  | "unsupported"
  | "ios-install"
  | "denied"
  | "needs-permission"
  | "ready"
  | "busy";

interface Radar {
  id: string;
  radarType: "exchange_rate" | "job_alert";
  parameters: string;
  createdAt: string;
}

export function JobAlertRadar() {
  const [state, setState] = useState<State>("checking");
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [radars, setRadars] = useState<Radar[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cantonCode, setCantonCode] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");

  const refreshRadars = useCallback(async (sub: PushSubscriptionJSON) => {
    if (!sub.endpoint) return;
    try {
      const res = await fetch(`/api/radars?endpoint=${encodeURIComponent(sub.endpoint)}`);
      const data = (await res.json()) as { radars?: Radar[] };
      setRadars(Array.isArray(data.radars) ? data.radars.filter(r => r.radarType === "job_alert") : []);
    } catch {
      setRadars([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supported =
          typeof window !== "undefined" &&
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;
        if (!supported) {
          const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
          const standalone =
            window.matchMedia?.("(display-mode: standalone)").matches ||
            (navigator as unknown as { standalone?: boolean }).standalone === true;
          if (!cancelled) setState(isIos && !standalone ? "ios-install" : "unsupported");
          return;
        }
        if (Notification.permission === "denied") {
          if (!cancelled) setState("denied");
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (cancelled) return;
        if (existing && Notification.permission === "granted") {
          const json = existing.toJSON();
          setSubscription(json);
          setState("ready");
          await refreshRadars(json);
        } else {
          setState("needs-permission");
        }
      } catch {
        if (!cancelled) setState("unsupported");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshRadars]);

  async function ensureSubscription(): Promise<PushSubscriptionJSON | null> {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setState(perm === "denied" ? "denied" : "needs-permission");
      return null;
    }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }
    return sub.toJSON();
  }

  async function handleCreateRadar() {
    setError(null);
    const kw = keyword.trim();
    if (!kw && cantonCode === "all") {
      setError("Adj meg egy kulcsszót vagy válassz kantont!");
      return;
    }

    const parameters = { cantonCode, keyword: kw };

    setState("busy");
    try {
      const sub = subscription ?? (await ensureSubscription());
      if (!sub) return;
      if (!subscription) setSubscription(sub);

      const res = await fetch("/api/radars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subscription: sub,
          radarType: "job_alert",
          parameters,
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Nem sikerült beállítani az értesítést.");
        setState("ready");
        return;
      }
      await refreshRadars(sub);
      setKeyword("");
      setState("ready");
    } catch {
      setError("Hálózati hiba.");
      setState("ready");
    }
  }

  async function handleDelete(id: string) {
    if (!subscription?.endpoint) return;
    setBusyId(id);
    try {
      await fetch(`/api/radars/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      setRadars((arr) => arr.filter((a) => a.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (state === "checking" || state === "unsupported") return null;

  if (state === "ios-install") {
    return (
      <InfoCard>
        Az Állás-riasztásokhoz iPhone-on tedd ki az appot a kezdőképernyőre
        (Megosztás → „Főképernyőhöz adás").
      </InfoCard>
    );
  }
  if (state === "denied") {
    return (
      <InfoCard>
        Az értesítések le vannak tiltva. Engedélyezd a böngésződ beállításaiban
        a kinti.app-nak, hogy állás-riasztót tudj beállítani.
      </InfoCard>
    );
  }

  function renderRadarSummary(r: Radar) {
    try {
      const p = JSON.parse(r.parameters);
      const canton = p.cantonCode === "all" ? "Minden kanton" : CANTONS.find((c) => c.code === p.cantonCode)?.name || p.cantonCode;
      const kw = p.keyword ? `"${p.keyword}"` : "Minden állás";
      return `${canton} · ${kw}`;
    } catch {
      return "Ismeretlen radar";
    }
  }

  return (
    <section className="rounded-card border border-primary/20 bg-primary/5 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Icon name="bell" size={20} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold tracking-tight text-primary">
            Állás-riasztás (Job Alert)
          </h3>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            Kapj azonnali Push értesítést a legújabb svájci munkákról!
          </p>
        </div>
      </div>

      {/* Új riasztó form */}
      <div className="rounded-2xl border border-line bg-surface/80 p-4 space-y-3">
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-ink">Kanton</label>
            <select
              value={cantonCode}
              onChange={(e) => setCantonCode(e.target.value)}
              disabled={state === "busy"}
              className="h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50"
            >
              <option value="all">Egész Svájc (Minden kanton)</option>
              {CANTONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-ink">Kulcsszó / Iparág</label>
            <input
              type="text"
              placeholder="pl. Informatika, sofőr, takarító..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={state === "busy"}
              className="h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateRadar}
          disabled={state === "busy"}
          className={cn(
            "w-full rounded-[12px] py-2.5 text-[14px] font-extrabold tracking-tight transition active:scale-95 mt-2",
            state === "busy" ? "bg-surface-alt text-ink-muted" : "bg-primary text-white shadow-card"
          )}
        >
          {state === "busy" ? "Beállítás folyamatban…" : "Értesítés Kérése"}
        </button>

        {error && <p className="text-[12px] font-bold text-accent text-center pt-1">{error}</p>}
      </div>

      {/* Aktív Radaraim */}
      {radars.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-muted">
            Aktív Riasztásaim ({radars.length})
          </p>
          <div className="space-y-2">
            {radars.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary">
                    <Icon name="search" size={14} strokeWidth={2.4} />
                  </span>
                  <span className="text-[13px] font-bold text-ink truncate">
                    {renderRadarSummary(a)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  disabled={busyId === a.id}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-alt active:scale-90"
                >
                  <Icon name="close" size={14} strokeWidth={2.4} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface-alt/60 p-4 text-[13px] font-medium leading-relaxed text-ink-muted">
      {children}
    </section>
  );
}
