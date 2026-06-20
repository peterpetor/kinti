"use client";

import { Component, type ReactNode } from "react";
import { reportClientError } from "@/lib/report-client-error";

interface Props {
  children: ReactNode;
  /** A widget helyén megjelenő tartalom, ha a gyerek render közben dob. */
  fallback: ReactNode;
  /** Opcionális címke a hiba-jelentéshez (melyik widget hasalt el). */
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Granuláris hiba-határ EGY widget (pl. térkép, grafikon) köré. Ha a gyerek
 * render közben dob, a `fallback` jelenik meg a HELYÉN — az oldal többi része
 * (menü, elérhetőségek, vélemények) zavartalanul betölt és működik.
 *
 * Kiegészíti a route-szintű `error.tsx`-et, ami az EGÉSZ szegmenst cserélné le.
 * A Next.js error.tsx route-szintű; ez itt komponens-szintű izolációt ad.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (typeof console !== "undefined") {
      console.error(`[error-boundary${this.props.label ? `:${this.props.label}` : ""}]`, error);
    }
    // Best-effort jelentés a monitoringnak (redaktálva). Sosem dobhat tovább.
    try {
      reportClientError(error);
    } catch {
      /* a hiba-jelentés hibája ne okozzon új hibát */
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
