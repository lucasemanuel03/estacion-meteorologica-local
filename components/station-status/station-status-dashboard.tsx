"use client"

import { useCallback, useEffect, useState, type ComponentType } from "react"
import useSWR from "swr"
import {
  Activity,
  Cpu,
  Droplets,
  Gauge,
  History,
  Loader2,
  MonitorDot,
  Power,
  Thermometer,
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  FormattedStationStatusReport,
  StationStatusLatestResponse,
  StationStatusRecentResponse,
} from "@/lib/types/station-status"
import {
  formatRecordedAtLabel,
  formatUptime,
  getWifiSignalLabel,
} from "@/lib/utils/functions/format-station-status"
import { AdvertenciaCard } from "@/components/ui/advertencia-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SecondaryWeatherCard } from "@/components/weather/secondary-weather-card"
import { SensorStatusBadge } from "./sensor-status-badge"
import { RecentStatusList } from "./recent-status-list"

const latestFetcher = async (url: string): Promise<StationStatusLatestResponse & { report?: FormattedStationStatusReport | null }> => {
  const res = await fetch(url)
  const json = await res.json()
  if (res.status === 404) {
    return { report: null, timestamp: new Date().toISOString() }
  }
  if (!res.ok) throw new Error(json.error ?? "Error al cargar datos")
  return json
}

type ConnectionState = "normal" | "warning" | "error"

function ReportTypeBadge({ type }: { type: FormattedStationStatusReport["report_type"] }) {
  const isBoot = type === "BOOT"

  return (
    <span
      className={cn(
        "rounded-lg border px-3 py-1 text-sm font-semibold",
        isBoot
          ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
          : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      )}
    >
      {isBoot ? "Arranque (BOOT)" : "Rutina (ROUTINE)"}
    </span>
  )
}

function StatusOverviewCard({ report }: { report: FormattedStationStatusReport }) {
  const wifi = getWifiSignalLabel(report.board.wifi_rssi_dbm)

  return (
    <Card
      className={cn(
        "glass-card border-2 animate-in fade-in-50 slide-in-from-bottom-8 duration-700",
        "bg-linear-to-br from-sky-500/5 via-transparent to-emerald-500/10",
        "hover:border-sky-400/30 hover:shadow-2xl hover:shadow-sky-500/15",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-foreground/90">Resumen del reporte</CardTitle>
          <ReportTypeBadge type={report.report_type} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <OverviewGrid report={report} wifi={wifi} />
      </CardContent>
    </Card>
  )
}

function OverviewGrid({
  report,
  wifi,
}: {
  report: FormattedStationStatusReport
  wifi: ReturnType<typeof getWifiSignalLabel>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Uptime</p>
        <p className="mt-1 text-xl font-bold">{formatUptime(report.uptime_sec)}</p>
      </div>
      <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Sincronización NTP</p>
        <p className={cn("mt-1 text-xl font-bold", report.ntp_synced ? "text-emerald-600" : "text-amber-600")}>
          {report.ntp_synced ? "Sincronizado" : "Sin sincronizar"}
        </p>
      </div>
      <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3 sm:col-span-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Señal WiFi</p>
        <p className="mt-1 text-xl font-bold">
          {report.board.wifi_rssi_dbm} dBm · {wifi.label}
        </p>
      </div>
    </div>
  )
}

function SensorsSection({ report }: { report: FormattedStationStatusReport }) {
  return (
    <section className="animate-in fade-in-50 slide-in-from-bottom-8 duration-700" style={{ animationDelay: "150ms" }}>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-xl bg-emerald-500/10 p-2">
          <Activity className="h-4 w-4 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Sensores y placa</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SecondaryWeatherCard
          title="WiFi (RSSI)"
          value={report.board.wifi_rssi_dbm}
          unit="dBm"
          subtitle={getWifiSignalLabel(report.board.wifi_rssi_dbm).label.toUpperCase()}
          icon={<Wifi className="h-full w-full text-sky-500" />}
          variant="humidity"
        />
        <SecondaryWeatherCard
          title="Memoria libre"
          value={report.board.free_heap_bytes.toLocaleString("es-ES")}
          unit="B"
          icon={<Cpu className="h-full w-full text-slate-500" />}
        />
        <SecondaryWeatherCard
          title="Motivo de reinicio"
          value={report.board.reset_reason}
          icon={<Power className="h-full w-full text-amber-500" />}
        />
        <SecondaryWeatherCard
          title="MAC"
          value={report.board.mac_address}
          icon={<MonitorDot className="h-full w-full text-violet-500" />}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SensorCard name="DHT22 (Temperatura y Humedad)" icon={Thermometer} status={report.sensors.dht.status} />
        <SensorCard name="BMP180 (Presión y Altitud)" icon={Gauge} status={report.sensors.bmp180.status} />
        <RainGaugeCard report={report} />
      </div>
    </section>
  )
}

function SensorCard({
  name,
  icon: Icon,
  status,
}: {
  name: string
  icon: ComponentType<{ className?: string }>
  status: FormattedStationStatusReport["sensors"]["dht"]["status"]
}) {
  const hasError = status === "ERROR"

  return (
    <div
      className={cn(
        "glass-card flex items-center justify-between rounded-xl border p-4",
        hasError ? "border-red-400/30 hover:shadow-red-500/10" : "border-emerald-400/20 hover:shadow-emerald-500/10",
        "transition-all duration-300 hover:shadow-lg",
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2", hasError ? "bg-red-500/15" : "bg-emerald-500/15")}>
          <Icon className={cn("h-5 w-5", hasError ? "text-red-500" : "text-emerald-500")} />
        </div>
        <span className="font-semibold">{name}</span>
      </div>
      <SensorStatusBadge status={status} />
    </div>
  )
}

function RainGaugeCard({ report }: { report: FormattedStationStatusReport }) {
  const rain = report.sensors.rain_gauge

  return (
    <div className="glass-card rounded-xl border border-sky-400/20 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-sky-500/15 p-2">
          <Droplets className="h-5 w-5 text-sky-500" />
        </div>
        <span className="font-semibold">Pluviómetro</span>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          Pin actual: <span className="font-bold">{rain.current_pin_state}</span>
        </p>
        <p>
          Eventos desde boot:{" "}
          <span className="font-bold">{rain.total_events_since_boot.toLocaleString("es-ES")}</span>
        </p>
        <p>
          Sin enviar: <span className="font-bold">{rain.unsent_events_count}</span>
        </p>
      </div>
    </div>
  )
}

export function StationStatusDashboard() {
  const [lastUpdateLabel, setLastUpdateLabel] = useState("")
  const [connectionState, setConnectionState] = useState<ConnectionState>("normal")
  const [showHistory, setShowHistory] = useState(false)
  const [recentReports, setRecentReports] = useState<FormattedStationStatusReport[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR(
    "/api/station-status",
    latestFetcher,
    { refreshInterval: 60000, revalidateOnFocus: true },
  )

  const report = data?.report ?? null

  useEffect(() => {
    if (!report?.recorded_at) return
    setLastUpdateLabel(formatRecordedAtLabel(report.recorded_at))
  }, [report?.recorded_at])

  useEffect(() => {
    if (!report?.recorded_at) return

    const checkConnection = () => {
      const minutes = (Date.now() - new Date(report.recorded_at).getTime()) / (1000 * 60)
      if (minutes > 60) setConnectionState("error")
      else if (minutes > 20) setConnectionState("warning")
      else setConnectionState("normal")
    }

    checkConnection()
    const interval = setInterval(checkConnection, 60000)
    return () => clearInterval(interval)
  }, [report?.recorded_at])

  const loadHistory = useCallback(async () => {
    if (showHistory) {
      setShowHistory(false)
      return
    }

    setHistoryLoading(true)
    setHistoryError(null)

    try {
      const res = await fetch("/api/station-status?limit=10")
      const json: StationStatusRecentResponse & { error?: string } = await res.json()

      if (!res.ok) {
        setHistoryError(json.error ?? "No se pudieron cargar los registros")
        return
      }

      setRecentReports(json.reports ?? [])
      setShowHistory(true)
    } catch {
      setHistoryError("No se pudieron cargar los registros")
    } finally {
      setHistoryLoading(false)
    }
  }, [showHistory])

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Error al cargar el estado de la estación</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-sky-500/10 via-violet-500/10 to-emerald-500/10 blur-3xl" />
        <div className="flex flex-col items-center justify-center pb-2">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/10 p-3">
              <MonitorDot className="h-6 w-6 text-sky-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estado de la Estación y Sensores</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary">Cargando...</span>
            </div>
          ) : lastUpdateLabel ? (
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Último contacto: {lastUpdateLabel}
            </p>
          ) : null}
        </div>
      </div>

      {connectionState === "warning" && (
        <AdvertenciaCard
          nivel="warning"
          titulo="Reporte desactualizado"
          descripcion="Hace más de 20 minutos que no llega un reporte de estado desde la placa."
        />
      )}

      {connectionState === "error" && (
        <AdvertenciaCard
          nivel="error"
          titulo="Sin reportes recientes"
          descripcion="No se recibió un reporte de estado en la última hora. Verificá la conexión de la NodeMCU."
        />
      )}

      {!isLoading && !report && (
        <Card className="glass-card border border-border/40">
          <CardContent className="py-12 text-center">
            <MonitorDot className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Aún no hay reportes de estado registrados.</p>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          <StatusOverviewCard report={report} />
          <SensorsSection report={report} />
        </>
      )}

      <Separator />

      <div className="flex flex-col items-center gap-3">
        <Button
          type="button"
          variant="dinamic"
          className="w-full max-w-sm"
          disabled={isLoading || historyLoading}
          onClick={loadHistory}
        >
          {historyLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando registros...
            </>
          ) : showHistory ? (
            "Ocultar últimos registros"
          ) : (
            <>
              <History className="mr-2 h-4 w-4" />
              Ver últimos registros
            </>
          )}
        </Button>

        {historyError && <p className="text-sm text-destructive">{historyError}</p>}
      </div>

      {showHistory && recentReports.length > 0 && <RecentStatusList reports={recentReports} />}

      {showHistory && recentReports.length === 0 && !historyLoading && (
        <p className="text-center text-sm text-muted-foreground">No hay registros para mostrar.</p>
      )}
    </div>
  )
}
