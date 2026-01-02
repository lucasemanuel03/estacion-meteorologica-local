import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface WeatherCardProps {
  title: string
  value: string | number | null
  unit?: string
  subtitle?: string
  icon?: React.ReactNode
  variant?: "default" | "temperature" | "humidity"
  tempColor?: string
}

export function WeatherCard({ title, value, unit, subtitle, icon, variant = "default", tempColor="text-primary" }: WeatherCardProps) {
  const variants = {
    default: {
      border: "border-muted-foreground/50",
      text: "text-muted-foreground",
      background: "bg-card",
      valueColor: "text-primary",
    },
    temperature: {
      border: "border-muted-foreground/50",
      text: `${tempColor}`,
      valueColor: `${tempColor}`,
    },
    humidity: {
      border: "border-blue-500/50",
      text: "text-blue-500",
      background: "bg-card",
      valueColor: "text-primary",
    },
  }

  const style = variants[variant]

  return (
    <Card className={cn("border", style.border)}>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className={cn("text-base sm:text-lg font-medium", style.text)}>{title}</CardTitle>
        <p className={style.text}>
          {icon}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-center gap-1">
          <span className={cn("text-5xl sm:text-6xl font-mono font-bold tracking-tight", style.valueColor)}>{value ?? "--"}</span>
          {unit && <span className="text-2xl font-mono text-muted-foreground">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
