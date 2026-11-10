"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useHourlyAverages } from "@/hooks/use-hourly-averages"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"

function roundDown(value: number, step: number): number {
  return Math.floor(value / step) * step
}

function roundUp(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

function computeTempDomain(values: number[]): [number, number] {
  if (values.length === 0) return [10, 35]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = Math.max(span * 0.15, 2)
  let lo = roundDown(min - pad, 5)
  let hi = roundUp(max + pad, 5)
  if (hi - lo < 10) {
    const mid = (min + max) / 2
    lo = roundDown(mid - 5, 5)
    hi = roundUp(mid + 5, 5)
  }
  return [lo, hi]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number | null
    name: string
    payload: {
      hour: number
      count: number
      avgTemperature: number | null
      avgHumidity: number | null
    }
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  const temp = row?.avgTemperature
  const hum = row?.avgHumidity
  const count = row?.count ?? 0

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
      }}
      className="text-xs space-y-1.5"
    >
      <p className="font-semibold text-foreground border-b border-border/50 pb-1 flex items-center justify-between gap-3">
        <span>Hora: {label}</span>
        {count > 0 && (
          <span className="text-[10px] font-normal text-muted-foreground">
            {count} {count === 1 ? "medición" : "mediciones"}
          </span>
        )}
      </p>
      <div className="flex items-center gap-2 pt-0.5">
        <span className="w-2.5 h-2.5 rounded-xs bg-[#f97316] shrink-0" />
        <span className="text-muted-foreground">Temperatura:</span>
        <span className="font-bold text-foreground ml-auto">
          {temp !== null && temp !== undefined ? `${temp.toFixed(1)} °C` : "—"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] shrink-0" />
        <span className="text-muted-foreground">Humedad:</span>
        <span className="font-bold text-foreground ml-auto">
          {hum !== null && hum !== undefined ? `${hum.toFixed(1)} %` : "—"}
        </span>
      </div>
    </div>
  )
}

export default function HourlyEvolutionChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [viewFullDay, setViewFullDay] = useState(false)

  // Criterio 1: Debe renderizarse cuando quede visible luego de hacer scroll
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Hook solo se dispara cuando isVisible es true
  const { data: hourlyData, loading, error } = useHourlyAverages(undefined, isVisible)

  // Procesamiento de datos para las 24 horas o hasta la hora máxima registrada
  const { chartData, tempDomain, hasAnyData } = useMemo(() => {
    const dataMap = new Map<number, { count: number; avgTemperature: number; avgHumidity: number }>()
    let maxDataHour = 0

    if (Array.isArray(hourlyData)) {
      hourlyData.forEach((item) => {
        dataMap.set(item.hour, item)
        if (item.hour > maxDataHour) {
          maxDataHour = item.hour
        }
      })
    }

    const now = new Date()
    const currentHour = now.getHours()
    const targetMaxHour = viewFullDay ? 23 : Math.max(currentHour, maxDataHour)

    const points: Array<{
      hour: number
      label: string
      avgTemperature: number | null
      avgHumidity: number | null
      count: number
    }> = []

    const tempValues: number[] = []

    for (let h = 0; h <= targetMaxHour; h++) {
      const match = dataMap.get(h)
      const avgTemp = match ? match.avgTemperature : null
      const avgHum = match ? match.avgHumidity : null
      const count = match ? match.count : 0

      if (avgTemp !== null) {
        tempValues.push(avgTemp)
      }

      points.push({
        hour: h,
        label: `${h.toString().padStart(2, "0")}h`,
        avgTemperature: avgTemp,
        avgHumidity: avgHum,
        count,
      })
    }

    return {
      chartData: points,
      tempDomain: computeTempDomain(tempValues),
      hasAnyData: tempValues.length > 0,
    }
  }, [hourlyData, viewFullDay])

  return (
    <div
      ref={containerRef}
      className="glass-card p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in-50 duration-500"
    >
      {/* Header con título requerido y chips de leyenda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-orange-500/10 p-2 shrink-0">
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Evolución por horas
            </h2>
            <p className="text-xs text-muted-foreground">
              Comportamiento horario de temperatura y humedad
            </p>
          </div>
        </div>

        {/* Leyenda interactiva & selector de rango */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#f97316]" />
            <span className="text-foreground font-medium">Temperatura (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
            <span className="text-foreground font-medium">Humedad (%)</span>
          </div>

          <button
            type="button"
            onClick={() => setViewFullDay((prev) => !prev)}
            className="ml-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Alternar entre ver hasta la hora actual o las 24 horas completas"
          >
            {viewFullDay ? "Ver hasta ahora" : "Ver 24h"}
          </button>
        </div>
      </div>

      {/* Contenido del gráfico */}
      {!isVisible || loading ? (
        <div className="h-64 sm:h-72 w-full flex flex-col justify-end gap-3 pb-2 pt-6">
          <div className="flex items-end justify-between h-44 gap-1.5 sm:gap-2 px-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-sm"
                style={{ height: `${25 + ((i * 13) % 65)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between px-2 pt-2 border-t border-border/40">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      ) : error ? (
        <div className="h-48 flex items-center justify-center text-sm text-destructive">
          Error al cargar los datos horarios: {error}
        </div>
      ) : !hasAnyData ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground text-center px-4">
          Aún no hay mediciones horarias registradas para el día de hoy.
        </div>
      ) : (
        <div className="h-64 sm:h-72 md:h-80 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 8, left: -16, bottom: 4 }}
            >
              <defs>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={0.15}
                vertical={false}
                stroke="currentColor"
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
                minTickGap={16}
                height={26}
              />

              {/* Eje Y Temperatura (Izquierdo) */}
              <YAxis
                yAxisId="temp"
                orientation="left"
                domain={tempDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `${v}°`}
                width={32}
                allowDecimals={false}
              />

              {/* Eje Y Humedad (Derecho) */}
              <YAxis
                yAxisId="hum"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `${v}%`}
                width={36}
                allowDecimals={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--accent)", opacity: 0.15 }}
              />

              {/* Humedad: Formato línea continua con fondo celeste */}
              <Area
                yAxisId="hum"
                type="monotone"
                dataKey="avgHumidity"
                name="Humedad"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fill="url(#humidityGradient)"
                fillOpacity={1}
                connectNulls={true}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "#0ea5e9",
                  strokeWidth: 2,
                  fill: "var(--background)",
                }}
              />

              {/* Temperatura: Bastones anaranjados */}
              <Bar
                yAxisId="temp"
                dataKey="avgTemperature"
                name="Temperatura"
                fill="#f97316"
                radius={[3, 3, 0, 0]}
                maxBarSize={16}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
