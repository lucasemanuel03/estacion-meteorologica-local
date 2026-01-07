import { NextRequest, NextResponse } from "next/server"
import { StatsRepository } from "@/lib/db/stats-repository"

/**
 * GET /api/todays-stats/trend
 * Calcula la tendencia de temperatura y humedad comparando las últimas N lecturas
 * con las N anteriores. Usa N=2 y umbral=0.2 por defecto.
 *
 * Query params opcionales:
 * - windowSize (number): cantidad de lecturas por bloque (default: 2)
 * - threshold (number): umbral de estabilidad (default: 0.2)
 *
 * Response (200):
 * {
 *   "success": true,
 *   "windowSize": 2,
 *   "threshold": 0.2,
 *   "tempTrend": { "differential": -0.1, "message": "Temperatura en descenso" },
 *   "humTrend":  { "differential":  0.5, "message": "Humedad en aumento" },
 *   "timestamp": "2026-01-06T22:38:18.162Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const windowSizeParam = searchParams.get("windowSize")
    const thresholdParam = searchParams.get("threshold")

    const windowSize = windowSizeParam ? Number(windowSizeParam) : undefined
    const threshold = thresholdParam ? Number(thresholdParam) : undefined

    const trend = await StatsRepository.getTrend({ windowSize, threshold })

    return NextResponse.json({
      success: true,
      windowSize: windowSize ?? 2,
      threshold: threshold ?? 0.2,
      ...trend,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v1-api] Error computing trend:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compute trend",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
