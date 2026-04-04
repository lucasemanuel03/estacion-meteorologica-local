"use client"

import { type FormEvent, useMemo, useState } from "react"
import useSWR from "swr"
import { Search, Loader2, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DayHistoryCard } from "@/components/weather-history/day-history-card"
import type { DailyExtremes } from "@/lib/types/weather"
import { Separator } from "@/components/ui/separator"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface WeatherHistoryResponse {
  weatherHistory: DailyExtremes[]
  timestamp: string
  limit: number
}

export default function HistorialPage() {
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
    <main className="app-stage min-h-screen relative overflow-hidden">
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10">
              <CalendarDays className="h-7 w-7 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Historial de clima</h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl">
            Consulta los extremos diarios registrados. Selecciona cuántos días quieres ver (1-30).
          </p>
        </div>

                {/* Search Card */}
        <div className="mb-10">
            <form className="flex items-end gap-4 w-fit" onSubmit={handleSearch}>
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  placeholder="Días a mostrar (1-30)"
                  id="days"
                  name="days"
                  type="number"
                  min={1}
                  max={30}
                  value={daysInput}
                  onChange={(event) => setDaysInput(event.target.value)}
                  className="w-50 h-10 backdrop-blur-sm"
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
        </div>
        <Separator  className="mb-4"/>

        {history.length === 0 && !error && !isValidating ? (
          <Card className="relative overflow-hidden border backdrop-blur-xl bg-linear-to-br from-slate-500/5 via-transparent to-slate-500/10 border-slate-400/30">
            <CardContent className="py-12 px-6 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No hay datos disponibles para mostrar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {history.map((day) => (
              <DayHistoryCard key={day.id} day={day} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
