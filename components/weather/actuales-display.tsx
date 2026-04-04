"use client"

import { WeatherCard } from "./weather-card"
import { TemperatureWeatherCard } from "./temperature-weather-card"
import { Droplets, CloudRainWind, ArrowDown, Mountain, ThermometerSun, Radio } from "lucide-react"
import HeatIndexCard from "./heat-index-card"
import { HeatIndex } from "@/lib/types/weather"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import { WeatherPrediction } from "@/lib/utils/functions/predictWeather"

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
  const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
  const esDeDia = hora >= "06:00:00" && hora <= "20:00:00";

  // [TODO] Actualizar la hora cada minuto para cambiar el fondo dinámicamente

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
            {(esDeDia) ?
              (<HeatIndexCard heatIndex={heatIndex} />

              ) :
              (
              <WeatherCard
                title="Presión Atmosférica"
                value={pressure?.toFixed(1) ?? null}
                diferencial={prediction? prediction.deltaPressure : undefined}
                treshold={0.5}
                subtitle={prediction ? prediction.trendPressure.toUpperCase() : undefined}
                unit="hPa"
                icon={<ArrowDown className="h-full w-full text-sky-700" />}
                variant="default"

              />
            )}
             
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="">
              {(esDeDia) ? (
                <SecondaryWeatherCard 
                  title="Presión Atmosférica"
                  value={pressure?.toFixed(1) ?? "---"}
                  unit="hPa"
                  icon={<ArrowDown className="h-full w-full text-sky-700" />}
                  variant="default"
                  diferencial={prediction? prediction.deltaPressure : undefined }
                  treshold={0.5}
                />
              ) : (
                  <SecondaryWeatherCard 
                    title="Altura sobre el nivel del mar"
                    value={altitude?.toFixed(1) ?? "---"}
                    unit="m.s.n.m."
                    icon={<Mountain className="h-full w-full text-amber-700" />}
                    variant="default"
                  />
              )}

            </div>

            <div className="">
              <SecondaryWeatherCard 
                title="Acumulado de lluvia (24h)"
                value={"N/A"}
                icon={<CloudRainWind className="h-full w-full text-sky-500" />}
                variant="default"
              />
            </div>
          </div>
      </div>
    </section>
  )
}

