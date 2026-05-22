import type { ReactNode } from "react"
import type { DailyExtremes } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Droplets,
  ThermometerSun,
} from "lucide-react"

interface ExtremesDisplayProps {
  extremes: DailyExtremes | null
}

function formatTime(timestamp: string | null) {
  if (!timestamp) return "--:--"
  return new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatValue(value: number | null) {
  if (value === null || value === undefined) return "--"
  return value.toFixed(1)
}

function ExtremeValueCard({
  label,
  value,
  unit,
  time,
  variant,
  index = 0,
}: {
  label: string
  value: number | null
  unit: string
  time: string | null
  variant: "min" | "max"
  index?: number
}) {
  const styles = {
    min: {
      border: "border-sky-400/25",
      iconBg: "bg-sky-500/15",
      icon: <ArrowDown className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      valueColor: "text-sky-600 dark:text-sky-400",
      glow: "hover:shadow-sky-500/15",
    },
    max: {
      border: "border-orange-400/25",
      iconBg: "bg-orange-500/15",
      icon: <ArrowUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
      valueColor: "text-orange-600 dark:text-orange-400",
      glow: "hover:shadow-orange-500/15",
    },
  }

  const style = styles[variant]

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl p-2.5 sm:p-4",
        "glass-card border transition-all duration-300 hover:shadow-lg",
        style.border,
        style.glow,
        "animate-in fade-in-50 slide-in-from-bottom-6 duration-700",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={cn("rounded-lg p-2", style.iconBg)}>{style.icon}</div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-2xl sm:text-3xl font-bold tabular-nums tracking-tight",
            style.valueColor,
          )}
        >
          {formatValue(value)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>

      <div className="flex items-center gap-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Registrado a las {formatTime(time)}</span>
      </div>
    </article>
  )
}

function MetricGroup({
  title,
  icon,
  accentBorder,
  children,
}: {
  title: string
  icon: ReactNode
  accentBorder: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        "bg-background/25 backdrop-blur-sm",
        accentBorder,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function ExtremesDisplay({ extremes }: ExtremesDisplayProps) {
  return (
    <section
      className={cn(
        "col-span-full mb-8",
        "animate-in fade-in-50 slide-in-from-bottom-8 duration-700",
      )}
      style={{ animationDelay: "300ms" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-xl bg-violet-500/10 p-2">
          <ThermometerSun className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Valores históricos del día
          </h2>
          <p className="text-sm text-muted-foreground">
            Mínimos y máximos registrados hoy
          </p>
        </div>
      </div>

      <div>
        <div className="relative z-10 grid grid-cols-1 gap-4 sm:p-6 lg:grid-cols-2 lg:gap-6">
          <MetricGroup
            title="Temperatura"
            accentBorder="border-orange-400/20"
            icon={
              <ThermometerSun className="h-4 w-4 text-orange-500" aria-hidden="true" />
            }
          >
           <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <ExtremeValueCard
              label="Mínima"
              value={extremes?.temp_min ?? null}
              unit="°C"
              time={extremes?.temp_min_time ?? null}
              variant="min"
              index={0}
            />
            <ExtremeValueCard
              label="Máxima"
              value={extremes?.temp_max ?? null}
              unit="°C"
              time={extremes?.temp_max_time ?? null}
              variant="max"
              index={1}
            />
            </div> 
          </MetricGroup>

          <MetricGroup
            title="Humedad"
            accentBorder="border-sky-400/20"
            icon={<Droplets className="h-4 w-4 text-sky-500" aria-hidden="true" />}
          >
            <div className="grid grid-cols-2 gap-2 lg:gap-4">
              <ExtremeValueCard
                label="Mínima"
                value={extremes?.humidity_min ?? null}
                unit="%"
                time={extremes?.humidity_min_time ?? null}
                variant="min"
                index={2}
              />
              <ExtremeValueCard
                label="Máxima"
                value={extremes?.humidity_max ?? null}
                unit="%"
                time={extremes?.humidity_max_time ?? null}
                variant="max"
                index={3}
              />
            </div>
          </MetricGroup>
        </div>
      </div>
    </section>
  )
}
