import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { calculateHeatIndex } from "@/lib/utils/functions/heat-index"
import { calculatePressureAverage, predictWeather } from "@/lib/utils/functions/predictWeather"
import { todayARLocalDate } from "@/lib/utils/timezone"

/**
 * GET /api/weather-data
 * Endpoint público para obtener datos del dashboard
 * Admite parámetro opcional `date=YYYY-MM-DD`
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const todayStr = todayARLocalDate()

    // Si se especifica una fecha histórica distinta a hoy
    if (dateParam && dateParam !== todayStr) {
      const dayExtremes = await WeatherRepository.getExtremesByDate(dateParam)
      return NextResponse.json({
        latestReading: null,
        todayExtremes: dayExtremes,
        heatIndex: null,
        predictions: null,
        timestamp: new Date().toISOString(),
      })
    }

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

