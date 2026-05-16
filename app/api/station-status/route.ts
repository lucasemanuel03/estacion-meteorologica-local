import { type NextRequest, NextResponse } from "next/server"
import { StationStatusRepository } from "@/lib/db/station-status-repository"
import { WeatherRepository } from "@/lib/db/weather-repository"
import type { StationStatusReport } from "@/lib/types/station-status"
import { WeatherValidator } from "@/lib/utils/weather-validator"
import { StationStatusValidator } from "@/lib/utils/station-status-validator"

const DEFAULT_RECENT_LIMIT = 10
const MAX_RECENT_LIMIT = 100

function formatReport(report: StationStatusReport) {
  return {
    id: report.id,
    report_type: report.report_type,
    device_timestamp: report.device_timestamp,
    ntp_synced: report.ntp_synced,
    recorded_at: report.recorded_at,
    uptime_sec: report.uptime_sec,
    board: {
      free_heap_bytes: report.free_heap_bytes,
      wifi_rssi_dbm: report.wifi_rssi_dbm,
      reset_reason: report.reset_reason,
      mac_address: report.mac_address,
    },
    sensors: {
      dht: { status: report.dht_status },
      bmp180: { status: report.bmp180_status },
      rain_gauge: {
        current_pin_state: report.rain_pin_state,
        total_events_since_boot: report.rain_total_events_since_boot,
        unsent_events_count: report.rain_unsent_events_count,
      },
    },
    created_at: report.created_at,
  }
}

/**
 * GET /api/station-status
 * Endpoint público para consultar reportes de estado de la estación.
 *
 * Sin query params: devuelve el último registro.
 * Con ?limit=N: devuelve los últimos N registros (por defecto 10 si limit está vacío o es inválido).
 */
export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get("limit")

    if (limitParam === null) {
      const report = await StationStatusRepository.getLatest()

      if (!report) {
        return NextResponse.json({ error: "No station status reports found" }, { status: 404 })
      }

      return NextResponse.json({
        report: formatReport(report),
        timestamp: new Date().toISOString(),
      })
    }

    const parsed =
      limitParam === "" ? DEFAULT_RECENT_LIMIT : Number.parseInt(limitParam, 10)
    const limit = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 1), MAX_RECENT_LIMIT)
      : DEFAULT_RECENT_LIMIT

    const reports = await StationStatusRepository.getRecent(limit)

    if (reports === null) {
      return NextResponse.json({ error: "Failed to fetch station status reports" }, { status: 500 })
    }

    return NextResponse.json({
      reports: reports.map(formatReport),
      limit,
      count: reports.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[station-status] Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/station-status
 * Recibe reportes periódicos de estado de la NodeMCU (ROUTINE o BOOT).
 *
 * Headers requeridos:
 * - Authorization: Bearer <api-key>
 *
 * Body:
 * {
 *   "report_type": "ROUTINE" | "BOOT",
 *   "timestamp": 1714578023,
 *   "uptime_sec": 3600,
 *   "board": {
 *     "free_heap_bytes": 43128,
 *     "wifi_rssi_dbm": -68,
 *     "reset_reason": "Power On",
 *     "mac_address": "AA:BB:CC:DD:EE:FF"
 *   },
 *   "sensors": {
 *     "dht": { "status": "OK" | "ERROR" },
 *     "bmp180": { "status": "OK" | "ERROR" },
 *     "rain_gauge": {
 *       "current_pin_state": 0 | 1,
 *       "total_events_since_boot": 42,
 *       "unsent_events_count": 3
 *     }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  console.log(`[station-status][req:${requestId}] Received POST request`)

  try {
    const authHeader = request.headers.get("authorization")
    const apiKey = WeatherValidator.extractApiKey(authHeader)

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key. Use Authorization header." }, { status: 401 })
    }

    const isValidKey = await WeatherRepository.validateApiKey(apiKey)
    if (!isValidKey) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    if (!StationStatusValidator.validatePayload(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid payload format. Required: report_type, timestamp, uptime_sec, board, sensors (dht, bmp180, rain_gauge)",
        },
        { status: 400 },
      )
    }

    const { valid, errors } = StationStatusValidator.validateRanges(body)
    if (!valid) {
      return NextResponse.json({ error: "Values out of range", details: errors }, { status: 400 })
    }

    const { insert, ntp_synced } = StationStatusValidator.toInsert(body)
    const report = await StationStatusRepository.insertReport(insert)

    if (!report) {
      return NextResponse.json({ error: "Failed to save station status report" }, { status: 500 })
    }

    console.log(
      `[station-status][req:${requestId}] Saved report ${report.id} (${report.report_type}, mac=${report.mac_address})`,
    )

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        report_type: report.report_type,
        device_timestamp: report.device_timestamp,
        ntp_synced,
        recorded_at: report.recorded_at,
        mac_address: report.mac_address,
        sensors: {
          dht: { status: report.dht_status },
          bmp180: { status: report.bmp180_status },
          rain_gauge: {
            current_pin_state: report.rain_pin_state,
            total_events_since_boot: report.rain_total_events_since_boot,
            unsent_events_count: report.rain_unsent_events_count,
          },
        },
      },
    })
  } catch (error) {
    console.error(`[station-status][req:${requestId}] Unhandled error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
