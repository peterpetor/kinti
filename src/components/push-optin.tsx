"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";

/**
 * PushOptin — „Kérek értesítést új eseményről" feliratkozó kártya.
 *
 * A kanton-célzáshoz a `kinti.canton` localStorage-kulcsot olvassa (ugyanazt,
 * amit az időjárás-widget állít). Homokozó / nem támogatott környezetben
 * (pl. nem telepített iOS PWA) szépen elrejti magát vagy tippet ad.
 */
type State = "checking" | "unsupported" | "ios-install" | "idle" | "subscribed" | "denied" | "busy" | "too-early";

/**
 * Növeli a látogatás-számlálót localStorage-ban (oldalanként legfeljebb 1×,
 * ehhez sessionStorage-flag-et használunk). Visszaadja az új visit count-ot.
 */
function bumpVisits(): number {
  if (typeof window === "undefined") return 0;
  try {
    // Egy session-ön belül egyszer számolunk
    if (window.sessionStorage.getItem("kinti.visitCounted")) {
      return Number(window.localStorage.getItem("kinti.visits") || "0");
    }
    const next = Number(window.localStorage.getItem("kinti.visits") || "0") + 1;
    window.localStorage.setItem("kinti.visits", String(next));
    window.sessionStorage.setItem("kinti.visitCounted", "1");
    return next;
  } catch {
    return 0;
  }
}

function hasSubmitted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("kinti.hasSubmitted") === "1";
  } catch {
    return false;
  }
}

export function PushOptin() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Timing guard: csak a 2+ látogatás után VAGY ha már sikeresen feladott valamit
        const visits = bumpVisits();
        const submitted = hasSubmitted();
        if (visits < 2 && !submitted) {
          if (!cancelled) setState("too-early");
          return;
        }

        const supported =
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;
        if (!supported) {
          // iOS: csak telepített (standalone) PWA-ban van push.
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
        if (!cancelled) setState(existing ? "subscribed" : "idle");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function readCanton(): string | null {
    try {
      const v = localStorage.getItem("kinti.canton");
      return v && v !== "all" ? v : null;
    } catch {
      return null;
    }
  }

  async function subscribe() {
    setState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), cantonCode: readCanton() }),
      });
      setState(res.ok ? "subscribed" : "idle");
    } catch {
      setState("idle");
    }
  }

  async function unsubscribe() {
    setState("busy");
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
      setState("idle");
    } catch {
      setState("subscribed");
    }
  }

  if (state === "checking" || state === "unsupported" || state === "too-early") return null;

  if (state === "ios-install") {
    return (
      <Card>
        <Bell />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-ink">Értesítések új eseményekről</p>
          <p className="text-[11.5px] leading-snug text-ink-muted">
            iPhone-on előbb tedd ki a kezdőképernyőre (Megosztás → „Főképernyőhöz adás"),
            utána kapcsolhatod be.
          </p>
        </div>
      </Card>
    );
  }

  if (state === "denied") {
    return (
      <Card>
        <Bell />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-ink">Értesítések letiltva</p>
          <p className="text-[11.5px] leading-snug text-ink-muted">
            A böngésző beállításaiban engedélyezd az értesítéseket a kinti.app-hoz.
          </p>
        </div>
      </Card>
    );
  }

  const subscribed = state === "subscribed";
  return (
    <Card>
      <Bell active={subscribed} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-ink">
          {subscribed ? "Értesítések bekapcsolva" : "Szólunk, ha új esemény van"}
        </p>
        <p className="text-[11.5px] leading-snug text-ink-muted">
          {subscribed
            ? "Értesítünk az új eseményekről a kantonodban."
            : "Engedélyezd, és értesítünk az új eseményekről a környékeden."}
        </p>
      </div>
      <button
        type="button"
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={state === "busy"}
        className={cn(
          "shrink-0 rounded-pill px-3.5 py-2 text-[12.5px] font-bold transition active:scale-[0.97]",
          subscribed
            ? "border border-line bg-surface text-ink-muted"
            : "bg-primary text-white shadow-card",
          state === "busy" && "opacity-60",
        )}
      >
        {state === "busy" ? "…" : subscribed ? "Kikapcsolás" : "Bekapcsolom"}
      </button>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      {children}
    </div>
  );
}

function Bell({ active = false }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-[12px]",
        active ? "bg-primary text-white" : "bg-primary-soft text-primary",
      )}
    >
      <Icon name="bell" size={17} strokeWidth={2.2} />
    </span>
  );
}
