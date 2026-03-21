"use client"

import useSWR from "swr"

type TrendParametro = {
  differential: number
  message: string
}

type TrendResponse = {
  success: boolean
  tempTrend?: TrendParametro
  humTrend?: TrendParametro
}

const fetcher = async (url: string): Promise<TrendResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json()
}

export function useTrends() {
  const { data, error, isLoading } = useSWR<TrendResponse>(
    "/api/todays-stats/trend",
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    },
  )

  return {
    tempTrend: data?.success ? data.tempTrend ?? null : null,
    humTrend: data?.success ? data.humTrend ?? null : null,
    error,
    isLoading,
  }
}
