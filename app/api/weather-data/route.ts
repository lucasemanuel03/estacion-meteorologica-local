import { NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { calculateHeatIndex } from "@/lib/utils/functions/heat-index"
import { calculatePressureAverage, predictWeather } from "@/lib/utils/functions/predictWeather"

/**
 * GET /api/weather-data
 * Endpoint público para obtener datos del dashboard
 * No requiere autenticación (datos públicos){
  "latestReading": {
    "id": "d23baae6-7048-4ebd-b1a2-3129c287cb70",
    "temperature": 30.2,
    "humidity": 62,
    "rain_mm": 0,
    "recorded_at": "2026-03-01T21:21:05.77+00:00",
    "created_at": "2026-03-01T21:21:05.809992+00:00",
    "pressure": 928.1799927,
    "altitude": 733.4573364
  },
  "todayExtremes": {
    "id": "f477e64a-d9f4-476e-995d-e12aa62332ec",
    "date": "2026-03-01",
    "temp_max": 32.4,
    "temp_min": 17,
    "temp_max_time": "2026-03-01T18:15:49.076+00:00",
    "temp_min_time": "2026-03-01T10:25:48.467+00:00",
    "humidity_max": 95,
    "humidity_min": 59,
    "precip_total": 0,
    "last_value": null,
    "updated_at": "2026-03-01T20:25:49.345+00:00",
    "humidity_max_time": "2026-03-01T12:15:48.562+00:00",
    "humidity_min_time": "2026-03-01T20:25:49.08+00:00"
  },
  "heatIndex": {
    "value": 33.6,
    "category": "PRECAUCIÓN EXTREMA",
    "description": "Posible golpe de calor, calambres o agotamiento por calor con exposición prolongada y/o actividad física."
  },
  "predictions": {
    "now": {
      "deltaPressure": -2.5,
      "status": "Estable",
      "message": "Presión ligeramente a la baja, condiciones estables."} ,
  },
  "timestamp": "2026-03-01T21:25:40.392Z"
}
 */
export async function GET() {
  try {
    const [latestReading, todayExtremes, lastReadings, pastReadings] = await Promise.all([
      WeatherRepository.getLatestReading(),
      WeatherRepository.getTodayExtremes(),
      WeatherRepository.getLastPressureReadings(4), // Últimas 4 lecturas para promedio actual
      WeatherRepository.getPressureReadingsFromHoursAgo(3, 6) // Lecturas de hace 3 horas para promedio pasado, 
    ])

    // Calcular índice de calor si hay lectura disponible
    const heatIndex = latestReading 
      ? calculateHeatIndex(latestReading.temperature, latestReading.humidity)
      : null

    // Calcular predicción del clima
    let predictions = null
    const currentAvg = calculatePressureAverage(lastReadings)
    const pastAvg = calculatePressureAverage(pastReadings)

    if (currentAvg !== null && pastAvg !== null) {
      predictions = {
        now: predictWeather(currentAvg, pastAvg)
      }
    }

    return NextResponse.json({
      latestReading,
      todayExtremes,
      heatIndex,
      predictions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

