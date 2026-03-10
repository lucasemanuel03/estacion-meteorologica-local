"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { WeatherPrediction } from "@/lib/utils/functions/predictWeather"
import { SecondaryWeatherCard } from "./secondary-weather-card"
import {
  CloudLightning,
  Cloud,
  CloudSun,
  Sun,
  Sparkles,
  ArrowDown,
	Megaphone,
} from "lucide-react"

interface ProximasHorasDisplayProps {
  pressure: number | null
  prediction?: WeatherPrediction | null
}

function getPredictionStyle(status?: string | null) {
  if (!status) {
    return {
      badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-400/30",
      glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(100,116,139,0.12),rgba(255,255,255,0))]",
      icon: <Cloud className="h-full w-full text-slate-500" />,
    }
  }

  const s = status.toLowerCase()

  if (s.includes("alerta") || s.includes("tormenta")) {
    return {
      badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-400/30",
      glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.12),rgba(255,255,255,0))]",
      icon: <CloudLightning className="h-full w-full text-red-500" />,
    }
  }
  if (s.includes("inestable")) {
    return {
      badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-400/30",
      glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.12),rgba(255,255,255,0))]",
      icon: <Cloud className="h-full w-full text-orange-500" />,
    }
  }
  if (s.includes("cambio")) {
    return {
      badge: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-400/30",
      glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.12),rgba(255,255,255,0))]",
      icon: <CloudSun className="h-full w-full text-yellow-500" />,
    }
  }
  if (s.includes("mejora") || s.includes("mejorando")) {
    return {
      badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-400/30",
      glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.12),rgba(255,255,255,0))]",
      icon: <CloudSun className="h-full w-full text-teal-500" />,
    }
  }
  if (s.includes("excelente")) {
    return {
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/30",
      glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),rgba(255,255,255,0))]",
      icon: <Sparkles className="h-full w-full text-emerald-500" />,
    }
  }
  // estable / buen tiempo
  return {
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-400/30",
    glow: "bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.12),rgba(255,255,255,0))]",
    icon: <Sun className="h-full w-full text-sky-500" />,
  }
}

function BadgePrediction({prediction} : {prediction?: WeatherPrediction | null}) {
	const style = getPredictionStyle(prediction?.status)
	return(
		<>
			        {/* Badge de estado */}
        <div className="flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full",
              "text-sm sm:text-base font-bold uppercase tracking-wider",
              "backdrop-blur-sm border",
              "animate-in zoom-in-90 duration-500 delay-150",
              style.badge
            )}
          >
            {prediction?.status ?? "Sin datos"}
          </span>
        </div>
		</>
	)
}

export default function ProximasHorasDisplay({
  pressure,
  prediction,
}: ProximasHorasDisplayProps) {
  const style = getPredictionStyle(prediction?.status)

  return (
    <Card
      className={cn(
        "col-span-full overflow-hidden backdrop-blur-xl",
        "bg-linear-to-br from-background/95 to-muted/30",
        "border-border/50 shadow-xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
      )}
    >
      <div className={cn("absolute inset-0 pointer-events-none", style.glow)} />

      <CardHeader className="relative z-10">
        <CardTitle className="text-lg sm:text-2xl font-bold tracking-wide">
					<div className="flex flex-col sm:flex-row gap-5 items-center">
          	<p>Próximas horas</p>
						<BadgePrediction prediction={prediction} />
					</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-6">

				<div className="text-sm md:text-base font-medium flex items-center gap-3">
					<Megaphone className="h-auto w-12 bg-slate-500/10 p-2 rounded-2xl text-foreground" />
					<div>
						<b>La presión atmosférica está {prediction?.trendPressure ?? "---"}</b>
						<p>Se espera para las próximas horas <b>{prediction?.message ?? "Predicción no disponible"}</b></p>
					</div>
				</div>
      </CardContent>
    </Card>
  )
}
