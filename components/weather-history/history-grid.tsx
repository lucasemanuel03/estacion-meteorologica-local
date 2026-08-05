import { DayHistoryCard } from "./day-history-card"
import type { DailyExtremes } from "@/lib/types/weather"

interface HistoryGridProps {
  history: DailyExtremes[]
}

export function HistoryGrid({ history }: HistoryGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
      {history.map((day) => (
        <DayHistoryCard key={day.id} day={day} />
      ))}
    </div>
  )
}
