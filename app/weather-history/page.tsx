"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Separator } from "@/components/ui/separator"
import { WeatherHistoryTitle } from "@/components/weather-history/title"
import { WeatherHistorySearchBar } from "@/components/weather-history/search-bar"
import { PeriodStatsCards } from "@/components/weather-history/period-stats-cards"
import { HistoryGrid } from "@/components/weather-history/history-grid"
import { EmptyStateCard } from "@/components/weather-history/empty-state-card"
import type { DailyExtremes } from "@/lib/types/weather"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface WeatherHistoryResponse {
  weatherHistory: DailyExtremes[]
  timestamp: string
  limit: number
}

export default function WeatherHistoryPage() {
  const [days, setDays] = useState(7)

  const { data, error, isValidating } = useSWR<WeatherHistoryResponse>(
    `/api/weather-history?days=${days}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const history = useMemo(() => {
    if (!data?.weatherHistory) return []
    return [...data.weatherHistory].sort((a, b) => b.date.localeCompare(a.date))
  }, [data?.weatherHistory])

  const handleSearch = (searchDays: number) => {
    setDays(searchDays)
  }

  return (
    <main className="app-stage min-h-screen relative overflow-hidden">
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div>
          <WeatherHistoryTitle />

          <WeatherHistorySearchBar
            isValidating={isValidating}
            onSearch={handleSearch}
            timestamp={data?.timestamp}
            error={!!error}
          />
        </div>



        {!error && <PeriodStatsCards history={history} days={days} />}

        {history.length === 0 && !error && !isValidating ? (
          <EmptyStateCard />
        ) : (
          <HistoryGrid history={history} />
        )}
      </div>
    </main>
  )
}