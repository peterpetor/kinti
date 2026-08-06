"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { toast } from "@/lib/toast";
import { confirmDialog } from "@/lib/confirm";

/**
 * „Belépés arccal vagy ujjlenyomattal" — jelszó nélküli belépés (WebAuthn
 * platform-hitelesítő, a Clerk passkey-jén keresztül).
 *
 * ⚠️ HÁROM FELTÉTEL, ÉS MINDHÁRMAT ELLENŐRIZNI KELL, KÜLÖNBEN HAZUG A VEZÉRLŐ:
 *
 * 1) Be van-e lépve. Kulcsot csak létező fiókhoz lehet kötni.
 * 2) Van-e az ESZKÖZBEN beépített hitelesítő (FaceID / TouchID / ujjlenyomat).
 *    Ezt a `isUserVerifyingPlatformAuthenticatorAvailable()` mondja meg —
 *    asztali gépen billentyűzet-olvasó nélkül `false`, és ott a felajánlás
 *    értelmetlen lenne.
 * 3) Engedélyezve van-e a Clerk-oldalon. ⚠️ EZT KÓDBÓL NEM LEHET ELŐRE
 *    LEKÉRDEZNI — csak a tényleges hívás derít rá fényt. Ezért a hiba nem
 *    nyelődik el: érthető üzenetet kap a felhasználó, és a munkamenetre
 *    elrejtjük a vezérlőt, hogy ne próbálkozzon újra hiába.
 *
 * A minta ugyanaz, mint a rezgés-kapcsolónál: egy vezérlő, ami nem csinál
 * semmit, rosszabb a hiányánál — a felhasználó azt hiszi, ő rontott el valamit.
 */
export function ArcBelepesKapcsolo() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [eszkozTamogat, setEszkozTamogat] = useState<boolean | null>(null);
  const [fut, setFut] = useState(false);
  /** A Clerk-oldali tiltás csak hívásból derül ki — utána nincs értelme mutatni. */
  const [kikapcsolva, setKikapcsolva] = useState(false);

  useEffect(() => {
    let ervenyes = true;
    const van =
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined" &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";
    if (!van) {
      setEszkozTamogat(false);
      return;
    }
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((ok) => {
        if (ervenyes) setEszkozTamogat(ok);
      })
      .catch(() => {
        if (ervenyes) setEszkozTamogat(false);
      });
    return () => {
      ervenyes = false;
    };
  }, []);

  if (!isLoaded || !isSignedIn || !user) return null;
  if (eszkozTamogat !== true || kikapcsolva) return null;

  const kulcsok = user.passkeys ?? [];
  const be = kulcsok.length > 0;

  async function beallit() {
    if (fut || !user) return;
    setFut(true);
    try {
      await user.createPasskey();
      await user.reload();
      haptic("success");
      toast("Kész — mostantól arccal vagy ujjlenyomattal is beléphetsz.");
    } catch (e) {
      // ⚠️ A MEGSZAKÍTÁS NEM HIBA. Ha a felhasználó elveti a rendszer-párbeszédet
      // (FaceID-panel bezárása), `NotAllowedError`-t kapunk — arra hibaüzenetet
      // mutatni sértő: pontosan azt tette, amit akart.
      const nev = e instanceof Error ? e.name : "";
      if (nev === "NotAllowedError" || nev === "AbortError") {
        setFut(false);
        return;
      }
      // Minden más: vagy a Clerk-oldali kapcsoló hiányzik, vagy az eszköz
      // mondott nemet. Egyik esetben sem tud a felhasználó mit tenni, ezért
      // a vezérlőt is elrejtjük a munkamenetre.
      setKikapcsolva(true);
      haptic("warning");
      toast("Ez a belépési mód most nem elérhető.", { variant: "error" });
    } finally {
      setFut(false);
    }
  }

  async function torol() {
    if (fut || !user) return;
    const ok = await confirmDialog({
      message:
        kulcsok.length > 1
          ? `Törlöd mind a ${kulcsok.length} kulcsot? Ezután újra jelszóval kell belépned.`
          : "Törlöd a kulcsot? Ezután újra jelszóval kell belépned.",
      confirmLabel: "Törlés",
      destructive: true,
    });
    if (!ok) return;
    setFut(true);
    try {
      for (const k of kulcsok) await k.delete();
      await user.reload();
      toast("A kulcs törölve.");
    } catch {
      toast("A törlés most nem sikerült.", { variant: "error" });
    } finally {
      setFut(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-ink">
        <Icon name="lock" size={16} strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-ink">
          Belépés arccal vagy ujjlenyomattal
        </span>
        <span className="block text-[11.5px] leading-snug text-ink-muted">
          {be
            ? `Bekapcsolva — ${kulcsok.length} eszköz.`
            : "Jelszó helyett, egy pillantással."}
        </span>
      </span>
      <button
        type="button"
        onClick={be ? torol : beallit}
        disabled={fut}
        className={cn(
          "shrink-0 rounded-pill px-3 py-1.5 text-[12.5px] font-extrabold disabled:opacity-60",
          be ? "border border-line bg-surface-alt text-ink" : "bg-primary text-white",
        )}
      >
        {fut ? "…" : be ? "Törlés" : "Beállítás"}
      </button>
    </div>
  );
}
