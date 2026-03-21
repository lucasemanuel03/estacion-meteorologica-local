"use client"

import { useState } from "react"
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
import { useHourlyAverages } from "../../hooks/use-hourly-averages"

export default function ModalDetails({ day, open }: { day: string; open: boolean }) {
  const [metric, setMetric] = useState<"temperature" | "humidity">("temperature")
  const { data, loading, error } = useHourlyAverages(day, open)

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