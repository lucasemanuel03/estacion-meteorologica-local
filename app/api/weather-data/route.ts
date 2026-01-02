import { NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"

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

    return NextResponse.json({
      latestReading,
      todayExtremes,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
