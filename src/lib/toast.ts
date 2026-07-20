/**
 * toast.ts — pehelysúlyú, globális toast (snackbar) sín.
 *
 * Modul-szintű pub/sub, NEM React-context: a `toast(...)` bárhonnan hívható
 * (akár nem-React kódból is), nincs szükség Providerre a fában — a `<ToastHost/>`
 * egyetlen példánya (az (app) layoutban) feliratkozik és megjeleníti.
 *
 * Cél: a szétszórt, ad-hoc „✓ Másolva" gomb-szövegcserék és a NÉMA
 * (visszajelzés nélküli) vágólap-másolások helyett egységes, meleg
 * megerősítés — kevesebb duplikáció, következetesebb élmény.
 */

export type ToastVariant = "success" | "info" | "error";

export interface ToastOptions {
  variant?: ToastVariant;
  /** Automatikus eltűnés ms-ben (alap 2400). */
  duration?: number;
}

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

type Listener = (t: ToastItem) => void;

const listeners = new Set<Listener>();
let seq = 0;

/** Toast megjelenítése bárhonnan. */
export function toast(message: string, opts: ToastOptions = {}): void {
  const item: ToastItem = {
    id: ++seq,
    message,
    variant: opts.variant ?? "success",
    duration: opts.duration ?? 2400,
  };
  for (const l of listeners) l(item);
}

/** A ToastHost iratkozik fel — a visszatérő fv. leiratkozik. */
export function subscribeToasts(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
