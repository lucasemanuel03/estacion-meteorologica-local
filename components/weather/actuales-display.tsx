"use client"

import { useMemo } from "react"
import { WeatherCard } from "./weather-card"
import { TemperatureWeatherCard } from "./temperature-weather-card"
import { Droplets, CloudRainWind, ThermometerSun, Radio } from "lucide-react"
import { HeatIndex } from "@/lib/types/weather"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import { WeatherPrediction } from "@/lib/utils/functions/predictWeather"
import calcularPuntoRocio from "@/lib/utils/functions/calcularPuntoRocio"
import { resolveActualesDisplay } from "@/lib/utils/functions/resolveActualesDisplay"
import { ActualesMetricCard } from "./actuales-metric-card"

interface ActualesDisplayProps {
  temperature: number | null
  humidity: number | null
  pressure: number | null
  altitude: number | null
  prediction?: WeatherPrediction | null
  heatIndex: HeatIndex | null
  tempTrend?: { differential: number; message: string }
  humTrend?: { differential: number; message: string }
}

export default function ActualesDisplay({
  temperature,
  humidity,
  pressure,
  altitude,
  prediction,
  tempTrend,
  humTrend,
  heatIndex,
}: ActualesDisplayProps) {
  const layout = useMemo(
    () =>
      resolveActualesDisplay({
        now: new Date(),
        temperature,
        humidity,
        pressure,
        altitude,
      }),
    [temperature, humidity, pressure, altitude],
  )

  const dewPoint = calcularPuntoRocio(temperature, humidity)

  return (
    <section className="mb-4 animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-950/20">
          <Radio className="h-4 w-4 text-emerald-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Valores actuales</h2>
      </div>

      <div className="flex flex-col">
        <div className="grid gap-4 md:grid-cols-3 ">
          <TemperatureWeatherCard
            title="Temperatura"
            temperature={temperature}
            icon={<ThermometerSun className="h-full w-full" />}
            subtitle={tempTrend ? tempTrend.message.toUpperCase() : undefined}
            diferencial={tempTrend ? tempTrend.differential : undefined}
          />

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
            heatIndex={heatIndex}
            prediction={prediction}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <ActualesMetricCard
            metric={layout.secondaryCard}
            variant="secondary"
            temperature={temperature}
            humidity={humidity}
            pressure={pressure}
            altitude={altitude}
            heatIndex={heatIndex}
            prediction={prediction}
          />

          {layout.showDewPointCard && (
            <SecondaryWeatherCard
              title="Punto de Rocío"
              value={dewPoint?.toFixed(1) ?? "---"}
              unit="°C"
              icon={<CloudRainWind className="h-full w-full text-sky-500" />}
              variant="default"
            />
          )}
        </div>
      </div>
    </section>
  )
}
