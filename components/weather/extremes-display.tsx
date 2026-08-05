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
      icon: <ArrowDown className="text-sky-600 dark:text-sky-400" />,
      valueColor: "text-sky-600 dark:text-sky-300",
      glow: "hover:shadow-sky-500/15",
    },
    max: {
      border: "border-red-400/25",
      iconBg: "bg-red-500/15",
      icon: <ArrowUp className=" text-red-700 dark:text-red-400" />,
      valueColor: "text-red-700 dark:text-red-400",
      glow: "hover:shadow-red-500/15",
    },
  }

  const style = styles[variant]

  return (
    <article
      className={cn(
        "flex min-w-0 w-full flex-col  rounded-xl p-3 ",
        "glass-card border transition-all duration-300",
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
        <div className={cn("rounded-lg p-1.5 w-8 h-8", style.iconBg)}>
          <span className="flex items-center justify-center w-full h-full">
            {style.icon}
          </span>
        </div>
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
        "w-full ",
        "backdrop-blur-sm",
        accentBorder,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      </div>
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
        {children}
      </div>
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
            Valores Extremos
          </h2>
        </div>
      </div>

      <div>
        <div className="relative z-10 grid grid-cols-1 gap-6 p-2 lg:grid-cols-2 lg:gap-6">
          <MetricGroup
            title="Temperatura"
            accentBorder="border-orange-400/20"
            icon={
              <ThermometerSun className="h-4 w-4 text-orange-500" aria-hidden="true" />
            }
          >
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
          </MetricGroup>

          <MetricGroup
            title="Humedad"
            accentBorder="border-sky-400/20"
            icon={<Droplets className="h-4 w-4 text-sky-500" aria-hidden="true" />}
          >
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
          </MetricGroup>
        </div>
      </div>
    </section>
  )
}
