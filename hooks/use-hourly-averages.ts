"use client"

import useSWR from "swr"
import type { HourlyAverages } from "@/lib/types/weather"

type HourlyResponse = {
  success?: boolean
  hourlyAverages?: HourlyAverages[]
}

const fetcher = async (url: string): Promise<HourlyResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json()
}

export function useHourlyAverages(date?: string, enabled = true) {
  const endpoint = date
    ? `/api/day-stats/measurements-per-hours?date=${encodeURIComponent(date)}`
    : "/api/todays-stats/measurements-per-hours"

  const { data, error, isLoading } = useSWR<HourlyResponse>(enabled ? endpoint : null, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    data: data?.hourlyAverages ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  }
}
