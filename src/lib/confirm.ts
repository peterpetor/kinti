/**
 * confirm.ts — natív-stílusú megerősítő-dialógus, a nyers böngésző-`confirm()`
 * (rendszer-stílusú, nincs haptika, nem branded) helyett.
 *
 * Ugyanaz a modul-szintű pub/sub minta, mint a `lib/toast.ts`-nél: a
 * `confirmDialog(...)` bárhonnan hívható (Provider nélkül), a `<ConfirmHost/>`
 * egyetlen példánya (az (app) layoutban) feliratkozik és megjeleníti — a
 * `window.confirm`-mel ellentétben Promise-t ad vissza (`await`-elhető).
 */

export interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Pusztító akció (törlés) → accent-színű gomb + „warning" haptika (alapból „tap" + primary). */
  destructive?: boolean;
}

export interface ConfirmRequest extends ConfirmOptions {
  id: number;
  resolve: (v: boolean) => void;
}

type Listener = (r: ConfirmRequest) => void;

const listeners = new Set<Listener>();
let seq = 0;

/** Megerősítő-dialógus megjelenítése — `await`-eld, `true`/`false`-t ad. */
export function confirmDialog(opts: ConfirmOptions | string): Promise<boolean> {
  const options: ConfirmOptions = typeof opts === "string" ? { message: opts } : opts;
  return new Promise((resolve) => {
    const req: ConfirmRequest = { id: ++seq, resolve, ...options };
    for (const l of listeners) l(req);
  });
}

/** A ConfirmHost iratkozik fel — a visszatérő fv. leiratkozik. */
export function subscribeConfirm(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
