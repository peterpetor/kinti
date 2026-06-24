"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  PROVIDER_CATEGORIES,
  getCategoryInfo,
  formatDateDe,
  type ProviderCategory,
  type CategoryInfo,
} from "@/lib/provider-switch";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export function ProviderSwitchWizard() {
  const [selectedId, setSelectedId] = useState<ProviderCategory | null>(null);
  const selected = selectedId ? getCategoryInfo(selectedId) : null;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🔄</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Szolgáltató Váltó
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Mikor és hogyan érdemes <strong className="text-ink">Krankenkasse</strong>,{" "}
              <strong className="text-ink">Internet</strong>, <strong className="text-ink">Mobil</strong>{" "}
              és <strong className="text-ink">Bank</strong> szolgáltatót váltani — felmondási idők, levél-minták.
            </p>
          </div>
        </div>
      </section>

      {/* Kategória-választó */}
      {!selected ? (
        <CategoryPicker onSelect={setSelectedId} />
      ) : (
        <CategoryDetail category={selected} onBack={() => setSelectedId(null)} />
      )}

      {/* Disclaimer (mindig látszik) */}
      <LegalDisclaimer
        toolName="Szolgáltató Váltó"
        variant="legal"
        notAdviceFor="jogi, pénzügyi vagy szerződéses"
        extraWarning="A felmondási feltételek szerződésenként és szolgáltatónként eltérőek lehetnek. A megjelölt felmondási idők ÁLTALÁNOS svájci szabályok — a TE konkrét szerződésed eltérő pontokat is tartalmazhat (különösen ha hűségidőben vagy, készülék-bérleted van, vagy promóciós csomag). Felmondás előtt mindig ellenőrizd a szerződésed eredeti dokumentumát. A megjelölt szolgáltatókkal NEM állunk affiliate vagy kereskedelmi kapcsolatban."
        officialSources={[
          { label: "Comparis — Összehasonlító", url: "https://www.comparis.ch/" },
          { label: "Priminfo — Krankenkasse", url: "https://www.priminfo.admin.ch/" },
        ]}
      />
    </div>
  );
}

function CategoryPicker({ onSelect }: { onSelect: (id: ProviderCategory) => void }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <label className="block mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        Melyik szolgáltatót váltanád?
      </label>
      <div className="space-y-2">
        {PROVIDER_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="flex w-full items-start gap-3 rounded-[14px] border-2 border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99] hover:border-primary/40 hover:bg-primary-soft/30"
          >
            <span className="text-3xl shrink-0">{c.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-extrabold text-ink">{c.label}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted line-clamp-2">
                {c.description}
              </p>
            </div>
            <Icon name="chevR" size={14} className="text-ink-muted shrink-0 mt-2" />
          </button>
        ))}
      </div>
    </section>
  );
}

function CategoryDetail({
  category,
  onBack,
}: {
  category: CategoryInfo;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Vissza */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[11.5px] font-bold text-ink-muted shadow-card active:scale-95"
      >
        <Icon name="arrowLeft" size={12} strokeWidth={2.4} />
        Más kategória
      </button>

      {/* Cím + leírás */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">{category.emoji}</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-extrabold leading-tight tracking-tight text-ink">
              {category.label}
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Szabályok */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          📅 Felmondási szabályok
        </h3>
        <div className="space-y-2">
          <RuleRow label="Felmondási idő" value={category.noticePeriod} icon="⏰" />
          <RuleRow label="Határidő" value={category.deadline} icon="📅" highlight />
          <RuleRow label="Hűségidő (Mindestlaufzeit)" value={category.minContract} icon="🔒" />
          <RuleRow label="Új szolgáltató indulása" value={category.newProviderStarts} icon="🆕" />
          <RuleRow label="Optimális váltási ablak" value={category.bestSwitchWindow} icon="🎯" />
        </div>
      </section>

      {/* Tippek */}
      <section className="rounded-card border-2 border-star/30 bg-[#fff8ed] p-4 shadow-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-[#9a6b00]">
          💡 Tippek
        </h3>
        <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-ink">
          {category.tips.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#9a6b00] shrink-0">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Felmondási levél generátor */}
      <TemplateGenerator category={category} />

      {/* Top szolgáltatók */}
      <section className="space-y-2">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          🏢 Szolgáltatók
        </h3>
        {category.providers.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-card transition active:scale-[0.99]"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white text-[12px] font-extrabold"
              style={{ backgroundColor: p.color }}
            >
              {p.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-extrabold text-ink">{p.name}</span>
                <span
                  className={cn(
                    "rounded-pill px-1.5 py-0.5 text-[10.5px] font-bold uppercase",
                    p.tier === "premium" && "bg-primary/10 text-primary",
                    p.tier === "mid" && "bg-star/10 text-[#9a6b00]",
                    p.tier === "budget" && "bg-success/10 text-success",
                  )}
                >
                  {p.tier === "premium" ? "Prémium" : p.tier === "mid" ? "Közepes" : "Olcsó"}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-muted truncate">{p.note}</p>
            </div>
            <Icon name="chevR" size={13} className="text-ink-faint shrink-0" />
          </a>
        ))}
      </section>

      {/* Hivatalos linkek */}
      <section className="rounded-card border border-line bg-surface-alt/60 p-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Hivatalos források
        </h3>
        <ul className="space-y-1.5">
          {category.officialLinks.map((l, i) => (
            <li key={i}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-semibold text-primary underline break-all"
              >
                🔗 {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RuleRow({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] px-3 py-2",
        highlight ? "border-2 border-accent/30 bg-accent-soft" : "bg-surface-alt",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      </div>
      <p
        className={cn(
          "mt-1 text-[13px] font-bold leading-snug",
          highlight ? "text-accent" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TemplateGenerator({ category }: { category: CategoryInfo }) {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [providerName, setProviderName] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [dateOfTermination, setDateOfTermination] = useState(getDefaultTerminationDate(category.id));
  const [copied, setCopied] = useState(false);

  const today = useMemo(() => formatDateDe(new Date()), []);

  const generatedLetter = useMemo(() => {
    return category.germanTemplate({
      customerName: customerName || "[Saját név]",
      customerAddress: customerAddress || "[Cím — utca, házszám, irányítószám, város]",
      providerName: providerName || "[Szolgáltató címe]",
      contractNumber: contractNumber || "[Szerződés-szám]",
      dateOfTermination: dateOfTermination || "[Felmondás napja]",
      todayDate: today,
    });
  }, [category, customerName, customerAddress, providerName, contractNumber, dateOfTermination, today]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <section className="rounded-card border-2 border-success/30 bg-success/5 p-4 shadow-card space-y-3">
      <h3 className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-success">
        ✍️ Felmondási levél (DE)
      </h3>
      <p className="text-[11px] leading-snug text-ink-muted">
        Töltsd ki az adatokat — generáljuk a felmondási levelet német nyelven, amit
        kinyomtatva tértivevényes ajánlott levélként küldhetsz.
      </p>

      <div className="grid grid-cols-1 gap-2">
        <InputField
          label="Saját neved"
          value={customerName}
          onChange={setCustomerName}
          placeholder="Pl. Kovács Péter"
        />
        <InputField
          label="Saját címed (utca, irsz., város)"
          value={customerAddress}
          onChange={setCustomerAddress}
          placeholder="Pl. Bahnhofstrasse 1, 8001 Zürich"
        />
        <InputField
          label="Szolgáltató címe"
          value={providerName}
          onChange={setProviderName}
          placeholder="Pl. CSS Versicherung, Postfach 6002 Luzern"
        />
        <InputField
          label="Szerződésszám / biztosítás-szám"
          value={contractNumber}
          onChange={setContractNumber}
          placeholder="Pl. 123-456-789"
        />
        <InputField
          label="Felmondás napja (DD.MM.YYYY)"
          value={dateOfTermination}
          onChange={setDateOfTermination}
          placeholder="Pl. 31.12.2026"
        />
      </div>

      {/* Letter-preview */}
      <div className="rounded-[10px] border border-line bg-surface p-3">
        <pre className="text-[11.5px] leading-relaxed text-ink whitespace-pre-wrap font-mono">
          {generatedLetter}
        </pre>
      </div>

      <button
        type="button"
        onClick={copyToClipboard}
        className={cn(
          "flex w-full items-center justify-center gap-1.5 rounded-pill py-2.5 text-[13px] font-bold transition active:scale-95",
          copied ? "bg-success text-white" : "bg-primary text-white shadow-card",
        )}
      >
        {copied ? "✓ Másolva!" : "📋 Másolás vágólapra"}
      </button>

      <p className="text-[11.5px] leading-snug text-ink-faint">
        💡 Postán <strong>Einschreiben</strong> (tértivevényes) ajánlott levélként küldd — a
        feladás dátuma a határidő bizonyítéka.
      </p>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block mb-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink"
      />
    </div>
  );
}

function getDefaultTerminationDate(categoryId: ProviderCategory): string {
  const now = new Date();
  const year = now.getFullYear();
  switch (categoryId) {
    case "krankenkasse":
      // Always Dec 31 of current year (if before Nov 30) or next year
      if (now.getMonth() < 10 || (now.getMonth() === 10 && now.getDate() <= 30)) {
        return `31.12.${year}`;
      }
      return `31.12.${year + 1}`;
    case "internet":
    case "mobile": {
      // +30 days
      const target = new Date(now);
      target.setDate(target.getDate() + 30);
      return formatDateDe(target);
    }
    case "bank":
    case "electricity":
    default: {
      // +30 days
      const target = new Date(now);
      target.setDate(target.getDate() + 30);
      return formatDateDe(target);
    }
  }
}
