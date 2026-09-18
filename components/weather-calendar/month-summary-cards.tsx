"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MonthlyWeatherSummary } from "@/lib/types/weather"
import { Thermometer, ThermometerSnowflake, Droplets, CloudRain, Calendar, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthSummaryCardsProps {
  summary: MonthlyWeatherSummary | undefined
  isLoading: boolean
}

type SelectedMetric = "temp_max" | "temp_min" | "humidity_avg" | "precip_total" | null

function formatDDMM(dateStr?: string | null): string {
  if (!dateStr) return "N/A"
  try {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const [, m, d] = parts
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}`
    }
    return dateStr
  } catch {
    return dateStr
  }
}

function formatTimeString(isoStr?: string | null): string | null {
  if (!isoStr) return null
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return null
    return d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " hs"
  } catch {
    return null
  }
}

export function MonthSummaryCards({ summary, isLoading }: MonthSummaryCardsProps) {
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/80 backdrop-blur-md shadow-xs">
            <CardContent className="flex items-center gap-3 p-3.5">
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
              <div className="flex flex-col gap-1.5 w-full min-w-0">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 sm:h-7 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const tempMax = summary?.temp_max !== null && summary?.temp_max !== undefined ? `${summary.temp_max}°C` : "N/A"
  const tempMin = summary?.temp_min !== null && summary?.temp_min !== undefined ? `${summary.temp_min}°C` : "N/A"
  const humAvg = summary?.humidity_avg !== null && summary?.humidity_avg !== undefined ? `${summary.humidity_avg}%` : "N/A"
  const precipTotal = summary?.precip_total !== null && summary?.precip_total !== undefined ? `${summary.precip_total} mm` : "0 mm"

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Temp Máxima */}
        <Card
          onClick={() => setSelectedMetric("temp_max")}
          className="border-red-500/20 bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-red-500/50 hover:shadow-md cursor-pointer group select-none"
        >
          <CardContent className="flex items-center gap-3 p-3.5">
            <div className="rounded-xl bg-red-500/10 text-red-500 shrink-0 p-2 group-hover:scale-105 transition-transform">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Máxima</p>
              <p className="text-base sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                {tempMax}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Temp Mínima */}
        <Card
          onClick={() => setSelectedMetric("temp_min")}
          className="border-blue-500/20 bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md cursor-pointer group select-none"
        >
          <CardContent className="flex items-center gap-3 p-3.5">
            <div className="rounded-xl bg-blue-500/10 text-blue-500 shrink-0 p-2 group-hover:scale-105 transition-transform">
              <ThermometerSnowflake className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Mínima</p>
              <p className="text-base sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {tempMin}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Humedad Promedio */}
        <Card
          onClick={() => setSelectedMetric("humidity_avg")}
          className="border-emerald-500/20 bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer group select-none"
        >
          <CardContent className="flex items-center gap-3 p-3.5">
            <div className="rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 p-2 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Humedad Prom.</p>
              <p className="text-base sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {humAvg}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lluvia Acumulada */}
        <Card
          onClick={() => setSelectedMetric("precip_total")}
          className="border-sky-500/20 bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-sky-500/50 hover:shadow-md cursor-pointer group select-none"
        >
          <CardContent className="flex items-center gap-3 p-3.5">
            <div className="rounded-xl bg-sky-500/10 text-sky-500 shrink-0 p-2 group-hover:scale-105 transition-transform">
              <CloudRain className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Total de Lluvias</p>
              <p className="text-base sm:text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
                {precipTotal}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Discreto y Sencillo para la Métrica Seleccionada */}
      <MetricDetailModal
        metric={selectedMetric}
        summary={summary}
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />
    </>
  )
}

function MetricDetailModal({
  metric,
  summary,
  isOpen,
  onClose,
}: {
  metric: SelectedMetric
  summary: MonthlyWeatherSummary | undefined
  isOpen: boolean
  onClose: () => void
}) {
  if (!metric || !summary) return null

  let title = ""
  let valueStr = ""
  let colorClass = ""
  let icon = Thermometer
  let dateStr: string | null = null
  let timeStr: string | null = null

  if (metric === "temp_max") {
    title = "Temperatura Máxima del Mes"
    valueStr = summary.temp_max !== null ? `${summary.temp_max}°C` : "N/A"
    colorClass = "text-red-600 dark:text-red-400"
    icon = Thermometer
    dateStr = summary.temp_max_date
    timeStr = formatTimeString(summary.temp_max_time)
  } else if (metric === "temp_min") {
    title = "Temperatura Mínima del Mes"
    valueStr = summary.temp_min !== null ? `${summary.temp_min}°C` : "N/A"
    colorClass = "text-blue-600 dark:text-blue-400"
    icon = ThermometerSnowflake
    dateStr = summary.temp_min_date
    timeStr = formatTimeString(summary.temp_min_time)
  } else if (metric === "humidity_avg") {
    title = "Humedad Promedio del Mes"
    valueStr = summary.humidity_avg !== null ? `${summary.humidity_avg}%` : "N/A"
    colorClass = "text-emerald-600 dark:text-emerald-400"
    icon = Droplets
  } else if (metric === "precip_total") {
    title = "Lluvia Acumulada del Mes"
    valueStr = summary.precip_total !== null ? `${summary.precip_total} mm` : "0 mm"
    colorClass = "text-sky-600 dark:text-sky-400"
    icon = CloudRain
    dateStr = summary.max_daily_precip_date || null
  }

  const IconComp = icon

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs border-border/80 bg-background/95 backdrop-blur-xl p-5">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <IconComp className={cn("w-4 h-4", colorClass)} />
            <span>Métrica Resumen</span>
          </div>
          <DialogTitle className="text-base font-bold tracking-tight">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-3 py-3 my-1 rounded-xl bg-card/60 border border-border/50 text-center">
          <span className={cn("text-3xl font-extrabold tracking-tight", colorClass)}>
            {valueStr}
          </span>

          {/* Información de Captura */}
          {(metric === "temp_max" || metric === "temp_min") && dateStr && (
            <div className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground pt-1 border-t border-border/40 w-full px-3">
              <div className="flex items-center gap-1 font-medium text-foreground">
                <Calendar className="w-3 h-3 text-primary" />
                <span>El {formatDDMM(dateStr)}</span>
              </div>
              {timeStr && (
                <div className="flex items-center gap-1 text-xs text-primary mt-0.5">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>A las: {timeStr}</span>
                </div>
              )}
            </div>
          )}

          {metric === "humidity_avg" && (
            <div className="text-xs text-muted-foreground px-3 pt-1 border-t border-border/40 w-full">
              Promedio mensual en {summary.days_with_data} días registrados
            </div>
          )}

          {metric === "precip_total" && (
            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground px-3 pt-1 border-t border-border/40 w-full">
              {summary.max_daily_precip !== undefined && summary.max_daily_precip !== null && summary.max_daily_precip > 0 && (
                <span className="text-xs font-medium text-foreground">
                  Máximo en un día: {summary.max_daily_precip} mm (El {formatDDMM(summary.max_daily_precip_date)})
                </span>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
