"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";

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
  radarType: "exchange_rate" | "alberlet";
  parameters: string;
  createdAt: string;
}

export function KintiRadar({ currentHufRate }: { currentHufRate?: number }) {
  const [state, setState] = useState<State>("checking");
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [radars, setRadars] = useState<Radar[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [activeTab, setActiveTab] = useState<"exchange_rate" | "alberlet">("exchange_rate");
  
  // Exchange Rate
  const [threshold, setThreshold] = useState<string>(String(Math.round((currentHufRate || 400) + 10)));
  const [direction, setDirection] = useState<"above" | "below">("above");

  // Alberlet
  const [alberletCanton, setAlberletCanton] = useState<string>("ZH");
  

  const refreshRadars = useCallback(async (sub: PushSubscriptionJSON) => {
    if (!sub.endpoint) return;
    try {
      const res = await fetch(`/api/radars?endpoint=${encodeURIComponent(sub.endpoint)}`);
      const data = (await res.json()) as { radars?: Radar[] };
      setRadars(Array.isArray(data.radars) ? data.radars : []);
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
    let parameters: any = {};
    
    if (activeTab === "exchange_rate") {
      const t = Number(threshold);
      if (!Number.isFinite(t) || t <= 0 || t > 10000) {
        setError("Érvénytelen küszöb.");
        return;
      }
      parameters = { threshold: t, direction };
    } else if (activeTab === "alberlet") {
      parameters = { canton: alberletCanton };
    }

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
          radarType: activeTab,
          parameters,
        }),
      });
      
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Nem sikerült elmenteni a radart.");
        setState("ready");
        return;
      }
      await refreshRadars(sub);
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
        A Radar riasztásokhoz iPhone-on tedd ki az appot a kezdőképernyőre
        (Megosztás → „Főképernyőhöz adás").
      </InfoCard>
    );
  }
  if (state === "denied") {
    return (
      <InfoCard>
        Az értesítések le vannak tiltva. Engedélyezd a böngésződ beállításaiban
        a kinti.app-nak, hogy radart tudj beállítani.
      </InfoCard>
    );
  }

  function renderRadarSummary(r: Radar) {
    try {
      const p = JSON.parse(r.parameters);
      if (r.radarType === "exchange_rate") {
        return `${p.direction === "above" ? "≥" : "≤"} ${p.threshold} HUF / CHF`;
      }
      if (r.radarType === "alberlet") {
        return `Új albérlet: ${p.canton} kantonban`;
      }
    } catch {
      return "Ismeretlen radar";
    }
  }

  function renderRadarIcon(type: string) {
    if (type === "exchange_rate") return "trending";
    if (type === "alberlet") return "home";
    return "bell";
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/15 text-accent shadow-inner">
          <Icon name="bell" size={20} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold tracking-tight text-ink">
            Kinti Radar 🎯
          </h3>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            Személyre szabott push értesítők. Spórolj időt és pénzt!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex overflow-x-auto hide-scrollbar gap-2">
        <button 
          onClick={() => setActiveTab("exchange_rate")}
          className={cn("px-3 py-1.5 rounded-pill text-[12px] font-bold whitespace-nowrap transition", activeTab === "exchange_rate" ? "bg-accent text-white" : "bg-surface-alt text-ink-muted")}
        >
          💱 Árfolyam
        </button>
        <button 
          onClick={() => setActiveTab("alberlet")}
          className={cn("px-3 py-1.5 rounded-pill text-[12px] font-bold whitespace-nowrap transition", activeTab === "alberlet" ? "bg-accent text-white" : "bg-surface-alt text-ink-muted")}
        >
          🏠 Albérlet
        </button>
      </div>

      {/* Új riasztó form */}
      <div className="rounded-2xl border border-line bg-surface-alt/40 p-4 space-y-3">
        
        {activeTab === "exchange_rate" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-bold text-ink">Értesíts ha 1 CHF</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as "above" | "below")}
                disabled={state === "busy"}
                className="rounded-[10px] border border-line bg-surface px-2.5 py-1.5 font-bold text-ink"
              >
                <option value="above">≥ fölé megy</option>
                <option value="below">≤ alá süllyed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                disabled={state === "busy"}
                className="flex-1 rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] font-extrabold text-ink outline-none"
              />
              <span className="grid place-items-center px-1 text-[13px] font-bold text-ink-muted">HUF</span>
            </div>
          </div>
        )}

        {activeTab === "alberlet" && (
          <div className="space-y-2">
            <span className="text-[13px] font-bold text-ink block">Kanton (Keresési zóna)</span>
            <select
              value={alberletCanton}
              onChange={(e) => setAlberletCanton(e.target.value)}
              disabled={state === "busy"}
              className="w-full rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[14px] font-bold text-ink"
            >
              <option value="ZH">Zürich (ZH)</option>
              <option value="AG">Aargau (AG)</option>
              <option value="BS">Basel-Stadt (BS)</option>
              <option value="BL">Basel-Landschaft (BL)</option>
              <option value="BE">Bern (BE)</option>
              <option value="LU">Luzern (LU)</option>
              <option value="SG">St. Gallen (SG)</option>
              <option value="all">Svájc összes</option>
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={handleCreateRadar}
          disabled={state === "busy"}
          className={cn(
            "w-full rounded-[12px] py-2.5 text-[14px] font-extrabold tracking-tight transition active:scale-95",
            state === "busy" ? "bg-surface-alt text-ink-muted" : "bg-accent text-white shadow-card"
          )}
        >
          {state === "busy" ? "Beállítás folyamatban…" : "Radar Aktiválása"}
        </button>

        {error && <p className="text-[12px] font-bold text-accent text-center pt-1">{error}</p>}
      </div>

      {/* Aktív Radaraim */}
      {radars.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-muted">
            Aktív Radaraim ({radars.length})
          </p>
          <div className="space-y-2">
            {radars.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary">
                    <Icon name={renderRadarIcon(a.radarType) as any} size={14} strokeWidth={2.4} />
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
