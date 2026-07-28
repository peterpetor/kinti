/**
 * Néma automatikus frissítés biztonsági fékje.
 *
 * ⚠️ Miért külön fájlban (és nem a `sw-register.tsx`-ben): ez a logika dönti
 * el, hogy szabad-e a user tudta NÉLKÜL újratölteni az oldalt (2026-07-28
 * user-döntés: a „Frissítés" gomb idegesítő volt, menjen magától). Ha téved,
 * egy félig kitöltött álláshirdetés / albérlet-hirdetés / önéletrajz vész el
 * — ezért unit-tesztelhető helyen kell lennie (ugyanaz a minta, mint a
 * `baseCurrencyFor()`-nál: .tsx-ből nem importálható a vitestbe).
 *
 * Felépítés: a DÖNTÉST tiszta függvények hozzák (nincs bennük DOM, node-ban
 * tesztelhetők), a DOM-ból való kiolvasás egy vékony adapter (`readFields` /
 * `readMedia`). A projekt vitest-környezete szándékosan böngésző nélküli.
 */

/** Egy űrlapmező tesztelhető, DOM-független leképezése. */
export interface FieldLike {
  kind: "input" | "textarea";
  /** input `type` (textarea-nál nincs értelme). */
  type?: string;
  value: string;
  /** A szerverről előtöltött kezdeti érték (`defaultValue`). */
  defaultValue: string;
  checked?: boolean;
  defaultChecked?: boolean;
  /** `data-auto-update-safe="1"` — kereső/szűrő, tartalma elveszhet. */
  safeToDiscard?: boolean;
}

/** Ezekbe a felhasználó nem „ír", elvesztésük nem jelent adatvesztést. */
const IGNORED_INPUT_TYPES = new Set(["hidden", "submit", "button", "reset", "image"]);

/**
 * „Piszkos"-e a mező, azaz van-e benne a felhasználótól származó, még el nem
 * mentett tartalom? Szándékosan ÓVATOS: inkább kihagyunk egy automatikus
 * frissítést, mint hogy bárkinek elvesszen a munkája.
 */
export function isDirtyField(f: FieldLike): boolean {
  if (f.safeToDiscard) return false;

  if (f.kind === "textarea") {
    return Boolean(f.value.trim()) && f.value !== f.defaultValue;
  }

  const type = (f.type ?? "text").toLowerCase();
  if (IGNORED_INPUT_TYPES.has(type)) return false;

  if (type === "checkbox" || type === "radio") {
    return Boolean(f.checked) !== Boolean(f.defaultChecked);
  }
  // A szerverről előtöltött érték (defaultValue) már mentve van — csak az
  // attól ELTÉRŐ, nem üres tartalom számít user-beírásnak.
  return Boolean(f.value.trim()) && f.value !== f.defaultValue;
}

/** Van-e bárhol el nem mentett felhasználói beírás? */
export function hasUserInput(fields: readonly FieldLike[]): boolean {
  return fields.some(isDirtyField);
}

/** Szól-e épp hang/videó (napi szó felolvasás, nyelvlecke)? Ne vágjuk el. */
export function hasPlayingMedia(media: readonly { paused: boolean; ended: boolean }[]): boolean {
  return media.some((m) => !m.paused && !m.ended);
}

/** A tiszta döntés: biztonságos-e MOST néma újratöltés? */
export function isSafeToReloadWith(
  fields: readonly FieldLike[],
  media: readonly { paused: boolean; ended: boolean }[],
): boolean {
  return !hasUserInput(fields) && !hasPlayingMedia(media);
}

// ── DOM-adapter (böngészőben fut, tesztben nem) ─────────────────────────────

/** Kiolvassa az oldal űrlapmezőit a fenti, DOM-független alakra. */
export function readFields(root: ParentNode): FieldLike[] {
  const out: FieldLike[] = [];
  for (const el of Array.from(root.querySelectorAll("input, textarea"))) {
    const safeToDiscard = (el as HTMLElement).dataset?.autoUpdateSafe === "1";
    const tag = el.tagName.toLowerCase();
    if (tag === "textarea") {
      const ta = el as HTMLTextAreaElement;
      out.push({ kind: "textarea", value: ta.value, defaultValue: ta.defaultValue, safeToDiscard });
    } else {
      const inp = el as HTMLInputElement;
      out.push({
        kind: "input",
        type: inp.type,
        value: inp.value,
        defaultValue: inp.defaultValue,
        checked: inp.checked,
        defaultChecked: inp.defaultChecked,
        safeToDiscard,
      });
    }
  }
  return out;
}

/** Kiolvassa a lejátszók állapotát. */
export function readMedia(root: ParentNode): { paused: boolean; ended: boolean }[] {
  return Array.from(root.querySelectorAll("audio, video")).map((m) => {
    const media = m as HTMLMediaElement;
    return { paused: media.paused, ended: media.ended };
  });
}

/** Biztonságos-e MOST néma (a user megkérdezése nélküli) újratöltést csinálni? */
export function isSafeToReload(): boolean {
  try {
    return isSafeToReloadWith(readFields(document), readMedia(document));
  } catch {
    // Ha bármi váratlan történik, NE frissítsünk magunktól — a kézi gomb és a
    // 3 napos kényszerítés úgyis elkapja. Inkább késsen, mint adatot veszítsen.
    return false;
  }
}
