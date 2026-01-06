import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"

/**
 * GET /api/weather-history
 * Endpoint público para obtener datos del historial del clima
 * No requiere autenticación (datos públicos)
 */
export async function GET(request: NextRequest) {
    try {
        const daysParam = request.nextUrl.searchParams.get("days")
        const parsedDays = daysParam ? Number.parseInt(daysParam, 10) : 7
        const limit = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 1), 30) : 7

        const [weatherHistory] = await Promise.all([WeatherRepository.getRecentExtremes(limit)])

        return NextResponse.json({
            weatherHistory,
            limit,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("[v0] Error fetching weather data:", error)
        return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }
}
