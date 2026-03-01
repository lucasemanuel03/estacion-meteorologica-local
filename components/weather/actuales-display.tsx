"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { WeatherCard } from "./weather-card"
import { Thermometer, Droplets, Clock, Umbrella, Wind, TriangleAlert, CloudRainWind, Smile, CheckCircle2, BadgeCheck, ArrowDownToLine, ArrowDown, Mountain } from "lucide-react"
import getTempColor from "@/lib/utils/functions/getTempColor"
import { cn } from "@/lib/utils"
import HeatIndexCard from "./heat-index-card"
import { HeatIndex } from "@/lib/types/weather"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import { useState } from "react"

interface ActualesDisplayProps {
  temperature: number | null
  humidity: number | null
  pressure: number | null
  altitude: number | null
  heatIndex: HeatIndex | null
  tempTrend?: { differential: number; message: string }
  humTrend?: { differential: number; message: string }
}

export default function ActualesDisplay({
  temperature,
  humidity,
  pressure,
  altitude,
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
        "col-span-full overflow-hidden backdrop-blur-xl",
        "bg-linear-to-br from-background/95 to-muted/30",
        "border-border/50 shadow-xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-wide">
          Valores Actuales
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-7">
        <div className="grid gap-6 md:grid-cols-3 ">

            <WeatherCard
              title="Temperatura"
              value={temperature}
              unit="°C"
              icon={<Thermometer className="h-full w-full" />}
              variant="temperature"
              tempColor={getTempColor(temperature ?? 16)}
              subtitle={tempTrend ? tempTrend.message : undefined}
              diferencial={tempTrend ? tempTrend.differential : undefined}
            />

            <WeatherCard
              title="Humedad"
              value={humidity}
              unit="%"
              icon={<Droplets className="h-full w-full" />}
              variant="humidity"
              subtitle={humTrend ? humTrend.message : undefined}
              diferencial={humTrend ? humTrend.differential : undefined}
            />
            {(esDeDia) ?
              (<HeatIndexCard heatIndex={heatIndex} />

              ) :
              (
              <WeatherCard
                title="Presión Atmosférica"
                value={pressure?.toFixed(1) ?? null}
                unit="hPa"
                icon={<ArrowDown className="h-full w-full text-sky-700" />}
                variant="default"

              />
            )}
             
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="">
              <SecondaryWeatherCard 
                title="Altura sobre el nivel del mar"
                value={altitude?.toFixed(1) ?? "---"}
                unit="m.s.n.m."
                icon={<Mountain className="h-full w-full text-amber-700" />}
                variant="default"
              />
            </div>

            <div className="">
              <SecondaryWeatherCard 
                title="Próximas horas"
                unit="hPa"
                icon={<CheckCircle2 className="h-full w-full text-emerald-500" />}
                variant="default"
                subtitle="Clima estable, sin cambios significativos"
              />
            </div>
          </div>
      </CardContent>
    </Card>
  )
}

