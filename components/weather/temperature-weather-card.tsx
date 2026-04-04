import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import TrendIcon from "./trend-icon"
import getTempColor from "@/lib/utils/functions/getTempColor"

interface TemperatureWeatherCardProps {
  title: string
  temperature: number | null
  unit?: string
  subtitle?: string
  icon?: React.ReactNode
  diferencial?: number
  treshold?: number
}

export function TemperatureWeatherCard({
  title,
  temperature,
  unit = "°C",
  subtitle,
  icon,
  diferencial,
  treshold = 0.2,
}: TemperatureWeatherCardProps) {
  const getTrendState = (value?: number, thresholdValue = 0.2) => {
    if (value === undefined || Number.isNaN(value)) return "stable"
    if (value > thresholdValue) return "up"
    if (value < -thresholdValue) return "down"
    return "stable"
  }

  const safeTemperature = temperature ?? 20
  const style = getTempColor(safeTemperature)
  const trendState = getTrendState(diferencial, treshold)

  const trendAnimationClass = {
    up: "animate-ascenso",
    down: "animate-descenso",
    stable: "animate-estable",
  }[trendState]

  return (
    <Card
      className={cn(
        "glass-card",
        "transition-all duration-500 hover:shadow-2xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-500",
        "py-4",
        style.gradient,
        style.border,
        style.glow
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <CardTitle className="text-lg sm:text-xl font-semibold tracking-wide text-foreground/90">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-2xl backdrop-blur-sm", style.iconBg)}>
          <div className={cn("w-6 h-6", style.iconColor)}>{icon}</div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex gap-2 items-baseline justify-center">
          <span className={cn("text-5xl sm:text-6xl font-bold tracking-wide drop-shadow-sm", style.textColor)}>
            {temperature ?? "--"}
          </span>
          {unit && <span className="text-2xl sm:text-3xl font-medium text-muted-foreground">{unit}</span>}
        </div>

        {subtitle && (
          <div className="flex items-center justify-center gap-2 mt-5 px-3 py-2 rounded-lg bg-background/40 backdrop-blur-sm">
            <div className={cn("absolute inset-0 pointer-events-none", trendAnimationClass, style.textColor)} />

            {diferencial !== undefined && <TrendIcon diferencial={diferencial} threshold={treshold} />}
            <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
