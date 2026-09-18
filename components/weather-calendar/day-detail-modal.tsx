"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyWeatherStats } from "@/lib/types/weather"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Thermometer, ThermometerSnowflake, Droplets, CloudRain, Calendar, ArrowRight, LineChart } from "lucide-react"
import Link from "next/link"
import CurvaTempHum from "@/components/curva-temp-hum"
import { useHourlyAverages } from "@/hooks/use-hourly-averages"

interface DayDetailModalProps {
  dateStr: string | null
  stats: DailyWeatherStats | null
  isOpen: boolean
  onClose: () => void
}

export function DayDetailModal({ dateStr, stats, isOpen, onClose }: DayDetailModalProps) {
  const [metric, setMetric] = useState<"temperature" | "humidity">("temperature")

  // Cargar datos por hora para la gráfica cuando el modal esté abierto
  const { data: hourlyData, loading: hourlyLoading, error: hourlyError } = useHourlyAverages(
    dateStr || undefined,
    isOpen
  )

  if (!dateStr) return null

  // Formatear la fecha (YYYY-MM-DD -> p.ej. "Jueves 17 de Septiembre, 2026")
  let formattedDate = dateStr
  try {
    const parsed = parseISO(dateStr)
    formattedDate = format(parsed, "EEEE d 'de' MMMM, yyyy", { locale: es })
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
  } catch {
    formattedDate = dateStr
  }

  const hasData = stats && stats.has_data

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Calendar className="w-4 h-4" />
            <span>Detalle Diario del Clima</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {formattedDate}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {hasData
              ? "Resumen de temperaturas, humedad, precipitaciones y evolución por hora."
              : "No se registraron mediciones en esta fecha."}
          </DialogDescription>
        </DialogHeader>

        {hasData && stats ? (
          <div className="flex flex-col gap-4 py-2">
            {/* Grid de Métricas Principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Temp Max */}
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-300 font-medium">
                  <Thermometer className="w-3.5 h-3.5 shrink-0" />
                  <span>Temp. Máxima</span>
                </div>
                <span className="text-xl font-extrabold text-red-600 dark:text-red-400">
                  {stats.temp_max !== null ? `${stats.temp_max}°C` : "N/A"}
                </span>
              </div>

              {/* Temp Min */}
              <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                  <ThermometerSnowflake className="w-3.5 h-3.5 shrink-0" />
                  <span>Temp. Mínima</span>
                </div>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {stats.temp_min !== null ? `${stats.temp_min}°C` : "N/A"}
                </span>
              </div>

              {/* Humedad Promedio */}
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <Droplets className="w-3.5 h-3.5 shrink-0" />
                  <span>Humedad Prom.</span>
                </div>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.humidity_avg !== null ? `${stats.humidity_avg}%` : "N/A"}
                </span>
              </div>

              {/* Lluvia Acumulada */}
              <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-300 font-medium">
                  <CloudRain className="w-3.5 h-3.5 shrink-0" />
                  <span>Lluvia Total</span>
                </div>
                <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
                  {stats.precip_total !== null ? `${stats.precip_total} mm` : "0 mm"}
                </span>
              </div>
            </div>

            {/* Gráfico de Curva de Temperatura y Humedad por Hora */}
            <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                  <LineChart className="w-4 h-4 text-primary" />
                  <span>Evolución Horaria</span>
                </div>

                <Tabs value={metric} onValueChange={(v) => setMetric(v as "temperature" | "humidity")}>
                  <TabsList className="h-8 p-0.5 text-xs bg-muted/60">
                    <TabsTrigger value="temperature" className="text-xs h-7 px-3">
                      Temperatura
                    </TabsTrigger>
                    <TabsTrigger value="humidity" className="text-xs h-7 px-3">
                      Humedad
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <CurvaTempHum
                data={hourlyData}
                metric={metric}
                loading={hourlyLoading}
                error={hourlyError}
                showAllHours={true}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end pt-2 border-t border-border/40">
              <Link href={`/day-stats?fecha=${dateStr}`} passHref>
                <Button size="sm" variant="default" className="gap-1.5">
                  <span>Ver estadísticas del día</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6 text-center text-sm text-muted-foreground">
            <p>No hay registros de mediciones guardadas para este día en la base de datos.</p>
            <Link href={`/day-stats?fecha=${dateStr}`} passHref>
              <Button size="sm" variant="outline" className="gap-1.5">
                <span>Ver página del día</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
