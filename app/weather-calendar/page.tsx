import { WeatherCalendarTitle } from "@/components/weather-calendar/weather-calendar-title"
import { WeatherCalendarView } from "@/components/weather-calendar/weather-calendar-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendario Climático | Estación Meteorológica Local",
  description: "Historial climático mensual con resúmenes y parámetros configurables por día.",
}

export default function WeatherCalendarPage() {
  return (
    <main className="app-stage min-h-screen relative overflow-hidden">
      <div className="px-4 relative py-8 z-10">
        <div className="mb-4">
          <WeatherCalendarTitle />
        </div>
        <WeatherCalendarView />
      </div>
    </main>
  )
}
