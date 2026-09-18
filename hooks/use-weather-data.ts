"use client"

import useSWR from "swr"
import type { WeatherDashboardData } from "@/lib/types/weather"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useWeatherData(date?: string) {
  const endpoint = date ? `/api/weather-data?date=${encodeURIComponent(date)}` : "/api/weather-data"
  return useSWR<WeatherDashboardData>(endpoint, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })
}
