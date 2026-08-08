import type React from "react"
import { Activity, ArrowUp, ChevronsLeftRightEllipsis, Droplets, Gauge, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string
  unit?: string
  subtitle?: React.ReactNode
  icon: React.ReactNode
  accentClassName: string
  valueClassName?: string
}

function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  accentClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "flex min-w-0 w-full flex-col  rounded-xl p-3 ",
        "glass-card border transition-all duration-300 hover:shadow-lg",
        "animate-in fade-in-50 slide-in-from-bottom-6 duration-700",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={cn("rounded-lg w-8 h-8 p-1.5", accentClassName)}>
          <span className="flex items-center justify-center w-full h-full">
            {icon}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-2xl sm:text-3xl font-bold tabular-nums tracking-tight",
            valueClassName,
          )}
        >
          <div className="flex items-center gap-1">
            {(parseFloat(value) >= 0)? "+" : ""} {value}
          </div>
        </span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>

      <div className="flex items-center gap-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <span>{subtitle}</span>
      </div>
    </article>
  )
}

export default function EstadisticasHoy({
  temp_max,
  temp_min,
  tempDiferencial = -999,
  humDiferencial = -999,
  deltaPressure,
}: {
  temp_max: number | null
  temp_min: number | null
  tempDiferencial?: number
  humDiferencial?: number
  deltaPressure: number | null
}) {
  const amplitudTermica = temp_max !== null && temp_min !== null ? (temp_max - temp_min).toFixed(1) : "--"
  const presion = deltaPressure !== null ? deltaPressure.toFixed(1) : "--"

  return (
    <section
      className={cn(
        "mb-8",
        "animate-in fade-in-50 slide-in-from-bottom-8 duration-700",
      )}
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-950/20">
          <Activity className="h-4 w-4 text-emerald-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Variación de los parámetros</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Amplitud térmica"
          value={amplitudTermica}
          unit="°C"
          icon={<ChevronsLeftRightEllipsis />}
          subtitle="Hasta el momento"
          accentClassName="border-orange-400/20 hover:border-orange-400/35 shadow-orange-500/10 bg-orange-500/5"
          valueClassName="from-orange-200 to-orange-50"
        />

        <StatCard
          title="Presión Atmosférica"
          value={presion}
          unit="hPa"
          icon={<Gauge />}
          subtitle= {parseFloat(presion) > 0 ? "Aumentó en los últimos 30' " : parseFloat(presion) < 0 ? "Disminuyó en los últimos 30' " : "Se mantuvo estable en los últimos 30' "
            }
          accentClassName="border-blue-400/20 hover:border-blue-400/35 shadow-blue-500/10 bg-blue-500/5"
          valueClassName="from-sky-200 to-sky-50"
        />

        {tempDiferencial !== -999 && (
          <StatCard
            title="Temperatura"
            value={Math.abs(tempDiferencial).toFixed(1)}
            unit="°C"
            icon={<Thermometer />}
            subtitle={
              tempDiferencial > 0 ? "Aumentó en los últimos 30' " : tempDiferencial < 0 ? "Disminuyó en los últimos 30' " : "Se mantuvo estable en los últimos 30'"
            }
            accentClassName={cn(
              "border-red-400/20 hover:border-red-400/35 shadow-red-500/10",
              tempDiferencial > 0 ? "bg-red-500/5" : tempDiferencial < 0 ? "bg-blue-500/5" : "bg-slate-500/5",
            )}
            valueClassName="from-red-200 to-orange-50"
          />
        )}

        {humDiferencial !== -999 && (
          <StatCard
            title="Humedad"
            value={Math.abs(humDiferencial).toFixed(1)}
            unit="%"
            icon={<Droplets />}
            subtitle={
              humDiferencial > 0 ? "Aumentó en los últimos 30' " : humDiferencial < 0 ? "Disminuyó en los últimos 30' " : "Se mantuvo estable en los últimos 30' "
            }
            accentClassName={cn(
              "border-cyan-400/20 hover:border-cyan-400/35 shadow-cyan-500/10",
              humDiferencial > 0 ? "bg-cyan-500/5" : humDiferencial < 0 ? "bg-sky-500/5" : "bg-slate-500/5",
            )}
            valueClassName="from-cyan-200 to-sky-50"
          />
        )}
      </div>
    </section>
  )
}