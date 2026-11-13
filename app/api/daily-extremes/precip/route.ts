import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { WeatherValidator } from "@/lib/utils/weather-validator"

/**
 * POST /api/daily-extremes/precip
 *
 * Permite cargar manualmente el valor de precipitación total (precip_total)
 * para un día específico en la tabla daily_extremes.
 *
 * Si ya existe un registro para la fecha indicada, actualiza el campo precip_total.
 * Si no existe ningún registro para esa fecha, inserta uno nuevo con solo la fecha
 * y la precipitación (los demás campos quedan en null).
 *
 * Headers requeridos:
 * - Authorization: Bearer <api-key>
 *
 * Body:
 * {
 *   "date": "YYYY-MM-DD",
 *   "precip_total": 12.5
 * }
 *
 * Respuestas:
 * - 200 OK          → operación exitosa (upsert realizado)
 * - 400 Bad Request → body inválido o valores fuera de rango
 * - 401 Unauthorized → falta la API key
 * - 403 Forbidden   → API key inválida o inactiva
 * - 500 Internal Server Error → error inesperado
 */
export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  console.log(`[precip][req:${requestId}] Received POST request to /api/daily-extremes/precip`)

  try {
    // 1. Validar API Key
    console.log(`[precip][req:${requestId}] Step 1: Validating API Key`)
    const authHeader = request.headers.get("authorization")
    const apiKey = WeatherValidator.extractApiKey(authHeader)

    if (!apiKey) {
      console.log(`[precip][req:${requestId}] Missing API key`)
      return NextResponse.json(
        { error: "Missing API key. Use Authorization header." },
        { status: 401 },
      )
    }

    const isValidKey = await WeatherRepository.validateApiKey(apiKey)
    if (!isValidKey) {
      console.log(`[precip][req:${requestId}] Invalid or inactive API key`)
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 403 },
      )
    }

    // 2. Parsear el body JSON
    console.log(`[precip][req:${requestId}] Step 2: Parsing request body`)
    let body: unknown
    try {
      body = await request.json()
      console.log(`[precip][req:${requestId}] Body parsed:`, body)
    } catch {
      console.error(`[precip][req:${requestId}] Failed to parse JSON body`)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // 3. Validar estructura del payload
    console.log(`[precip][req:${requestId}] Step 3: Validating payload structure`)
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 })
    }

    const data = body as Record<string, unknown>

    // Validar campo date: string con formato YYYY-MM-DD
    if (
      typeof data.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
    ) {
      return NextResponse.json(
        { error: "Invalid or missing 'date'. Expected format: YYYY-MM-DD" },
        { status: 400 },
      )
    }

    // Validar que la fecha sea una fecha calendario real
    const parsedDate = new Date(`${data.date}T12:00:00`)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: `'date' value '${data.date}' is not a valid calendar date` },
        { status: 400 },
      )
    }

    // Validar campo precip_total: número finito >= 0
    if (
      typeof data.precip_total !== "number" ||
      isNaN(data.precip_total) ||
      !isFinite(data.precip_total) ||
      data.precip_total < 0
    ) {
      return NextResponse.json(
        { error: "Invalid or missing 'precip_total'. Must be a non-negative decimal number" },
        { status: 400 },
      )
    }

    const date: string = data.date
    const precipTotal: number = Math.round(data.precip_total * 100) / 100

    // 4. Upsert del campo precip_total en daily_extremes
    console.log(`[precip][req:${requestId}] Step 4: Upserting precip_total=${precipTotal} for date=${date}`)
    const result = await WeatherRepository.upsertPrecipTotal(date, precipTotal)

    if (!result.success) {
      console.error(`[precip][req:${requestId}] DB error:`, result.error)
      return NextResponse.json({ error: "Failed to save precip_total" }, { status: 500 })
    }

    console.log(`[precip][req:${requestId}] Success. Action: ${result.action}`)

    // 5. Respuesta exitosa
    return NextResponse.json({
      success: true,
      date,
      precip_total: precipTotal,
      action: result.action, // "inserted" | "updated"
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[precip][req:${requestId}] Unhandled error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
