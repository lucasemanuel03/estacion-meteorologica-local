"use client"

import useSWR from "swr"
import type { WeatherDashboardData } from "@/lib/types/weather"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useWeatherData() {
  return useSWR<WeatherDashboardData>("/api/weather-data", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })
}
