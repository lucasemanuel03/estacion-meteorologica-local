"use client"

import { CardDescription } from "@/components/ui/card"
import CurvaTempHum from "../curva-temp-hum"
import { cn } from "@/lib/utils"
import { useHourlyAverages } from "../../hooks/use-hourly-averages"

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
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <span className="inline-block h-4 w-4 rounded-full bg-emerald-500" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Evolución del día</h2>
          <CardDescription className="text-sm sm:text-base">
            Curvas simultáneas por hora de temperatura y humedad
          </CardDescription>
        </div>
      </div>

      <div className={cn(
        "relative overflow-hidden rounded-3xl  backdrop-blur-xl",
        "glass-card",
      )}>
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex w-full flex-col items-stretch gap-8 p-5 sm:p-6 md:flex-row md:gap-10">
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
        </div>
      </div>
    </section>
  )
}
