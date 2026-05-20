import type { ComponentType } from "react"
import { Droplets, Gauge, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FormattedStationStatusReport } from "@/lib/types/station-status"
import { SensorStatusBadge } from "./sensor-status-badge"

export function ReportTypeBadge({ type }: { type: FormattedStationStatusReport["report_type"] }) {
  const isBoot = type === "BOOT"

  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 text-xs font-semibold",
        isBoot
          ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
          : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      )}
    >
      {isBoot ? "Arranque" : "Rutina"}
    </span>
  )
}

export function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-background/40 px-2 py-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export function SensorRow({ report }: { report: FormattedStationStatusReport }) {
  const rain = report.sensors.rain_gauge

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4">
        <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5" />
            DHT22 (Temperatura y Humedad)
          </div>
          <SensorStatusBadge status={report.sensors.dht.status} />
        </span>
        <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            BMP180 (Presión Atmosférica)
          </div>
          <SensorStatusBadge status={report.sensors.bmp180.status} />
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Droplets className="h-3.5 w-3.5" />
        Pin {rain.current_pin_state} · {rain.total_events_since_boot.toLocaleString("es-ES")} eventos ·{" "}
        {rain.unsent_events_count} sin enviar
      </span>
    </div>
  )
}
