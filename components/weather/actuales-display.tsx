"use client"

import { useMemo } from "react"
import { WeatherCard } from "./weather-card"
import { TemperatureWeatherCard } from "./temperature-weather-card"
import {
  Droplets,
  CloudRainWind,
  ThermometerSun,
  Radio,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ActivitySquareIcon,
} from "lucide-react"
import type { DailyExtremes, DerivedMetrics, HeatIndex } from "@/lib/types/weather"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import type { WeatherPrediction } from "@/lib/utils/functions/predictWeather"
import { resolveActualesDisplay } from "@/lib/utils/functions/resolveActualesDisplay"
import { ActualesMetricCard } from "./actuales-metric-card"
import { formatTimeString } from "@/lib/utils/date-utils"
import { Separator } from "../ui/separator"

interface ActualesDisplayProps {
  temperature: number | null
  humidity: number | null
  pressure: number | null
  altitude: number | null
  precipitation?: number | null
  prediction?: WeatherPrediction | null
  heatIndex: HeatIndex | null
  tempTrend?: { differential: number; message: string }
  humTrend?: { differential: number; message: string }
  thermalAmplitud: number | null
  derivedMetrics?: DerivedMetrics | null
  todayExtremes?: DailyExtremes | null
}

export default function ActualesDisplay({
  temperature,
  humidity,
  pressure,
  altitude,
  precipitation,
  prediction,
  tempTrend,
  humTrend,
  heatIndex,
  thermalAmplitud,
  derivedMetrics,
  todayExtremes,
}: ActualesDisplayProps) {
  const layout = useMemo(
    () =>
      resolveActualesDisplay({
        now: new Date(),
        temperature,
        humidity,
        pressure,
        altitude,
        precipitation: precipitation ?? null,
      }),
    [temperature, humidity, pressure, altitude, precipitation],
  )

  const dewPoint = derivedMetrics?.dewPoint

  return (
    <section className="mb-4 animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-950/20">
          <Radio className="h-4 w-4 text-emerald-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Valores actuales</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-2 md:grid-cols-2">
          <TemperatureWeatherCard
            title="Temperatura"
            temperature={temperature}
            icon={<ThermometerSun className="h-full w-full" />}
            subtitle={tempTrend ? tempTrend.message.toUpperCase() : undefined}
            diferencial={tempTrend ? tempTrend.differential : undefined}
          />
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <WeatherCard
              title="Humedad"
              value={humidity}
              unit="%"
              icon={<Droplets className="h-full w-full" />}
              variant="humidity"
              subtitle={humTrend ? humTrend.message.toUpperCase() : undefined}
              diferencial={humTrend ? humTrend.differential : undefined}
            />

            <ActualesMetricCard
              metric={layout.tertiaryCard}
              variant="main"
              temperature={temperature}
              humidity={humidity}
              pressure={pressure}
              altitude={altitude}
              precipitation={precipitation ?? null}
              heatIndex={heatIndex}
              prediction={prediction}
            />
          </div>
        </div>

        <Separator />

        {/* Tarjetas secundarias: 3 columnas en pantallas grandes, 2 en móviles */}
        <div className="">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-950/20">
              <ActivitySquareIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base md:text-lg font-semibold tracking-tight">Más datos del día</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            <SecondaryWeatherCard
              title="Temp. Máxima"
              value={
                todayExtremes?.temp_max !== null && todayExtremes?.temp_max !== undefined
                  ? todayExtremes.temp_max.toFixed(1)
                  : "---"
              }
              unit="°C"
              time={formatTimeString(todayExtremes?.temp_max_time)}
              icon={<ArrowUp className="h-full w-full" />}
              variant="max"
            />

            <SecondaryWeatherCard
              title="Temp. Minima"
              value={
                todayExtremes?.temp_min !== null && todayExtremes?.temp_min !== undefined
                  ? todayExtremes.temp_min.toFixed(1)
                  : "---"
              }
              unit="°C"
              time={formatTimeString(todayExtremes?.temp_min_time)}
              icon={<ArrowDown className="h-full w-full" />}
              variant="min"
            />

            <SecondaryWeatherCard
              title="Amplitud Térmica"
              value={
                thermalAmplitud !== null && thermalAmplitud !== undefined
                  ? `Δ ${thermalAmplitud.toFixed(1)}`
                  : "---"
              }
              unit="°C"
              icon={<ArrowUpDown className="h-full w-full text-primary" />}
              variant="default"
            />

            <ActualesMetricCard
              metric={layout.secondaryCard}
              variant="secondary"
              temperature={temperature}
              humidity={humidity}
              pressure={pressure}
              altitude={altitude}
              precipitation={precipitation ?? null}
              heatIndex={heatIndex}
              prediction={prediction}
            />

            {layout.showDewPointCard && (
              <SecondaryWeatherCard
                title="Punto de Rocío"
                value={dewPoint?.value !== undefined ? dewPoint.value.toFixed(1) : "---"}
                unit={dewPoint?.unit}
                icon={<CloudRainWind className="h-full w-full text-sky-500" />}
                variant="default"
              />
            )}

            <SecondaryWeatherCard
              title="Variación Pr. Atm (3h)"
              value={prediction?.deltaPressure !== null && prediction?.deltaPressure !== undefined ? prediction.deltaPressure.toFixed(1) : "---"}
              unit="hPa"
              icon={<ArrowDown className="h-full w-full text-primary" />}
              variant="default"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
