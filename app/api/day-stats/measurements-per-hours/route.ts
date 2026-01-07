import { NextRequest, NextResponse } from "next/server"
import { DayStatsRepository } from "@/lib/db/day-stats-repository"

/**
 * GET /api/day-stats/measurements-per-hours?date=YYYY-MM-DD
 * Endpoint público para obtener promedios por hora de un día específico
 * No requiere autenticación (datos públicos)
 *
 * Agrupa todas las mediciones del día por hora y retorna el promedio
 * de temperatura y humedad para cada hora con datos disponibles.
 *
 * Query params:
 * - date (required): Fecha en formato YYYY-MM-DD (e.g., "2026-01-06")
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
 * Error response (400):
 * {
 *   "success": false,
 *   "error": "Missing or invalid date parameter. Expected format: YYYY-MM-DD",
 *   "timestamp": "2026-01-06T15:36:53.200Z"
 * }
 *
 * Error response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch hourly averages",
 *   "timestamp": "2026-01-06T15:36:53.200Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    // Validar que se proporcione la fecha
    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing date parameter. Expected format: YYYY-MM-DD",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format. Expected format: YYYY-MM-DD",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const hourlyAverages = await DayStatsRepository.getAveragesByHourForDate(date)

    return NextResponse.json({
      success: true,
      date,
      hoursWithData: hourlyAverages.length,
      hourlyAverages,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v1-api] Error fetching hourly averages for date:", error)
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
