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

export default function CurvaTempHum({ 
  data, 
  metric, 
  loading = false, 
  error = null,
  showAllHours = false 
}: CurvaTempHumProps) {
  const chartData = useMemo(() => {
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
        label: `${h.toString().padStart(2, "0")}h.`,
        avgTemperature: found ? found.avgTemperature : null,
        avgHumidity: found ? found.avgHumidity : null,
        count: found ? found.count : 0,
      })
    }

    return filled
  }, [data, showAllHours])

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
  const yLabel = metric === "temperature" ? "Temperatura (°C)" : "Humedad (%)"

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={70}
            label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value: number | null, _name, item) => {
              const cnt = chartData[item?.payload?.hour]?.count ?? 0
              if (value === null || value === undefined) return ["Sin datos", ""]
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
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={metric === "temperature" ? "Temperatura" : "Humedad"}
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={2}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
