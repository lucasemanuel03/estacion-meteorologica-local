import { Calendar } from "lucide-react"

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

interface WeatherCalendarTitleProps {
  currentMonth: Date
}

export function WeatherCalendarTitle({ currentMonth }: WeatherCalendarTitleProps) {
  const monthName = MONTH_NAMES[currentMonth.getMonth()]
  const year = currentMonth.getFullYear()

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 shadow-2xs">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex flex-col min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground truncate">
          Clima de {monthName}
        </h1>
        <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
          Año {year}
        </span>
      </div>
    </div>
  )
}