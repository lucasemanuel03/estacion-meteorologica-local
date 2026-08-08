import { NextResponse } from "next/server"
import { RainRepository } from "@/lib/db/rain-repository"

/**
 * GET /api/cron/clean-rain-events
 * Consolida precip_total en daily_extremes y luego borra rain_events de dias anteriores.
 * Invocado por Vercel Cron (ver vercel.json).
 */
export async function GET() {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const prefix = `[rain-cron][req:${requestId}]`

  console.log(`${prefix} Start cleanup of past rain events`)

  try {
    const result = await RainRepository.cleanupPastEventsWithVerification()

    if (!result) {
      console.error(`${prefix} Cleanup failed`)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to clean past rain events",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    console.log(`${prefix} Cleanup complete`, {
      targetDate: result.targetDate,
      processed: result.processedDates.length,
      skipped: result.skippedDates.length,
    })

    return NextResponse.json({
      success: true,
      targetDate: result.targetDate,
      factor: result.factor,
      processedDates: result.processedDates,
      skippedDates: result.skippedDates,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`${prefix} Unhandled error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
