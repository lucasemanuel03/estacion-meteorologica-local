import { type NextRequest, NextResponse } from "next/server"
import { RainRepository } from "@/lib/db/rain-repository"

function formatEvent(event: { id: string; recorded_at: string; created_at: string; is_offline: boolean }) {
  return {
    id: event.id,
    recorded_at: event.recorded_at,
    created_at: event.created_at,
    is_offline: event.is_offline,
  }
}

/**
 * GET /api/rain-events/test?limit=25
 * Endpoint de test para recuperar los últimos N eventos de lluvia.
 */
export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get("limit")
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 10
    const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10

    const events = await RainRepository.getRecentEvents(limit)

    if (events === null) {
      return NextResponse.json({ error: "Failed to fetch rain events" }, { status: 500 })
    }

    return NextResponse.json({
      limit: Math.min(Math.max(Math.floor(limit), 1), 100),
      count: events.length,
      events: events.map(formatEvent),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[rain] Error fetching recent events:", error)
    return NextResponse.json({ error: "Failed to fetch rain events" }, { status: 500 })
  }
}