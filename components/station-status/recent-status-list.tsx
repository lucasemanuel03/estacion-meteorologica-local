import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FormattedStationStatusReport } from "@/lib/types/station-status"
import {
  formatRecordedAtLabel,
  formatUptime,
} from "@/lib/utils/functions/format-station-status"
import { ReportTypeBadge } from "./status-detail-parts"
import { SensorStatusBadge } from "./sensor-status-badge"

export function RecentStatusList({ reports }: { reports: FormattedStationStatusReport[] }) {
  return (
    <div className="glass-card overflow-hidden rounded-xl border border-border/40 shadow-xs animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[850px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="whitespace-nowrap font-semibold">Fecha</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Tipo</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Uptime</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Motivo último reinicio</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">WiFi dBm</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Memoria libre kb</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">DHT22</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">BMP180</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Pin1</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Eventos</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Eventos sin enviar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const freeHeapKB = (report.board.free_heap_bytes / 1024).toFixed(2)
              return (
                <TableRow key={report.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="whitespace-nowrap text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{formatRecordedAtLabel(report.recorded_at)}</span>
                      {!report.ntp_synced && (
                        <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                          Sin NTP
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <ReportTypeBadge type={report.report_type} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatUptime(report.uptime_sec)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {report.board.reset_reason}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {report.board.wifi_rssi_dbm} dBm
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {freeHeapKB} KB
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <SensorStatusBadge status={report.sensors.dht.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <SensorStatusBadge status={report.sensors.bmp180.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center font-mono text-xs">
                    {report.sensors.rain_gauge.current_pin_state}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center font-mono text-xs">
                    {report.sensors.rain_gauge.total_events_since_boot.toLocaleString("es-ES")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center font-mono text-xs">
                    {report.sensors.rain_gauge.unsent_events_count}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
