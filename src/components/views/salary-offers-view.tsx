"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  deleteSalaryOffer,
  listSalaryOffers,
  type SalaryOffer,
} from "@/lib/salary-offers";

const formatCHF = (n: number) => Math.round(n).toLocaleString("de-CH") + " CHF";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

const CIVIL_LABEL: Record<"A" | "B" | "C", string> = {
  A: "Egyedülálló",
  B: "Házas (1 keresős)",
  C: "Házas (2 keresős)",
};

export function SalaryOffersView() {
  const [offers, setOffers] = useState<SalaryOffer[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setOffers(listSalaryOffers());
    setHydrated(true);
  }, []);

  const best = useMemo(() => {
    if (offers.length === 0) return null;
    return offers.reduce((a, b) =>
      a.computed.netYearly >= b.computed.netYearly ? a : b,
    );
  }, [offers]);

  function handleDelete(id: string) {
    deleteSalaryOffer(id);
    setOffers(listSalaryOffers());
    if (expandedId === id) setExpandedId(null);
  }

  if (!hydrated) {
    return (
      <p className="text-center text-[13px] text-ink-muted">Betöltés…</p>
    );
  }

  if (offers.length === 0) {
    return (
      <section className="rounded-card border border-dashed border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
          <Icon name="bookmark" size={20} strokeWidth={2.4} />
        </span>
        <h2 className="mt-3 text-[17px] font-extrabold tracking-tight text-ink">
          Még nincs mentett ajánlat
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          Menj a Bérkalkulátorra, számolj ki egy ajánlatot, és mentsd el —
          itt majd összehasonlíthatod a többivel.
        </p>
        <Link
          href="/berkalkulator"
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 text-[13px] font-extrabold text-white shadow-card active:scale-95"
        >
          <span>💰</span>
          Bérkalkulátorhoz
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
          {offers.length} mentett ajánlat
        </h2>
        <p className="mt-1 text-[12px] text-ink-muted">
          Az adatok csak a böngésződben élnek — szerverre nem küldjük.
        </p>
        <p className="mt-2 rounded-[8px] border border-accent/30 bg-accent/5 px-2.5 py-1.5 text-[11px] leading-snug text-ink-muted">
          ⚠ <strong className="text-accent">Megosztott gép?</strong> Ha valaki más is használja ezt a böngészőt
          (családtag, kolléga), ő is láthatja a mentett ajánlataidat. Magán-böngészés (incognito)
          módban a mentés nem őrződik meg, a kijelentkezés után törlődik.
        </p>
      </section>

      {/* Összehasonlító táblázat — kompakt grid */}
      <section className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-surface-alt text-left">
                <Th>Ajánlat</Th>
                <Th align="right">Nettó / hó</Th>
                <Th align="right">Nettó / év</Th>
                <Th align="right">Levonás</Th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const isBest = best?.id === o.id;
                const dedRate =
                  (o.computed.totalDeductions /
                    Math.max(1, o.computed.grossMonthly)) *
                  100;
                return (
                  <tr
                    key={o.id}
                    className={cn(
                      "border-t border-line transition-colors hover:bg-surface-alt/40 cursor-pointer",
                      isBest && "bg-success/5",
                    )}
                    onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {isBest && (
                          <span className="rounded bg-success px-1 py-0.5 text-[9px] font-extrabold text-white">
                            TOP
                          </span>
                        )}
                        <span className="font-bold text-ink truncate">{o.label}</span>
                      </div>
                      <span className="text-[10.5px] text-ink-faint">
                        {o.input.canton} · {fmtDate(o.createdAt)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-extrabold text-primary">
                      {formatCHF(o.computed.netMonthly)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-ink">
                      {formatCHF(o.computed.netYearly)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-accent">
                      {dedRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Részletes nézet — kiválasztott ajánlat */}
      {expandedId && (
        <OfferDetail
          offer={offers.find((o) => o.id === expandedId)!}
          onDelete={() => handleDelete(expandedId)}
          onClose={() => setExpandedId(null)}
        />
      )}

      <Link
        href="/berkalkulator"
        className="flex items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-5 py-2.5 text-[12.5px] font-bold text-ink-muted shadow-card transition active:scale-95"
      >
        <Icon name="plus" size={13} strokeWidth={2.4} />
        Új ajánlat hozzáadása
      </Link>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

function OfferDetail({
  offer,
  onDelete,
  onClose,
}: {
  offer: SalaryOffer;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { input, computed } = offer;
  const dedRate =
    (computed.totalDeductions / Math.max(1, computed.grossMonthly)) * 100;

  return (
    <section className="rounded-card border-2 border-primary/30 bg-primary-soft p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[16px] font-extrabold tracking-tight text-ink truncate">
            {offer.label}
          </h3>
          <p className="text-[11.5px] text-ink-muted">
            Mentve: {fmtDate(offer.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Bezár"
          className="grid h-8 w-8 place-items-center rounded-full bg-surface text-ink-muted active:scale-90"
        >
          ✕
        </button>
      </div>

      {/* Bemenet összegzése */}
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <Field label="Bruttó / hó" value={formatCHF(computed.grossMonthly)} />
        <Field label="Bruttó / év" value={formatCHF(computed.grossYearly)} />
        <Field label="Kanton" value={input.canton} />
        <Field label="Tarifa" value={`${input.civil}${input.kids > 0 ? `${input.kids}` : ""}`} />
        <Field label="Családi" value={CIVIL_LABEL[input.civil]} />
        <Field label="Gyerek" value={String(input.kids)} />
        <Field label="Korosztály" value={input.age} />
        <Field label="Hónapok" value={`${input.months}× / év`} />
      </div>

      <div className="mt-4 rounded-card border border-primary/20 bg-surface p-4">
        <Row label="Nettó / hó" value={formatCHF(computed.netMonthly)} accent />
        <Row label="Nettó / év" value={formatCHF(computed.netYearly)} />
        <Row label="Levonás összesen" value={`-${formatCHF(computed.totalDeductions)}`} muted />
        <Row label="Forrásadó" value={`-${formatCHF(computed.qstAmount)}`} muted />
        <Row label="Társadalombiztosítás" value={`-${formatCHF(computed.socialDeductions)}`} muted />
        <Row label="Levonási arány" value={`${dedRate.toFixed(1)}%`} muted />
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm(`Biztos törlöd: "${offer.label}"?`)) onDelete();
        }}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-pill border border-accent/30 bg-accent/5 px-4 py-2 text-[12.5px] font-bold text-accent transition active:scale-95"
      >
        <Icon name="close" size={12} strokeWidth={2.4} />
        Ajánlat törlése
      </button>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-surface px-2.5 py-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-[12.5px] font-bold text-ink">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
  muted = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-[13px]">
      <span className={cn("font-semibold", muted ? "text-ink-muted" : "text-ink")}>
        {label}
      </span>
      <span
        className={cn(
          "font-extrabold tabular-nums",
          accent ? "text-primary text-[15px]" : muted ? "text-ink-muted" : "text-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}
