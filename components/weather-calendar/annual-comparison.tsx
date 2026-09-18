"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AnnualComparisonResponse, MonthComparisonStats } from "@/lib/types/weather"
import { BarChart3, CalendarX, Info } from "lucide-react"
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
    <div className="flex flex-col gap-4 pt-6 border-t border-border/60">
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
            Valores consolidados de temperaturas, humedad y precipitaciones. Haz clic en una fila para ver el detalle completo del mes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : error || !data?.has_data ? (
        /* Estado Sin Registros para el año */
        <Card className="border-border/60 bg-card/40 backdrop-blur-md py-12 px-4 text-center">
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
        /* Tabla Comparativa Única */
        <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Mes</th>
                  <th className="py-3.5 px-4 text-center">Temp. Prom.</th>
                  <th className="py-3.5 px-4 text-center text-red-600 dark:text-red-400">Temp. Máx.</th>
                  <th className="py-3.5 px-4 text-center text-blue-600 dark:text-blue-400">Temp. Mín.</th>
                  <th className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400">Humedad Prom.</th>
                  <th className="py-3.5 px-4 text-center text-sky-600 dark:text-sky-400">Lluvia Total</th>
                  <th className="py-3.5 px-4 text-center">Lluvia Máx. Día</th>
                  <th className="py-3.5 px-4 text-center w-10"></th>
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
                    <td className="py-3.5 px-4 font-bold text-foreground flex items-center gap-2">
                      <span className="group-hover:text-primary transition-colors">{m.monthName}</span>
                      {!m.has_data && (
                        <span className="text-[10px] font-normal text-muted-foreground/60 italic">
                          (Sin datos)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">
                      {m.temp_avg !== null ? `${m.temp_avg}°C` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-red-600 dark:text-red-400">
                      {m.temp_max !== null ? `${m.temp_max}°C` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                      {m.temp_min !== null ? `${m.temp_min}°C` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {m.humidity_avg !== null ? `${m.humidity_avg}%` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-600 dark:text-sky-400">
                      {m.precip_total !== null ? `${m.precip_total} mm` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-foreground">
                      {m.max_daily_precip !== null ? `${m.max_daily_precip} mm` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground/50 group-hover:text-primary">
                      {m.has_data && <Info className="w-3.5 h-3.5 inline-block opacity-70 group-hover:opacity-100" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
