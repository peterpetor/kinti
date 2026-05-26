/**
 * Időjárás-segédmodul — Open-Meteo (MeteoSwiss ICON CH2 modell) válaszának
 * típusai + a WMO időjárás-kódok magyar feliratra / emojira fordítása.
 *
 * A WMO weather_code egy nemzetközi szabvány (0 = tiszta … 95+ = zivatar).
 */

/** A /api/weather route által visszaadott, már feldolgozott alak. */
export interface WeatherNow {
  city: string;
  cantonCode: string;
  tempC: number; // aktuális hőmérséklet
  feelsC: number | null; // hőérzet
  code: number; // WMO weather_code
  humidity: number | null; // %
  windKmh: number | null;
  maxC: number | null; // napi max
  minC: number | null; // napi min
}

export interface WeatherCondition {
  label: string; // magyar felirat
  emoji: string;
}

/**
 * WMO weather_code → magyar felirat + emoji.
 * Forrás: Open-Meteo / WMO 4677 kódtábla (csoportosítva).
 */
export function describeWeather(code: number): WeatherCondition {
  switch (code) {
    case 0:
      return { label: "Tiszta", emoji: "☀️" };
    case 1:
      return { label: "Túlnyomóan tiszta", emoji: "🌤️" };
    case 2:
      return { label: "Részben felhős", emoji: "⛅" };
    case 3:
      return { label: "Borult", emoji: "☁️" };
    case 45:
    case 48:
      return { label: "Ködös", emoji: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { label: "Szitálás", emoji: "🌦️" };
    case 56:
    case 57:
      return { label: "Ónos szitálás", emoji: "🌧️" };
    case 61:
      return { label: "Gyenge eső", emoji: "🌦️" };
    case 63:
      return { label: "Eső", emoji: "🌧️" };
    case 65:
      return { label: "Erős eső", emoji: "🌧️" };
    case 66:
    case 67:
      return { label: "Ónos eső", emoji: "🌧️" };
    case 71:
      return { label: "Gyenge havazás", emoji: "🌨️" };
    case 73:
      return { label: "Havazás", emoji: "🌨️" };
    case 75:
      return { label: "Erős havazás", emoji: "❄️" };
    case 77:
      return { label: "Hószemcsék", emoji: "🌨️" };
    case 80:
    case 81:
      return { label: "Záporok", emoji: "🌦️" };
    case 82:
      return { label: "Heves záporok", emoji: "⛈️" };
    case 85:
    case 86:
      return { label: "Hózáporok", emoji: "🌨️" };
    case 95:
      return { label: "Zivatar", emoji: "⛈️" };
    case 96:
    case 99:
      return { label: "Zivatar jégesővel", emoji: "⛈️" };
    default:
      return { label: "Időjárás", emoji: "🌡️" };
  }
}
