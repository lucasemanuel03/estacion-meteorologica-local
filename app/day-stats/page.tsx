"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import CurveToday from "@/components/estadisticas-hoy/curve-today"
import EstadisticasHoy from "@/components/estadisticas-hoy/estadisticas-hoy"
import { ExtremesDisplay } from "@/components/weather/extremes-display"
import { useWeatherData } from "@/hooks/use-weather-data"
import { useTrends } from "@/hooks/use-trends"
import { useHourlyAverages } from "@/hooks/use-hourly-averages"
import Title from "@/components/estadisticas-hoy/title"
import { parseDateParam } from "@/lib/utils/date-utils"

function DayStatsContent() {
  const searchParams = useSearchParams()
  const rawParam = searchParams.get("fecha") || searchParams.get("date") || searchParams.get("d")
  const parsed = parseDateParam(rawParam)

  const dateParamToFetch = parsed.isValid && !parsed.isToday ? parsed.isoDate! : undefined

  const { data, error, isLoading: isWeatherLoading } = useWeatherData(dateParamToFetch)
  const { data: hourlyData, loading: isHourlyLoading } = useHourlyAverages(dateParamToFetch)
  const { tempTrend, humTrend } = useTrends()

  const isHistorical = parsed.isValid && !parsed.isToday

  // Verificar si hay datos registrados para el día solicitado
  const hasExtremesData = Boolean(
    data?.todayExtremes &&
    (data.todayExtremes.temp_max !== null ||
      data.todayExtremes.temp_min !== null ||
      (data.todayExtremes.precip_total ?? 0) > 0)
  )
  const hasHourlyData = Array.isArray(hourlyData) && hourlyData.length > 0
  const isLoading = isWeatherLoading || isHourlyLoading

  const noDataAvailable = isHistorical && !isLoading && !hasExtremesData && !hasHourlyData

  return (
    <div className="container flex flex-col mx-auto py-8 px-4 relative z-10">
      {error && (
        <p className="text-center text-destructive mb-4">
          No se pudieron cargar las estadísticas.
        </p>
      )}

      <Title dateStr={parsed.isValid ? parsed.isoDate : null} />

      {noDataAvailable ? (
        <div className="glass-card border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 text-center my-6 max-w-xl mx-auto shadow-lg animate-in fade-in duration-500">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 mb-3 text-amber-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            Sin datos disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            No hay mediciones registradas para la fecha{" "}
            <span className="font-semibold text-foreground">
              {parsed.displayDateStr || rawParam}
            </span>
            .
          </p>
        </div>
      ) : (
        <>
          <ExtremesDisplay extremes={data?.todayExtremes ?? null} />
          <EstadisticasHoy
            temp_max={data?.todayExtremes?.temp_max ?? null}
            temp_min={data?.todayExtremes?.temp_min ?? null}
            tempDiferencial={isHistorical ? undefined : tempTrend?.differential}
            humDiferencial={isHistorical ? undefined : humTrend?.differential}
            deltaPressure={isHistorical ? null : (data?.predictions?.now?.deltaPressure ?? null)}
            isHistorical={isHistorical}
          />
          <CurveToday date={dateParamToFetch} />
        </>
      )}
    </div>
  )
}

export default function DayStatsPage() {
  return (
    <main className="app-stage min-h-screen relative overflow-hidden">
      <Suspense fallback={
        <div className="container flex flex-col mx-auto py-8 px-4 relative z-10 text-center">
          <Title />
        </div>
      }>
        <DayStatsContent />
      </Suspense>
    </main>
  )
}
