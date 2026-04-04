import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Droplets, ThermometerSun } from "lucide-react"

interface ExtremesDisplayProps {
  extremes: DailyExtremes | null
}

export default function CardExtremesDisplay({valor, unit, time, variant = "default", index = 0} : {valor: number | null, unit: string, time: string | null, variant?: "default" | "max" | "min", index?: number}) {
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--:--"
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  const variants = {
    default: {
      gradient: "from-slate-500/10 to-slate-600/5",
      border: "border-slate-400/30",
      iconBg: "bg-slate-500/15",
      icon: <Droplets className="w-5 h-5 text-slate-500" />,
      valueColor: "text-foreground",
    },
    max: {
      gradient: "from-red-400/20 to-red-500/10",
      border: "border-border/50",
      iconBg: "bg-red-500/30",
      icon: <ArrowUp className="w-5 h-5" />,
      valueColor: "text-red-400",
    },
    min: {
      gradient: "from-blue-400/20 to-cyan-500/10",
      border: "border-border/50",
      iconBg: "bg-blue-500/30",
      icon: <ArrowDown className="w-5 h-5" />,
      valueColor: "text-blue-500",
    },
  }

  const style = variants[variant]
  
  return(
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg border px-3 py-2 w-full",
        "bg-linear-to-br backdrop-blur-sm transition-all duration-300 hover:shadow-md",
        "animate-in fade-in-50 slide-in-from-bottom-8 duration-700",
        style.gradient,
        style.border
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute w-full inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
          <div className={cn("p-1.5 rounded-md", style.iconBg)}>
            {style.icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-lg sm:text-xl font-bold text-foreground")}>
            {valor ?? "--"}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>

      <div className="relative z-10 mt-1 pt-1 border-t border-border/40">
        <p className="text-xs text-muted-foreground text-right">
          {formatTime(time ?? null)}
        </p>
      </div>
    </div>
  )
}

export function ExtremesDisplay({ extremes }: ExtremesDisplayProps) {
  return (
    <Card className={cn(
      "col-span-full overflow-hidden",
      "glass-card",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
    )}
    style={{ animationDelay: "300ms" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-wide">
          Valores Históricos del Día
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid sm:grid-cols-2 gap-6 text-foreground/80 w-full">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <ThermometerSun className="w-5 h-5"/>
              <p className="text-sm font-semibold">Temperatura</p>
            </div>
            <div className="flex flex-row gap-2">
              <CardExtremesDisplay
                valor={extremes?.temp_min ?? null}
                unit="°C"
                variant="min"
                time={extremes?.temp_min_time ?? null}
                index={0}
              />
              <CardExtremesDisplay
                valor={extremes?.temp_max ?? null}
                unit="°C"
                variant="max"
                time={extremes?.temp_max_time ?? null}
                index={1}
              />
            </div>
          </section>
          <section className="flex flex-col w-full gap-3">
            <div className="flex items-center gap-1">
              <Droplets className="h-5 w-5"/>
              <p className="text-sm font-semibold">Humedad</p>
            </div>
            <div className="flex flex-row w-full gap-2">
              <CardExtremesDisplay
                valor={extremes?.humidity_min ?? null}
                variant="min"
                unit="%"
                time={extremes?.humidity_min_time ?? null}
                index={2}
              />
              <CardExtremesDisplay
                valor={extremes?.humidity_max ?? null}
                variant="max"
                unit="%"
                time={extremes?.humidity_max_time ?? null}
                index={3}
              />
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
