"use client"

import CurveToday from "@/components/todays-stats/curve-today"
import EstadisticasHoy from "@/components/todays-stats/estadisticas-hoy"
import { ExtremesDisplay } from "@/components/weather/extremes-display"
import { useWeatherData } from "../../hooks/use-weather-data"
import { useTrends } from "../../hooks/use-trends"

export default function EstadisticasHoyPage() {
  const { data, error } = useWeatherData()
  const { tempTrend, humTrend } = useTrends()

  return (
    <main className="app-stage min-h-screen relative overflow-hidden">
      <div className="container flex flex-col gap-6 mx-auto py-8 px-4 relative z-10">

        {error && (
          <p className="text-center text-destructive">No se pudieron cargar las estadísticas actuales.</p>
        )}

        <EstadisticasHoy
          temp_max={data?.todayExtremes?.temp_max ?? null}
          temp_min={data?.todayExtremes?.temp_min ?? null}
          tempDiferencial={tempTrend?.differential}
          humDiferencial={humTrend?.differential}
          deltaPressure={data?.predictions?.now?.deltaPressure ?? null}
        />

        <ExtremesDisplay extremes={data?.todayExtremes ?? null} />

        <CurveToday />
      </div>
    </main>
  )
}
