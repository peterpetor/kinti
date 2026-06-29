"use client";

import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { SalaryCalculator } from "@/components/views/salary-calculator";
import { SalaryCalculatorAT } from "@/components/views/salary-calculator-at";
import { SalaryCalculatorDE } from "@/components/views/salary-calculator-de";
import { SalaryCalculatorNL } from "@/components/views/salary-calculator-nl";

/**
 * Ország-tudatos bérkalkulátor-választó. CH = svájci (Quellensteuer/AHV/BVG),
 * AT = osztrák (SV + Lohnsteuer + 13./14.), DE = német (SV + Lohnsteuer §32a +
 * Steuerklasse + Soli/Kirche). Hidratálás-biztos: mount előtt CH (= SSR), mount
 * után a választott ország.
 */
export function SalaryCalculatorSwitch() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  if (country === "AT") return <SalaryCalculatorAT />;
  if (country === "DE") return <SalaryCalculatorDE />;
  if (country === "NL") return <SalaryCalculatorNL />;
  return <SalaryCalculator />;
}
