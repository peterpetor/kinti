"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { confirmDialog } from "@/lib/confirm";
import { cn } from "@/lib/cn";
import type { Business } from "@/lib/types";
import { useCheckout } from "@/hooks/useCheckout";
import { SubscriptionManageButton } from "@/components/views/subscription-manage-button";
import { LanguagePicker, WorkingHoursEditor } from "@/components/views/business-fields";
import { AddressFields, parseSwissAddress, composeAddress } from "@/components/views/address-fields";
import { parseWorkingHours, type WorkingHours } from "@/lib/hours";

/**
 * Email-only business manager: token-alapú szerkesztés/törlés Clerk nélkül.
 * A PATCH /api/business/manage/<token> hívásokat csinálja, sikerre router.refresh().
 */
export function BusinessManageForm({ business, token }: { business: Business; token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: business.name,
    categoryLabel: business.categoryLabel ?? "",
    phone: business.phone ?? "",
    blurb: business.blurb ?? "",
    openText: business.openText ?? "",
    languages: business.languages ?? ["Magyar"],
    leadOptOut: business.leadOptOut ?? false,
    kintiPassActive: business.kintiPassActive ?? false,
    kintiPassOffer: business.kintiPassOffer ?? "",
  });
  // Strukturált nyitvatartás — ez hajtja a "Most nyitva" szűrőt és a státuszt.
  const [hours, setHours] = useState<WorkingHours>(() =>
    parseWorkingHours(business.workingHours ?? null),
  );
  // Strukturált cím + pontos térkép-pin. A koordinátát CSAK friss találat-
  // választáskor küldjük (coordPicked); kézi gépelésnél a meglévő pin marad.
  const [addressParts, setAddressParts] = useState(() => parseSwissAddress(business.address ?? ""));
  const [lat, setLat] = useState<number | null>(business.lat ?? null);
  const [lng, setLng] = useState<number | null>(business.lng ?? null);
  const [coordPicked, setCoordPicked] = useState(false);
  const [phase, setPhase] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { startCheckout, isLoading: isCheckoutLoading } = useCheckout();

  const handleUpgrade = () => {
    startCheckout({
      product: "business_pro_monthly",
      // Token-os (Clerk-mentes) vásárlás: a szerver a manageTokenből oldja fel
      // a céget — az email-only tulajdonos belépés nélkül vehet Szaknévsor PRO-t.
      manageToken: token,
      customData: {
        type: "business_pro",
        businessId: business.id
      }
    });
  };

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setPhase("idle");
  }

  async function save() {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch(`/api/business/manage/${token}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categoryLabel: form.categoryLabel || null,
          address: composeAddress(addressParts) || null,
          // Pontos koordinátát csak friss cím-választáskor küldünk (a szerver
          // ország-beli párnál frissíti a pint, egyébként a meglévő marad).
          ...(coordPicked && lat != null && lng != null ? { lat, lng } : {}),
          phone: form.phone || null,
          blurb: form.blurb || null,
          openText: form.openText || null,
          workingHours: JSON.stringify(hours),
          languages: form.languages,
          leadOptOut: form.leadOptOut,
          // Kinti Pass mezőket CSAK PRO-nak küldjük (a szerver úgyis 403-mal védi).
          ...(business.featured
            ? {
                kintiPassActive: form.kintiPassActive,
                kintiPassOffer: form.kintiPassActive ? form.kintiPassOffer || null : null,
              }
            : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { field: string; message: string }[];
      };
      if (!res.ok) {
        const msg = data.details?.[0]?.message ?? data.error ?? "Mentés sikertelen.";
        setError(msg);
        setPhase("error");
        return;
      }
      setPhase("saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  async function remove() {
    if (!(await confirmDialog({ message: `Biztosan törlöd a(z) "${business.name}" vállalkozást? Ez nem visszavonható, és a vélemények is törlődnek.`, destructive: true }))) return;
    setPhase("saving");
    try {
      const res = await fetch(`/api/business/manage/${token}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Törlés sikertelen.");
        setPhase("error");
        return;
      }
      router.push("/szaknevsor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  return (
    <div className="space-y-4">
      {/* Aktív Szaknévsor PRO: előfizetés-kezelés/lemondás (Paddle portal —
          token-os úton is, Clerk nélkül). Csak weben (.web-only-payment):
          a Paddle-portál az Android-appban Play-szabályzatot sértene. */}
      {business.featured && (
        <div className="web-only-payment rounded-[14px] border border-pro/25 bg-pro/5 px-4 py-3">
          <p className="mb-2 text-[13px] font-bold text-ink">
            ⭐ Szaknévsor PRO aktív ezen a vállalkozáson.
          </p>
          <SubscriptionManageButton manageToken={token} />
        </div>
      )}
      {!business.featured && (
        <div className="rounded-[20px] border-2 border-pro/20 bg-pro/5 p-5 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pro/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="mb-2 text-3xl">🚀</div>
          <h3 className="mb-1 text-[17px] font-black text-pro tracking-tight">Válts Szaknévsor PRO-ba!</h3>
          <p className="mb-3 text-[13px] font-medium text-ink-muted leading-snug">
            Tűnj ki a sárga kiemeléssel, kerülj a lista elejére (a kiemelt cégek közé), és{" "}
            <strong className="text-ink">lásd, hányan nézték meg és hívták</strong> a vállalkozásod —
            több magyar ügyfélért.
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {["Megtekintés", "Hívás", "14 napos trend"].map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-pill bg-pro/10 px-2.5 py-1 text-[11px] font-bold text-pro"
              >
                🔒 {m}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isCheckoutLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-pill bg-pro px-4 py-3 text-[15px] font-black text-white shadow-[0_4px_0_0_#cc7700] transition active:translate-y-1 active:shadow-none hover:bg-[#e68600]",
              isCheckoutLoading && "opacity-60 cursor-wait translate-y-1 shadow-none"
            )}
          >
            {isCheckoutLoading ? "Töltés…" : "Kiemelés vásárlása (19 €/hó)"}
          </button>
          {/* Ár-záradék (fogyasztóvédelem): a feltüntetett ár tájékoztató nettó. */}
          <p className="mt-1.5 text-[10.5px] leading-snug text-ink-faint">
            Tájékoztató nettó ár (ÁFA nélkül) — a végső, áfával együttes összeget a pénztár mutatja. Havonta megújul, bármikor lemondható.{" "}
            <span className="web-only-payment">A fizetést a Paddle (Merchant of Record) bonyolítja — az Android-alkalmazásból vásárolva a Google Play fizetési rendszere érvényes.</span>
            <span className="android-only-payment">A fizetést a Google Play fizetési rendszere bonyolítja.</span>
          </p>
        </div>
      )}

      <Section title="Vállalkozás neve" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls()}
          maxLength={100}
        />
      </Section>

      <Section title="Pontos szakma">
        <input
          type="text"
          value={form.categoryLabel}
          onChange={(e) => set("categoryLabel", e.target.value)}
          placeholder="Pl. Női fodrász, Burkoló"
          className={inputCls()}
          maxLength={50}
        />
      </Section>

      <Section title="Cím a térképen">
        <AddressFields
          country={business.country}
          value={addressParts}
          onChange={(parts) => {
            setAddressParts(parts);
            setLat(null);
            setLng(null);
            setCoordPicked(false);
            setPhase("idle");
          }}
          onGeocode={(hit) => {
            setLat(hit.lat);
            setLng(hit.lng);
            setCoordPicked(true);
            setPhase("idle");
          }}
        />
        {coordPicked && lat != null && lng != null ? (
          <p className="mt-2 flex items-center gap-1 text-[11.5px] font-semibold text-success">
            <Icon name="check" size={12} strokeWidth={2.6} className="shrink-0" />
            Pontos hely rögzítve — mentés után ide kerül a térkép-pin.
          </p>
        ) : lat != null && lng != null ? (
          <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">
            Már van térkép-helyed. Ha pontosítanád, írd be a címet és{" "}
            <strong className="text-ink-muted">válassz a felkínált találatok közül</strong>.
          </p>
        ) : (
          <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">
            Írd be a címet és <strong className="text-ink-muted">válassz a felkínált találatok
            közül</strong> — így pontosan a térképre kerülsz.
          </p>
        )}
      </Section>

      <Section title="Telefonszám">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+41 79 123 45 67"
          className={inputCls()}
          maxLength={30}
        />
      </Section>

      <Section title="Bemutatkozás">
        <textarea
          value={form.blurb}
          onChange={(e) => set("blurb", e.target.value)}
          rows={4}
          maxLength={600}
          className={cn(inputCls(), "resize-none")}
        />
        <p className="mt-1 text-right text-[11.5px] text-ink-faint">
          {form.blurb.length} / 600
        </p>
      </Section>

      <Section title="Nyitvatartás">
        <WorkingHoursEditor
          value={hours}
          onChange={(next) => {
            setHours(next);
            setPhase("idle");
          }}
        />
        <div className="mt-3 border-t border-line/60 pt-3">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Extra megjegyzés (opcionális)
          </label>
          <input
            type="text"
            value={form.openText}
            onChange={(e) => set("openText", e.target.value)}
            placeholder="Pl. Ebédszünet 12–13 · Ünnepnap zárva"
            className={inputCls()}
          />
        </div>
      </Section>

      <Section title="Beszélt nyelvek">
        <LanguagePicker
          value={form.languages}
          onChange={(next) => {
            set("languages", next);
          }}
        />
      </Section>

      <Section title="Árajánlat-kérések">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.leadOptOut}
            onChange={(e) => set("leadOptOut", e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
          />
          <span className="text-[13px] leading-snug text-ink-muted">
            <strong className="text-ink">Ne kapjak árajánlat-kéréseket.</strong> Ha bekapcsolod, a
            felhasználók „Kérj árajánlatot" üzenetei nem érkeznek meg hozzád — sem azonnali e-mailben,
            sem a napi összefoglalóban.
          </span>
        </label>
      </Section>

      {/* Kinti Pass — digitális kedvezménykártya elfogadóhely (Szaknévsor PRO). */}
      {business.featured ? (
        <Section title="🎟️ Kinti Pass elfogadóhely">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.kintiPassActive}
              onChange={(e) => set("kintiPassActive", e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
            />
            <span className="text-[13px] leading-snug text-ink-muted">
              <strong className="text-ink">Kinti Pass Elfogadóhely vagyok.</strong> A Kinti
              felhasználói digitális kártyát mutathatnak fel nálad — te pedig kedvezményt adsz
              nekik. A profilod arany „Kinti Pass" jelvényt kap a Szaknévsorban, és megjelenik a
              „Csak Kinti Pass helyek" szűrőben.
            </span>
          </label>
          {form.kintiPassActive && (
            <div className="mt-3 border-t border-line/60 pt-3">
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                Mit kínálsz a Kinti felhasználóknak?
              </label>
              <input
                type="text"
                value={form.kintiPassOffer}
                onChange={(e) => set("kintiPassOffer", e.target.value)}
                placeholder="Pl. 10% kedvezmény minden főételre"
                className={inputCls()}
                maxLength={120}
              />
              <p className="mt-1 text-[11.5px] leading-snug text-ink-faint">
                Ez a szöveg jelenik meg a profilodon és a találati kártyádon. Az ajánlatot te
                adod és te váltod be — a Kinti csak megjeleníti.
              </p>
            </div>
          )}
        </Section>
      ) : (
        <div className="rounded-card border border-star/40 bg-star/10 p-4 shadow-card">
          <h3 className="text-[14.5px] font-extrabold tracking-tight text-ink">
            🎟️ Légy Kinti Pass elfogadóhely!
          </h3>
          <p className="mt-1 mb-3 text-[13px] leading-snug text-ink-muted">
            A PRO csomaggal kedvezményt kínálhatsz a felhasználóknak, és kiemelt helyre kerülsz a
            keresőben. A Kinti Pass helyeket a felhasználók külön szűrővel is keresik.
          </p>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isCheckoutLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-pill bg-pro px-4 py-2.5 text-[13.5px] font-black text-white shadow-card transition active:scale-[0.99] hover:bg-[#e68600]",
              isCheckoutLoading && "opacity-60 cursor-wait",
            )}
          >
            {isCheckoutLoading ? "Töltés…" : "Előfizetés — Szaknévsor PRO (19 €/hó)"}
          </button>
          {/* Ár-záradék (fogyasztóvédelem): a feltüntetett ár tájékoztató nettó. */}
          <p className="mt-1.5 text-[10.5px] leading-snug text-ink-faint">
            Tájékoztató nettó ár (ÁFA nélkül) — a végső, áfával együttes összeget a pénztár mutatja. Havonta megújul, bármikor lemondható.{" "}
            <span className="web-only-payment">A fizetést a Paddle (Merchant of Record) bonyolítja — az Android-alkalmazásból vásárolva a Google Play fizetési rendszere érvényes.</span>
            <span className="android-only-payment">A fizetést a Google Play fizetési rendszere bonyolítja.</span>
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {error}
        </div>
      )}

      {phase === "saved" && (
        <div className="rounded-card border border-success/30 bg-success/10 px-4 py-3 text-[12.5px] font-semibold text-success">
          ✓ Mentve.
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={phase === "saving"}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.99]",
            phase === "saving" && "opacity-60 cursor-not-allowed",
          )}
        >
          {phase === "saving" ? "Mentés…" : "Mentés"}
          {phase !== "saving" && <Icon name="check" size={15} strokeWidth={2.6} />}
        </button>

        <Link
          href={`/szaknevsor/${business.id}`}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-pill border border-line bg-surface text-[13px] font-bold text-ink"
        >
          Publikus profil megnyitása
        </Link>

        <button
          type="button"
          onClick={remove}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-pill border border-accent/40 bg-accent/10 px-4 py-2 text-[12px] font-bold text-accent hover:bg-accent hover:text-white"
        >
          🗑 Vállalkozás törlése
        </button>
      </div>
    </div>
  );
}

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
        {required && (
          <span className="text-[11.5px] font-semibold uppercase tracking-wide text-accent">
            kötelező
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function inputCls(): string {
  return cn(
    "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint",
    "focus:outline-none focus:ring-2 focus:ring-primary/30",
  );
}
