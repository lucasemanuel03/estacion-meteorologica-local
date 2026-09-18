"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AnnualComparisonResponse, MonthComparisonStats } from "@/lib/types/weather"
import { BarChart3, CalendarX, Info, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonthDetailModal } from "./month-detail-modal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AnnualComparisonProps {
  initialYear?: number
}

export function AnnualComparison({ initialYear }: AnnualComparisonProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || currentYear)
  const [selectedMonthData, setSelectedMonthData] = useState<MonthComparisonStats | null>(null)

  const { data, isLoading, error } = useSWR<AnnualComparisonResponse>(
    `/api/weather-calendar/annual?year=${selectedYear}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const availableYears = useMemo(() => {
    const years: number[] = []
    for (let y = currentYear; y >= 2024; y--) {
      years.push(y)
    }
    return years
  }, [currentYear])

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto pt-6 border-t border-border/60">
      {/* Cabecera y Selector de Año */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <BarChart3 className="w-4 h-4" />
            <span>Resumen Anual</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Comparativa de Meses de {selectedYear}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Valores consolidados de temperaturas, humedad y precipitaciones. Toca un mes para ver el detalle completo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Selector de Año */}
          <Select
            value={selectedYear.toString()}
            onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
          >
            <SelectTrigger className="h-9 w-[120px] border-border/60 bg-background/60 text-xs font-medium">
              <SelectValue>{selectedYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-xs">
                  Año {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="rounded-2xl border border-border/60 p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : error || !data?.has_data ? (
        /* Estado Sin Registros para el año */
        <Card className="border-border/60 bg-card/40 backdrop-blur-md py-10 px-4 text-center">
          <CardContent className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
              <CalendarX className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              No hay registros para este año
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              No se han encontrado mediciones ni estadísticas climáticas guardadas para el año {selectedYear}. Prueba seleccionando otro año.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vista Móvil (pantallas < sm): Tarjetas compactas adaptables */}
          <div className="flex flex-col gap-2 sm:hidden">
            {data.months.map((m) => (
              <MobileMonthCard
                key={m.month}
                monthData={m}
                onSelect={() => setSelectedMonthData(m)}
              />
            ))}
          </div>

          {/* Vista Escritorio (pantallas >= sm): Tabla elegante acotada */}
          <div className="hidden sm:block rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 border-b border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-32">Mes</th>
                    <th className="py-3.5 px-3 text-center w-24">Temp. Prom.</th>
                    <th className="py-3.5 px-3 text-center w-24 text-red-600 dark:text-red-400">Temp. Máx.</th>
                    <th className="py-3.5 px-3 text-center w-24 text-blue-600 dark:text-blue-400">Temp. Mín.</th>
                    <th className="py-3.5 px-3 text-center w-28 text-emerald-600 dark:text-emerald-400">Humedad Prom.</th>
                    <th className="py-3.5 px-3 text-center w-28 text-sky-600 dark:text-sky-400">Lluvia Total</th>
                    <th className="py-3.5 px-3 text-center w-28">Lluvia Máx. Día</th>
                    <th className="py-3.5 px-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.months.map((m) => (
                    <tr
                      key={m.month}
                      onClick={() => m.has_data && setSelectedMonthData(m)}
                      className={
                        m.has_data
                          ? "hover:bg-accent/40 cursor-pointer transition-colors group select-none"
                          : "opacity-40 bg-muted/10 cursor-not-allowed select-none"
                      }
                    >
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <span className="group-hover:text-primary transition-colors">{m.monthName}</span>
                        {!m.has_data && (
                          <span className="text-[10px] font-normal text-muted-foreground/60 italic ml-1">
                            (Sin datos)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium">
                        {m.temp_avg !== null ? `${m.temp_avg}°C` : "-"}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-red-600 dark:text-red-400">
                        {m.temp_max !== null ? `${m.temp_max}°C` : "-"}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-blue-600 dark:text-blue-400">
                        {m.temp_min !== null ? `${m.temp_min}°C` : "-"}
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        {m.humidity_avg !== null ? `${m.humidity_avg}%` : "-"}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-sky-600 dark:text-sky-400">
                        {m.precip_total !== null ? `${m.precip_total} mm` : "-"}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-foreground">
                        {m.max_daily_precip !== null ? `${m.max_daily_precip} mm` : "-"}
                      </td>
                      <td className="py-3.5 px-3 text-center text-muted-foreground/50 group-hover:text-primary">
                        {m.has_data && <Info className="w-3.5 h-3.5 inline-block opacity-70 group-hover:opacity-100" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal flotante con datos completos del mes */}
      <MonthDetailModal
        year={selectedYear}
        monthData={selectedMonthData}
        isOpen={!!selectedMonthData}
        onClose={() => setSelectedMonthData(null)}
      />
    </div>
  )
}

function MobileMonthCard({
  monthData,
  onSelect,
}: {
  monthData: MonthComparisonStats
  onSelect: () => void
}) {
  const { monthName, temp_max, temp_min, humidity_avg, precip_total, has_data, days_with_data } = monthData

  return (
    <div
      onClick={() => has_data && onSelect()}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border bg-card/60 backdrop-blur-md transition-all select-none w-full overflow-hidden",
        has_data
          ? "border-border/60 hover:border-primary/40 active:bg-accent/40 cursor-pointer shadow-2xs"
          : "border-border/30 opacity-40 cursor-not-allowed bg-muted/10"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-foreground">{monthName}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border",
              has_data
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border/30"
            )}
          >
            {has_data ? `${days_with_data} días` : "Sin datos"}
          </span>
          {has_data && <ChevronRight className="w-4 h-4 text-muted-foreground/70" />}
        </div>
      </div>

      {has_data ? (
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-xs">
          <div className="flex flex-col p-1.5 rounded-lg bg-background/50 border border-border/30 text-center">
            <span className="text-[10px] text-muted-foreground truncate">Máx / Mín</span>
            <span className="font-bold text-foreground text-xs mt-0.5 truncate">
              <span className="text-red-600 dark:text-red-400">{temp_max !== null ? `${temp_max}°` : "-"}</span>
              <span className="text-muted-foreground/60 mx-0.5">/</span>
              <span className="text-blue-600 dark:text-blue-400">{temp_min !== null ? `${temp_min}°` : "-"}</span>
            </span>
          </div>

          <div className="flex flex-col p-1.5 rounded-lg bg-background/50 border border-border/30 text-center">
            <span className="text-[10px] text-muted-foreground truncate">Humedad</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 truncate">
              {humidity_avg !== null ? `${humidity_avg}%` : "-"}
            </span>
          </div>

          <div className="flex flex-col p-1.5 rounded-lg bg-background/50 border border-border/30 text-center">
            <span className="text-[10px] text-muted-foreground truncate">Lluvia Total</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-xs mt-0.5 truncate">
              {precip_total !== null ? `${precip_total} mm` : "0 mm"}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground/50 italic pt-0.5">Sin registros guardados</p>
      )}
    </div>
  )
}
