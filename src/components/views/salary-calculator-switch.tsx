"use client";

import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { SalaryCalculator } from "@/components/views/salary-calculator";
import { SalaryCalculatorAT } from "@/components/views/salary-calculator-at";

/**
 * Ország-tudatos bérkalkulátor-választó. CH = svájci (Quellensteuer/AHV/BVG),
 * AT = osztrák (SV + Lohnsteuer + 13./14.). Hidratálás-biztos: mount előtt CH
 * (az SSR is azt rendereli), mount után a választott ország.
 */
export function SalaryCalculatorSwitch() {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";
  return isAT ? <SalaryCalculatorAT /> : <SalaryCalculator />;
}
