import { NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"

/**
 * GET /api/day-stats?date=YYYY-MM-DD
 * Endpoint público para obtener estadísticas/extremos de un día específico.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

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

    const extremes = await WeatherRepository.getExtremesByDate(date)

    return NextResponse.json({
      success: true,
      date,
      extremes,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[api] Error fetching day-stats for date:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch day stats",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
