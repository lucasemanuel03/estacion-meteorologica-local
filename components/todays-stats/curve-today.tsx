"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurvaTempHum from "../curva-temp-hum"
import { HourlyAverages } from "@/lib/types/weather"


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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Curva diària de hoy</CardTitle>
          <CardDescription>Promedio por hora de temperatura y humedad</CardDescription>
        </div>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList>
            <TabsTrigger value="temperature">Temperatura</TabsTrigger>
            <TabsTrigger value="humidity">Humedad</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
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
