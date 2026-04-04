"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { WeatherCard } from "./weather-card"
import { TemperatureWeatherCard } from "./temperature-weather-card"
import { Thermometer, Droplets, Clock, Umbrella, Wind, TriangleAlert, CloudRainWind, Smile, CheckCircle2, BadgeCheck, ArrowDownToLine, ArrowDown, Mountain, ThermometerSun } from "lucide-react"
import { cn } from "@/lib/utils"
import HeatIndexCard from "./heat-index-card"
import { HeatIndex } from "@/lib/types/weather"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import { useState } from "react"
import { WeatherPrediction } from "@/lib/utils/functions/predictWeather"
import { Separator } from "../ui/separator"

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
  const [hora, setHora] = useState(new Date().toLocaleTimeString());
  const esDeDia = hora >= "06:00:00" && hora <= "20:00:00";

  // [TODO] Actualizar la hora cada minuto para cambiar el fondo dinámicamente

  return (
    <Card
      className={cn(
        "glass-card",
        "col-span-full overflow-hidden",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
      )}
    >

      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-wide">
          Valores Actuales
          <Separator className="my-2" />
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-2">
        <div className="grid gap-6 md:grid-cols-3 ">

            <TemperatureWeatherCard
              title="Temperatura"
              temperature={29}
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
          <div className="grid md:grid-cols-2 gap-6 mt-6">
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
      </CardContent>
    </Card>
  )
}

