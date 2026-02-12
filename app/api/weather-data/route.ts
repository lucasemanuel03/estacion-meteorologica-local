import { NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { calculateHeatIndex } from "@/lib/utils/functions/heat-index"

/**
 * GET /api/weather-data
 * Endpoint público para obtener datos del dashboard
 * No requiere autenticación (datos públicos)
 */
export async function GET() {
  try {
    const [latestReading, todayExtremes] = await Promise.all([
      WeatherRepository.getLatestReading(),
      WeatherRepository.getTodayExtremes(),
    ])

    // Calcular índice de calor si hay lectura disponible
    const heatIndex = latestReading 
      ? calculateHeatIndex(latestReading.temperature, latestReading.humidity)
      : null

    return NextResponse.json({
      latestReading,
      todayExtremes,
      heatIndex,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

