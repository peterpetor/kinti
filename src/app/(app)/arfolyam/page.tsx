import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { ExchangeCalculator } from "@/components/views/exchange-calculator";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Árfolyam és hazautalás kalkulátor — CHF / HUF",
  description:
    "Aktuális CHF/HUF árfolyam és népszerű utalás-szolgáltatók díjkalkulátora — Wise, Revolut, banki utalás összehasonlítva.",
};

interface ExchangeData {
  date: string;
  rates: { HUF: number; EUR: number };
  inverse: { hufToChf: number; eurToChf: number };
}

async function getRate(): Promise<ExchangeData | null> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=CHF&to=HUF,EUR", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      date: string;
      rates: Record<string, number>;
    };
    const huf = data.rates.HUF;
    const eur = data.rates.EUR;
    return {
      date: data.date,
      rates: { HUF: huf, EUR: eur },
      inverse: {
        hufToChf: huf > 0 ? Math.round((100 / huf) * 100000) / 100000 : 0,
        eurToChf: eur > 0 ? Math.round((1 / eur) * 10000) / 10000 : 0,
      },
    };
  } catch {
    return null;
  }
}

export default async function ArfolyamPage() {
  const rate = await getRate();

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Árfolyam · CHF/HUF
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      {rate ? (
        <ExchangeCalculator
          chfToHuf={rate.rates.HUF}
          chfToEur={rate.rates.EUR}
          date={rate.date}
        />
      ) : (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-6 text-center text-[13px] text-ink-muted">
          Az árfolyam-szolgáltatás átmenetileg nem érhető el. Próbáld újra később.
        </div>
      )}

      <LegalDisclaimer
        toolName="árfolyam és hazautalás kalkulátor"
        variant="legal"
        notAdviceFor="pénzügyi vagy befektetési"
        extraWarning="Az ECB napi középárfolyama NEM ugyanaz, mint amit a bank vagy a szolgáltató ad — a tényleges váltáskor 0.3-2% spread van a károdra. A szolgáltatói díjbecslések publikált átlagos tarifa alapján, és gyakran változnak. Konkrét utaláshoz mindig az adott szolgáltatónál ellenőrizd az aktuális díjat."
        officialSources={[
          { label: "Frankfurter.app — ECB napi árfolyam", url: "https://api.frankfurter.app/" },
          { label: "SNB — Svájci Nemzeti Bank", url: "https://www.snb.ch/" },
        ]}
      />
    </div>
  );
}
