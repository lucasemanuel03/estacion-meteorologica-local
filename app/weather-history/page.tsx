"use client"

import { type FormEvent, useMemo, useState } from "react"
import useSWR from "swr"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DayHistoryCard } from "@/components/weather/day-history-card"
import type { DailyExtremes } from "@/lib/types/weather"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface WeatherHistoryResponse {
  weatherHistory: DailyExtremes[]
  timestamp: string
  limit: number
}

export default function WeatherHistoryPage() {
  const [daysInput, setDaysInput] = useState("7")
  const [days, setDays] = useState(7)

  const { data, error, isValidating } = useSWR<WeatherHistoryResponse>(
    `/api/weather-history?days=${days}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = Number.parseInt(daysInput, 10)
    const clamped = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 30) : 7
    setDays(clamped)
    setDaysInput(String(clamped))
  }

  const history = useMemo(() => {
    if (!data?.weatherHistory) return []
    return [...data.weatherHistory].sort((a, b) => b.date.localeCompare(a.date))
  }, [data?.weatherHistory])

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Historial de clima</h1>
          <p className="text-base text-muted-foreground">
            Consulta los extremos diarios registrados. Selecciona cuántos días quieres ver (1-30) y presiona buscar.
          </p>
        </div>

        <Card>
          <CardContent className="py-6">
            <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleSearch}>
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="days">
                  Cantidad de días (1-30)
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="days"
                    name="days"
                    type="number"
                    min={1}
                    max={30}
                    value={daysInput}
                    onChange={(event) => setDaysInput(event.target.value)}
                    className="w-32"
                  />
                  <Button type="submit" disabled={isValidating}>
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {data?.timestamp && (
                <p className="text-sm text-muted-foreground">
                  Actualizado: {new Date(data.timestamp).toLocaleString("es-ES")}
                </p>
              )}
            </form>
            {error && (
              <p className="mt-3 text-sm text-destructive">No se pudo cargar el historial. Inténtalo nuevamente.</p>
            )}
          </CardContent>
        </Card>

        {history.length === 0 && !error ? (
          <p className="text-muted-foreground">No hay datos disponibles para mostrar.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {history.map((day) => (
              <DayHistoryCard key={day.id} day={day} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}