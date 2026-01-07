import { useEffect, useState, type ComponentType } from "react"
import { CalendarDays, Droplets, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import ModalDetails from "../weather-history/modal-details"
import type { HourlyAverages } from "@/lib/types/weather"

interface DayHistoryCardProps {
  day: DailyExtremes
}

const formatDate = (date: string) => {
  const parsed = new Date(date)
  return parsed.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    //year: "numeric",
    timeZone: "UTC",
  })
}

const formatTime = (timestamp: string | null) => {
  if (!timestamp) return "--:--"
  return new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatItem({
  label,
  value,
  unit,
  time,
  variant = "neutral",
  icon: Icon,
}: {
  label: string
  value: number | null
  unit: string
  time: string | null
  variant?: "neutral" | "max" | "min"
  icon: ComponentType<{ className?: string }>
}) {
  const variants = {
    neutral: "border-border",
    max: "border-red-500/60",
    min: "border-sky-500/60",
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3 shadow-sm", variants[variant])}>
      <div className="rounded-md bg-muted p-2 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">
            {value !== null && value !== undefined ? value.toFixed(1) : "--"}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground">A las {formatTime(time)}</p>
      </div>
    </div>
  )
}

export function DayHistoryCard({ day }: DayHistoryCardProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hourlyData, setHourlyData] = useState<HourlyAverages[]>([])

  useEffect(() => {
    if (!open) return
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/day-stats/measurements-per-hours?date=${encodeURIComponent(day.date)}`)
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const json = await res.json()
        setHourlyData(json.hourlyAverages ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        setHourlyData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [open, day.date])
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg capitalize">{formatDate(day.date)}</CardTitle>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-primary">
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm font-medium">{day.date}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">

          <StatItem
            label="Temp. maxima"
            value={day.temp_max}
            unit="°C"
            time={day.temp_max_time}
            variant="max"
            icon={Thermometer}
          />
          <StatItem
            label="Temp. minima"
            value={day.temp_min}
            unit="°C"
            time={day.temp_min_time}
            variant="min"
            icon={Thermometer}
          />
          <StatItem
            label="Humedad maxima"
            value={day.humidity_max}
            unit="%"
            time={day.humidity_max_time}
            variant="max"
            icon={Droplets}
          />
          <StatItem
            label="Humedad minima"
            value={day.humidity_min}
            unit="%"
            time={day.humidity_min_time}
            variant="min"
            icon={Droplets}
          />
        </div>
        <div>
          La Amplitud térmica del día fue de{" "}
          <span className="font-semibold">
            {day.temp_max !== null && day.temp_min !== null
              ? (day.temp_max - day.temp_min).toFixed(1)
              : "--"}{" "}
            °C
          </span>
        </div>
        <div className="align-right flex justify-end">
          <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
              <Button variant="default">Ver detalles</Button>
            </DialogTrigger>
            <ModalDetails day={day.date} />
          </Dialog>
        </div>

      </CardContent>
    </Card>
  )
}
