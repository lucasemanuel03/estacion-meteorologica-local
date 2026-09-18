import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { todayARLocalDate } from "@/lib/utils/timezone"

/**
 * GET /api/weather-calendar/annual
 * Devuelve la comparativa de los meses para un año determinado
 * Parámetro opcional: ?year=YYYY (por defecto año actual AR)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const today = todayARLocalDate()
    const [todayYear] = today.split("-").map(Number)

    const yearParam = searchParams.get("year")
    const year = yearParam ? parseInt(yearParam, 10) : todayYear

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Año inválido" }, { status: 400 })
    }

    const data = await WeatherRepository.getAnnualComparisonStats(year)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[api/weather-calendar/annual] Error fetching annual comparison:", error)
    return NextResponse.json(
      { error: "Error al obtener comparativa anual" },
      { status: 500 }
    )
  }
}
