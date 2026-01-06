import type { ComponentType } from "react"
import { CalendarDays, Droplets, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"

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
      <CardContent className="grid gap-3 sm:grid-cols-2">
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
      </CardContent>
    </Card>
  )
}
