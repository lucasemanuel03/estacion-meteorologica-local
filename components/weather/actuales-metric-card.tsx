"use client"

import { ArrowDown, CloudRainWind, Mountain } from "lucide-react"
import HeatIndexCard from "./heat-index-card"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import { WeatherCard } from "./weather-card"
import calcularPuntoRocio from "@/lib/utils/functions/calcularPuntoRocio"
import type { ActualesMetric } from "@/lib/utils/functions/resolveActualesDisplay"
import type { HeatIndex } from "@/lib/types/weather"
import type { WeatherPrediction } from "@/lib/utils/functions/predictWeather"

interface ActualesMetricCardProps {
  metric: ActualesMetric
  variant: "main" | "secondary"
  temperature: number | null
  humidity: number | null
  pressure: number | null
  altitude: number | null
  heatIndex: HeatIndex | null
  prediction?: WeatherPrediction | null
}

export function ActualesMetricCard({
  metric,
  variant,
  temperature,
  humidity,
  pressure,
  altitude,
  heatIndex,
  prediction,
}: ActualesMetricCardProps) {
  const dewPoint = calcularPuntoRocio(temperature, humidity)

  if (metric === "heat-index") {
    return <HeatIndexCard heatIndex={heatIndex} />
  }

  const metrics = {
    pressure: {
      title: "Presión Atmosférica",
      value: pressure?.toFixed(1) ?? null,
      unit: "hPa",
      icon: <ArrowDown className="h-full w-full text-sky-700" />,
      diferencial: prediction?.deltaPressure,
      subtitle: prediction?.trendPressure.toUpperCase(),
    },
    "dew-point": {
      title: "Punto de Rocío",
      value: dewPoint?.toFixed(1) ?? null,
      unit: "°C",
      icon: <CloudRainWind className="h-full w-full text-sky-500" />,
      diferencial: undefined,
      subtitle: undefined,
    },
    altitude: {
      title: "Altura sobre el nivel del mar",
      value: altitude?.toFixed(1) ?? null,
      unit: "m.s.n.m.",
      icon: <Mountain className="h-full w-full text-amber-700" />,
      diferencial: undefined,
      subtitle: undefined,
    },
  } as const

  const { title, value, unit, icon, diferencial, subtitle } = metrics[metric]

  if (variant === "main") {
    return (
      <WeatherCard
        title={title}
        value={value}
        unit={unit}
        icon={icon}
        variant="default"
        diferencial={diferencial}
        treshold={0.5}
        subtitle={subtitle}
      />
    )
  }

  return (
    <SecondaryWeatherCard
      title={title}
      value={value ?? "---"}
      unit={unit}
      icon={icon}
      variant="default"
      diferencial={diferencial}
      treshold={0.5}
    />
  )
}
