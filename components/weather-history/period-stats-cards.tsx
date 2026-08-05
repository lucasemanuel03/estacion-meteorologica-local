import { useMemo } from "react"
import { Thermometer, Droplets, Activity, TrendingUp, Snowflake } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface PeriodStatsCardsProps {
  history: DailyExtremes[]
  days: number
}

interface MetricCardProps {
  title: string
  value: number | null
  unit: string
  icon: React.ReactNode
  tone: "warm" | "cold" | "neutral"
}

const tones = {
  warm: {
    card: "from-orange-500/10 to-red-500/10 border-orange-400/25",
    value: "text-orange-500",
  },
  cold: {
    card: "from-blue-500/10  to-cyan-500/10 border-blue-400/25",
    value: "text-blue-500",
  },
  neutral: {
    card: "from-slate-600/10 to-slate-500/20 border-border",
    value: "text-emerald-600 dark:text-emerald-400",
  },
}

function MetricCard({ title, value, unit, tone, icon }: MetricCardProps) {
  return (
    <Card className="glass-card py-4 px-2">
      <CardContent className="flex flex-col items-center gap-2 relative z-10">
        <p 
          className={cn("text-sm flex items-center gap-1 truncate",
          tones[tone].value)}
          title={title}>
            {icon} {title}
        </p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold tracking-wide text-primary`}>
            {value !== null ? value.toFixed(1) : "--"}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function PeriodStatsCards({ history, days }: PeriodStatsCardsProps) {
  const stats = useMemo(() => {
    const maxTemps = history
      .map((day) => day.temp_max)
      .filter((value): value is number => value !== null)

    const minTemps = history
      .map((day) => day.temp_min)
      .filter((value): value is number => value !== null)

    const tempMeans = history
      .filter((day) => day.temp_max !== null && day.temp_min !== null)
      .map((day) => ((day.temp_max as number) + (day.temp_min as number)) / 2)

    const humidityMeans = history
      .filter((day) => day.humidity_max !== null && day.humidity_min !== null)
      .map((day) => ((day.humidity_max as number) + (day.humidity_min as number)) / 2)

    const amplitudes = history
      .filter((day) => day.temp_max !== null && day.temp_min !== null)
      .map((day) => (day.temp_max as number) - (day.temp_min as number))

    const precipitation = history
      .map((day) => day.precip_total)
      .filter((value): value is number => value !== null)

    const mean = (values: number[]) => {
      if (values.length === 0) return null
      const total = values.reduce((acc, current) => acc + current, 0)
      return total / values.length
    }
    const sum = (values: number[]) => {
      if (values.length === 0) return null
      return values.reduce((acc, current) => acc + current, 0)
    }

    return {
      avgTemp: mean(tempMeans),
      maxTemp: maxTemps.length > 0 ? Math.max(...maxTemps) : null,
      minTemp: minTemps.length > 0 ? Math.min(...minTemps) : null,
      avgHumidity: mean(humidityMeans),
      avgAmplitude: mean(amplitudes),
      maxAmplitude: amplitudes.length > 0 ? Math.max(...amplitudes) : null,
      avgPrecipitation: sum(precipitation),
      maxPrecipitation: precipitation.length > 0 ? Math.max(...precipitation) : null,
    }
  }, [history])

  if (history.length === 0) return null

  return (
    <section className="mb-8 animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <Activity className="h-4 w-4 text-emerald-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Últimos {days} días</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Thermometer className="h-4 w-4" />}
          title="Temperatura promedio" value={stats.avgTemp} unit="°C" tone="neutral" />
        <MetricCard 
          icon={<Droplets className="h-4 w-4" />}
          title="Humedad promedio" value={stats.avgHumidity} unit="%" tone="neutral" />
        <MetricCard 
          icon={<Activity className="h-4 w-4" />}
          title="Temperatura máxima" value={stats.maxTemp} unit="°C" tone="warm" />
        <MetricCard 
          icon={<Snowflake className="h-4 w-4" />}
          title="Temperatura mínima" value={stats.minTemp} unit="°C" tone="cold" />
        <MetricCard 
          icon={<TrendingUp className="h-4 w-4" />}
          title="Amplitud Máxima" value={stats.maxAmplitude} unit="°C" tone="warm" />
        <MetricCard 
          icon={<TrendingUp className="h-4 w-4" />}
          title="Amplitud Promedio" value={stats.avgAmplitude} unit="°C" tone="neutral" />
        <MetricCard 
          icon={<Droplets className="h-4 w-4" />}
          title="Acumulado de Lluvia" value={stats.avgPrecipitation} unit="mm" tone="neutral" />
        <MetricCard 
          icon={<Droplets className="h-4 w-4" />}
          title="Máxima Lluvia" value={stats.maxPrecipitation} unit="mm" tone="neutral" />
      </div>

    </section>
  )
}
