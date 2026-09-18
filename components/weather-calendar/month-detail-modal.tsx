"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MonthComparisonStats } from "@/lib/types/weather"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Thermometer, ThermometerSnowflake, Droplets, CloudRain, Calendar, Zap, CloudDrizzle } from "lucide-react"

interface MonthDetailModalProps {
  year: number
  monthData: MonthComparisonStats | null
  isOpen: boolean
  onClose: () => void
}

function formatDateString(dateStr: string | null): string {
  if (!dateStr) return "N/A"
  try {
    const parsed = parseISO(dateStr)
    return format(parsed, "d 'de' MMMM", { locale: es })
  } catch {
    return dateStr
  }
}

export function MonthDetailModal({ year, monthData, isOpen, onClose }: MonthDetailModalProps) {
  if (!monthData) return null

  const {
    monthName,
    temp_avg,
    temp_max,
    temp_max_date,
    temp_min,
    temp_min_date,
    humidity_avg,
    precip_total,
    max_daily_precip,
    max_daily_precip_date,
    rainy_days_count,
    days_with_data,
    has_data,
  } = monthData

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-border/80 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Calendar className="w-4 h-4" />
            <span>Resumen Mensual Completo</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {monthName} {year}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {has_data
              ? `Estadísticas consolidadas sobre ${days_with_data} días registrados en este mes.`
              : "No se registraron mediciones en este mes."}
          </DialogDescription>
        </DialogHeader>

        {has_data ? (
          <div className="flex flex-col gap-3 py-2 text-xs">
            {/* Récords de Temperatura con Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Temp Máxima del mes */}
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-red-700 dark:text-red-300">
                    <Thermometer className="w-3.5 h-3.5 shrink-0" />
                    Temp. Máxima
                  </span>
                  <span className="text-lg font-black text-red-600 dark:text-red-400">
                    {temp_max !== null ? `${temp_max}°C` : "N/A"}
                  </span>
                </div>
                {temp_max_date && (
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    Registrada el <strong className="text-foreground font-semibold">{formatDateString(temp_max_date)}</strong>
                  </p>
                )}
              </div>

              {/* Temp Mínima del mes */}
              <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-blue-700 dark:text-blue-300">
                    <ThermometerSnowflake className="w-3.5 h-3.5 shrink-0" />
                    Temp. Mínima
                  </span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {temp_min !== null ? `${temp_min}°C` : "N/A"}
                  </span>
                </div>
                {temp_min_date && (
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    Registrada el <strong className="text-foreground font-semibold">{formatDateString(temp_min_date)}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Lluvia Máxima Diaria con Fecha */}
            <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-sky-700 dark:text-sky-300">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Máx. Lluvia en un Día
                </span>
                <span className="text-lg font-black text-sky-600 dark:text-sky-400">
                  {max_daily_precip !== null && max_daily_precip > 0 ? `${max_daily_precip} mm` : "0 mm"}
                </span>
              </div>
              {max_daily_precip_date && max_daily_precip && max_daily_precip > 0 ? (
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  Registrada el <strong className="text-foreground font-semibold">{formatDateString(max_daily_precip_date)}</strong>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">Sin días con lluvia intensa</p>
              )}
            </div>

            {/* Promedios y Precipitaciones Totales */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-border/50 bg-card/40 flex flex-col justify-between gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Temp. Promedio:
                </span>
                <span className="text-base font-bold text-foreground">
                  {temp_avg !== null ? `${temp_avg}°C` : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border/50 bg-card/40 flex flex-col justify-between gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-emerald-500" />
                  Humedad Promedio:
                </span>
                <span className="text-base font-bold text-foreground">
                  {humidity_avg !== null ? `${humidity_avg}%` : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border/50 bg-card/40 flex flex-col justify-between gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-sky-500" />
                  Lluvia Total del Mes:
                </span>
                <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                  {precip_total !== null ? `${precip_total} mm` : "0 mm"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border/50 bg-card/40 flex flex-col justify-between gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CloudDrizzle className="w-3.5 h-3.5 text-indigo-500" />
                  Días con Lluvia:
                </span>
                <span className="text-base font-bold text-foreground">
                  {rainy_days_count} días <span className="text-[10px] font-normal text-muted-foreground">({days_with_data} reg.)</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No existen mediciones registradas para este mes en el sistema.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
