"use client"

import { useMemo } from "react"
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import {
  Thermometer,
  ThermometerSnowflake,
  CloudRain,
  TrendingUp,
  Droplets,
  BarChart2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { DailyWeatherStats } from "@/lib/types/weather"

// ─── Types ───────────────────────────────────────────────────────────────────

interface DayPoint {
  day: number
  temp_max: number | null
  temp_min: number | null
  precip_total: number | null
}

interface MonthEvolutionChartProps {
  days: Record<string, DailyWeatherStats>
  currentMonth: Date
  isLoading?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function buildChartData(
  days: Record<string, DailyWeatherStats>,
  year: number,
  month: number,
): DayPoint[] {
  const totalDays = getDaysInMonth(year, month)
  return Array.from({ length: totalDays }, (_, i) => {
    const d = i + 1
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const s = days[dateStr]
    return {
      day: d,
      temp_max: s?.temp_max ?? null,
      temp_min: s?.temp_min ?? null,
      precip_total: s?.precip_total ?? null,
    }
  })
}

function roundDown(v: number, step: number) { return Math.floor(v / step) * step }
function roundUp(v: number, step: number) { return Math.ceil(v / step) * step }

function computeTempDomain(data: DayPoint[]): [number, number] {
  const vals = data
    .flatMap((d) => [d.temp_max, d.temp_min])
    .filter((v): v is number => v !== null)
  if (vals.length === 0) return [0, 40]
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = Math.max((max - min) * 0.15, 3)
  return [roundDown(min - pad, 5), roundUp(max + pad, 5)]
}

function computeRainDomain(data: DayPoint[]): [number, number] {
  const vals = data
    .map((d) => d.precip_total)
    .filter((v): v is number => v !== null && v > 0)
  if (vals.length === 0) return [0, 10]
  return [0, roundUp(Math.max(...vals) * 1.2, 5)]
}

function buildXTicks(totalDays: number): number[] {
  const step = totalDays > 20 ? 5 : totalDays > 10 ? 2 : 1
  const ticks: number[] = []
  for (let d = 1; d <= totalDays; d += step) ticks.push(d)
  if (ticks[ticks.length - 1] !== totalDays) ticks.push(totalDays)
  return ticks
}

// ─── Stat mini-card ───────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  unit,
  icon: Icon,
  colorClass,
  iconBgClass,
}: {
  label: string
  value: string
  unit?: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  iconBgClass: string
}) {
  return (
    <div className="glass-card p-3 flex items-center gap-3 min-w-27.5">
      <div className={cn("rounded-lg p-2 shrink-0", iconBgClass)}>
        <Icon className={cn("w-4 h-4", colorClass)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{label}</p>
        <p className={cn("text-lg font-bold tracking-tight leading-tight", colorClass)}>
          {value}
          {unit && <span className="text-xs font-medium text-muted-foreground ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "8px 12px",
  fontSize: 12,
  color: "var(--foreground)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
}

function TempTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const maxEntry = payload.find((p: any) => p.dataKey === "temp_max")
  const minEntry = payload.find((p: any) => p.dataKey === "temp_min")
  return (
    <div style={tooltipStyle}>
      <p className="font-semibold mb-1 text-foreground">Día {label}</p>
      {maxEntry?.value != null && (
        <p className="text-red-500 dark:text-red-400">Máxima: <b>{maxEntry.value}°C</b></p>
      )}
      {minEntry?.value != null && (
        <p className="text-blue-500 dark:text-blue-400">Mínima: <b>{minEntry.value}°C</b></p>
      )}
      {maxEntry?.value == null && minEntry?.value == null && (
        <p className="text-muted-foreground italic">Sin datos</p>
      )}
    </div>
  )
}

function RainTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div style={tooltipStyle}>
      <p className="font-semibold mb-1 text-foreground">Día {label}</p>
      {val != null && val > 0
        ? <p className="text-sky-500 dark:text-sky-400">Lluvia: <b>{val} mm</b></p>
        : <p className="text-muted-foreground italic">Sin lluvia</p>
      }
    </div>
  )
}

// ─── Shared axis style ────────────────────────────────────────────────────────

const axisStyle = { fontSize: 11, fill: "var(--muted-foreground)" }
const xLabel = {
  value: "Día del mes",
  position: "insideBottom" as const,
  offset: -6,
  style: { fontSize: 11, fill: "var(--muted-foreground)" },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MonthEvolutionChart({
  days,
  currentMonth,
  isLoading = false,
}: MonthEvolutionChartProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  const chartData = useMemo(
    () => buildChartData(days, year, month),
    [days, year, month],
  )

  const tempDomain = useMemo(() => computeTempDomain(chartData), [chartData])
  const rainDomain = useMemo(() => computeRainDomain(chartData), [chartData])
  const totalDays = getDaysInMonth(year, month)
  const xTicks = useMemo(() => buildXTicks(totalDays), [totalDays])

  // Summary stats
  const tempMaxVal = useMemo(() => {
    const vals = chartData.map((d) => d.temp_max).filter((v): v is number => v !== null)
    return vals.length > 0 ? Math.max(...vals) : null
  }, [chartData])

  const tempMinVal = useMemo(() => {
    const vals = chartData.map((d) => d.temp_min).filter((v): v is number => v !== null)
    return vals.length > 0 ? Math.min(...vals) : null
  }, [chartData])

  const tempAvgVal = useMemo(() => {
    const maxVals = chartData.map((d) => d.temp_max).filter((v): v is number => v !== null)
    const minVals = chartData.map((d) => d.temp_min).filter((v): v is number => v !== null)
    if (maxVals.length === 0 && minVals.length === 0) return null
    const allVals = [...maxVals, ...minVals]
    return Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10
  }, [chartData])

  const rainTotalVal = useMemo(() => {
    const vals = chartData
      .map((d) => d.precip_total)
      .filter((v): v is number => v !== null)
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) * 10) / 10 : null
  }, [chartData])

  const rainMaxVal = useMemo(() => {
    const vals = chartData
      .map((d) => d.precip_total)
      .filter((v): v is number => v !== null && v > 0)
    return vals.length > 0 ? Math.max(...vals) : null
  }, [chartData])

  const hasTemp = tempMaxVal !== null || tempMinVal !== null
  const hasRain = rainTotalVal !== null && rainTotalVal > 0

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-14 w-28 rounded-xl" />
              <Skeleton className="h-14 w-28 rounded-xl" />
            </div>
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6">

      {/* ── Temperatura ─────────────────────────────────────── */}
      <section className="glass-card rounded-2xl p-5 flex flex-col gap-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-orange-500/10 p-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Temperatura mensual</h2>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-2">
          <StatChip
            label="Máxima"
            value={tempMaxVal !== null ? `${tempMaxVal}` : "—"}
            unit="°C"
            icon={Thermometer}
            colorClass="text-red-600 dark:text-red-400"
            iconBgClass="bg-red-500/10"
          />
          <StatChip
            label="Mínima"
            value={tempMinVal !== null ? `${tempMinVal}` : "—"}
            unit="°C"
            icon={ThermometerSnowflake}
            colorClass="text-blue-600 dark:text-blue-400"
            iconBgClass="bg-blue-500/10"
          />
          <StatChip
            label="Promedio"
            value={tempAvgVal !== null ? `${tempAvgVal}` : "—"}
            unit="°C"
            icon={Thermometer}
            colorClass="text-amber-600 dark:text-amber-400"
            iconBgClass="bg-amber-500/10"
          />
        </div>

        {/* Chart */}
        {!hasTemp ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No hay datos de temperatura para este mes.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={[1, totalDays]}
                  ticks={xTicks}
                  allowDecimals={false}
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={false}
                  height={40}
                  label={xLabel}
                />
                <YAxis
                  domain={tempDomain}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tick={axisStyle}
                  tickFormatter={(v) => `${v}°`}
                  allowDecimals={false}
                />
                <Tooltip content={<TempTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                  formatter={(value) =>
                    value === "temp_max" ? "T. Máxima" : "T. Mínima"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="temp_max"
                  name="temp_max"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="temp_min"
                  name="temp_min"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ── Lluvia ──────────────────────────────────────────── */}
      <section className="glass-card rounded-2xl p-5 flex flex-col gap-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-sky-500/10 p-2">
            <BarChart2 className="h-4 w-4 text-sky-500" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Lluvia mensual</h2>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 gap-2">
          <StatChip
            label="Total"
            value={rainTotalVal !== null ? `${rainTotalVal}` : "0"}
            unit="mm"
            icon={CloudRain}
            colorClass="text-sky-600 dark:text-sky-400"
            iconBgClass="bg-sky-500/10"
          />
          <StatChip
            label="Máximo de un día"
            value={rainMaxVal !== null ? `${rainMaxVal}` : "0"}
            unit="mm"
            icon={Droplets}
            colorClass="text-cyan-600 dark:text-cyan-400"
            iconBgClass="bg-cyan-500/10"
          />
        </div>

        {/* Chart */}
        {!hasRain ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No se registraron lluvias este mes.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  strokeOpacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={[0.5, totalDays + 0.5]}
                  ticks={xTicks}
                  allowDecimals={false}
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={false}
                  height={40}
                  label={xLabel}
                />
                <YAxis
                  domain={rainDomain}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tick={axisStyle}
                  tickFormatter={(v) => `${v}`}
                  label={{
                    value: "mm",
                    angle: -90,
                    position: "insideLeft" as const,
                    offset: 10,
                    style: { fontSize: 11, fill: "var(--muted-foreground)" },
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<RainTooltip />}
                  cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="precip_total"
                  name="Lluvia"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={26}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        (entry.precip_total ?? 0) > 0 ? "#0ea5e9" : "transparent"
                      }
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

    </div>
  )
}
