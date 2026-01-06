import { NextResponse } from "next/server"
import { StatsRepository } from "@/lib/db/stats-repository"

/**
 * GET /api/todays-stats/measurements-per-hours
 * Endpoint público para obtener promedios por hora del día actual
 * No requiere autenticación (datos públicos)
 *
 * Agrupa todas las mediciones del día por hora y retorna el promedio
 * de temperatura y humedad para cada hora con datos disponibles.
 *
 * Response format (200 OK):
 * {
 *   "success": true,
 *   "date": "2026-01-06",
 *   "hoursWithData": 12,
 *   "hourlyAverages": [
 *     {
 *       "hour": 8,
 *       "count": 8,
 *       "avgTemperature": 20.45,
 *       "avgHumidity": 65.23
 *     },
 *     {
 *       "hour": 9,
 *       "count": 12,
 *       "avgTemperature": 21.67,
 *       "avgHumidity": 63.89
 *     },
 *     {
 *       "hour": 10,
 *       "count": 10,
 *       "avgTemperature": 23.12,
 *       "avgHumidity": 61.45
 *     }
 *     // ... solo horas con mediciones disponibles
 *   ],
 *   "timestamp": "2026-01-06T15:36:53.200Z"
 * }
 *
 * Notes:
 * - "count": número de mediciones en esa hora
 * - "avgTemperature": promedio de temperaturas redondeado a 2 decimales
 * - "avgHumidity": promedio de humedad redondeado a 2 decimales
 * - Solo se retornan las horas que tienen al menos una medición
 * - El array está ordenado por hora (ascendente)
 *
 * Error response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch hourly averages",
 *   "timestamp": "2026-01-06T15:36:53.200Z"
 * }
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const hourlyAverages = await StatsRepository.getTodayAveragesByHour()

    return NextResponse.json({
      success: true,
      date: today,
      hoursWithData: hourlyAverages.length,
      hourlyAverages,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v1-api] Error fetching hourly averages:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch hourly averages",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
