"use client"

import { useEffect, useState } from "react"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurvaTempHum from "@/components/curva-temp-hum"
import { HourlyAverages } from "@/lib/types/weather"

export default function ModalDetails({ day }: { day: string }) {
  const [metric, setMetric] = useState<"temperature" | "humidity">("temperature")
  const [data, setData] = useState<HourlyAverages[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/day-stats/measurements-per-hours?date=${encodeURIComponent(day)}`)
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const json = await res.json()
        setData(json?.hourlyAverages ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [day])

  return (
    <DialogContent className="max-w-5xl">
      <DialogHeader>
        <DialogTitle>Detalles del historial meteorológico</DialogTitle>
        <DialogDescription>
          Información detallada sobre las mediciones históricas de temperatura y humedad.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4">
        <Tabs value={metric} onValueChange={(v) => setMetric(v as "temperature" | "humidity")}>
          <TabsList>
            <TabsTrigger value="temperature">Temperatura</TabsTrigger>
            <TabsTrigger value="humidity">Humedad</TabsTrigger>
          </TabsList>
        </Tabs>
        <CurvaTempHum
          data={data}
          metric={metric}
          loading={loading}
          error={error}
          showAllHours={true}
        />
      </div>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">Cerrar</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}