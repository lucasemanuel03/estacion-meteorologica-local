"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import { Clock, CloudRain, Cpu, EyeOff, Gauge, History, Loader2, MonitorDot, Power, Wifi } from "lucide-react"
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
import { MiniStat, ReportTypeBadge, SensorRow } from "./status-detail-parts"
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

function LatestStatusCards({ report }: { report: FormattedStationStatusReport }) {
  const wifi = getWifiSignalLabel(report.board.wifi_rssi_dbm)
  const hasSensorError =
    report.sensors.dht.status === "ERROR" || report.sensors.bmp180.status === "ERROR"

  return (
    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
      <Card
        className={cn(
          "glass-card border transition-all duration-300 hover:shadow-lg",
          "border-border/40 hover:shadow-sky-500/10",
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base font-semibold">Placa</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <MiniStat icon={Wifi} label="WiFi" value={`${report.board.wifi_rssi_dbm} dBm`} />
            <MiniStat
              icon={Cpu}
              label="Memoria libre"
              value={`${report.board.free_heap_bytes / 1024} KB`}
            />
            <MiniStat icon={Power} label="Uptime" value={formatUptime(report.uptime_sec)} />
            <MiniStat
              icon={Clock}
              label="NTP"
              value={report.ntp_synced ? "Sincronizado" : "Sin sincronizar"}
            />
            <MiniStat icon={Gauge} label="Último Reinicio" value={report.board.reset_reason} />
            <MiniStat icon={MonitorDot} label="MAC" value={report.board.mac_address} />
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "glass-card border transition-all duration-300 hover:shadow-lg",
          hasSensorError ? "border-red-400/25 hover:shadow-red-500/10" : "border-border/40 hover:shadow-emerald-500/10",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Sensores</CardTitle>
        </CardHeader>
        <CardContent>
          <SensorRow report={report} />
        </CardContent>
      </Card>
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estado de la Estación</h1>
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

      {report && <LatestStatusCards report={report} />}

      <Separator />
        
      <div className="flex flex-col items-center gap-3">
        <a href="/test" className="w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full max-w-xs"
          >
            <CloudRain />
            Ver eventos de lluvia
          </Button>
        </a>
        <Button
          type="button"
          variant="outline"
          className="w-full max-w-xs"
          disabled={isLoading || historyLoading}
          onClick={loadHistory}
        >
          {historyLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando registros...
            </>
          ) : showHistory ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Ocultar últimos registros
              </>
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
