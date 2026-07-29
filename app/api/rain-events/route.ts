import { type NextRequest, NextResponse } from "next/server"
import { RainRepository } from "@/lib/db/rain-repository"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { WeatherValidator } from "@/lib/utils/weather-validator"
import { RainValidator } from "@/lib/utils/rain-validator"
import { todayARLocalDate } from "@/lib/utils/timezone"

function formatEvent(event: { id: string; recorded_at: string; created_at: string; is_offline: boolean }) {
  return {
    id: event.id,
    recorded_at: event.recorded_at,
    created_at: event.created_at,
    is_offline: event.is_offline,
  }
}

async function authorizeRainWriteRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const apiKey = WeatherValidator.extractApiKey(authHeader)

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key. Use Authorization header." }, { status: 401 })
  }

  const isValidKey = await WeatherRepository.validateApiKey(apiKey)
  if (!isValidKey) {
    return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 403 })
  }

  return null
}

/**
 * POST /api/rain-events
 * 
 * :: HACER EL POST DESDE LOCALHOST:300 YA QUE LA MAIN DEL PROYECTO NO ESTÁ ACTUALIZADA ::
 * 
 * Registra uno o varios eventos de lluvia desde la NodeMCU.
 *
 * Headers requeridos:
 * - Authorization: Bearer <api-key>
 *
 * Body:
 * {
 *   "offline_data": true,
 *   "events": [
 *     { "timestamp": 1714578023 },
 *     { "timestamp": 1714578145 }
 *   ]
 * }
 *
 * timestamp: Unix epoch en segundos (UTC). Eventos sin timestamp válido se descartan.
 */
export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  console.log(`[rain][req:${requestId}] Received POST request to /api/rain-events`)

  try {
    const authError = await authorizeRainWriteRequest(request)
    if (authError) {
      return authError
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    if (!RainValidator.validatePayload(body)) {
      return NextResponse.json(
        {
          error: "Invalid payload format. Required: { offline_data?: boolean, events: [{ timestamp: number }, ...] }",
        },
        { status: 400 },
      )
    }

    const isOffline = body.offline_data === true
    const { toInsert, rejected } = RainValidator.parseEvents(body.events, isOffline)

    if (toInsert.length === 0) {
      return NextResponse.json(
        {
          error: "No valid events to insert. All events were discarded.",
          rejected,
        },
        { status: 400 },
      )
    }

    const inserted = await RainRepository.insertEvents(toInsert)
    if (inserted === null) {
      return NextResponse.json({ error: "Failed to save rain events" }, { status: 500 })
    }

    console.log(
      `[rain][req:${requestId}] Inserted ${inserted.length} event(s), rejected ${rejected.length}`,
    )

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      rejected: rejected.length,
      events: inserted.map((e) => ({
        id: e.id,
        recorded_at: e.recorded_at,
        is_offline: e.is_offline,
      })),
      ...(rejected.length > 0 ? { rejected } : {}),
    })
  } catch (error) {
    console.error(`[rain][req:${requestId}] Unhandled error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/rain-events
 * Elimina físicamente los eventos de lluvia del día local actual.
 */
export async function DELETE(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  console.log(`[rain][req:${requestId}] Received DELETE request to /api/rain-events`)

  try {
    const authError = await authorizeRainWriteRequest(request)
    if (authError) {
      return authError
    }

    const deleted = await RainRepository.deleteTodayEvents()
    if (deleted === null) {
      return NextResponse.json({ error: "Failed to delete rain events" }, { status: 500 })
    }

    console.log(
      `[rain][req:${requestId}] Deleted ${deleted.deletedCount} event(s) for ${deleted.date} and reset precip_total`,
    )

    return NextResponse.json({
      success: true,
      date: deleted.date,
      deleted: deleted.deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[rain][req:${requestId}] Unhandled error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/rain-events
 * Devuelve los eventos de lluvia del día local actual.
 */
export async function GET() {
  try {
    const events = await RainRepository.getTodayEvents()

    if (events === null) {
      return NextResponse.json({ error: "Failed to fetch rain events" }, { status: 500 })
    }

    return NextResponse.json({
      date: todayARLocalDate(),
      count: events.length,
      events: events.map(formatEvent),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[rain] Error fetching today events:", error)
    return NextResponse.json({ error: "Failed to fetch rain events" }, { status: 500 })
  }
}
