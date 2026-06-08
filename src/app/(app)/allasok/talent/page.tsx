"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { KintiLogo } from "@/components/ui/kinti-logo";
import { useRouter } from "next/navigation";

export default function KintiTalentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    germanLevel: "Nincs",
    drivingLicense: false,
    hasCar: false,
    isInSwitzerland: false,
    permitType: "Nincs",
    targetCanton: "Bárhol",
    availableFrom: "Azonnal",
    notes: "",
  });

  const updateForm = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!form.firstName || !form.lastName || !form.email || !form.phone)) {
      alert("Kérlek töltsd ki az elérhetőségeidet.");
      return;
    }
    if (step === 2 && !form.profession) {
      alert("Kérlek add meg a szakmád.");
      return;
    }
    setStep((s) => s + 1);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/allasok/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStep(4); // Success step
      } else {
        const data = await res.json();
        alert(data.error || "Hiba történt a küldéskor.");
      }
    } catch (err) {
      alert("Hálózati hiba.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      {step < 4 && (
        <div className="mb-8">
          <Link href="/allasok" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-ink hover:bg-line transition mb-4">
            <Icon name="arrowLeft" size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
            Kinti Talent 🚀
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            Töltsd ki ezt a gyors profilt (2 perc), és a Kinti HR partnerei felkeresnek
            a profilodba vágó svájci állásajánlatokkal!
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors duration-500",
                  step >= s ? "bg-primary" : "bg-line"
                )} 
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Elérhetőségek */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Keresztnév</label>
            <input 
              type="text" 
              value={form.firstName} 
              onChange={(e) => updateForm("firstName", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition" 
              placeholder="Példa: Gábor"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Vezetéknév</label>
            <input 
              type="text" 
              value={form.lastName} 
              onChange={(e) => updateForm("lastName", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition" 
              placeholder="Példa: Szabó"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Email</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={(e) => updateForm("email", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition" 
              placeholder="gabor@pelda.hu"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Telefonszám (WhatsApp is)</label>
            <input 
              type="tel" 
              value={form.phone} 
              onChange={(e) => updateForm("phone", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition" 
              placeholder="+36 30 123 4567"
            />
          </div>
          
          <Button onClick={nextStep} className="w-full rounded-full py-6 text-[16px] mt-4" size="lg">
            Tovább (1/3)
          </Button>
        </div>
      )}

      {/* STEP 2: Szakma & Nyelv */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Mi a szakmád?</label>
            <input 
              type="text" 
              value={form.profession} 
              onChange={(e) => updateForm("profession", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition" 
              placeholder="Pl. Asztalos, CNC Esztergályos, Felszolgáló"
            />
          </div>
          
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Német nyelvtudásod</label>
            <select 
              value={form.germanLevel} 
              onChange={(e) => updateForm("germanLevel", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition appearance-none"
            >
              <option value="Nincs">Nincs / Nagyon minimális</option>
              <option value="A1">A1 (Alapfok)</option>
              <option value="A2">A2 (Erős alapfok, megértem amit mondanak)</option>
              <option value="B1">B1 (Középfok, kommunikálok)</option>
              <option value="B2">B2 (Erős középfok, folyékony)</option>
              <option value="C1+">C1+ (Felsőfok / Anyanyelvi)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex flex-1 cursor-pointer items-center justify-between rounded-2xl border-2 border-line bg-surface p-4 hover:border-primary transition">
              <span className="text-[14px] font-bold text-ink">Van "B" Jogsim</span>
              <input type="checkbox" checked={form.drivingLicense} onChange={(e) => updateForm("drivingLicense", e.target.checked)} className="h-5 w-5 accent-primary" />
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-between rounded-2xl border-2 border-line bg-surface p-4 hover:border-primary transition">
              <span className="text-[14px] font-bold text-ink">Van saját autóm</span>
              <input type="checkbox" checked={form.hasCar} onChange={(e) => updateForm("hasCar", e.target.checked)} className="h-5 w-5 accent-primary" />
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={() => setStep(1)} variant="secondary" className="w-16 rounded-full">
              <Icon name="arrowLeft" />
            </Button>
            <Button onClick={nextStep} className="flex-1 rounded-full py-6 text-[16px]" size="lg">
              Tovább (2/3)
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Svájc & Extrák */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-up">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-line bg-surface p-4 hover:border-primary transition">
            <span className="text-[14px] font-bold text-ink">Már Svájcban élek</span>
            <input type="checkbox" checked={form.isInSwitzerland} onChange={(e) => updateForm("isInSwitzerland", e.target.checked)} className="h-5 w-5 accent-primary" />
          </label>

          {form.isInSwitzerland && (
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Svájci engedély típusa</label>
              <select 
                value={form.permitType} 
                onChange={(e) => updateForm("permitType", e.target.value)} 
                className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition appearance-none"
              >
                <option value="Nincs">Még nincs</option>
                <option value="L">L-Ausweis (Rövidtávú)</option>
                <option value="B">B-Ausweis (Tartózkodási)</option>
                <option value="C">C-Ausweis (Letelepedési)</option>
                <option value="G">G-Ausweis (Ingázó)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Mikor tudnál kezdeni?</label>
            <input 
              type="text" 
              value={form.availableFrom} 
              onChange={(e) => updateForm("availableFrom", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition" 
              placeholder="Pl. Azonnal, vagy 2 héten belül"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted mb-2 ml-1">Megjegyzés (Opcionális)</label>
            <textarea 
              value={form.notes} 
              onChange={(e) => updateForm("notes", e.target.value)} 
              className="w-full rounded-2xl border-2 border-line bg-surface-alt px-4 py-3.5 text-[14px] text-ink outline-none focus:border-primary focus:bg-surface transition min-h-[100px]" 
              placeholder="Bármi fontos infó a közvetítők számára..."
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={() => setStep(2)} variant="secondary" className="w-16 rounded-full" disabled={isSubmitting}>
              <Icon name="arrowLeft" />
            </Button>
            <Button onClick={submitForm} disabled={isSubmitting} className="flex-1 rounded-full py-6 text-[16px]" size="lg">
              {isSubmitting ? "Küldés..." : "Jelentkezés beküldése"}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Siker */}
      {step === 4 && (
        <div className="text-center animate-fade-up mt-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success mb-6">
            <Icon name="check" size={40} strokeWidth={3} />
          </div>
          <h2 className="text-[24px] font-extrabold text-ink mb-3">Profil Beküldve!</h2>
          <p className="text-[15px] leading-relaxed text-ink-muted mb-8 max-w-sm mx-auto">
            Köszönjük, {form.firstName}! A jelentkezésed bekerült a Kinti Talent adatbázisba.
            Ha találunk a profilodhoz illő nyitott pozíciót, keresni fogunk a megadott elérhetőségeken.
          </p>
          <Button onClick={() => router.push("/allasok")} className="rounded-full px-8 py-6 text-[16px]">
            Vissza az állásokhoz
          </Button>
        </div>
      )}
    </div>
  );
}
