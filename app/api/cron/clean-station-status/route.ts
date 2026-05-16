import { NextResponse } from "next/server"
import { StationStatusRepository } from "@/lib/db/station-status-repository"

const RETENTION_DAYS = 2

function getCutoffIso(retentionDays: number): string {
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays)
  return cutoff.toISOString()
}

/**
 * GET /api/cron/clean-station-status
 * Elimina reportes de station_status_reports con más de RETENTION_DAYS días.
 * Invocado por Vercel Cron (ver vercel.json).
 */
export async function GET() {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const prefix = `[station-status-cron][req:${requestId}]`
  const cutoffIso = getCutoffIso(RETENTION_DAYS)

  console.log(`${prefix} Start cleanup`, { retentionDays: RETENTION_DAYS, cutoffIso })

  try {
    const result = await StationStatusRepository.deleteOlderThan(cutoffIso)

    if (!result) {
      console.error(`${prefix} Delete failed`)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete old station status reports",
          retentionDays: RETENTION_DAYS,
          cutoffIso,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    console.log(`${prefix} Cleanup complete`, { deletedCount: result.deletedCount })

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      retentionDays: RETENTION_DAYS,
      cutoffIso,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`${prefix} Unhandled error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        retentionDays: RETENTION_DAYS,
        cutoffIso,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
