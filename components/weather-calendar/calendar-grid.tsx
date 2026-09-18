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
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl p-1.5 sm:p-5 shadow-lg">
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
              className="flex flex-col justify-between p-1 sm:p-2.5 rounded-md border border-border/40 bg-card/30 min-h-25 md:min-h-30 select-none"
            >
              <div className="flex items-center justify-between w-full">
                <Skeleton className="h-4 w-4 rounded-md" />
              </div>
              <div className="flex flex-col gap-1 my-1 w-full overflow-hidden">
                <Skeleton className="h-3 sm:h-4 w-full rounded-xs" />
                <Skeleton className="h-3 sm:h-4 w-4/5 rounded-xs" />
                <Skeleton className="h-3 sm:h-4 w-2/3 rounded-xs" />
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
                  "group relative flex flex-col justify-between p-1 sm:p-2.5 rounded-md border transition-all duration-200 min-h-25 md:min-h-30 select-none",
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
                      "text-xs sm:text-sm font-semibold rounded-md px-1 py-0.5",
                      isDayToday
                        ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                        : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {hasRain && isCurrentMonth ? (
                    <span className="flex items-center  p-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      <CloudRain className="w-3 h-3 shrink-0" />
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

                        let value: number | null | undefined = null
                        if (paramKey === "temp_max") value = dayStats.temp_max
                        if (paramKey === "temp_min") value = dayStats.temp_min
                        if (paramKey === "temp_avg") value = dayStats.temp_avg
                        if (paramKey === "humidity_avg") value = dayStats.humidity_avg
                        if (paramKey === "precip_total") value = dayStats.precip_total

                        if (value === null || value === undefined) return null

                        const Icon = config.icon

                        return (
                          <div
                            key={paramKey}
                            className={cn(
                              "flex items-center justify-between px-1 py-0.5 rounded-sm border text-[10px] sm:text-xs  leading-tight truncate",
                              config.badgeBg,
                            )}
                          >
                            <span className="hidden sm:inline-flex items-center gap-1 opacity-80 shrink-0">
                              <Icon className="w-4 h-4 shrink-0" />
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] md:text-sm tracking-tight">
                              {value}
                              <span className=" md:text-xs font-light ">{config.unit}</span>
                            </span>
                          </div>
                        )
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
