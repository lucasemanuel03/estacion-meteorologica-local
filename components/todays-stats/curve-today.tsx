"use client"

import { useEffect, useMemo, useState } from "react"
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

type HourlyAverages = Array<{
  hour: number
  count: number
  avgTemperature: number
  avgHumidity: number
}>

type ApiResponse = {
  success: boolean
  date: string
  hoursWithData: number
  hourlyAverages: HourlyAverages
  timestamp: string
}

type Metric = "temperature" | "humidity"

export default function CurveToday() {
  const [metric, setMetric] = useState<Metric>("temperature")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HourlyAverages>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/todays-stats/measurements-per-hours")
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const json: ApiResponse = await res.json()
        if (!json.success) {
          throw new Error(json?.error || "Unknown error")
        }
        setData(json.hourlyAverages)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
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

    for (let h = 0; h <= currentHour; h++) {
      const found = map.get(h)
      filled.push({
        hour: h,
        label: `${h.toString().padStart(2, "0")}:00`,
        avgTemperature: found ? found.avgTemperature : null,
        avgHumidity: found ? found.avgHumidity : null,
        count: found ? found.count : 0,
      })
    }

    return filled
  }, [data])

  const renderChart = () => {
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
      return <p className="text-sm text-muted-foreground">No hay datos disponibles para hoy.</p>
    }

    const dataKey = metric === "temperature" ? "avgTemperature" : "avgHumidity"
    const color = metric === "temperature" ? "#f97316" : "#0ea5e9" // naranja / celeste
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
                return [`${value}`, `${metric === "temperature" ? "°C" : "%"} (n=${cnt})`]
              }}
              labelFormatter={(label) => `Hora ${label}`}
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Curva diária de hoy</CardTitle>
          <CardDescription>Promedio por hora de temperatura y humedad</CardDescription>
        </div>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList>
            <TabsTrigger value="temperature">Temperatura</TabsTrigger>
            <TabsTrigger value="humidity">Humedad</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}