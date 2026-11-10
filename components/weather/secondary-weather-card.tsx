import type React from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import TrendIcon from "./trend-icon"
import { Clock } from "lucide-react"

interface SecondaryWeatherCardProps {
  title: string
  value?: string | number | null
  unit?: string
  subtitle?: string
  time?: string | null
  icon?: React.ReactNode
  variant?: "default" | "temperature" | "humidity" | "max" | "min"
  tempColor?: string
  diferencial?: number
  treshold?: number
}

export function SecondaryWeatherCard({
  title,
  value,
  unit,
  subtitle,
  time,
  icon,
  variant = "default",
  tempColor = "text-primary",
  diferencial,
  treshold = 0.2,
}: SecondaryWeatherCardProps) {
  const variants = {
    default: {
      gradient: "from-slate-500/10 to-slate-600/10",
      border: "hover:border-slate-400/30",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-600 dark:text-slate-400",
      glow: "hover:shadow-slate-500/20",
    },
    temperature: {
      gradient: "from-amber-500/5 via-transparent to-amber-500/30",
      border: "hover:border-orange-400/30",
      iconBg: "bg-linear-to-br from-orange-500/20 to-red-500/20",
      iconColor: tempColor,
      glow: "hover:shadow-orange-500/20",
    },
    humidity: {
      gradient: "from-background/20 via-transparent to-sky-500/30",
      border: "hover:border-blue-400/30",
      iconBg: "bg-linear-to-br from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      glow: "hover:shadow-blue-500/20",
    },
    max: {
      gradient: "from-red-500/5 via-transparent to-red-500/20",
      border: "hover:border-red-400/30",
      iconBg: "bg-red-500/15",
      iconColor: "text-red-600 dark:text-red-400",
      glow: "hover:shadow-red-500/20",
    },
    min: {
      gradient: "from-sky-500/5 via-transparent to-sky-500/20",
      border: "hover:border-sky-400/30",
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-600 dark:text-sky-400",
      glow: "hover:shadow-sky-500/20",
    },
  }

  const style = variants[variant]

  return (
    <Card
      className={cn(
        "glass-card h-full",
        "hover:shadow-2xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
        "p-1",
        style.gradient,
        style.border,
        style.glow
      )}
    >
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 relative z-10 h-full">
        {/* Left side: Title, Value, Subtitle / Time */}
        <div className="flex-1 min-w-0 mr-2 sm:mr-4 flex flex-col justify-center">
          <CardTitle className="text-xs sm:text-sm font-semibold tracking-wide text-foreground/80 truncate">
            {title}
          </CardTitle>

          {value && (
            <div className="flex items-baseline gap-1 mt-0.5">
              {diferencial !== undefined && (
                <TrendIcon diferencial={diferencial} threshold={treshold} />
              )}

              <span
                className={cn(
                  "text-lg sm:text-xl font-bold tracking-wide",
                  "bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent",
                  "drop-shadow-sm"
                )}
              >
                {value ?? "No disponible"}
              </span>
              {unit && (
                <span className="text-sm sm:text-base font-normal text-muted-foreground/80">
                  {unit}
                </span>
              )}
            </div>
          )}

          {time && (
            <div className="flex items-center gap-1 mt-1 text-[11px] sm:text-xs text-muted-foreground font-normal">
              <Clock className="w-3 h-3 shrink-0 opacity-70" />
              <span className="truncate">
                {time.startsWith("a las") ? time : `a las ${time}`}
              </span>
            </div>
          )}

          {subtitle && !time && (
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground/90">{subtitle}</p>
            </div>
          )}
        </div>

        {/* Right side: Icon */}
        <div
          className={cn(
            "shrink-0 p-2 rounded-xl backdrop-blur-sm transition-transform duration-300 hover:scale-110",
            style.iconBg
          )}
        >
          <div className={cn("w-4 h-4 sm:w-6 sm:h-6", style.iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  )
}
