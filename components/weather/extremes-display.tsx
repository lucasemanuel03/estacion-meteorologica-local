import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Droplets } from "lucide-react"

interface ExtremesDisplayProps {
  extremes: DailyExtremes | null
}

export default function CardExtremesDisplay({valor, title, unit, time, variant = "default", index = 0} : {valor: number | null, title: string, unit: string, time: string | null, variant?: "default" | "max" | "min", index?: number}) {
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--:--"
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  const variants = {
    default: {
      gradient: "from-slate-500/5 to-slate-600/5",
      border: "border-slate-400/20",
      iconBg: "bg-slate-500/10",
      icon: <Droplets className="w-5 h-5 text-slate-500" />,
      glow: "shadow-slate-400/10",
    },
    max: {
      gradient: "from-red-500/10 to-orange-500/5",
      border: "border-red-400/30",
      iconBg: "bg-red-500/15",
      icon: <ArrowUp className="w-5 h-5 text-red-500" />,
      glow: "shadow-red-400/20",
    },
    min: {
      gradient: "from-blue-500/10 to-cyan-500/5",
      border: "border-blue-400/30",
      iconBg: "bg-blue-500/15",
      icon: <ArrowDown className="w-5 h-5 text-blue-500" />,
      glow: "shadow-blue-400/20",
    },
  }

  const style = variants[variant]
  
  return(
    <div 
      className={cn(
        "relative space-y-3 border p-4 rounded-xl text-center backdrop-blur-sm",
        "bg-linear-to-br transition-all duration-500 hover:scale-105",
        "animate-in fade-in-50 slide-in-from-bottom-8",
        style.gradient,
        style.border,
        style.glow
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        <div className={cn("p-2 rounded-lg", style.iconBg)}>
          {style.icon}
        </div>
        <p className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">{title}</p>
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl sm:text-4xl font-mono font-black tracking-tight">
          {valor ?? "--"}
          <span className="text-lg font-bold text-muted-foreground ml-1.5">{unit}</span>
        </p>
      </div>
      
      <div className="relative z-10 border-t border-border/30">
        <p className="text-sm md:text-base font-medium text-muted-foreground">
          {formatTime(time ?? null)}
        </p>
      </div>
    </div>
  )
}

export function ExtremesDisplay({ extremes }: ExtremesDisplayProps) {
  return (
    <Card className={cn(
      "col-span-full overflow-hidden backdrop-blur-xl",
      "bg-linear-to-br from-background/95 to-muted/30",
      "border-border/50 shadow-xl",
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardExtremesDisplay
            valor={extremes?.temp_min ?? null}
            title="Temp. Mínima"
            unit="°C"
            variant="min"
            time={extremes?.temp_min_time ?? null}
            index={0}
          />
          <CardExtremesDisplay
            valor={extremes?.temp_max ?? null}
            title="Temp. Máxima"
            unit="°C"
            variant="max"
            time={extremes?.temp_max_time ?? null}
            index={1}
          />
          <CardExtremesDisplay
            valor={extremes?.humidity_min ?? null}
            title="Hum. Mínima"
            unit="%"
            time={extremes?.humidity_min_time ?? null}
            index={2}
          />
          <CardExtremesDisplay
            valor={extremes?.humidity_max ?? null}
            title="Hum. Máxima"
            unit="%"
            time={extremes?.humidity_max_time ?? null}
            index={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
