"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurvaTempHum from "../curva-temp-hum"
import { HourlyAverages } from "@/lib/types/weather"
import { cn } from "@/lib/utils"


type ApiResponse = {
  success: boolean
  date: string
  hoursWithData: number
  hourlyAverages: HourlyAverages[]
  timestamp: string
}

type Metric = "temperature" | "humidity"

export default function CurveToday() {
  const [metric, setMetric] = useState<Metric>("temperature")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HourlyAverages[]>([])

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
          throw new Error("Unknown error")
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

  return (
    <Card className={cn(
      "overflow-hidden backdrop-blur-xl",
      "bg-linear-to-br from-cyan-500/5 via-background/95 to-blue-500/5",
      "border-cyan-400/20 shadow-xl shadow-cyan-500/10",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
    )}
    style={{ animationDelay: "500ms" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.1),rgba(255,255,255,0))] pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-wide">
            Curva diaria de hoy
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Promedio por hora de temperatura y humedad
          </CardDescription>
        </div>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList className="bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger 
              value="temperature"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 transition-all"
            >
              Temperatura
            </TabsTrigger>
            <TabsTrigger 
              value="humidity"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
            >
              Humedad
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="relative z-10">
        <CurvaTempHum 
          data={data} 
          metric={metric} 
          loading={loading} 
          error={error}
          showAllHours={false}
        />
      </CardContent>
    </Card>
  )
}
