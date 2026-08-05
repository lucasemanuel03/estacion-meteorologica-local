import { CalendarDays } from "lucide-react"

export function WeatherHistoryTitle() {
  return (
    <div className="mb-8 flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-center md:text-4xl">
                Historial del clima
            </h1>
            <p className="text-center text-sm text-primary/80">
                Selecciona cuántos días quieres ver (1-30).
            </p>
        </div>
  )
}