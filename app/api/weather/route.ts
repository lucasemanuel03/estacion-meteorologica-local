import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { WeatherValidator } from "@/lib/utils/weather-validator"

/**
 * POST /api/weather
 * Endpoint para recibir datos de la ESP32
 *
 * Headers requeridos:
 * - Authorization: Bearer <api-key>
 *
 * Body:
 * {
 *   "temperature": 23.5,
 *   "humidity": 65.2,
 *   "timestamp": "2025-01-01T12:00:00Z" (opcional)
 * }
 */
export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  console.log(`[v1][req:${requestId}] Received POST request to /api/weather`)
  
  try {
    // 1. Validar API Key
    console.log(`[v1][req:${requestId}] Step 1: Validating API Key`)
    const authHeader = request.headers.get("authorization")
    console.log(`[v1][req:${requestId}] Authorization header:`, authHeader ? "present" : "missing")
    
    const apiKey = WeatherValidator.extractApiKey(authHeader)

    if (!apiKey) {
      console.log(`[v1][req:${requestId}] Missing API key`)
      return NextResponse.json({ error: "Missing API key. Use Authorization header." }, { status: 401 })
    }

    const isValidKey = await WeatherRepository.validateApiKey(apiKey)
    if (!isValidKey) {
      console.log(`[v1][req:${requestId}] Invalid API key`)
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 403 })
    }

    // 2. Parsear y validar el payload
    console.log(`[v1][req:${requestId}] Step 2: Parsing request body`)
    let body: unknown
    try {
      body = await request.json()
      console.log(`[v1][req:${requestId}] Body parsed successfully:`, body)
    } catch (parseError) {
      console.error(`[v1][req:${requestId}] Failed to parse JSON body:`, parseError)
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      )
    }

    if (!WeatherValidator.validatePayload(body)) {
      console.log(`[v1][req:${requestId}] Invalid payload format:`, body)
      return NextResponse.json(
        { error: "Invalid payload format. Required: {temperature: number, humidity: number}" },
        { status: 400 },
      )
    }

    // 3. Validar rangos
    console.log(`[v1][req:${requestId}] Step 3: Validating value ranges`)
    const { valid, errors } = WeatherValidator.validateRanges(body)
    if (!valid) {
      console.log(`[v1][req:${requestId}] Values out of range:`, errors)
      return NextResponse.json({ error: "Values out of range", details: errors }, { status: 400 })
    }

    // 4. Insertar lectura en la base de datos
    console.log(`[v1][req:${requestId}] Step 4: Inserting reading to database`)
    const reading = await WeatherRepository.insertReading(body)
    if (!reading) {
      console.error(`[v1][req:${requestId}] Failed to insert reading`)
      return NextResponse.json({ error: "Failed to save reading" }, { status: 500 })
    }
    console.log(`[v1][req:${requestId}] Reading inserted successfully:`, reading.id)

    // 5. Actualizar extremos diarios (no bloqueante)
    console.log(`[v1][req:${requestId}] Step 5: Starting background task to update daily extremes`)
    WeatherRepository.updateDailyExtremes(reading, { requestId, source: "POST /api/weather" }).catch((error) => {
      console.error(`[v1][req:${requestId}] Background task error updating extremes:`, error)
    })

    // 6. Respuesta exitosa
    console.log(`[v1][req:${requestId}] Returning success response`)
    return NextResponse.json({
      success: true,
      reading: {
        id: reading.id,
        temperature: reading.temperature,
        humidity: reading.humidity,
        recorded_at: reading.recorded_at,
      },
    })
  } catch (error) {
    console.error(`[v1][req:${requestId}] Unhandled error in weather API:`, error)
    console.error(`[v1][req:${requestId}] Error type:`, error instanceof Error ? error.name : typeof error)
    console.error(`[v1][req:${requestId}] Error message:`, error instanceof Error ? error.message : String(error))
    console.error(`[v1][req:${requestId}] Error stack:`, error instanceof Error ? error.stack : "N/A")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
