import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { todayARLocalDate } from "@/lib/utils/timezone"

/**
 * GET /api/weather-calendar
 * Devuelve las estadísticas mensuales del clima y el desglose de cada día del mes
 * Parámetros opcionales: ?year=YYYY&month=MM
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const today = todayARLocalDate()
    const [todayYear, todayMonth] = today.split("-").map(Number)

    const yearParam = searchParams.get("year")
    const monthParam = searchParams.get("month")

    const year = yearParam ? parseInt(yearParam, 10) : todayYear
    const month = monthParam ? parseInt(monthParam, 10) : todayMonth

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Año inválido" }, { status: 400 })
    }

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Mes inválido" }, { status: 400 })
    }

    const data = await WeatherRepository.getMonthlyWeatherStats(year, month)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[api/weather-calendar] Error fetching monthly stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas del calendario" },
      { status: 500 }
    )
  }
}
