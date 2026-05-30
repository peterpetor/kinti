"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";

/**
 * ExchangeRateAlert — CHF/HUF árfolyam-küszöb riasztó.
 *
 * A felhasználó megadhat egy küszöböt (pl. "értesíts ha 1 CHF ≥ 410 HUF"),
 * és a szerver-oldali cron óránként ellenőrzi az árfolyamot. Ha átlépi, push-
 * értesítés érkezik a böngészőjére.
 *
 * Auth: a push-subscription endpoint maga az "azonosító" — a kliens csak a
 * saját endpoint-jához tartozó riasztásokat látja/törli.
 */

type State =
  | "checking"
  | "unsupported"
  | "ios-install"
  | "denied"
  | "needs-permission"
  | "ready"
  | "busy";

interface Alert {
  id: string;
  thresholdHuf: number;
  direction: "above" | "below";
  createdAt: string;
}

interface CurrentRate {
  huf: number;
}

export function ExchangeRateAlert({ currentRate }: { currentRate: CurrentRate }) {
  const [state, setState] = useState<State>("checking");
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threshold, setThreshold] = useState<string>(String(Math.round(currentRate.huf + 10)));
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAlerts = useCallback(async (sub: PushSubscriptionJSON) => {
    if (!sub.endpoint) return;
    try {
      const res = await fetch(
        `/api/exchange-rate-alerts?endpoint=${encodeURIComponent(sub.endpoint)}`,
      );
      const data = (await res.json()) as { alerts?: Alert[] };
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
    } catch {
      setAlerts([]);
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
          await refreshAlerts(json);
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
  }, [refreshAlerts]);

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

  async function handleCreateAlert() {
    setError(null);
    const t = Number(threshold);
    if (!Number.isFinite(t) || t <= 0 || t > 10000) {
      setError("Érvénytelen küszöb. Próbáld pl. 410.");
      return;
    }
    setState("busy");
    try {
      const sub = subscription ?? (await ensureSubscription());
      if (!sub) return;
      if (!subscription) setSubscription(sub);
      const res = await fetch("/api/exchange-rate-alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subscription: sub,
          thresholdHuf: t,
          direction,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Nem sikerült elmenteni a riasztót.");
        setState("ready");
        return;
      }
      await refreshAlerts(sub);
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
      await fetch(`/api/exchange-rate-alerts/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      setAlerts((arr) => arr.filter((a) => a.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (state === "checking" || state === "unsupported") return null;

  if (state === "ios-install") {
    return (
      <InfoCard>
        Az árfolyam-riasztáshoz iPhone-on tedd ki az appot a kezdőképernyőre
        (Megosztás → „Főképernyőhöz adás"), utána tudsz feliratkozni.
      </InfoCard>
    );
  }
  if (state === "denied") {
    return (
      <InfoCard>
        Az értesítések le vannak tiltva. Engedélyezd a böngésződ beállításaiban
        a kinti.app-nak — utána tudsz riasztót beállítani.
      </InfoCard>
    );
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-accent/15 text-accent">
          <Icon name="bell" size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-extrabold tracking-tight text-ink">
            Árfolyam-riasztó
          </h3>
          <p className="text-[11.5px] text-ink-muted">
            Push-értesítést kapsz, ha az árfolyam átlépi a küszöböt.
          </p>
        </div>
      </div>

      {/* Új riasztó form */}
      <div className="rounded-card border border-line bg-surface-alt/40 p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <span className="font-semibold text-ink">Értesíts ha 1 CHF</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "above" | "below")}
            disabled={state === "busy"}
            className="rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-[12.5px] font-bold text-ink"
          >
            <option value="above">≥ (eléri vagy meghaladja)</option>
            <option value="below">≤ (eléri vagy alá süllyed)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="100"
            max="10000"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="pl. 410"
            disabled={state === "busy"}
            className="flex-1 rounded-[10px] border border-line bg-surface px-3 py-2 text-[14px] font-extrabold text-ink outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="grid place-items-center px-2 text-[13px] font-bold text-ink-muted">HUF</span>
          <button
            type="button"
            onClick={handleCreateAlert}
            disabled={state === "busy"}
            className={cn(
              "rounded-[10px] px-3.5 py-2 text-[13px] font-extrabold tracking-tight transition active:scale-95",
              state === "busy"
                ? "bg-surface-alt text-ink-muted"
                : "bg-accent text-white shadow-card",
            )}
          >
            {state === "busy" ? "…" : "Beállít"}
          </button>
        </div>
        <p className="text-[10.5px] text-ink-faint">
          Aktuális középárfolyam:{" "}
          <strong className="text-ink">
            {currentRate.huf.toLocaleString("hu-HU", { maximumFractionDigits: 2 })} HUF
          </strong>{" "}
          / 1 CHF
        </p>
        {error && (
          <p className="text-[11.5px] font-bold text-accent">{error}</p>
        )}
      </div>

      {/* Aktív riasztásaim */}
      {alerts.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Aktív riasztásaim ({alerts.length})
          </p>
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-[10px] border border-line bg-surface px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="bell" size={12} strokeWidth={2.4} className="text-accent shrink-0" />
                <span className="text-[12.5px] font-bold text-ink truncate">
                  {a.direction === "above" ? "≥" : "≤"}{" "}
                  {a.thresholdHuf.toLocaleString("hu-HU", { maximumFractionDigits: 2 })} HUF
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                disabled={busyId === a.id}
                aria-label="Riasztó törlése"
                className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-surface-alt active:scale-90"
              >
                <Icon name="close" size={12} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-[10.5px] text-ink-faint">
        Csak az aktuális böngésződ kap értesítést. Ha másik gépről nyitod az appot, ott
        külön kell beállítanod. Email-cím vagy bejelentkezés nem szükséges.
      </p>
    </section>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface-alt/60 p-4 text-[12.5px] leading-relaxed text-ink-muted">
      {children}
    </section>
  );
}
