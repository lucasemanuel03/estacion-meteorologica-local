import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"

interface ExtremesDisplayProps {
  extremes: DailyExtremes | null
}

export default function CardExtremesDisplay({valor, title, unit, time, variant = "default"} : {valor: number | null, title: string, unit: string, time: string | null, variant?: "default" | "max" | "min"}) {
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--:--"
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
    const variants = {
    default: {
      border: "border-border",
      text: "text-muted-foreground",
    },
    max: {
      border: "border-red-500/50",
      text: "text-red-500",
    },
    min: {
      border: "border-sky-500/50",
      text: "text-sky-500",
    },
  }

  const style = variants[variant]
  return(
    <div className={cn(`space-y-1 border p-2 rounded-md text-center shadow-sm`, style.border)}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <div>
        <p className="text-2xl font-mono font-bold">
          {valor ?? "--"}
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </p>
      </div>
      <p className="text-xs text-muted-foreground">A las {formatTime(time ?? null)}</p>
    </div>

  )
}

export function ExtremesDisplay({ extremes }: ExtremesDisplayProps) {

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Valores Historicos del Día</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardExtremesDisplay
            valor={extremes?.temp_min ?? null}
            title="Temp. Mínima"
            unit="°C"
            variant="min"
            time={extremes?.temp_min_time ?? null}
          />
          <CardExtremesDisplay
            valor={extremes?.temp_max ?? null}
            title="Temp. Máxima"
            unit="°C"
            variant="max"
            time={extremes?.temp_max_time ?? null}
          />
          <CardExtremesDisplay
            valor={extremes?.humidity_min ?? null}
            title="Hum. Mínima"
            unit="%"
            time={extremes?.humidity_min_time ?? null}
          />
          <CardExtremesDisplay
            valor={extremes?.humidity_max ?? null}
            title="Hum. Máxima"
            unit="%"
            time={extremes?.humidity_max_time ?? null}
          />
        </div>
      </CardContent>
    </Card>
  )
}
