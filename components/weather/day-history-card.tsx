import { useEffect, useState, type ComponentType } from "react"
import { CalendarDays, Droplets, Eye, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import ModalDetails from "../weather-history/modal-details"
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
    neutral: {
      gradient: "from-slate-500/5 to-slate-600/5",
      border: "border-slate-400/30",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-600",
    },
    max: {
      gradient: "from-orange-500/5 via-transparent to-red-500/10",
      border: "border-red-400/30",
      iconBg: "bg-linear-to-br from-orange-700/20 to-red-700/20",
      iconColor: "text-red-300",
    },
    min: {
      gradient: "from-blue-500/5 via-transparent to-cyan-500/10",
      border: "border-blue-400/30",
      iconBg: "bg-linear-to-br from-blue-700/20 to-cyan-700/20",
      iconColor: "text-blue-300",
    },
  }

  const style = variants[variant]

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border backdrop-blur-sm bg-linear-to-br p-4",
      "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
      style.gradient,
      style.border
    )}>
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-2.5 rounded-xl backdrop-blur-sm", style.iconBg)}>
            <Icon className={cn("h-5 w-5", style.iconColor)} />
          </div>
          <p className="text-base md:text-lg text-foreground font-medium">{label}</p>
        </div>

        <div className="">
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn(
              "text-3xl font-extrabold tracking-wide",
              "bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent"
            )}>
              {value !== null && value !== undefined ? value.toFixed(1) : "--"}
            </span>
            <span className="text-base text-muted-foreground font-medium">{unit}</span>
          </div>
          <p className="text-base text-muted-foreground mt-2"> A las {formatTime(time)}</p>
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
      "relative overflow-hidden border backdrop-blur-xl bg-linear-to-br",
      "transition-all duration-500 hover:shadow-xl",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
      "from-slate-500/5 via-background to-slate-500/10",
      "border-slate-400/30"
    )}>
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between gap-4 pb-4">
        <div className="flex-1">
          <CardTitle className="text-2xl font-semibold tracking-wide text-foreground capitalize">
            {formatDate(day.date)}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 border border-blue-400/30">
          <CalendarDays className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">{day.date}</span>
        </div>
      </CardHeader>
    
      <CardContent className="relative z-10 space-y-6">
        {/* Estadísticas grid */}
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatItem
              label="Temperatura Máxima"
              value={day.temp_max}
              unit="°C"
              time={day.temp_max_time}
              variant="max"
              icon={Thermometer}
            />
            <StatItem
              label="Temperatura Mínima"
              value={day.temp_min}
              unit="°C"
              time={day.temp_min_time}
              variant="min"
              icon={Thermometer}
            />
          </div>

          <Separator className="border border-foreground/10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatItem
              label="Humedad Máxima"
              value={day.humidity_max}
              unit="%"
              time={day.humidity_max_time}
              variant="max"
              icon={Droplets}
            />
            <StatItem
              label="Humedad Mínima"
              value={day.humidity_min}
              unit="%"
              time={day.humidity_min_time}
              variant="min"
              icon={Droplets}
            />
          </div>
        </div>


        {/* Amplitud térmica */}
        <div className={cn(
          "relative overflow-hidden rounded-lg border backdrop-blur-sm bg-linear-to-br p-4",
          "from-purple-500/5 via-transparent to-pink-500/10",
          "border-purple-400/30"
          )}>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <p className="text-base text-foreground font-normal">Amplitud Térmica del Día : </p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-2xl sm:text-3xl font-semibold tracking-wide",
                "bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent"
              )}>
                {thermalAmplitude}
              </span>
              <span className="text-base text-muted-foreground font-medium">°C</span>
            </div>
          </div>
        </div>

        {/* Ver detalles button */}
        <div className="flex justify-end pt-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="dinamic">
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </Button>
            </DialogTrigger>
            <ModalDetails day={day.date} />
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
