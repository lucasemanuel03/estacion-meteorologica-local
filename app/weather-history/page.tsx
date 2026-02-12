"use client"

import { type FormEvent, useMemo, useState } from "react"
import useSWR from "swr"
import { Search, Loader2, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Atmospheric background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/5 via-background to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10">
              <CalendarDays className="h-7 w-7 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Historial de Clima</h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl">
            Consulta los extremos diarios registrados. Selecciona cuántos días quieres ver (1-30).
          </p>
        </div>

        {/* Search Card */}
        <Card className="relative overflow-hidden border backdrop-blur-xl bg-linear-to-br from-blue-500/5 via-transparent to-emerald-700/30 border-emerald-400/30 mb-8 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
          
          <CardContent className="relative z-10">
            <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleSearch}>
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm sm:text-base font-medium text-foreground" htmlFor="days">
                  Cantidad de días (1-30)
                </label>
                <Input
                  id="days"
                  name="days"
                  type="number"
                  min={1}
                  max={30}
                  value={daysInput}
                  onChange={(event) => setDaysInput(event.target.value)}
                  className="w-full sm:w-42 h-10 backdrop-blur-sm"
                />
              </div>
              <Button
                type="submit"
                variant="dinamic"
                disabled={isValidating}
                className="w-32"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </form>
            
            {data?.timestamp && (
              <p className="mt-4 text-sm text-muted-foreground">
                📅 Última actualización: {new Date(data.timestamp).toLocaleString("es-ES")}
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm text-destructive">
                ⚠️ No se pudo cargar el historial. Inténtalo nuevamente.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {history.length === 0 && !error && !isValidating ? (
          <Card className="relative overflow-hidden border backdrop-blur-xl bg-linear-to-br from-slate-500/5 via-transparent to-slate-500/10 border-slate-400/30">
            <CardContent className="py-12 px-6 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No hay datos disponibles para mostrar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((day) => (
              <DayHistoryCard key={day.id} day={day} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}