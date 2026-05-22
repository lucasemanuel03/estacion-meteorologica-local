import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { AR_TZ_OFFSET_MINUTES } from "@/lib/utils/timezone"
import { HourlyAverages } from "@/lib/types/weather"


type Metric = "temperature" | "humidity"

interface CurvaTempHumProps {
  data: HourlyAverages[]
  metric: Metric
  loading?: boolean
  error?: string | null
  showAllHours?: boolean // Si true, muestra 0-23, si false solo hasta la hora actual
}

function getCurrentLocalHour(): number {
  const now = Date.now()
  const local = new Date(now - AR_TZ_OFFSET_MINUTES * 60 * 1000)
  return local.getUTCHours()
}

function roundDown(value: number, step: number): number {
  return Math.floor(value / step) * step
}

function roundUp(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

function computeYDomain(values: number[], metric: Metric): [number, number] {
  if (values.length === 0) {
    return metric === "temperature" ? [0, 30] : [0, 100]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  if (metric === "temperature") {
    const pad = Math.max(span * 0.12, 2)
    let lo = roundDown(min - pad, 5)
    let hi = roundUp(max + pad, 5)
    if (hi - lo < 10) {
      const mid = (min + max) / 2
      lo = roundDown(mid - 5, 5)
      hi = roundUp(mid + 5, 5)
    }
    return [lo, hi]
  }

  const pad = Math.max(span * 0.12, 5)
  let lo = Math.max(0, roundDown(min - pad, 10))
  let hi = Math.min(100, roundUp(max + pad, 10))
  if (hi - lo < 20) {
    const mid = (min + max) / 2
    lo = Math.max(0, roundDown(mid - 10, 10))
    hi = Math.min(100, roundUp(mid + 10, 10))
  }
  return [lo, hi]
}

function hourTicks(maxHour: number): number[] {
  const step = maxHour > 12 ? 2 : 1
  const ticks: number[] = []
  for (let h = 0; h <= maxHour; h += step) {
    ticks.push(h)
  }
  if (ticks[ticks.length - 1] !== maxHour) {
    ticks.push(maxHour)
  }
  return ticks
}

export default function CurvaTempHum({ 
  data, 
  metric, 
  loading = false, 
  error = null,
  showAllHours = false 
}: CurvaTempHumProps) {
  const { chartData, yAxisDomain, maxHour } = useMemo(() => {
    const currentHour = getCurrentLocalHour()
    const maxHour = showAllHours ? 23 : currentHour
    
    const map = new Map<number, { count: number; avgTemperature: number; avgHumidity: number }>()
    data.forEach((entry) => {
      map.set(entry.hour, {
        count: entry.count,
        avgTemperature: entry.avgTemperature,
        avgHumidity: entry.avgHumidity,
      })
    })

    const filled = [] as Array<{
      hour: number
      label: string
      avgTemperature: number | null
      avgHumidity: number | null
      count: number
    }>

    for (let h = 0; h <= maxHour; h++) {
      const found = map.get(h)
      filled.push({
        hour: h,
        label: `${h.toString().padStart(2, "0")}`,
        avgTemperature: found ? found.avgTemperature : null,
        avgHumidity: found ? found.avgHumidity : null,
        count: found ? found.count : 0,
      })
    }

    const values = filled
      .map((d) => (metric === "temperature" ? d.avgTemperature : d.avgHumidity))
      .filter((v): v is number => v !== null)

    const domain = computeYDomain(values, metric)

    return { chartData: filled, yAxisDomain: domain, maxHour }
  }, [data, showAllHours, metric])

  if (loading) {
    return (
      <div className="h-72 w-full flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">No se pudo cargar la gráfica: {error}</p>
  }

  if (!chartData.some((d) => (metric === "temperature" ? d.avgTemperature : d.avgHumidity) !== null)) {
    return <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
  }

  const dataKey = metric === "temperature" ? "avgTemperature" : "avgHumidity"
  const color = metric === "temperature" ? "#f97316" : "#0ea5e9"


  return (
    <div className="h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 4, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis
            type="number"
            dataKey="hour"
            domain={[0, maxHour]}
            allowDecimals={false}
            padding={{ left: 0, right: 0 }}
            ticks={hourTicks(maxHour)}
            height={48}
            tickFormatter={(h) => `${Number(h).toString().padStart(2, "0")}`}
            label={{ value: "Horas", angle: 0, position: "insideBottom" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={30}
            tickMargin={1}
            domain={yAxisDomain}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value: any) => {
              if (value === null || value === undefined) return ["Sin datos", ""]
              const hour = Math.floor(value)
              const cnt = chartData.find((d) => d.hour === hour)?.count ?? 0
              return [`${value} ${metric === "temperature" ? "°C" : "%"} (Con ${cnt} muestra/s)`]
            }}
            labelFormatter={(label) => `Hora: ${label}`}
            contentStyle={{
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              border: '1px solid var(--border)',
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />

          <Area
            type="monotone"
            dataKey={dataKey}
            name={metric === "temperature" ? "Temperatura" : "Humedad"}
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={3}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
