"use client"

import type { ReactNode } from "react"
import { CardDescription } from "@/components/ui/card"
import CurvaTempHum from "../curva-temp-hum"
import { cn } from "@/lib/utils"
import { useHourlyAverages } from "../../hooks/use-hourly-averages"
import { LineChart } from "lucide-react"

function ChartPanel({
  title,
  accent,
  children,
}: {
  title: string
  accent: "temperature" | "humidity"
  children: ReactNode
}) {
  const accents = {
    temperature: {
      dot: "bg-orange-500",
      title: "text-orange-600 dark:text-orange-400",
      border: "border-orange-400/20",
      glow: "hover:shadow-orange-500/10",
    },
    humidity: {
      dot: "bg-sky-500",
      title: "text-sky-600 dark:text-sky-400",
      border: "border-sky-400/20",
      glow: "hover:shadow-sky-500/10",
    },
  }

  const style = accents[accent]

  return (
    <section
      className={cn(
        "min-w-0 flex-1 space-y-4 rounded-2xl border p-4 sm:p-5",
        "glass-card backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
        style.border,
        style.glow,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn("inline-block h-2.5 w-2.5 rounded-full", style.dot)}
          aria-hidden="true"
        />
        <h3 className={cn("text-sm font-semibold tracking-wide", style.title)}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

export default function CurveToday() {
  const { data, loading, error } = useHourlyAverages()

  return (
    <section
      className={cn(
        "mb-8",
        "animate-in fade-in-50 slide-in-from-bottom-8 duration-700",
      )}
      style={{ animationDelay: "500ms" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-xl bg-emerald-500/10 p-2">
          <LineChart className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Evolución del día
          </h2>
          <CardDescription className="text-sm sm:text-base">
            Curvas por hora de temperatura y humedad
          </CardDescription>
        </div>
      </div>

      <div>
        <div className="relative z-10 flex w-full flex-col gap-5 p-5 sm:p-6 md:flex-row md:gap-6">
          <ChartPanel title="Temperatura" accent="temperature">
            <CurvaTempHum
              data={data}
              metric="temperature"
              loading={loading}
              error={error}
              showAllHours={false}
            />
          </ChartPanel>

          <ChartPanel title="Humedad" accent="humidity">
            <CurvaTempHum
              data={data}
              metric="humidity"
              loading={loading}
              error={error}
              showAllHours={false}
            />
          </ChartPanel>
        </div>
      </div>
    </section>
  )
}
