import type { ComponentType } from "react"
import {
  Clock,
  Cpu,
  Droplets,
  Gauge,
  Power,
  Thermometer,
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FormattedStationStatusReport } from "@/lib/types/station-status"
import {
  formatRecordedAtLabel,
  formatUptime,
  getWifiSignalLabel,
} from "@/lib/utils/functions/format-station-status"
import { SensorStatusBadge } from "./sensor-status-badge"

function ReportTypeBadge({ type }: { type: FormattedStationStatusReport["report_type"] }) {
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

function MiniStat({
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

function RecentStatusCard({
  report,
  index,
}: {
  report: FormattedStationStatusReport
  index: number
}) {
  const wifi = getWifiSignalLabel(report.board.wifi_rssi_dbm)
  const hasSensorError =
    report.sensors.dht.status === "ERROR" ||
    report.sensors.bmp180.status === "ERROR"

  return (
    <article
      className={cn(
        "glass-card rounded-xl border p-4 transition-all duration-300 hover:shadow-lg",
        hasSensorError ? "border-red-400/25 hover:shadow-red-500/10" : "border-border/40 hover:shadow-sky-500/10",
        "animate-in fade-in-50 slide-in-from-bottom-6 duration-500",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{formatRecordedAtLabel(report.recorded_at)}</span>
        <ReportTypeBadge type={report.report_type} />
        {!report.ntp_synced && (
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            Sin NTP
          </span>
        )}
        <span
          className={cn(
            "ml-auto text-xs font-medium",
            wifi.tone === "good" && "text-emerald-600 dark:text-emerald-400",
            wifi.tone === "fair" && "text-amber-600 dark:text-amber-400",
            wifi.tone === "poor" && "text-red-600 dark:text-red-400",
          )}
        >
          {wifi.label}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <MiniStat icon={Wifi} label="WiFi" value={`${report.board.wifi_rssi_dbm} dBm`} />
        <MiniStat icon={Cpu} label="Memoria libre" value={`${report.board.free_heap_bytes.toLocaleString("es-ES")} B`} />
        <MiniStat icon={Power} label="Uptime" value={formatUptime(report.uptime_sec)} />
        <MiniStat icon={Gauge} label="Reinicio" value={report.board.reset_reason} />
      </div>

      <SensorRow report={report} />
    </article>
  )
}

function SensorRow({ report }: { report: FormattedStationStatusReport }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3 border-t border-border/40 pt-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Thermometer className="h-3.5 w-3.5" />
        DHT
        <SensorStatusBadge status={report.sensors.dht.status} />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Gauge className="h-3.5 w-3.5" />
        BMP180
        <SensorStatusBadge status={report.sensors.bmp180.status} />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Droplets className="h-3.5 w-3.5" />
        Pin {report.sensors.rain_gauge.current_pin_state} · {report.sensors.rain_gauge.unsent_events_count} sin enviar
      </span>
    </div>
  )
}

export function RecentStatusList({ reports }: { reports: FormattedStationStatusReport[] }) {
  return (
    <section className="space-y-3 animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
      <h3 className="text-lg font-semibold tracking-tight">Últimos {reports.length} registros</h3>
      <div className="flex flex-col gap-3">
        {reports.map((report, index) => (
          <RecentStatusCard key={report.id} report={report} index={index} />
        ))}
      </div>
    </section>
  )
}
