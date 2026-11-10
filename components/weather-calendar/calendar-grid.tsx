"use client"

import { DailyWeatherStats } from "@/lib/types/weather"
import { WeatherParameter, PARAMETER_CONFIGS } from "./parameter-selector"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns"
import { cn } from "@/lib/utils"
import { CloudRain, Droplets, Thermometer, ThermometerSnowflake } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface CalendarGridProps {
  currentMonth: Date
  daysData: Record<string, DailyWeatherStats>
  selectedParameters: WeatherParameter[]
  onSelectDay: (dateStr: string, stats: DailyWeatherStats | null) => void
  isLoading: boolean
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export function CalendarGrid({
  currentMonth,
  daysData,
  selectedParameters,
  onSelectDay,
  isLoading,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="flex flex-col gap-2 glass-card p-1 sm:p-4 md:p-5">
      {/* Cabecera Días de la Semana */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-1 text-center">
        {WEEKDAYS.map((weekday, idx) => (
          <div
            key={weekday}
            className={cn(
              "py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground",
              idx >= 5 && "text-primary/80" // Destacar fin de semana
            )}
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Grid del Mes */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2.5">
          {[...Array(35)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-1 sm:p-2 rounded-md border border-border/40 bg-card/30 min-h-20 sm:min-h-25 md:min-h-28 select-none"
            >
              <div className="flex items-center justify-between w-full">
                <Skeleton className="h-4 w-4 rounded-md" />
              </div>
              <div className="flex flex-col gap-1 my-1 w-full overflow-hidden">
                <Skeleton className="h-3 sm:h-4 w-full rounded-xs" />
                <Skeleton className="h-3 sm:h-4 w-3/4 rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2.5">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isDayToday = isToday(day)
            const dayStats = daysData[dateStr]
            const hasData = dayStats && dayStats.has_data
            const hasRain = dayStats && dayStats.precip_total && dayStats.precip_total > 0

            return (
              <div
                key={dateStr}
                onClick={() => isCurrentMonth && onSelectDay(dateStr, dayStats || null)}
                className={cn(
                  "group relative flex flex-col justify-between p-1 sm:p-2 rounded-md border transition-all duration-200 min-h-20 sm:min-h-25 md:min-h-28 select-none",
                  isCurrentMonth
                    ? "bg-background/70 hover:bg-accent/40 hover:border-border hover:shadow-md cursor-pointer"
                    : "bg-muted/15 border-transparent text-muted-foreground/40 opacity-40 pointer-events-none",
                  isDayToday && "ring-2 ring-primary border-primary/50 font-bold bg-primary/5",
                  hasRain && isCurrentMonth && "border-sky-500/30 bg-sky-500/5"
                )}
              >
                {/* Cabecera de la celda: Número de día + Indicador de lluvia */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-[11px] sm:text-sm font-semibold rounded-md px-1 py-0.5",
                      isDayToday
                        ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                        : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {hasRain && isCurrentMonth ? (
                    <span className="flex items-center p-0.5 sm:p-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      <CloudRain className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    </span>
                  ) : (
                    <span />
                  )}
                </div>

                {/* Parámetros Seleccionados */}
                {isCurrentMonth && (
                  <div className="flex flex-col gap-1 my-1 w-full overflow-hidden">
                    {hasData ? (
                      selectedParameters.map((paramKey) => {
                        const config = PARAMETER_CONFIGS.find((p) => p.id === paramKey)
                        if (!config) return null
                        const Icon = config.icon

                        // 1. Temperatura unificada (Mín / Máx -> ej: 13°/37°)
                        if (paramKey === "temperature") {
                          const hasMin = dayStats.temp_min !== null && dayStats.temp_min !== undefined
                          const hasMax = dayStats.temp_max !== null && dayStats.temp_max !== undefined

                          if (!hasMin && !hasMax) return null

                          const minStr = hasMin ? `${Math.round(dayStats.temp_min!)}°` : "-"
                          const maxStr = hasMax ? `${Math.round(dayStats.temp_max!)}°` : "-"

                          return (
                            <div
                              key={paramKey}
                              className={cn(
                                "flex items-center justify-center sm:justify-between px-0.5 sm:px-1.5 py-0.5 rounded-sm border leading-none transition-colors",
                                config.badgeBg,
                                config.borderClass
                              )}
                              title={`Mín: ${minStr} / Máx: ${maxStr}`}
                            >
                              <span className="hidden sm:inline-flex items-center gap-1 opacity-80 shrink-0">
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                              </span>
                              <span className="inline-flex items-center justify-center font-bold text-[9px] xs:text-[10px] sm:text-xs tracking-tighter sm:tracking-tight whitespace-nowrap">
                                <span className="text-blue-600 dark:text-blue-400">{minStr}</span>
                                <span className="text-muted-foreground/60 mx-px sm:mx-0.5">/</span>
                                <span className="text-red-600 dark:text-red-400">{maxStr}</span>
                              </span>
                            </div>
                          )
                        }

                        // 2. Lluvia acumulada (ej: 18mm)
                        if (paramKey === "precip_total") {
                          if (dayStats.precip_total === null || dayStats.precip_total === undefined) return null

                          const precipVal = `${Math.round(dayStats.precip_total)}mm`

                          return (
                            <div
                              key={paramKey}
                              className={cn(
                                "flex items-center justify-center sm:justify-between px-0.5 sm:px-1.5 py-0.5 rounded-sm border leading-none transition-colors",
                                config.badgeBg,
                                config.borderClass
                              )}
                              title={`Lluvia acumulada: ${precipVal}`}
                            >
                              <span className="hidden sm:inline-flex items-center gap-1 opacity-80 shrink-0">
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                              </span>
                              <span className="inline-flex items-center justify-center font-bold text-[9px] xs:text-[10px] sm:text-xs tracking-tight text-sky-700 dark:text-sky-300 whitespace-nowrap">
                                {precipVal}
                              </span>
                            </div>
                          )
                        }

                        // 3. Temperatura promedio
                        if (paramKey === "temp_avg") {
                          if (dayStats.temp_avg === null || dayStats.temp_avg === undefined) return null

                          const avgVal = `${Math.round(dayStats.temp_avg)}°C`

                          return (
                            <div
                              key={paramKey}
                              className={cn(
                                "flex items-center justify-center sm:justify-between px-0.5 sm:px-1.5 py-0.5 rounded-sm border leading-none transition-colors",
                                config.badgeBg,
                                config.borderClass
                              )}
                              title={`Temp Promedio: ${avgVal}`}
                            >
                              <span className="hidden sm:inline-flex items-center gap-1 opacity-80 shrink-0">
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                              </span>
                              <span className="inline-flex items-center justify-center font-semibold text-[9px] xs:text-[10px] sm:text-xs tracking-tight text-amber-700 dark:text-amber-300 whitespace-nowrap">
                                {avgVal}
                              </span>
                            </div>
                          )
                        }

                        // 4. Humedad promedio
                        if (paramKey === "humidity_avg") {
                          if (dayStats.humidity_avg === null || dayStats.humidity_avg === undefined) return null

                          const humVal = `${Math.round(dayStats.humidity_avg)}%`

                          return (
                            <div
                              key={paramKey}
                              className={cn(
                                "flex items-center justify-center sm:justify-between px-0.5 sm:px-1.5 py-0.5 rounded-sm border leading-none transition-colors",
                                config.badgeBg,
                                config.borderClass
                              )}
                              title={`Humedad Promedio: ${humVal}`}
                            >
                              <span className="hidden sm:inline-flex items-center gap-1 opacity-80 shrink-0">
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                              </span>
                              <span className="inline-flex items-center justify-center font-semibold text-[9px] xs:text-[10px] sm:text-xs tracking-tight text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                {humVal}
                              </span>
                            </div>
                          )
                        }

                        return null
                      })
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50 italic text-center py-1">
                        Sin datos
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
