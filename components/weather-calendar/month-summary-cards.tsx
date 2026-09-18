"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MonthlyWeatherSummary } from "@/lib/types/weather"
import { Thermometer, ThermometerSnowflake, Droplets, CloudRain, CalendarDays } from "lucide-react"

interface MonthSummaryCardsProps {
  summary: MonthlyWeatherSummary | undefined
  isLoading: boolean
}

export function MonthSummaryCards({ summary, isLoading }: MonthSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/60 backdrop-blur-md">
            <CardContent className="p-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Temp Máxima */}
      <Card className="border-red-500/20 bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-red-500/40">
        <CardContent className=" flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
            <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Máxima</p>
            <p className="text-base sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {tempMax}
            </p>
            {summary?.temp_max_date && (
              <p className="text-[10px] text-muted-foreground/80 truncate">
                {summary.temp_max_date.split("-")[2]}/{summary.temp_max_date.split("-")[1]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Temp Mínima */}
      <Card className="border-blue-500/20  bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-blue-500/40">
        <CardContent className=" flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <ThermometerSnowflake className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Mínima</p>
            <p className="text-base sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {tempMin}
            </p>
            {summary?.temp_min_date && (
              <p className="text-[10px] text-muted-foreground/80 truncate">
                {summary.temp_min_date.split("-")[2]}/{summary.temp_min_date.split("-")[1]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Humedad Promedio */}
      <Card className="border-emerald-500/20  bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-emerald-500/40">
        <CardContent className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
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
      <Card className="border-sky-500/20  bg-card/80 backdrop-blur-md shadow-xs transition-all hover:border-sky-500/40">
        <CardContent className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
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
  )
}
