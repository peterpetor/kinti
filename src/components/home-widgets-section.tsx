"use client";

import { WeatherWidget } from "./weather-widget";
import { ExchangeRateWidget } from "./exchange-rate-widget";
import { KvizDailyCard } from "./kviz-daily-card";
import { NapiSzoCard } from "./napi-szo-card";
import { HomeWidgets } from "./home-widgets";

/**
 * A kezdőlapi napi-widget-blokk EGY kliens-komponensbe zárva, hogy a 4 widget
 * (időjárás, árfolyam, kvíz, napi szó) + a testreszabható board együtt, LAZY
 * chunkban töltődjön (home-lazy.tsx) — így egyik sem terheli a kezdőlap első
 * bundle-jét. Korábban a `page.tsx` közvetlenül konstruálta a widget-node-okat,
 * ezért mind az 5 komponens a first-load JS-ben volt.
 */
export function HomeWidgetsSection() {
  return (
    <HomeWidgets
      widgets={[
        { id: "weather", label: "Időjárás", node: <WeatherWidget /> },
        { id: "exchange", label: "Árfolyam", node: <ExchangeRateWidget /> },
        { id: "kviz", label: "Napi kvíz", node: <KvizDailyCard /> },
        { id: "napiszo", label: "Napi szó", node: <NapiSzoCard /> },
      ]}
    />
  );
}
