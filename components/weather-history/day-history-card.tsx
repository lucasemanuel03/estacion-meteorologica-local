import { useEffect, useState } from "react"
import { Calendar, Clock, Droplets, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import ModalDetails from "./modal-details"
import type { HourlyAverages } from "@/lib/types/weather"
import { Separator } from "../ui/separator"

interface DayHistoryCardProps {
  day: DailyExtremes
}

const formatDate = (date: string) => {
  const parsed = new Date(date)
  return parsed.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
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
  value,
  unit,
  time,
  variant = "neutral",
}: {
  value: number | null
  unit: string
  time: string | null
  variant?: "neutral" | "max" | "min"
}) {
  const variants = {
    neutral: {
      gradient: "from-slate-500/20 to-slate-600/10",
      border: "border-slate-400/30",
      iconColor: "text-slate-600",
    },
    max: {
      gradient: "from-red-500/20 to-red-600/10",
      border: "border-red-400/30",
      iconColor: "text-red-400",
    },
    min: {
      gradient: "from-blue-500/20 to-cyan-600/10",
      border: "border-blue-400/30",
      iconColor: "text-blue-500",
    },
  }

  const style = variants[variant]
  const isMax = variant === "max"

  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg px-2",
      "transition-all duration-300",
    )}>
      <div className="flex flex-row gap-2 items-start">
        <span className={cn("text-base font-normal", style.iconColor)}>
          {isMax ? "↑" : "↓"}
        </span>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">
              {value !== null && value !== undefined ? value.toFixed(1) : "--"}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          <p className="text-xs text-muted-foreground">{formatTime(time)}</p>
        </div>
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

  const thermalAmplitude = day.temp_max !== null && day.temp_min !== null
    ? (day.temp_max - day.temp_min).toFixed(1)
    : "--"

  return (
    <Card className={cn(
      "glass-card relative overflow-hidden",
      "transition-all duration-500 hover:shadow-xl",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
    )}>

      <CardHeader className="relative z-10 flex flex-row items-center justify-between">
        <div className="flex-1 justify-center items-center">
          <CardTitle className="text-xl font-bold tracking-wide text-foreground capitalize">
            <div className="flex items-center">
              <Calendar className="inline-block h-4 w-4 mr-1 " />
              {formatDate(day.date)}
            </div>
          </CardTitle>
        </div>
        {/* Ver detalles button */}
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="dinamic">
                <Clock/>
              </Button>
            </DialogTrigger>
            <ModalDetails day={day.date} open={open} />
          </Dialog>
        </div>
      </CardHeader>
      
      <Separator />

      <CardContent className="relative z-10 space-y-3 pt-2 px-4">
        
        <div className="flex flex-row gap-4 justify-center">
          {/* Temperatura */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="h-4 w-4 text-foreground/70" />
              <h3 className="text-sm font-medium text-foreground/80">Temperatura</h3>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <StatItem
                value={day.temp_max}
                unit="°C"
                time={day.temp_max_time}
                variant="max"
              />
              <StatItem
                value={day.temp_min}
                unit="°C"
                time={day.temp_min_time}
                variant="min"
              />
            </div>
          </div>
          <p className=" border my-2 border-border"></p>
          {/* Humedad */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="h-4 w-4 text-foreground/70" />
              <h3 className="text-sm font-medium text-foreground/80">Humedad</h3>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <StatItem
                value={day.humidity_max}
                unit="%"
                time={day.humidity_max_time}
                variant="max"
              />
              <StatItem
                value={day.humidity_min}
                unit="%"
                time={day.humidity_min_time}
                variant="min"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-center">
          {/* Amplitud térmica */}
          <div className={cn(
            "relative w-full overflow-hidden rounded-lg border py-2 px-3",
            "border-border",
            "flex items-center justify-between gap-2"
            )}>
             
                <p className="text-sm text-foreground font-normal truncate" title="Amplitud Térmica">Amplitud Térmica</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold">
                    {thermalAmplitude}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">°C</span>
                </div>
          </div>
          {/* Acumulado de Lluvia */} 
          <div className={cn(
            "relative w-full overflow-hidden rounded-lg border py-2 px-3",
            "border-border",
            "flex items-center justify-between"
            )}>
             
                <p className="text-sm text-foreground font-normal ">Lluvia</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold">
                    {day.precip_total?.toFixed(1) ?? "0.0"}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">mm</span>
                </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
