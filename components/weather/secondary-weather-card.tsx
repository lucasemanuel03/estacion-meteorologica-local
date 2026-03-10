import type React from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import TrendIcon from "./trend-icon"


interface SecondaryWeatherCardProps {
  title: string
  value?: string | number | null
  unit?: string
  subtitle?: string
  icon?: React.ReactNode
  variant?: "default" | "temperature" | "humidity"
  tempColor?: string
  diferencial?: number
  treshold?: number
}

export function SecondaryWeatherCard({ title, value, unit, subtitle, icon, variant = "default", tempColor="text-primary", diferencial, treshold=0.2 }: SecondaryWeatherCardProps) {
  const variants = {
    default: {
      gradient: "from-slate-500/10 to-slate-600/10",
      border: "border-slate-400/30",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-600",
      glow: "shadow-slate-500/20",
    },
    temperature: {
      gradient: "from-amber-500/5 via-transparent to-amber-500/30",
      border: "border-orange-400/30",
      iconBg: "bg-linear-to-br from-orange-500/20 to-red-500/20",
      iconColor: tempColor,
      glow: "shadow-orange-500/20",
    },
    humidity: {
      gradient: "from-background/20 via-transparent to-sky-500/30",
      border: "border-blue-400/30",
      iconBg: "bg-linear-to-br from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      glow: "shadow-blue-500/20",
    },
  }

  const style = variants[variant]

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border backdrop-blur-xl bg-linear-to-br",
        "  hover:shadow-2xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
        "p-1 h-full",
        style.gradient,
        style.border,
        style.glow
      )}
    >
      {/* Atmospheric background effect */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between px-4 py-2 relative z-10">
        {/* Left side: Title, Value, Subtitle */}
        <div className="flex-1 min-w-0 mr-6">
          <CardTitle className="text-xs sm:text-sm font-semibold tracking-wide text-foreground/80 mb-1">
            {title}
          </CardTitle>
          
          {value && (
            <div className="flex items-baseline gap-1">

              {diferencial !== undefined && <TrendIcon diferencial={diferencial} threshold={treshold} />}

              <span className={cn(
                "text-lg sm:text-xl font-bold tracking-wide",
                "bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent",
                "drop-shadow-sm"
              )}>
                {value ?? "No disponible"}
              </span>
              {unit && (
                <span className="text-sm sm:text-base font-normal text-muted-foreground/80">
                  {unit}
                </span>
              )}
            </div>
          )}
          
          {subtitle && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/50 backdrop-blur-sm">
              <p className="text-sm sm:text-base font-medium text-foreground/90 ">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Right side: Icon */}
        <div className={cn(
          "shrink-0 p-2 rounded-xl backdrop-blur-sm transition-transform duration-300 hover:scale-110",
          style.iconBg
        )}>
          <div className={cn("w-4 h-4 sm:w-6 sm:h-6", style.iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  )
}
