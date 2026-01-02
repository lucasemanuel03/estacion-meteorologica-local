"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { WeatherCard } from "./weather-card"
import { ExtremesDisplay } from "./extremes-display"
import type { WeatherDashboardData } from "@/lib/types/weather"
import { Thermometer, Droplets } from "lucide-react"
import getTempColor from "@/lib/utils/functions/getTempColor"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WeatherDashboard() {
  const [lastUpdate, setLastUpdate] = useState<string>("")

  // SWR para refrescar datos automáticamente cada 30 segundos
  const { data, error, isLoading } = useSWR<WeatherDashboardData>("/api/weather-data", fetcher, {
    refreshInterval: 60000, // 60 segundos
    revalidateOnFocus: true,
  })

  useEffect(() => {
    if (data?.latestReading?.recorded_at) {
      const time = new Date(data.latestReading.recorded_at).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setLastUpdate(time)
    }
  }, [data])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar los datos meteorológicos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Valores Actuales</h2>
          {lastUpdate && <p className="text-base text-muted-foreground">Última Medición: {lastUpdate}</p>}
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Actualizando...</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WeatherCard
          title="Temperatura"
          value={data?.latestReading?.temperature ?? null}
          unit="°C"
          icon={<Thermometer className="h-6 w-6" />}
          variant="temperature"
          tempColor={getTempColor(data?.latestReading?.temperature ?? 16)}
        />
        <WeatherCard
          title="Humedad"
          value={data?.latestReading?.humidity ?? null}
          unit="%"
          icon={<Droplets className="h-6 w-6" />}
          variant="humidity"
        
        />
      </div>

      <ExtremesDisplay extremes={data?.todayExtremes ?? null} />
    </div>
  )
}
