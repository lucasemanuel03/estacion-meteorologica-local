import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { WeatherCard } from "./weather-card"
import { Thermometer, Droplets } from "lucide-react"
import getTempColor from "@/lib/utils/functions/getTempColor"
import { cn } from "@/lib/utils"
import HeatIndexCard from "./heat-index-card"
import { HeatIndex } from "@/lib/types/weather"

interface ActualesDisplayProps {
  temperature: number | null
  humidity: number | null
  heatIndex: HeatIndex | null
  tempTrend?: { differential: number; message: string }
  humTrend?: { differential: number; message: string }
}

export default function ActualesDisplay({
  temperature,
  humidity,
  tempTrend,
  humTrend,
  heatIndex,
}: ActualesDisplayProps) {
  return (
    <Card
      className={cn(
        "col-span-full overflow-hidden backdrop-blur-xl",
        "bg-linear-to-br from-background/95 to-muted/30",
        "border-border/50 shadow-xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-wide">
          Valores Actuales
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid gap-6 md:grid-cols-3">
          <WeatherCard
            title="Temperatura"
            value={temperature}
            unit="°C"
            icon={<Thermometer className="h-full w-full" />}
            variant="temperature"
            tempColor={getTempColor(temperature ?? 16)}
            subtitle={tempTrend ? tempTrend.message : undefined}
            diferencial={tempTrend ? tempTrend.differential : undefined}
          />
          <WeatherCard
            title="Humedad"
            value={humidity}
            unit="%"
            icon={<Droplets className="h-full w-full" />}
            variant="humidity"
            subtitle={humTrend ? humTrend.message : undefined}
            diferencial={humTrend ? humTrend.differential : undefined}
          />
            <HeatIndexCard heatIndex={heatIndex} /> 
        </div>
      </CardContent>
    </Card>
  )
}

