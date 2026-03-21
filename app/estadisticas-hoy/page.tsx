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
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-violet-500/5 via-background to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto py-8 px-4 relative z-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Estadísticas de hoy</h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Resumen diario de extremos, variaciones de tendencia y curva horaria de mediciones.
          </p>
        </div>

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
