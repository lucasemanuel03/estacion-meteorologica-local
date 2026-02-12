import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import TrendIcon from "./trend-icon"


interface WeatherCardProps {
  title: string
  value: string | number | null
  unit?: string
  subtitle?: string
  icon?: React.ReactNode
  variant?: "default" | "temperature" | "humidity"
  tempColor?: string
  diferencial?: number
}

export function WeatherCard({ title, value, unit, subtitle, icon, variant = "default", tempColor="text-primary", diferencial }: WeatherCardProps) {
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
        "transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
        style.gradient,
        style.border,
        style.glow
      )}
    >
      {/* Atmospheric background effect */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-foreground/90">
          {title}
        </CardTitle>
        <div className={cn(
          "p-3 rounded-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-110",
          style.iconBg
        )}>
          <div className={cn("w-7 h-7", style.iconColor)}>
            {icon}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-baseline justify-center gap-2 py-4">
          <span className={cn(
            "text-6xl sm:text-7xl font-bold font-mono tracking-tight",
            "bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent",
            "drop-shadow-sm"
          )}>
            {value ?? "--"}
          </span>
          {unit && (
            <span className="text-3xl sm:text-4xl font-mono font-bold text-muted-foreground/80">
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <div className="flex  items-center justify-center gap-2 mt-3 px-3 py-2 rounded-lg bg-background/40 backdrop-blur-sm">
            {diferencial !== undefined && <TrendIcon diferencial={diferencial} />}
            <p className="text-sm sm:text-base font-medium text-muted-foreground">
              {subtitle}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
