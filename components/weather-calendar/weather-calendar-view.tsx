"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import {
  format,
  addMonths,
  subMonths,
  isSameMonth,
  startOfMonth,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, Calendar as CalendarHeaderIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthlyWeatherResponse, DailyWeatherStats } from "@/lib/types/weather"
import { MonthSummaryCards } from "./month-summary-cards"
import { ParameterSelector, WeatherParameter } from "./parameter-selector"
import { CalendarGrid } from "./calendar-grid"
import { DayDetailModal } from "./day-detail-modal"
import { AnnualComparison } from "./annual-comparison"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function WeatherCalendarView() {
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(today))

  // Parámetros activos en el calendario
  const [selectedParameters, setSelectedParameters] = useState<WeatherParameter[]>([
    "temp_max",
    "temp_min",
    "precip_total",
  ])

  // Modal de detalle de día
  const [activeDayStr, setActiveDayStr] = useState<string | null>(null)
  const [activeDayStats, setActiveDayStats] = useState<DailyWeatherStats | null>(null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1 // 1..12

  // Fetch SWR para los datos del mes seleccionado
  const { data, error, isLoading } = useSWR<MonthlyWeatherResponse>(
    `/api/weather-calendar?year=${year}&month=${month}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const isCurrentMonthOrFuture = useMemo(() => {
    return isSameMonth(currentMonth, today) || currentMonth > today
  }, [currentMonth, today])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    if (!isCurrentMonthOrFuture) {
      setCurrentMonth((prev) => addMonths(prev, 1))
    }
  }

  const handleResetToToday = () => {
    setCurrentMonth(startOfMonth(today))
  }

  const handleMonthChange = (monthIdxStr: string) => {
    const newMonthIdx = parseInt(monthIdxStr, 10)
    const newDate = new Date(currentMonth.getFullYear(), newMonthIdx, 1)
    setCurrentMonth(newDate)
  }

  const handleYearChange = (yearStr: string) => {
    const newYear = parseInt(yearStr, 10)
    const newDate = new Date(newYear, currentMonth.getMonth(), 1)
    setCurrentMonth(newDate)
  }

  const handleSelectDay = (dateStr: string, stats: DailyWeatherStats | null) => {
    setActiveDayStr(dateStr)
    setActiveDayStats(stats)
  }

  // Generar años disponibles para el selector (desde 2024 hasta año actual)
  const availableYears = useMemo(() => {
    const years: number[] = []
    const currentYear = today.getFullYear()
    for (let y = currentYear; y >= 2024; y--) {
      years.push(y)
    }
    return years
  }, [today])

  const formattedMonthTitle = useMemo(() => {
    const title = format(currentMonth, "MMMM yyyy", { locale: es })
    return title.charAt(0).toUpperCase() + title.slice(1)
  }, [currentMonth])

  return (
    <div className="flex flex-col items-center justify-center gap-6  mx-auto pb-12">
      <div className="flex flex-col items-center justify-between gap-4">

        {/* Controles de Navegación de Mes */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-9 w-9 border-border/60 bg-background/60 hover:bg-accent"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Selector de Mes */}
          <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-9 w-[130px] border-border/60 bg-background/60 text-xs font-medium">
              <SelectValue>{MONTH_NAMES[currentMonth.getMonth()]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, idx) => (
                <SelectItem key={name} value={idx.toString()} className="text-xs">
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selector de Año */}
          <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="h-9 w-[90px] border-border/60 bg-background/60 text-xs font-medium">
              <SelectValue>{currentMonth.getFullYear()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={isCurrentMonthOrFuture}
            className="h-9 w-9 border-border/60 bg-background/60 hover:bg-accent disabled:opacity-40"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {!isSameMonth(currentMonth, today) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetToToday}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hoy</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas de Valores Resumen del Mes (Temp Máx/Mín, Humidad Prom, Lluvia Total) */}
      <MonthSummaryCards summary={data?.summary} isLoading={isLoading} />


      {/* Sección del Calendario: Selector de Parámetros + Cuadrícula del Calendario */}
      <div className="flex flex-col gap-4">

        <CalendarGrid
          currentMonth={currentMonth}
          daysData={data?.days || {}}
          selectedParameters={selectedParameters}
          onSelectDay={handleSelectDay}
          isLoading={isLoading}
        />
        <ParameterSelector
          selectedParameters={selectedParameters}
          onChange={setSelectedParameters}
        />
      </div>

      {/* Nueva Sección: Comparativa Anual de Meses */}
      <AnnualComparison initialYear={year} />

      {/* Modal interactivo al hacer clic en un día */}
      <DayDetailModal
        dateStr={activeDayStr}
        stats={activeDayStats}
        isOpen={!!activeDayStr}
        onClose={() => setActiveDayStr(null)}
      />
    </div>
  )
}
