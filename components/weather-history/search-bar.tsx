"use client"

import { type FormEvent, useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  isValidating: boolean
  onSearch: (days: number) => void
  timestamp?: string
  error?: boolean
}

export function WeatherHistorySearchBar({ isValidating, onSearch, timestamp, error }: SearchBarProps) {
  const [daysInput, setDaysInput] = useState("7")

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = Number.parseInt(daysInput, 10)
    const clamped = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 30) : 7
    onSearch(clamped)
    setDaysInput(String(clamped))
  }

  return (
    <div className="mb-10 flex justify-center items-center flex-col">
      <form className="flex justify-center items-center gap-2 w-fit" onSubmit={handleSearch}>
        <div className="flex flex-1 flex-col gap-1">
          <Input
            placeholder="Días"
            id="days"
            name="days"
            type="number"
            min={1}
            max={30}
            value={daysInput}
            onChange={(event) => setDaysInput(event.target.value)}
            className="w-25 h-10"
          />
        </div>
        <Button
          type="submit"
          variant="dinamic"
          disabled={isValidating}
          className="w-20"
        >
          {isValidating ? (
            <>
              <Loader2 className="animate-spin" />
            </>
          ) : (
            <>
              <Search />
            </>
          )}
        </Button>
      </form>

      {timestamp && (
        <p className="mt-2 text-sm font-light text-muted-foreground">
          Última actualización: {new Date(timestamp).toLocaleString("es-ES")}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-destructive">
          No se pudo cargar el historial. Inténtalo nuevamente.
        </p>
      )}
    </div>
  )
}
