"use client"

import { useState, useMemo, useEffect } from "react"
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
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCcw, Calendar as CalendarHeaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthlyWeatherResponse, DailyWeatherStats } from "@/lib/types/weather"
import { MonthSummaryCards } from "./month-summary-cards"
import { ParameterSelector, WeatherParameter } from "./parameter-selector"
import { CalendarGrid } from "./calendar-grid"
import { DayDetailModal } from "./day-detail-modal"
import { AnnualComparison } from "./annual-comparison"
import { MonthEvolutionChart } from "./month-evolution-chart"
import { WeatherCalendarTitle, MONTH_NAMES } from "./weather-calendar-title"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WeatherCalendarView() {
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(today))
  const [isSelectorVisible, setIsSelectorVisible] = useState(true)

  // Ocultar selector automáticamente al hacer scroll hacia abajo
  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Si nos desplazamos hacia abajo más de 15px y pasamos el umbral inicial
      if (currentScrollY > lastScrollY + 15 && currentScrollY > 50) {
        setIsSelectorVisible(false)
      }
      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Parámetros activos en el calendario (por defecto solamente temperaturas y lluvia acumulada)
  const [selectedParameters, setSelectedParameters] = useState<WeatherParameter[]>([
    "temperature",
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
    <div className="flex flex-col w-full pb-12">
      {/* Barra Sticky Superior: Título dinámico "Clima de [Mes]" + Selector de Mes/Año */}
      <div className="sticky top-16 sm:top-[68px] z-30 w-full bg-background/85 dark:bg-background/90 backdrop-blur-xl border-b border-border/50 py-2.5 sm:py-3 px-3 sm:px-6 shadow-xs mb-6 transition-all duration-200">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <WeatherCalendarTitle currentMonth={currentMonth} />

            {/* Botón sutil para alternar visibilidad del selector */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsSelectorVisible((prev) => !prev)}
              title={isSelectorVisible ? "Ocultar selector de mes y año" : "Mostrar selector de mes y año"}
              aria-label={isSelectorVisible ? "Ocultar selector de mes y año" : "Mostrar selector de mes y año"}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 border border-transparent hover:border-border/40 transition-all duration-200 shrink-0"
            >
              {isSelectorVisible ? (
                <ChevronUp className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              )}
            </Button>
          </div>

          {/* Selector de Mes y Año con animación suave y rápida */}
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out w-full md:w-auto",
              isSelectorVisible
                ? "grid-rows-[1fr] opacity-100 scale-100"
                : "grid-rows-[0fr] opacity-0 scale-95 pointer-events-none"
            )}
          >
            <div className="overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-xl bg-card border border-border/80 shadow-xs backdrop-blur-md">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="h-9 w-9 border-border bg-background hover:bg-accent text-foreground shadow-2xs transition-all hover:scale-105 active:scale-95"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Selector de Mes */}
                <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="h-9 w-[130px] sm:w-[145px] border-border bg-background text-xs sm:text-sm font-semibold text-foreground shadow-2xs hover:bg-accent/50 focus:ring-2 focus:ring-primary/20">
                    <div className="flex items-center gap-1.5 truncate">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <SelectValue>{MONTH_NAMES[currentMonth.getMonth()]}</SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {MONTH_NAMES.map((name, idx) => (
                      <SelectItem key={name} value={idx.toString()} className="text-xs sm:text-sm font-medium">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selector de Año */}
                <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="h-9 w-[85px] sm:w-[95px] border-border bg-background text-xs sm:text-sm font-semibold text-foreground shadow-2xs hover:bg-accent/50 focus:ring-2 focus:ring-primary/20">
                    <SelectValue>{currentMonth.getFullYear()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((y) => (
                      <SelectItem key={y} value={y.toString()} className="text-xs sm:text-sm font-medium">
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
                  className="h-9 w-9 border-border bg-background hover:bg-accent text-foreground shadow-2xs disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {!isSameMonth(currentMonth, today) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResetToToday}
                    className="h-9 px-2.5 sm:px-3 gap-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 shadow-2xs transition-all hover:scale-105 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hoy</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor Principal con ancho armónico */}
      <div className="max-w-[1600px] mx-auto w-full px-2 sm:px-6 flex flex-col items-center justify-center gap-6">
        {/* Tarjetas de Valores Resumen del Mes (Temp Máx/Mín, Humidad Prom, Lluvia Total) */}
        <div className="w-full">
          <MonthSummaryCards summary={data?.summary} isLoading={isLoading} />
        </div>

        {/* Grilla Principal (en pantallas grandes: 2fr Calendario a la izquierda, 1fr Temperatura y Lluvia mensual a la derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
          {/* 2fr: Calendario y selector de parámetros */}
          <div className="lg:col-span-2 flex flex-col gap-4 w-full">
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

          {/* 1fr: Temperatura Mensual y Lluvia Mensual */}
          <div className="lg:col-span-1 w-full">
            <MonthEvolutionChart
              days={data?.days ?? {}}
              currentMonth={currentMonth}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Comparativa Anual de Meses (mismo ancho que la grilla superior) */}
        <div className="w-full">
          <AnnualComparison initialYear={year} />
        </div>

        {/* Modal interactivo al hacer clic en un día */}
        <DayDetailModal
          dateStr={activeDayStr}
          stats={activeDayStats}
          isOpen={!!activeDayStr}
          onClose={() => setActiveDayStr(null)}
        />
      </div>
    </div>
  )
}
