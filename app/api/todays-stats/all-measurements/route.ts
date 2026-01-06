import { NextResponse } from "next/server"
import { StatsRepository } from "@/lib/db/stats-repository"

/**
 * GET /api/todays-stats/all-measurements
 * Endpoint público para obtener todas las mediciones del día actual
 * No requiere autenticación (datos públicos)
 *
 * Response format (200 OK):
 * {
 *   "success": true,
 *   "date": "2026-01-06",
 *   "count": 42,
 *   "readings": [
 *     {
 *       "id": "uuid-1",
 *       "temperature": 20.5,
 *       "humidity": 65.2,
 *       "recorded_at": "2026-01-06T08:00:00+00:00",
 *       "created_at": "2026-01-06T08:00:01+00:00"
 *     },
 *     {
 *       "id": "uuid-2",
 *       "temperature": 21.3,
 *       "humidity": 64.8,
 *       "recorded_at": "2026-01-06T08:05:00+00:00",
 *       "created_at": "2026-01-06T08:05:01+00:00"
 *     }
 *     // ... más mediciones ordenadas de más antiguas a más recientes
 *   ],
 *   "timestamp": "2026-01-06T15:36:53.200Z"
 * }
 *
 * Error response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch today readings",
 *   "timestamp": "2026-01-06T15:36:53.200Z"
 * }
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const readings = await StatsRepository.getTodayReadings()

    return NextResponse.json({
      success: true,
      date: today,
      count: readings.length,
      readings,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v1-api] Error fetching today readings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch today readings",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
