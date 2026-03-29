"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CurvaTempHum from "../curva-temp-hum"
import { cn } from "@/lib/utils"
import { useHourlyAverages } from "../../hooks/use-hourly-averages"

export default function CurveToday() {
  const { data, loading, error } = useHourlyAverages()

  return (
    <Card className={cn(
      "overflow-hidden backdrop-blur-xl",
      "bg-card",
      "border-border/50 shadow-xl shadow-border/50",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
    )}
    style={{ animationDelay: "500ms" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.1),rgba(255,255,255,0))] pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-wide">
            Evolución del Día
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Curvas simultáneas por hora de temperatura y humedad
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex w-full flex-col items-stretch gap-8 md:flex-row md:gap-10">
        <section className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold tracking-wide text-orange-600 dark:text-orange-400">
              Temperatura
            </h3>
          </div>
          <CurvaTempHum
            data={data}
            metric="temperature"
            loading={loading}
            error={error}
            showAllHours={false}
          />
        </section>

        <section
          className="h-px w-full shrink-0 bg-border/70 md:h-auto md:w-px md:self-stretch"
          aria-hidden="true"
        />

        <section className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold tracking-wide text-sky-600 dark:text-sky-400">
              Humedad
            </h3>
          </div>
          <CurvaTempHum
            data={data}
            metric="humidity"
            loading={loading}
            error={error}
            showAllHours={false}
          />
        </section>
      </CardContent>
    </Card>
  )
}
